"use strict";
define(['Ember', 'EmberData', 'cnc/cam/cam', 'cnc/util', 'cnc/cam/operations', 'cnc/cam/toolpath',
        'cnc/cam/3D/3Dcomputer', 'require', 'cnc/gcode/simulation'],
    function (Ember, DS, cam, util, Operations, tp, Computer, require, simulation) {
        var attr = DS.attr;
        var operationDefinition = {
            init: function () {
                this._super.apply(this, arguments);
            },

            name: attr('string', {defaultValue: 'New Operation'}),
            index: attr('number', {defaultValue: 0}),
            type: attr('string', {defaultValue: 'SimpleEngravingOperation'}),
            feedrate: attr('number', {defaultValue: 0}),
            feedrateOverride: attr('boolean', {defaultValue: false}),
            enabled: attr('boolean', {defaultValue: true}),
            outline: DS.belongsTo('shape'),
            job: DS.belongsTo('job'),
            task: null,
            terminateWorkerWhenDeleted: function () {
                var worker = this.get('toolpathWorker');
                if (worker)
                    worker.terminate();
                var task = this.get('task');
                if (task)
                    task.cancel();
                var durationWorker = this.get('durationWorker');
                if (durationWorker)
                    durationWorker.terminate();
            }.on('didDelete'),
            installObservers: function () {
                var _this = this;
                var previousProperties = this.get('previousOpertionComputerProperties');
                if (previousProperties)
                    Object.keys(previousProperties).forEach(function (key) {
                        _this.removeObserver(key, _this, _this.computeToolpathObeserved)
                    });
                var properties = this.get('operationComputer').properties;
                Object.keys(properties).forEach(function (key) {
                    _this.addObserver(key, _this, _this.computeToolpathObeserved)
                });
                this.set('previousOpertionComputerProperties', properties);
            }.observes('operationComputer').on('didLoad'),
            computeToolpathObeserved: function () {
                if (!this.get('outline.computing'))
                    if (this.get('type') != '3DlinearOperation') {
                        if (this.get('outline.definition'))
                            Ember.run.debounce(this, this.computeToolpath, 100);
                    }
                    else
                        Ember.run.debounce(this, this.compute3D, 100);
            }.observes('type', 'outline.polyline', 'job.toolRadius', 'job.safetyZ', 'outline.manualDefinition.x',
                'outline.manualDefinition.y', 'outline.computing').on('didLoad'),
            computeToolpath: function () {
                var _this = this;
                var id = this.get('id');
                if (this.get('type')) {
                    var params = this.getComputingParameters();
                    var previousWorker = _this.get('toolpathWorker');
                    if (previousWorker)
                        previousWorker.terminate();
                    _this.set('toolpath', null);
                    _this.set('missedArea', null);
                    _this.set('leftStock', null);
                    var worker = new Worker(require.toUrl('worker.js'));
                    this.set('toolpathWorker', worker);
                    worker.onmessage = Ember.run.bind(this, function (event) {
                        if (event.data.terminate && _this.get('toolpathWorker')) {
                            _this.get('toolpathWorker').terminate();
                            _this.set('toolpathWorker', null);
                        }
                        if (event.data.toolpath)
                            _this.set('toolpath', event.data.toolpath.map(function (p) {
                                var toolPath = tp.decodeToolPath(p);
                                toolPath.speedTag = 'normal';
                                toolPath.initialPoint = toolPath.getStartPoint();
                                return toolPath
                            }));
                        if (event.data.missedArea)
                            _this.set('missedArea', event.data.missedArea);
                        if (event.data.leftStock)
                            _this.set('leftStock', event.data.leftStock);
                    });
                    worker.onerror = Ember.run.bind(this, function (error) {
                        _this.set('toolpathWorker', null);
                        console.log(error);
                    });
                    worker.postMessage({
                        operation: 'computeToolpath',
                        params: params
                    });
                }
            },
            compute3D: function () {
                var _this = this;
                var safetyZ = this.get('job.safetyZ');
                var toolDiameter = this.get('job.toolDiameter');
                var model = this.get('outline.meshGeometry');
                var leaveStock = this.get('3d_leaveStock');
                var topZ = this.get('top_Z');
                var sliceZ = this.get('3d_slice_Z');
                var minZ = this.get('bottom_Z');
                var tool = this.get('tool');
                var orientation = this.get('3d_pathOrientation');
                var stepover = this.get('3d_diametralEngagement') * toolDiameter / 100;
                var startRatio = this.get('3d_startPercent') / 100;
                var stopRatio = this.get('3d_stopPercent') / 100;
                var computer = new Computer.ToolPathComputer();
                var task = this.get('task');
                if (task)
                    task.cancel();
                task = computer.computeHeightField(model, stepover, tool, leaveStock, orientation,
                    startRatio, stopRatio);
                this.set('task', task);
                task.addObserver('isDone', function () {
                    _this.set('task', null);
                });
                task.get('promise')
                    .then(function (heightField) {
                        return Computer.convertHeightFieldToToolPath(heightField, safetyZ, topZ, sliceZ, minZ);
                    })
                    .then(Ember.run.bind(this, function (result) {
                        for (var i = 0; i < result.length; i++) {
                            result[i].speedTag = 'normal';
                            result[i].initialPoint = result[i].getStartPoint();
                        }
                        _this.set('toolpath', result);
                    }));
                task.start();
            },
            computing: function () {
                return !!((this.get('task') && !this.get('task.isDone'))
                || this.get('toolpathWorker')
                || this.get('outline.computing'));
            }.property('task', 'task.isDone', 'toolpathWorker', 'outline.computing'),
            paused: function () {
                return this.get('task.isPaused');
            }.property('task', 'task.isPaused'),
            tool: function () {
                return {
                    type: this.get('3d_toolType'),
                    diameter: this.get('job.toolDiameter'),
                    angle: this.get('3d_vToolAngle'),
                    tipDiameter: this.get('3d_vToolTipDiameter')
                };
            }.property('3d_toolType', 'job.toolDiameter', '3d_vToolAngle', '3d_vToolTipDiameter'),
            actualFeedrate: function () {
                if (this.get('feedrateOverride')) {
                    var f = this.get('feedrate');
                    return f == 0 ? this.get('job.feedrate') : f;
                } else return this.get('job.feedrate');
            }.property('feedrate', 'job.feedrate', 'feedrateOverride'),
            operationComputer: function () {
                return Operations[this.get('type')];
            }.property('type'),
            getComputingParameters: function () {
                var operation = this.get('operationComputer');
                var params = {
                    job: {
                        safetyZ: this.get('job.safetyZ'),
                        toolRadius: this.get('job.toolRadius'),
                        offsetX: this.get('job.offsetX'),
                        offsetY: this.get('job.offsetY')
                    },
                    outline: {
                        flipped: this.get('outline.flipped'),
                        clipperPolyline: this.get('outline.clipperPolyline'),
                        point: {
                            x: this.get('outline.manualDefinition.x'),
                            y: this.get('outline.manualDefinition.y')
                        },
                        drillData: this.get('outline.drillData')
                    },
                    type: this.get('type'),
                    feedRate: this.get('actualFeedrate')

                };
                var _this = this;
                Object.keys(operation.properties).forEach(function (key) {
                    params[key] = _this.get(key);
                });
                return params;
            },
            travelBits: function () {
                return this.get('assembledPath').getTravelBits();
            }.property('assembledPath'),
            assembledPath: function () {
                var _this = this;
                return tp.assembleToolPathFromOperation(function () {
                    return _this.get('actualFeedrate');
                }, this.get('job.safetyZ'), this.get('toolpath'));
            }.property('toolpath', 'job.safetyZ'),
            computeOperationDuration: function () {
                this.set('operationDuration', 'computing duration...');
                if (this.get('durationWorker'))
                    this.get('durationWorker').terminate();
                var worker = new Worker(require.toUrl('worker.js'));
                this.set('durationWorker', worker);
                var _this = this;
                worker.onmessage = Ember.run.bind(this, function (event) {
                    _this.set('operationDuration', event.data.duration);
                    worker.terminate();
                    _this.set('durationWorker', null);
                });
                worker.postMessage({
                    operation: 'computeDuration',
                    path: this.get('assembledPath').path
                });
            },
            observeOperationDuration: function () {
                this.set('operationDuration', null);
                if (!this.get('computing'))
                    Ember.run.debounce(this, 'computeOperationDuration', 100);
            }.observes('assembledPath', 'actualFeedrate', 'computing'),
            pushCompactToolpathOn: function (collector) {
                var feedrate = this.get('actualFeedrate');
                var id = this.get('id');
                var travelBits = this.get('travelBits');
                for (var i = 0; i < travelBits.length; i++) {
                    var fragment = travelBits[i];
                    if (fragment.path.length == 0)
                        continue;
                    collector.push({
                        operation: id,
                        speedTag: fragment.speedTag,
                        feedRate: feedrate,
                        path: fragment.asCompactToolpath()
                    });
                }
            }
        };

//add all the attributes from all the operations types
        for (var opName in Operations) {
            var op = Operations[opName];
            for (var attrName in op.properties) {
                var definition = op.properties[attrName];
                operationDefinition[attrName] = attr(definition.type, definition.options);
            }
        }

        /**
         * Here is the deal: the Operation grabs the tool at startPoint for X and Y and on the safety plane,
         * at zero speed, zero inertia.
         * Operation releases the tool at stopPoint, at the Z it wants at zero speed and zero inertia, but the document will
         * pull the tool along Z+ to the safety plane, so dovetail tools or slotting tools better be out at the end of the operation.
         * The Job does the travel before, in between and after the operations.
         * When this works we can try to be smarter and not stop uselessly.
         */

        return DS.Model.extend(operationDefinition);
    });