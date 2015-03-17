"use strict";
var $ = {
    each: function (array, func) {
        for (var i = 0; i < array.length; i++)
            func(i, array[i]);
    },
    extend: function () {
        /** stolen from JQUERY **/
        var src, copy, name, options,
            target = arguments[0] || {},
            length = arguments.length;
        for (var i = 0; i < length; i++)
            if ((options = arguments[i]) != null)
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy)
                        continue;
                    if (copy !== undefined)
                        target[name] = copy;
                }
        return target;
        /** END stolen from JQUERY **/
    }
};

importScripts('libs/require.js', 'config.js');
var tasks = {
    createPocket: function (event) {
        require(['cnc/cam/pocket'], function (pocket) {
            pocket.createPocketWorkerSide(event);
        });
    },
    computeToolpath: function (event) {
        require(['cnc/cam/operations', 'cnc/util'], function (operations, util) {
            event.data.params.outline.clipperPolyline = event.data.params.outline.clipperPolyline.map(function (polygon) {
                return polygon.map(function (point) {
                    return new util.Point(point.x, point.y, point.z);
                });
            });
            operations[event.data.params.type].
                computeToolpath(event.data.params).then(function (toolpath) {
                    self.postMessage({
                        toolpath: toolpath.map(function (p) {
                            return p.toJSON()
                        })
                    });
                }).finally(function () {
                    close();
                });
        });
    },
    acceptProgram: function (event) {
        require(['cnc/gcode/parser', 'cnc/gcode/simulation', 'cnc/util.js'], function (parser, simulation, util) {
            function createProgramEncoder(maximumInstructionsCount) {
                var buffer = new ArrayBuffer(maximumInstructionsCount * 3 + 4);
                return {
                    buffer: buffer,
                    view: new DataView(buffer),
                    instructionsCount: 0,
                    maximumInstructionsCount: maximumInstructionsCount,
                    isFull: function () {
                        return this.instructionsCount == this.maximumInstructionsCount;
                    },
                    isNotEmpty: function () {
                        return this.instructionsCount != 0;
                    },
                    pushInstruction: function (dx, dy, dz, time) {
                        function bin(axis) {
                            var direction = axis >= 0 ? '1' : '0';
                            var enableStep = axis ? '1' : '0';
                            return direction + enableStep;
                        }

                        this.view.setUint16(this.instructionsCount * 3 + 4, time, true);
                        var word = '00' + bin(dz) + bin(dy) + bin(dx);
                        this.view.setUint8(this.instructionsCount * 3 + 6, parseInt(word, 2));
                        ++this.instructionsCount;
                    },
                    popEncodedProgram: function () {
                        // We send the *size in byte* of the program, not the instructions count
                        this.view.setUint32(0, this.instructionsCount * 3, true);
                        var encodedProgram = this.buffer.slice(0, this.instructionsCount * 3 + 4);
                        this.instructionsCount = 0;
                        return encodedProgram;
                    }
                };
            }

            var toolPath = [];
            var myPort = event.ports[0];
            myPort.onmessage = function (event) {
                var params = event.data.parameters;
                var typeConverter = {
                    gcode: function (data) {
                        return parser.evaluate(data.program, params.maxFeedrate, params.maxFeedrate, params.position);
                    },
                    toolPath: function (data) {
                        return data.toolPath;
                    },
                    compactToolPath: function (data) {
                        var fragments = data.toolPath;
                        var travelBits = [];
                        var position;
                        var travelFeedrate = params.maxFeedrate;

                        function travelTo(point, speedTag, feedrate) {
                            if (position)
                                travelBits.push({
                                    type: 'line',
                                    from: position,
                                    to: point,
                                    speedTag: speedTag,
                                    feedRate: speedTag == 'rapid' ? travelFeedrate : feedrate
                                });
                            position = point;
                        }

                        for (var i = 0; i < fragments.length; i++) {
                            var fragment = fragments[i];
                            for (var j = 0; j < fragment.path.length; j += 3) {
                                var point = new util.Point(fragment.path[j], fragment.path[j + 1], fragment.path[j + 2]);
                                travelTo(point, fragment.speedTag, fragment.feedRate);
                            }
                        }
                        return travelBits;
                    }
                };
                toolPath = typeConverter[event.data.type](event.data);

                var programEncoder = createProgramEncoder(30000);
                simulation.planProgram(toolPath, params.maxAcceleration, 1 / params.stepsPerMillimeter, params.clockFrequency,
                    function stepCollector(dx, dy, dz, time) {
                        programEncoder.pushInstruction(dx, dy, dz, time);
                        if (programEncoder.isFull()) {
                            var encodedProgram = programEncoder.popEncodedProgram();
                            self.postMessage(encodedProgram, [encodedProgram]);
                        }
                    });
                if (programEncoder.isNotEmpty()) {
                    var encodedProgram = programEncoder.popEncodedProgram();
                    self.postMessage(encodedProgram, [encodedProgram]);
                }
                if (!event.data['hasMore']) {
                    self.postMessage(null);
                    myPort.close();
                }
            };
        });
    },
    simulateGCode: function (event) {
        require(['cnc/gcode/gcodeSimulation'], function (gcodeSimulation) {
            gcodeSimulation.simulateWorkerSide(event);
        });
    },
    ping: function (event) {
        setTimeout(function () {
            postMessage('pong');
        }, 10);
    }
};

self.onmessage = function (event) {
    tasks[event.data.operation](event);
};
