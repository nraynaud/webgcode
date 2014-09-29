"use strict";
require(['Ember', 'EmberData', 'cnc/ui/views', 'cnc/ui/twoDView', 'cnc/ui/threeDView', 'cnc/cam.js', 'templates'],
    function (Ember, DS, views, TwoDView, TreeDView, cam, templates) {
        Ember.TEMPLATES['application'] = Ember.TEMPLATES['visucamApp'];

        window.Visucam = Ember.Application.create({});
        Visucam.NumberView = views.NumberField;
        Visucam.Shape = Ember.Object.extend({
            definition: null
        });
        Visucam.Operation = Ember.Object.extend({
            name: null,
            outline: null,
            inside: null,
            toolDiameter: null,
            toolpath: null
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
                this.set('toolpath', machine.fromClipper(polygon1)[0]);
            }.observes('outline', 'contourZ', 'toolDiameter', 'inside')
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
                this.set('toolpath', toolpath);
            }.observes('outline', 'startZ', 'stopZ', 'turns', 'toolDiameter', 'inside')
        });

        Visucam.Document = Ember.Object.extend({
            operations: [],
            shapes: []
        });

        var shape1 = Visucam.Shape.create({
            id: 1,
            definition: 'M0,0L100,0L100,100L0,100 Z'
        });
        var shape2 = Visucam.Shape.create({
            id: 2,
            definition: 'M10,10L90,10L90,90L10,90Z'
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
            name: 'Inner Profiling',
            outline: shape2,
            toolDiameter: 3,
            inside: true,
            startZ: 0,
            stopZ: -10,
            turns: 2
        });
        var doc = Visucam.Document.create({
            operations: [op1, op2],
            shapes: [shape1, shape2]
        });

        var operations = {
            1: op1,
            2: op2
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
                var operation = this.get('controller.currentOperation');
                threeDView.clearToolpath();
                if (operation) {
                    var toolpath = operation.get('toolpath');
                    var res = [];
                    toolpath.forEachPoint(function (x, y, z, _) {
                        res.push(x, y, z);
                    }, operation.get('contourZ'));
                    var vertices = new Float32Array(res);
                    threeDView.addToolpathFragment(threeDView.toolpath, {vertices: vertices.buffer, speedTag: 'normal'});
                    threeDView.displayHighlight(cam.pathDefToPolygons(operation.get('outline.definition'))[0]);
                }
                threeDView.reRender();
            }.observes('controller.currentOperation', 'controller.currentOperation.toolpath'),
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
            }.observes('controller.shapes')
        });

    });