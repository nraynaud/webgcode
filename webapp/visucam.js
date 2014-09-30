"use strict";
require(['Ember', 'EmberData', 'cnc/ui/views', 'cnc/ui/twoDView', 'cnc/ui/threeDView', 'cnc/cam.js', 'cnc/util.js', 'cnc/toolpath', 'templates'],
    function (Ember, DS, views, TwoDView, TreeDView, cam, util, tp, templates) {
        Ember.TEMPLATES['application'] = Ember.TEMPLATES['visucamApp'];

        window.Visucam = Ember.Application.create({});
        Visucam.NumberView = views.NumberField;
        Visucam.Shape = Ember.Object.extend({
            definition: null
        });
        /**
         * Here is the deal: the Operation grabs the tool at startPoint for X and Y and on the security plane,
         * at zero speed, zero inertia.
         * Operation releases the tool at stopPoint, at the Z it wants at zero speed and zero inertia, but the document will
         * pull the tool along Z+ to the security plane, so dovetail tools or slotting tools better be out at the end of the operation.
         * The Document does the travel before, in between and after the operations.
         * When this works we can try to be smarter and not stop uselessly.
         */
        Visucam.Operation = Ember.Object.extend({
            name: null,
            securityZ: null,
            outline: null,
            inside: null,
            toolDiameter: null,
            toolpath: null,
            startPoint: function () {
                var pt = this.get('toolpath').getStartPoint();
                return new util.Point(pt.x, pt.y);
            }.property('toolpath'),
            endPoint: function () {
                return this.get('toolpath').getStopPoint();
            }.property('toolpath')
        });
        Visucam.SimpleContourOperation = Visucam.Operation.extend({
            init: function () {
                this.computeToolpath();
            },
            contourZ: 0,
            specialTemplate: 'simpleContour',
            computeToolpath: function () {
                var machine = new cam.Machine(null);
                machine.setParams(this.get('contourZ'), 10, 100);
                var polygon = cam.pathDefToClipper(this.get('outline.definition'));
                var polygon1 = machine.contourClipper(polygon, parseFloat(this.get('toolDiameter')) / 2, this.get('inside'));
                var toolpath = machine.fromClipper(polygon1)[0].asGeneralToolpath(this.get('contourZ'));
                var startPoint = toolpath.getStartPoint();
                toolpath.pushPointInFront(startPoint.x, startPoint.y, this.get('securityZ'));
                this.set('toolpath', toolpath);
            }.observes('outline', 'contourZ', 'toolDiameter', 'inside', 'securityZ')
        });
        Visucam.RampingContourOperation = Visucam.Operation.extend({
            init: function () {
                this.computeToolpath();
            },
            startZ: 0,
            stopZ: -5,
            turns: 5,
            specialTemplate: 'rampingContour',
            computeToolpath: function () {
                var machine = new cam.Machine(null);
                machine.setParams(this.get('contourZ'), 10, 100);
                var contour = machine.contourClipper(cam.pathDefToClipper(this.get('outline.definition')), parseFloat(this.get('toolDiameter')) / 2, this.get('inside'));
                var toolpath = machine.rampToolPathArray(
                    machine.fromClipper(contour), parseFloat(this.get('startZ')), parseFloat(this.get('stopZ')), parseFloat(this.get('turns')))[0];
                var startPoint = toolpath.getStartPoint();
                toolpath.pushPointInFront(startPoint.x, startPoint.y, this.get('securityZ'));
                this.set('toolpath', toolpath);
            }.observes('outline', 'startZ', 'stopZ', 'turns', 'toolDiameter', 'inside', 'securityZ')
        });

        Visucam.Document = Ember.Object.extend({
            init: function () {
                this.syncSecurityZ();
            },
            securityZ: 5,
            operations: [],
            shapes: [],
            transitionTravels: function () {
                var operations = this.get('operations');
                var travelBits = [];
                for (var i = 0; i < operations.length - 1; i++) {
                    var endPoint = operations[i].get('endPoint');
                    var destinationPoint = operations[i + 1].get('startPoint');
                    var travel = new tp.GeneralPolylineToolpath();
                    travel.pushPoint(endPoint.x, endPoint.y, endPoint.z);
                    travel.pushPoint(endPoint.x, endPoint.y, this.get('securityZ'));
                    travel.pushPoint(destinationPoint.x, destinationPoint.y, this.get('securityZ'));
                    travelBits.push(travel);
                }
                return travelBits;
            }.property('operations.@each.startPoint', 'operations.@each.endPoint'),
            syncSecurityZ: function () {
                var securityZ = this.get('securityZ');
                this.get('operations').forEach(function (operation) {
                    operation.set('securityZ', securityZ);
                });
            }.observes('securityZ', 'operations.@each.securityZ')
        });

        var shape1 = Visucam.Shape.create({
            id: 1,
            definition: 'M0,0L100,0L100,100L0,100 Z'
        });
        var shape2 = Visucam.Shape.create({
            id: 2,
            definition: 'M25, 35 A10, 10 0 0 0 35, 25 A10, 10 0 0 0 25, 15 A10, 10 0 0 0 15, 25 A10, 10 0 0 0 25, 35Z'
        });
        var shape3 = Visucam.Shape.create({
            id: 3,
            definition: 'M50,50L80,50L80,80L50,80 Z'
        });
        var op1 = Visucam.SimpleContourOperation.create({
            id: 1,
            name: 'Outer Profiling',
            outline: shape1,
            toolDiameter: 3,
            inside: false,
            contourZ: -10
        });
        var op2 = Visucam.RampingContourOperation.create({
            id: 2,
            name: 'Inner Profiling 1',
            outline: shape2,
            toolDiameter: 3,
            inside: true,
            startZ: 0,
            stopZ: -10,
            turns: 2
        });

        var op3 = Visucam.RampingContourOperation.create({
            id: 3,
            name: 'Inner Profiling 2',
            outline: shape3,
            toolDiameter: 3,
            inside: true,
            startZ: 0,
            stopZ: -10,
            turns: 2
        });
        var doc = Visucam.Document.create({
            securityZ: 10,
            operations: [op1, op2, op3],
            shapes: [shape1, shape2, shape3]
        });

        var operations = {
            1: op1,
            2: op2,
            3: op3
        };

        Visucam.Router.map(function () {
            this.resource('operation', {path: '/operations/:operation_id'});
        });
        Visucam.ApplicationRoute = Ember.Route.extend({
            model: function () {
                return doc;
            }
        });
        Visucam.OperationRoute = Ember.Route.extend({
            model: function (params) {
                return operations[params.operation_id];
            }
        });

        Visucam.ApplicationController = Ember.ObjectController.extend({
            needs: ['operation'],
            currentOperation: function () {
                return this.get('controllers.operation.model');
            }.property('controllers.operation.model')
        });

        Visucam.OperationController = Ember.ObjectController.extend({
            init: function () {
                this._super();
            }
        });
        Visucam.OperationListItemController = Ember.ObjectController.extend({
            needs: ['application'],
            isCurrent: function () {
                return this.get('controllers.application.currentOperation') === this.get('model');
            }.property('controllers.application.currentOperation')
        });

        Visucam.TwoDView = Ember.View.extend({
            classNames: ['TwoDView'],
            didInsertElement: function () {
                var view = TwoDView.TwoDView.create({element: this.$()});
                this.set('nativeComponent', view);
                this.set('documentDisplay', view.get('paper').group());
                this.set('currentOperationDisplay', view.get('paper').group());
                this.set('highlight', view.get('overlay').group().attr('class', 'highlight'));
                this.synchronizeCurrentOperation();
                this.synchronizeDocument();
            },
            synchronizeCurrentOperation: function () {
                var operation = this.get('controller.currentOperation');
                if (!operation)
                    return;
                var currentOperationDisplay = this.get('currentOperationDisplay');
                currentOperationDisplay.clear();
                currentOperationDisplay.path(operation.get('toolpath').asPathDef())
                    .attr('class', 'toolpath normalMove');
                var highlight = this.get('highlight');
                highlight.clear();
                highlight.path(operation.get('outline.definition'));
            }.observes('controller.currentOperation', 'controller.currentOperation.toolpath'),
            synchronizeDocument: function () {
                var shapes = this.get('controller.shapes');
                var _this = this;
                shapes.forEach(function (shape) {
                    _this.get('documentDisplay').path(shape.get('definition')).attr('class', 'outline');
                });
                this.get('nativeComponent').zoomExtent();
            }.observes('controller.shapes')
        });
        Visucam.TreeDView = Ember.View.extend({
            classNames: ['ThreeDView'],
            didInsertElement: function () {
                var threeDView = new TreeDView.ThreeDView(this.$());
                this.set('nativeComponent', threeDView);
                this.synchronizeCurrentOperation();
                this.synchronizeDocument();
            },
            synchronizeCurrentOperation: function () {
                var threeDView = this.get('nativeComponent');
                threeDView.clearToolpath();
                var operation = this.get('controller.currentOperation');
                if (operation) {
                    var toolpath = operation.get('toolpath');
                    var res = [];
                    toolpath.forEachPoint(function (x, y, z, _) {
                        res.push(x, y, z);
                    }, operation.get('contourZ'));
                    var vertices = new Float32Array(res);
                    threeDView.addToolpathFragment(threeDView.toolpath, {vertices: vertices.buffer, speedTag: 'normal'});
                    threeDView.displayHighlight(cam.pathDefToPolygons(operation.get('outline.definition'))[0]);
                    var travelMoves = this.get('controller.transitionTravels');
                    var securityZ = this.get('controller.securityZ');
                    for (var i = 0; i < travelMoves.length; i++) {
                        res = [];
                        var poly = travelMoves[i].path;
                        for (var j = 0; j < poly.length; j++)
                            res.push(poly[j][0], poly[j][1], poly[j][2]);
                        vertices = new Float32Array(res);
                        threeDView.addToolpathFragment(threeDView.toolpath, {vertices: vertices.buffer, speedTag: 'rapid'});
                    }
                }
                threeDView.reRender();
            }.observes('controller.currentOperation', 'controller.currentOperation.toolpath', 'controller.securityZ', 'controller.transitionTravels'),
            synchronizeDocument: function () {
                var threeDView = this.get('nativeComponent');
                threeDView.clearOutlines();
                var shapes = this.get('controller.shapes');
                shapes.forEach(function (shape) {
                    var res = [];
                    var polys = cam.pathDefToPolygons(shape.get('definition'));
                    for (var i = 0; i < polys.length; i++) {
                        var poly = polys[i];
                        res = [];
                        for (var j = 0; j < poly.length; j++)
                            res.push(poly[j].X, poly[j].Y, 0);
                        threeDView.addCollated(threeDView.outline, new Float32Array(res), 'outlineDisplay', threeDView.outlineMaterial);
                    }
                });
                threeDView.zoomExtent();
                threeDView.reRender();
            }.observes('controller.shapes'),
            synchronizeTravel: function () {

            }.observes('controller.transitionTravels')
        });

    });