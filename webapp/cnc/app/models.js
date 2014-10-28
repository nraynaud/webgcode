"use strict";

define(['Ember', 'EmberData', 'cnc/util', 'cnc/cam/operations', 'cnc/cam/toolpath'], function (Ember, DS, util, Operations, tp) {
    var attr = DS.attr;

    var Shape = DS.Model.extend({
        definition: attr('string')
    });

    var operationDefinition = {
        name: attr('string', {defaultValue: 'New Operation'}),
        type: attr('string', {defaultValue: 'SimpleEngravingOperation'}),
        outline: DS.belongsTo('shape'),
        job: DS.belongsTo('job'),
        installObservers: function () {
            var properties = Operations[this.get('type')].properties;
            var _this = this;
            Object.keys(properties).forEach(function (key) {
                _this.addObserver(key, _this, _this.computeToolpath)
            });
        }.observes('type').on('init'),
        uninstallObservers: function () {
            var properties = Operations[this.get('type')].properties;
            var _this = this;
            Object.keys(properties).forEach(function (key) {
                _this.removeObserver(key, _this, _this.computeToolpath)
            });
        }.observesBefore('type'),
        computeToolpath: function () {
            Operations[this.get('type')]['computeToolpath'](this);
        }.observes('type', 'job.toolDiameter', 'job.safetyZ').on('init')
    };

    //add all the attributes from all the operations types
    for (var opName in Operations) {
        var op = Operations[opName];
        for (var attrName in op.properties) {
            var definition = op.properties[attrName];
            console.log(opName, attrName, definition);
            operationDefinition[attrName] = definition;
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

    var Operation2 = DS.Model.extend(operationDefinition);

    var Job2 = DS.Model.extend({
        safetyZ: attr('number', {defaultValue: 5}),
        toolDiameter: attr('number', {defaultValue: 3}),
        toolFlutes: attr('number', {defaultValue: 2}),
        surfaceSpeed: attr('number', {defaultValue: 200}),
        chipLoad: attr('number', {defaultValue: 0.01}),
        feedrate: attr('number', {defaultValue: 100}),
        speed: attr('number', {defaultValue: 24000}),
        startPoint: attr(null, {defaultValue: new util.Point(0, 0, 10)}),
        operations: DS.hasMany('operation', {
            inverse: 'job'
        }),
        shapes: DS.hasMany('shape'),
        deleteOperation: function (operation) {
            this.get('operations').removeObject(operation);
            operation.destroyRecord();
        },
        transitionTravels: function () {
            var operations = this.get('operations');
            var travelBits = [];
            var pathFragments = [];
            var endPoint = null;
            operations.forEach(function (operation) {
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
            return travelBits;
        }.property('operations.@each.toolpath.@each'),
        createOperation: function (params) {
            var operation = this.store.createRecord('operation', params);
            operation.set('job', this);
            this.get('operations').pushObject(operation);
            return  operation;
        },
        createShape: function (def) {
            var shape = this.store.createRecord('shape', {definition: def});
            this.get('shapes').pushObject(shape);
            return shape;
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
        Job: Job2,
        Operation: Operation2,
        Shape: Shape
    }
});