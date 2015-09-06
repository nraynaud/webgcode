"use strict";
define(['RSVP', 'jQuery', 'Ember', 'cnc/controller/connection', 'cnc/controller/runner', 'cnc/util'], function (RSVP, $, Ember, Connection, Runner, util) {
    // correspondence in usb.c
    var CONTROL_COMMANDS = {
        REQUEST_POSITION: 0, REQUEST_PARAMETERS: 1, REQUEST_STATE: 2, REQUEST_TOGGLE_MANUAL_STATE: 3,
        REQUEST_DEFINE_AXIS_POSITION: 4, REQUEST_ABORT: 5, REQUEST_CLEAR_ABORT: 6, REQUEST_SET_SPI_OUTPUT: 7,
        REQUEST_RESUME_PROGRAM: 8, REQUEST_RESET_SPI_OUTPUT: 9, REQUEST_HOME: 10, REQUEST_WORK_OFFSET: 11
    };
    var EVENTS = {PROGRAM_END: 1, PROGRAM_START: 2, MOVED: 3, ENTER_MANUAL_MODE: 4, EXIT_MANUAL_MODE: 5};
    var STATES = {READY: 0, RUNNING_PROGRAM: 1, MANUAL_CONTROL: 2, ABORTING_PROGRAM: 3, PAUSED_PROGRAM: 4, HOMING: 5};
    var SPI_OUTPUT_MAPPING = {RUN_SPINDLE: 1, SOCKET: 1 << 6};
    var SPI_INPUT_MAPPING = {
        SPINDLE_RUNNING: 1 << 0, SPINDLE_AT_SPEED: 1 << 1, LIMIT_X: 1 << 2, LIMIT_Y: 1 << 3, LIMIT_Z: 1 << 4
    };
    var Axis = Ember.Object.extend({
        name: null,
        position: 0,
        machine: null,
        limit: false,
        homed: false,
        offset: 0,
        definePosition: function (newPosition) {
            this.get('machine').setAxisValue(this.get('name'), newPosition);
        },
        defineOffset: function (newOffset) {
            this.set('offset', newOffset);
            this.get('machine').setWorkOffset();
        }
    });

    var CNCMachine = Ember.Object.extend({
        init: function () {
            var _this = this;
            var connection = Connection.create();
            this.set('connection', connection);
            this.set('runner', new Runner(connection));
            this.set('axes', ['X', 'Y', 'Z'].map(function (name) {
                return Axis.create({name: name, machine: _this});
            }));
            this.connect();
        },
        connection: null,
        runner: null,
        axes: null,
        stepsPerMillimeter: 640,
        maxFeedrate: 2000,
        maxAcceleration: 100,
        clockFrequency: 200000,
        feedRate: 0,
        currentState: null,
        spiInput: 0,
        spiOutput: 0,
        connect: function () {
            var _this = this;
            this.get('connection').bind()
                .then(function () {
                    return _this.askForConfiguration();
                })
                .then(function () {
                    _this.askForPosition();
                    _this.askForState();
                    _this.askForWorkOffset();
                });
        },
        askForConfiguration: function () {
            var _this = this;
            return _this.get('connection')
                .controlTransfer({request: CONTROL_COMMANDS.REQUEST_PARAMETERS, length: 16})
                .then(function (data) {
                    console.log('received configuration');
                    var params = new Int32Array(data);
                    _this.set('stepsPerMillimeter', params[0]);
                    _this.set('maxFeedrate', params[1]);
                    _this.set('maxAcceleration', params[2]);
                    _this.set('clockFrequency', params[3]);
                });
        },
        askForPosition: function () {
            var _this = this;
            var positionTransfer = {request: CONTROL_COMMANDS.REQUEST_POSITION, length: 16};
            return _this.get('connection').controlTransfer(positionTransfer).then(function (data) {
                _this.decodeAxesPosition(data);
                Ember.run.later(_this, _this.askForPosition, 500);
            }, function () {
                console.error('error getting position', arguments);
                return _this.get('connection').reset().then(function () {
                    return _this.connect();
                });
            });
        },
        askForState: function () {
            var _this = this;
            var transfer = {request: CONTROL_COMMANDS.REQUEST_STATE, length: 12};
            return this.get('connection').controlTransfer(transfer).then(
                function (data) {
                    _this.decodeState(data);
                    Ember.run.later(_this, _this.askForState, 200);
                }, function () {
                    console.error('error getting state', arguments);
                    return _this.get('connection').reset().then(function () {
                        return _this.connect();
                    });
                });
        },
        askForWorkOffset: function () {
            var _this = this;
            var transfer = {request: CONTROL_COMMANDS.REQUEST_WORK_OFFSET, length: 12};
            return this.get('connection').controlTransfer(transfer).then(
                function (data) {
                    var buffer = new Int32Array(data);
                    var resolution = _this.get('stepsPerMillimeter');
                    _this.get('axes')[0].set('offset', buffer[0] / resolution);
                    _this.get('axes')[1].set('offset', buffer[1] / resolution);
                    _this.get('axes')[2].set('offset', buffer[2] / resolution);
                    Ember.run.later(_this, _this.askForWorkOffset, 1000);
                }, function () {
                    console.error('error getting work offset', arguments);
                });
        },
        setWorkOffset: function () {
            var resolution = this.get('stepsPerMillimeter');
            var x = this.get('axes')[0].get('offset') * resolution;
            var y = this.get('axes')[1].get('offset') * resolution;
            var z = this.get('axes')[2].get('offset') * resolution;
            var data = new Int32Array([x, y, z]).buffer;
            return this.get('connection').controlTransfer({
                direction: 'out', request: CONTROL_COMMANDS.REQUEST_WORK_OFFSET, data: data
            });
        },
        setAxisValue: function (axis, valueInmm) {
            var values = {X: 0, Y: 0, Z: 0};
            values[axis] = valueInmm * this.get('stepsPerMillimeter');
            var encodedAxis = parseInt({X: '001', Y: '010', Z: '100'}[axis], 2);
            var data = new Int32Array([values.X, values.Y, values.Z]).buffer;
            return this.get('connection').controlTransfer({
                direction: 'out',
                request: CONTROL_COMMANDS.REQUEST_DEFINE_AXIS_POSITION,
                value: encodedAxis,
                data: data
            });
        },
        quickControlTransfer: function (request, value) {
            return this.get('connection').controlTransfer({direction: 'out', request: request, value: value});
        },
        setManualMode: function () {
            this.quickControlTransfer(CONTROL_COMMANDS.REQUEST_TOGGLE_MANUAL_STATE);
        },
        decodeAxesPosition: function (data) {
            var buffer = new Int32Array(data);
            this.get('axes')[0].set('position', buffer[0] / this.get('stepsPerMillimeter'));
            this.get('axes')[1].set('position', buffer[1] / this.get('stepsPerMillimeter'));
            this.get('axes')[2].set('position', buffer[2] / this.get('stepsPerMillimeter'));
            var feedrate = buffer[3] == 0 ? 0 : 60 * this.get('clockFrequency') / this.get('stepsPerMillimeter') / buffer[3];
            this.set('feedRate', feedrate);
            $('#webView')[0].contentWindow.postMessage({
                type: 'toolPosition',
                position: this.getParameters().position
            }, '*');
        },
        decodeState: function (data) {
            var dataView = new DataView(data);
            var state = dataView.getUint16(0, true);
            this.set('currentState', state);
            var bitPart = dataView.getUint8(2, true);
            this.set('estop', !!(bitPart & (1 << 0)));
            this.set('toolProbe', !!(bitPart & (1 << 1)));
            this.get('axes')[0].set('homed', !!(bitPart & (1 << 2)));
            this.get('axes')[1].set('homed', !!(bitPart & (1 << 3)));
            this.get('axes')[2].set('homed', !!(bitPart & (1 << 4)));
            this.set('spiInput', dataView.getUint8(4, true));
            this.set('spiOutput', dataView.getUint8(6, true));
            this.set('programID', dataView.getUint32(8, true));
            this.set('spindleRunning', !!(this.get('spiInput') & SPI_INPUT_MAPPING.SPINDLE_RUNNING));
            this.set('spindleUpToSpeed', !!(this.get('spiInput') & SPI_INPUT_MAPPING.SPINDLE_AT_SPEED));
            this.get('axes')[0].set('limit', !!(this.get('spiInput') & SPI_INPUT_MAPPING.LIMIT_X));
            this.get('axes')[1].set('limit', !!(this.get('spiInput') & SPI_INPUT_MAPPING.LIMIT_Y));
            this.get('axes')[2].set('limit', !!(this.get('spiInput') & SPI_INPUT_MAPPING.LIMIT_Z));
            this.set('socketOn', !!(this.get('spiOutput') & SPI_OUTPUT_MAPPING.SOCKET));
            var operations = this.get('runner').programs[this.get('programID')];
            $('#webView')[0].contentWindow.postMessage({
                type: 'current operations',
                operations: (operations ? operations : [])
            }, '*');
        },
        getParameters: function () {
            var keys = ['stepsPerMillimeter', 'maxFeedrate', 'maxAcceleration', 'clockFrequency'];
            var res = {};
            for (var i = 0; i < keys.length; i++)
                res[keys[i]] = this.get(keys[i]);
            var axes = this.get('axes');
            res.position = new util.Point(axes[0].get('position'), axes[1].get('position'), axes[2].get('position'));
            return res;
        },
        sendGcode: function (code) {
            this.get('runner').executeProgram({type: 'gcode', program: code, parameters: this.getParameters()});
        },
        abort: function () {
            var _this = this;
            this.quickControlTransfer(CONTROL_COMMANDS.REQUEST_ABORT)
                .then(function () {
                    return _this.get('runner').stop();
                })
                .then(function () {
                    return _this.quickControlTransfer(CONTROL_COMMANDS.REQUEST_CLEAR_ABORT);
                })
        },
        transmitProgram: function () {
            var deferred = RSVP.defer();
            $('#webView')[0].contentWindow.postMessage({type: 'gimme program', parameters: this.getParameters()}, '*',
                [this.get('runner').getCodeChannel(deferred)]);
            return deferred.promise;
        },
        resumeProgram: function () {
            return this.quickControlTransfer(CONTROL_COMMANDS.REQUEST_RESUME_PROGRAM);
        },
        startSpindle: function () {
            return this.quickControlTransfer(CONTROL_COMMANDS.REQUEST_SET_SPI_OUTPUT, SPI_OUTPUT_MAPPING.RUN_SPINDLE);
        },
        stopSpindle: function () {
            return this.quickControlTransfer(CONTROL_COMMANDS.REQUEST_RESET_SPI_OUTPUT, SPI_OUTPUT_MAPPING.RUN_SPINDLE);
        },
        toggleSocket: function () {
            var request = (this.get('socketOn') ? 'REQUEST_RESET_SPI_OUTPUT' : 'REQUEST_SET_SPI_OUTPUT');
            return this.quickControlTransfer(CONTROL_COMMANDS[request], SPI_OUTPUT_MAPPING.SOCKET);
        },
        home: function () {
            return this.quickControlTransfer(CONTROL_COMMANDS.REQUEST_HOME);
        },
        spiInputBinary: function () {
            return this.get('spiInput').toString(2);
        }.property('spiInput'),
        spiOutputBinary: function () {
            return this.get('spiOutput').toString(2);
        }.property('spiOutput')
    });
    CNCMachine.STATES = STATES;
    return CNCMachine;
});