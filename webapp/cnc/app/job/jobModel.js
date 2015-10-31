"use strict";
define(['Ember', 'EmberData', 'cnc/cam/cam', 'cnc/util', 'cnc/cam/operations', 'cnc/cam/toolpath'],
    function (Ember, DS, cam, util, Operations, tp) {
        var attr = DS.attr;

        return DS.Model.extend({
            name: attr('string', {defaultValue: 'Unnamed Job'}),
            safetyZ: attr('number', {defaultValue: 5}),
            toolDiameter: attr('number', {defaultValue: 3}),
            toolFlutes: attr('number', {defaultValue: 2}),
            surfaceSpeed: attr('number', {defaultValue: 200}),
            chipLoad: attr('number', {defaultValue: 0.01}),
            computeSpeedFeed: attr('boolean', {defaultValue: false}),
            userFeedrate: attr('number', {defaultValue: 100}),
            speed: attr('number', {defaultValue: 24000}),
            startPoint: attr('point', {defaultValue: new util.Point(0, 0, 10)}),
            jobSummary: DS.belongsTo('jobSummary', {inverse: 'job', async: true}),
            shapes: DS.hasMany('shape', {inverse: 'job', embedded: true}),
            operations: DS.hasMany('operation', {inverse: 'job', embedded: true}),
            offsetX: attr('number', {defaultValue: 0}),
            offsetY: attr('number', {defaultValue: 0}),
            startSpindle: attr('boolean', {defaultValue: true}),
            startSocket: attr('boolean', {defaultValue: true}),
            transitionTravels: [],
            operationsOrderProperty: ['index'],
            orderedOperations: Ember.computed.sort('operations', 'operationsOrderProperty'),
            enabledOperations: Ember.computed.filterBy('orderedOperations', 'enabled', true),
            computingOperations: Ember.computed.filterBy('operations', 'computing', true),
            computing: Ember.computed.notEmpty('computingOperations'),
            operationsTravelsBits: Ember.computed.mapBy('enabledOperations', 'travelBits'),
            toolRadius: function () {
                return parseFloat(this.get('toolDiameter')) / 2;
            }.property('toolDiameter'),
            didLoad: function () {
                //re-number operations, because some of them were serialized before the index field existed.
                var i = 0;
                this.get('orderedOperations').slice().forEach(function (op) {
                    op.set('index', i);
                    i++;
                });
            },
            deleteOperation: function (operation) {
                this.get('operations').removeObject(operation);
                operation.destroyRecord();
                this.save();
            },
            deleteShape: function (shape) {
                this.get('shapes').removeObject(shape);
                shape.destroyRecord();
                this.save();
            },
            safeStartPoint: function () {
                var startPoint = this.get('startPoint');
                return new util.Point(startPoint.x, startPoint.y, Math.max(startPoint.z, this.get('safetyZ')));
            }.property('startPoint', 'safetyZ'),
            prefixTravel: function () {
                var firstPath = this.get('enabledOperations.firstObject.toolpath.firstObject');
                var result = new tp.GeneralPolylineToolpath([this.get('safeStartPoint')]);
                result.speedTag = 'rapid';
                result.initialPoint = this.get('startPoint');
                if (firstPath) {
                    var firstPoint = firstPath.getStartPoint(0);
                    result.pushPointXYZ(firstPoint.x, firstPoint.y, this.get('safetyZ'));
                }
                return result;
            }.property('startPoint', 'safeStartPoint', 'safetyZ', 'enabledOperations.firstObject.toolpath.firstObject'),
            suffixTravel: function () {
                var lastPath = this.get('enabledOperations.lastObject.toolpath.lastObject');
                var result = new tp.GeneralPolylineToolpath();
                result.speedTag = 'rapid';
                if (lastPath) {
                    var lastPoint = lastPath.getStopPoint(0);
                    result.initialPoint = lastPoint;
                    result.pushPointXYZ(lastPoint.x, lastPoint.y, this.get('safetyZ'));
                    result.pushPoint(this.get('safeStartPoint'))
                }
                return result;
            }.property('safeStartPoint', 'safetyZ', 'enabledOperations.lastObject', 'enabledOperations.lastObject.toolpath'),
            transitionTravelsObeserved: function () {
                Ember.run.debounce(this, this.computeTransitionTravels, 100);
            }.observes('startPoint', 'operationsTravelsBits', 'prefixTravel', 'suffixTravel', 'enabledOperations.@each.assembledPath'),
            computeTransitionTravels: function () {
                this.set('transitionTravels', this.get('wholeProgram').getTravelBits());
            }.on('didLoad'),
            wholeProgram: function () {
                return tp.assembleWholeProgram(this.get('prefixTravel'), this.get('suffixTravel'), this.get('safetyZ'),
                    this.get('enabledOperations').filterBy('assembledPath.isEmpty', false).mapBy('assembledPath'));
            }.property('prefixTravel', 'suffixTravel', 'enabledOperations.@each.assembledPath', 'safetyZ'),
            createOperation: function (params) {
                var lastOp = this.get('orderedOperations.lastObject');
                if (lastOp) {
                    if (params == null) {
                        params = lastOp.toJSON();
                        params.job = this;
                        params.outline = lastOp.get('outline');
                        params.index = lastOp.get('index') + 1;
                    }
                    if (params.index == null)
                        params.index = lastOp.get('index') + 1;
                }
                var operation = this.store.createRecord('operation', params);
                operation.set('job', this);
                this.get('operations').pushObject(operation);
                return operation;
            },
            createShape: function (def, name, params) {
                var shape = this.store.createRecord('shape', $.extend({definition: def, name: name}, params));
                this.get('shapes').pushObject(shape);
                return shape;
            },
            saveAll: function () {
                var summaryPromise = this.get('jobSummary');
                var _this = this;
                summaryPromise.then(function (summary) {
                    if (summary == null) {
                        summary = _this.store.createRecord('jobSummary', {job: _this, name: _this.get('name')});
                        _this.set('jobSummary', summary);
                    } else
                        summary.set('name', _this.get('name'));
                    return Ember.RSVP.all([summary.save(), _this.save()]);
                });
            },
            updateSpeed: function () {
                var toolDiameter = this.get('toolDiameter');
                var surfaceSpeed = this.get('surfaceSpeed');
                this.set('speed', Math.round(surfaceSpeed * 1000 / Math.PI / toolDiameter));
            }.observes('surfaceSpeed', 'toolDiameter').on('didCreate'),
            computedFeedrate: function () {
                var speed = this.get('speed');
                var chipLoad = this.get('chipLoad');
                var toolFlutes = this.get('toolFlutes');
                return Math.round(speed * chipLoad * toolFlutes);
            }.property('toolFlutes', 'chipLoad', 'speed'),
            feedrate: function () {
                return this.get('computeSpeedFeed') ? this.get('computedFeedrate') : this.get('userFeedrate');
            }.property('computedFeedrate', 'userFeedrate', 'computeSpeedFeed'),
            canSendProgram: function () {
                var operations = this.get('operations');
                if (operations.length == 0)
                    return false;
                var oneIsComputing = false;
                var oneIsEnabled = false;
                operations.forEach(function (op) {
                    if (op.get('enabled')) {
                        oneIsEnabled = true;
                        if (op.get('computing'))
                            oneIsComputing = true;
                    }
                });
                return oneIsEnabled && !oneIsComputing;
            }.property('operations', 'operations.@each.enabled', 'operations.@each.computing'),
            computeDuration: function () {
                if (!this.get('wholeProgram').path.length)
                    return;
                this.set('duration', 'computing...');
                if (this.get('durationWorker'))
                    this.get('durationWorker').terminate();
                var worker = new Worker(require.toUrl('worker.js'));
                this.set('durationWorker', worker);
                var _this = this;
                worker.onmessage = Ember.run.bind(this, function (event) {
                    _this.set('duration', event.data.duration);
                    worker.terminate();
                    _this.set('durationWorker', null);
                });
                worker.postMessage({
                    operation: 'computeDuration',
                    path: this.get('wholeProgram').path
                });
            },
            observeOperationDuration: function () {
                this.set('duration', null);
                if (this.get('enabledOperations').filterBy('computing', true).length == 0)
                    Ember.run.debounce(this, 'computeDuration', 100);
            }.observes('wholeProgram', 'operations.@each.actualFeedrate', 'operations.@each.computing'),
            computeCompactToolPath: function () {
                console.log('computeCompactToolPath');
                var operations = this.get('enabledOperations');
                var safetyZ = this.get('safetyZ');
                var travelBits = [];
                var pathFragments = [];
                var endPoint = null;
                operations.forEach(function (operation) {
                    pathFragments.pushObjects(operation.get('toolpath'));
                });
                var startPoint = this.get('startPoint');
                console.timeEnd('preparation');
                var position = startPoint;
                var safeStartPoint = new util.Point(startPoint.x, startPoint.y, Math.max(startPoint.z, safetyZ));

                function segment(p1, p2) {
                    return new Float32Array([p1.x, p1.y, p1.z, p2.x, p2.y, p2.z]);
                }

                travelBits.push({speedTag: 'rapid', path: segment(startPoint, safeStartPoint)});
                if (pathFragments.length) {
                    position = pathFragments[0].getStartPoint();
                    travelBits.push({speedTag: 'rapid', path: segment(safeStartPoint, position)});
                    for (var i = 0; i < pathFragments.length; i++) {
                        var fragment = pathFragments[i];
                        console.log('feedrate', fragment.feedrate);
                        travelBits.push({
                            operation: fragment.operation,
                            speedTag: 'normal',
                            feedRate: fragment.feedrate,
                            path: fragment.asCompactToolpath()
                        });
                        endPoint = fragment.getStopPoint();
                        position = new util.Point(endPoint.x, endPoint.y, safetyZ);
                        travelBits.push({speedTag: 'rapid', path: segment(endPoint, position)});
                        if (i + 1 < pathFragments.length) {
                            var destinationPoint = pathFragments[i + 1].getStartPoint();
                            var newPos = new util.Point(destinationPoint.x, destinationPoint.y, safetyZ);
                            travelBits.push({speedTag: 'rapid', path: segment(position, newPos)});
                            position = newPos;
                        }
                    }
                    travelBits.push({speedTag: 'rapid', path: segment(position, safeStartPoint)});
                }
                return travelBits;
            }
        });
    });