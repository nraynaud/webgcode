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
            computeSpeedFeed: attr('boolean', {defaultValue: true}),
            userFeedrate: attr('number', {defaultValue: 100}),
            speed: attr('number', {defaultValue: 24000}),
            startPoint: attr('point', {defaultValue: new util.Point(0, 0, 10)}),
            jobSummary: DS.belongsTo('jobSummary', {inverse: 'job', async: true}),
            shapes: DS.hasMany('shape', {inverse: 'job', embedded: true}),
            operations: DS.hasMany('operation', {inverse: 'job', embedded: true}),
            offsetX: attr('number', {defaultValue: 0}),
            offsetY: attr('number', {defaultValue: 0}),
            startSpindle: attr('boolean', {defaultValue: true}),
            transitionTravels: [],
            operationsOrderProperty: ['index'],
            orderedOperations: Ember.computed.sort('operations', 'operationsOrderProperty'),
            enabledOperations: Ember.computed.filterBy('orderedOperations', 'enabled', true),
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
            transitionTravelsObeserved: function () {
                Ember.run.debounce(this, this.computeTransitionTravels, 100);
            }.observes('enabledOperations.@each.toolpath.@each'),
            computeTransitionTravels: function () {
                var operations = this.get('enabledOperations');
                var travelBits = [];
                var pathFragments = [];
                var endPoint = null;
                operations.forEach(function (operation) {
                    if (operation.get('toolpath'))
                        pathFragments.pushObjects(operation.get('toolpath'));
                });
                if (pathFragments.length) {
                    var prefix = new tp.GeneralPolylineToolpath();
                    prefix.pushPoint(this.get('startPoint'));
                    prefix.pushPoint(pathFragments[0].getStartPoint());
                    travelBits.push(prefix);
                    for (var i = 0; i < pathFragments.length; i++) {
                        endPoint = pathFragments[i].getStopPoint();
                        var travel = new tp.GeneralPolylineToolpath();
                        travel.pushPointXYZ(endPoint.x, endPoint.y, endPoint.z);
                        travel.pushPointXYZ(endPoint.x, endPoint.y, this.get('safetyZ'));
                        if (i + 1 < pathFragments.length) {
                            var destinationPoint = pathFragments[i + 1].getStartPoint();
                            travel.pushPointXYZ(destinationPoint.x, destinationPoint.y, this.get('safetyZ'));
                        }
                        travelBits.push(travel);
                    }
                    var suffix = new tp.GeneralPolylineToolpath();
                    suffix.pushPoint(travelBits[travelBits.length - 1].getStopPoint());
                    suffix.pushPoint(this.get('startPoint'));
                    travelBits.push(suffix);
                }
                var len = 0;
                for (i = 0; i < travelBits.length; i++)
                    len += travelBits[i].length();
                console.log('travel dist', len);
                this.set('transitionTravels', travelBits);
            }.on('init'),
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
            computeCompactToolPath: function () {
                var operations = this.get('enabledOperations');
                var feedrate = this.get('feedrate');
                console.log('using feed rate', feedrate);
                var safetyZ = this.get('safetyZ');
                var travelBits = [];
                var pathFragments = [];
                var endPoint = null;
                operations.forEach(function (operation) {
                    var toolpath = operation.get('toolpath');
                    toolpath.forEach(function (fragment) {
                        fragment.operation = operation.get('id');
                    });
                    pathFragments.pushObjects(toolpath);
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
                        travelBits.push({
                            operation: fragment.operation,
                            speedTag: 'normal',
                            feedRate: feedrate,
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