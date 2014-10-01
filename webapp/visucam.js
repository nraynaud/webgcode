"use strict";
require(['Ember', 'EmberData', 'cnc/ui/views', 'cnc/ui/twoDView', 'cnc/ui/threeDView', 'cnc/cam.js', 'cnc/util.js',
        'cnc/toolpath', 'THREE', 'templates'],
    function (Ember, DS, views, TwoDView, TreeDView, cam, util, tp, THREE, templates) {
        Ember.TEMPLATES['application'] = Ember.TEMPLATES['visucamApp'];

        window.Visucam = Ember.Application.create({});
        Visucam.NumberView = views.NumberField;
        Visucam.Shape = Ember.Object.extend({
            definition: null
        });

        /**
         * Here is the deal: the Operation grabs the tool at startPoint for X and Y and on the safety plane,
         * at zero speed, zero inertia.
         * Operation releases the tool at stopPoint, at the Z it wants at zero speed and zero inertia, but the document will
         * pull the tool along Z+ to the safety plane, so dovetail tools or slotting tools better be out at the end of the operation.
         * The Job does the travel before, in between and after the operations.
         * When this works we can try to be smarter and not stop uselessly.
         */
        Visucam.Operation = Ember.Object.extend({
            name: null,
            job: null,
            outline: null,
            inside: null,
            toolpath: null,
            startPoint: function () {
                var pt = this.get('toolpath')[0].getStartPoint();
                return new util.Point(pt.x, pt.y);
            }.property('toolpath'),
            endPoint: function () {
                var toolpath = this.get('toolpath');
                return toolpath[toolpath.length - 1].getStopPoint();
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
                var polygon1 = machine.contourClipper(polygon, parseFloat(this.get('job.toolDiameter')) / 2, this.get('inside'));
                var contourZ = this.get('contourZ');
                var safetyZ = this.get('job.safetyZ');
                var toolpath = machine.fromClipper(polygon1).map(function (path) {
                    var startPoint = path.getStartPoint();
                    var generalPath = path.asGeneralToolpath(contourZ);
                    // plunge from safety plane
                    generalPath.pushPointInFront(startPoint.x, startPoint.y, safetyZ);
                    //close the loop
                    generalPath.pushPoint(startPoint.x, startPoint.y, contourZ);
                    return generalPath;
                });
                this.set('toolpath', toolpath);
            }.observes('outline', 'contourZ', 'job.toolDiameter', 'inside', 'job.safetyZ')
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
                var clipperPolygon = cam.pathDefToClipper(this.get('outline.definition'));
                var contour = machine.contourClipper(clipperPolygon, parseFloat(this.get('job.toolDiameter')) / 2, this.get('inside'));
                var startZ = parseFloat(this.get('startZ'));
                var stopZ = parseFloat(this.get('stopZ'));
                var turns = parseFloat(this.get('turns'));
                var toolpath = machine.rampToolPathArray(machine.fromClipper(contour), startZ, stopZ, turns);
                var safetyZ = this.get('job.safetyZ');
                toolpath.forEach(function (path) {
                    var startPoint = path.getStartPoint();
                    path.pushPointInFront(startPoint.x, startPoint.y, safetyZ);
                });
                this.set('toolpath', toolpath);
            }.observes('outline', 'startZ', 'stopZ', 'turns', 'job.toolDiameter', 'inside', 'job.safetyZ')
        });

        Visucam.Job = Ember.Object.extend({
            init: function () {
                this.syncSecurityZ();
            },
            safetyZ: 5,
            toolDiameter: 3,
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
                    travel.pushPoint(endPoint.x, endPoint.y, this.get('safetyZ'));
                    travel.pushPoint(destinationPoint.x, destinationPoint.y, this.get('safetyZ'));
                    travelBits.push(travel);
                }
                return travelBits;
            }.property('operations.@each.startPoint', 'operations.@each.endPoint'),
            syncSecurityZ: function () {
                var safetyZ = this.get('safetyZ');
                this.get('operations').forEach(function (operation) {
                    operation.set('safetyZ', safetyZ);
                });
            }.observes('safetyZ', 'operations.@each.safetyZ'),
            createSimpleContour: function (id, name, outline, inside, contourZ) {
                var contour = Visucam.SimpleContourOperation.create({
                    id: id,
                    job: this,
                    name: name,
                    outline: outline,
                    inside: inside,
                    contourZ: contourZ
                });
                this.operations.push(contour);
                return  contour;
            },
            createRampingContour: function (id, name, outline, inside, startZ, stopZ, turns) {
                var contour = Visucam.RampingContourOperation.create({
                    id: id,
                    job: this,
                    name: name,
                    outline: outline,
                    inside: inside,
                    startZ: startZ,
                    stopZ: stopZ,
                    turns: turns
                });
                this.operations.push(contour);
                return  contour;
            }
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
        var shape4 = Visucam.Shape.create({
            id: 3,
            definition: 'M-10,-10 L-100,-10 L-100,-100 L-10,-100Z M-20,-20 L-20,-80L-80,-80L-80,-20Z '
        });
        var doc = Visucam.Job.create({
            safetyZ: 10,
            operations: [],
            shapes: [shape1, shape2, shape3, shape4]
        });
        var op1 = doc.createSimpleContour(1, 'Outer Profiling', shape1, false, -10);
        var op2 = doc.createRampingContour(2, 'Inner Profiling 1', shape2, true, 0, -10, 3);
        var op3 = doc.createRampingContour(3, 'Inner Profiling 2', shape3, true, 0, -15, 4);
        var op4 = doc.createRampingContour(4, 'Outer Profiling 3', shape4, false, 0, -15, 5);
        var operations = {
            1: op1,
            2: op2,
            3: op3,
            4: op4
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
                this.set('travel', view.get('paper').group().attr('class', 'travel'));
                this.set('highlight', view.get('overlay').group().attr('class', 'highlight'));
                this.synchronizeCurrentOperation();
                this.synchronizeJob();
            },
            synchronizeCurrentOperation: function () {
                var operation = this.get('controller.currentOperation');
                if (!operation)
                    return;
                var currentOperationDisplay = this.get('currentOperationDisplay');
                currentOperationDisplay.clear();
                operation.get('toolpath').forEach(function (path) {
                    currentOperationDisplay.path(path.asPathDef())
                        .attr('class', 'toolpath normalMove');
                });
                var highlight = this.get('highlight');
                highlight.clear();
                highlight.path(operation.get('outline.definition'));
                var travel = this.get('travel');
                travel.clear();
                var travelMoves = this.get('controller.transitionTravels');
                for (var i = 0; i < travelMoves.length; i++) {
                    var p = '';
                    var poly = travelMoves[i].path;
                    for (var j = 0; j < poly.length; j++) {
                        p += j == 0 ? 'M' : 'L';
                        p += poly[j][0] + ', ' + poly[j][1];
                    }
                    travel.path(p);
                }
            }.observes('controller.currentOperation', 'controller.currentOperation.toolpath', 'controller.transitionTravels'),
            synchronizeJob: function () {
                var shapes = this.get('controller.shapes');
                var _this = this;
                shapes.forEach(function (shape) {
                    _this.get('documentDisplay').path(shape.get('definition')).attr('class', 'outline');
                });
                this.get('nativeComponent').zoomExtent();
            }.observes('controller.shapes')
        });

        function collectVertices(toolpath, defaultZ) {
            var res = [];
            toolpath.forEachPoint(function (x, y, z, _) {
                res.push(x, y, z);
            }, defaultZ);
            return new Float32Array(res);
        }

        Visucam.TreeDView = Ember.View.extend({
            classNames: ['ThreeDView'],
            didInsertElement: function () {
                var threeDView = new TreeDView.ThreeDView(this.$());
                this.set('nativeComponent', threeDView);
                this.set('travelDisplay', threeDView.createDrawingNode(threeDView.rapidMaterial));
                this.set('outlinesDisplay', threeDView.createDrawingNode(threeDView.outlineMaterial));
                this.set('highlightDisplay', threeDView.createOverlayNode(threeDView.highlightMaterial));
                this.synchronizeCurrentOperation();
                this.synchronizeJob();
                this.synchronizeOutlines();
            },
            synchronizeCurrentOperation: function () {
                var threeDView = this.get('nativeComponent');
                threeDView.clearToolpath();
                var operation = this.get('controller.currentOperation');
                if (operation) {
                    var toolpath2 = operation.get('toolpath');
                    toolpath2.forEach(function (toolpath) {
                        var vertices = collectVertices(toolpath, operation.get('contourZ'));
                        threeDView.addToolpathFragment(threeDView.toolpath, {vertices: vertices.buffer, speedTag: 'normal'});
                    });
                    var highlightDisplay = this.get('highlightDisplay');
                    highlightDisplay.clear();
                    highlightDisplay.addPolyLines(cam.pathDefToPolygons(operation.get('outline.definition')));
                }
                threeDView.reRender();
            }.observes('controller.currentOperation', 'controller.currentOperation.toolpath', 'controller.safetyZ'),
            synchronizeJob: function () {
                var threeDView = this.get('nativeComponent');
                var travelDisplay = this.get('travelDisplay');
                travelDisplay.clear();
                var travelMoves = this.get('controller.transitionTravels');
                travelDisplay.addPolyLines(travelMoves);
                threeDView.reRender();
            }.observes('controller.shapes', 'controller.transitionTravels'),
            synchronizeOutlines: function () {
                var outlinesDisplay = this.get('outlinesDisplay');
                outlinesDisplay.clear();
                this.get('controller.shapes').forEach(function (shape) {
                    outlinesDisplay.addPolyLines(cam.pathDefToPolygons(shape.get('definition')));
                });
            }.observes('controller.shapes')
        });
    });