"use strict";

define(['Ember', 'EmberData', 'cnc/cam/cam', 'cnc/util', 'cnc/cam/operations', 'cnc/cam/toolpath', 'require'],
    function (Ember, DS, cam, util, Operations, tp, require) {
        var attr = DS.attr;

        var PointTransform = DS.Transform.extend({
            deserialize: function (serialized) {
                return new util.Point(serialized.x, serialized.y, serialized.z);
            },
            serialize: function (deserialized) {
                return deserialized;
            }
        });

        var Shape = DS.Model.extend({
            name: attr('string', {defaultValue: 'New Shape'}),
            definition: attr('string'),
            polyline: function () {
                return cam.pathDefToPolygons(this.get('definition'));
            }.property('definition'),
            clipperPolyline: function () {
                return cam.pathDefToClipper(this.get('definition'));
            }.property('definition')
        });

        var operationDefinition = {
            init: function () {
                this._super.apply(this, arguments);
            },
            name: attr('string', {defaultValue: 'New Operation'}),
            type: attr('string', {defaultValue: 'SimpleEngravingOperation'}),
            outline: DS.belongsTo('shape'),
            job: DS.belongsTo('job'),
            installObservers: function () {
                var properties = Operations[this.get('type')].properties;
                var _this = this;
                Object.keys(properties).forEach(function (key) {
                    _this.addObserver(key, _this, _this.computeToolpathObeserved)
                });
            }.observes('type').on('didLoad'),
            uninstallObservers: function () {
                var properties = Operations[this.get('type')].properties;
                var _this = this;
                Object.keys(properties).forEach(function (key) {
                    _this.removeObserver(key, _this, _this.computeToolpathObeserved)
                });
            }.observesBefore('type'),
            computeToolpathObeserved: function () {
                if (this.get('outline.definition') && this.get('type'))
                    Ember.run.debounce(this, this.computeToolpath, 100);
            }.observes('type', 'outline.polyline', 'job.toolDiameter', 'job.safetyZ').on('init'),
            computeToolpath: function () {
                var _this = this;
                if (this.get('type')) {
                    var operation = Operations[this.get('type')];
                    var params = {
                        job: {safetyZ: this.get('job.safetyZ'), toolDiameter: this.get('job.toolDiameter')},
                        outline: {clipperPolyline: this.get('outline.clipperPolyline')},
                        type: this.get('type')
                    };
                    Object.keys(operation.properties).forEach(function (key) {
                        params[key] = _this.get(key);
                    });
                    var previousWorker = _this.get('toolpathWorker');
                    if (previousWorker)
                        previousWorker.terminate();
                    _this.set('toolpath', null);
                    var worker = new Worker(require.toUrl('worker.js'));
                    worker.onmessage = Ember.run.bind(this, function (event) {
                        _this.get('toolpathWorker').terminate();
                        _this.set('toolpathWorker', null);
                        _this.set('toolpath', event.data.toolpath.map(function (p) {
                            return tp.decodeToolPath(p)
                        }));
                    });
                    worker.onerror = Ember.run.bind(this, function (error) {
                        _this.get('toolpathWorker').terminate();
                        _this.set('toolpathWorker', null);
                        console.log(error);
                    });
                    worker.postMessage({
                        operation: 'computeToolpath',
                        params: params
                    });
                    this.set('toolpathWorker', worker);
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

        var Operation = DS.Model.extend(operationDefinition);

        var Job = DS.Model.extend({
            name: attr('string', {defaultValue: 'Unnamed Job'}),
            safetyZ: attr('number', {defaultValue: 5}),
            toolDiameter: attr('number', {defaultValue: 3}),
            toolFlutes: attr('number', {defaultValue: 2}),
            surfaceSpeed: attr('number', {defaultValue: 200}),
            chipLoad: attr('number', {defaultValue: 0.01}),
            feedrate: attr('number', {defaultValue: 100}),
            speed: attr('number', {defaultValue: 24000}),
            startPoint: attr('point', {defaultValue: new util.Point(0, 0, 10)}),
            shapes: DS.hasMany('shape', {embedded: true, async: true}),
            operations: DS.hasMany('operation', {inverse: 'job', embedded: true, async: true}),
            transitionTravels: [],
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
            }.observes('operations.@each.toolpath.@each'),
            computeTransitionTravels: function () {
                var operations = this.get('operations');
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
                this.set('transitionTravels', travelBits);
            },
            createOperation: function (params) {
                var operation = this.store.createRecord('operation', params);
                operation.set('job', this);
                this.get('operations').pushObject(operation);
                return operation;
            },
            createShape: function (def, name) {
                var shape = this.store.createRecord('shape', {definition: def, name: name});
                this.get('shapes').pushObject(shape);
                return shape;
            },
            saveAll: function () {
                this.save();
            },
            updateSpeed: function () {
                var toolDiameter = this.get('toolDiameter');
                var surfaceSpeed = this.get('surfaceSpeed');
                this.set('speed', Math.round(surfaceSpeed * 1000 / Math.PI / toolDiameter));
            }.observes('surfaceSpeed', 'toolDiameter').on('didCreate'),
            updateFeedrate: function () {
                var speed = this.get('speed');
                var chipLoad = this.get('chipLoad');
                var toolFlutes = this.get('toolFlutes');
                this.set('feedrate', Math.round(speed * chipLoad * toolFlutes));
            }.observes('toolFlutes', 'chipLoad', 'speed'),
            computeSimulableToolpath: function (travelFeedrate) {
                var operations = this.get('operations');
                var feedrate = this.get('feedrate');
                var travelBits = [];
                var pathFragments = [];
                var endPoint = null;
                operations.forEach(function (operation) {
                    pathFragments.pushObjects(operation.get('toolpath'));
                });
                var startPoint = this.get('startPoint');
                var position = startPoint;

                function travelTo(point, speedTag) {
                    travelBits.push({
                        type: 'line',
                        from: position,
                        to: point,
                        speedTag: speedTag == null ? 'rapid' : speedTag,
                        feedRate: speedTag == null ? travelFeedrate : feedrate});
                    position = point;
                }

                var safetyZ = this.get('safetyZ');
                // it could happen that the cycle be started from a position that is lower than the start point
                // for example after doing the Z zeroing, the user might leave the tool just a few mm over the stock
                // or in a hole, it would be unsafe to travel from there.
                var safeStartPoint = new util.Point(startPoint.x, startPoint.y, Math.max(startPoint.z, safetyZ));
                if (pathFragments.length) {
                    travelTo(safeStartPoint);
                    travelTo(pathFragments[0].getStartPoint());
                    for (var i = 0; i < pathFragments.length; i++) {
                        var fragment = pathFragments[i];
                        fragment.forEachPoint(function (x, y, z) {
                            travelTo(new util.Point(x, y, z), 'normal');
                        });
                        endPoint = fragment.getStopPoint();
                        travelTo(new util.Point(endPoint.x, endPoint.y, safetyZ));
                        if (i + 1 < pathFragments.length) {
                            var destinationPoint = pathFragments[i + 1].getStartPoint();
                            travelTo(new util.Point(destinationPoint.x, destinationPoint.y, safetyZ));
                        }
                    }
                    travelTo(safeStartPoint);
                }
                for (i = 0; i < travelBits.length - 1; i++) {
                    var previous = travelBits[i].to;
                    var next = travelBits[i + 1].from;
                    if (previous.sqDistance(next))
                        console.error('continuity error', i, travelBits[i], travelBits[i + 1]);
                }
                return travelBits;
            }
        });

        return {
            Job: Job,
            Operation: Operation,
            Shape: Shape,
            PointTransform: PointTransform
        }
    });