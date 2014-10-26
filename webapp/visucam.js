"use strict";
require(['Ember', 'cnc/app/models', 'cnc/ui/views', 'cnc/ui/threeDView', 'cnc/cam/cam', 'cnc/cam/operations',
        'libs/svg', 'cnc/svgImporter', 'cnc/cad/wabble', 'cnc/util', 'templates', 'libs/svg-import'],
    function (Ember, models, views, TreeDView, cam, Operations, SVG, svgImporter, Wabble, util, templates, _) {
        Ember.TEMPLATES['application'] = Ember.TEMPLATES['visucamApp'];

        window.Visucam = Ember.Application.create({});
        Visucam.NumberView = views.NumberField;
        Visucam.Shape = Ember.Object.extend({
            definition: null
        });
        Visucam.Job = models.Job;
        Visucam.Operation = models.Operation;

        var doc = Visucam.Job.create();

        var wabble = new Wabble(13, 15, 1, 1, 5, 8, 3);
        doc.createOperation({name: 'Eccentric Hole', type: 'PocketOperation', outline: doc.createShape(wabble.getEccentricShape())});
        doc.createOperation({name: 'Output Holes', type: 'PocketOperation', outline: doc.createShape(wabble.getOutputHolesShape()), contour_inside: true});
        doc.createOperation({name: 'Crown', type: 'RampingContourOperation', outline: doc.createShape(wabble.getRotorShape()), contour_inside: false});
        doc.createOperation({name: 'Pins', type: 'RampingContourOperation', outline: doc.createShape(wabble.getPinsShape()), contour_inside: false});
        doc.createOperation({name: 'Output Pins', type: 'RampingContourOperation', outline: doc.createShape(wabble.getOutputPinsShape()), contour_inside: false});

        Visucam.Router.map(function () {
            this.resource('operation', {path: '/operations/:operation_id'});
        });
        Visucam.ApplicationRoute = Ember.Route.extend({
            model: function () {
                return doc;
            }
        });
        Visucam.IndexRoute = Ember.Route.extend({
            setupController: function (controller, model) {
                this._super.apply(this, arguments);
                this.controller.set('currentOperation', null);
            }
        });
        Visucam.OperationRoute = Ember.Route.extend({
            model: function (params) {
                return doc.findOperation(params.operation_id);
            },
            afterModel: function (model) {
                if (!model)
                    this.transitionTo('/');
            },
            setupController: function (controller, model) {
                this._super.apply(this, arguments);
                this.controllerFor('application').set('currentOperation', model);
            }
        });

        Visucam.ApplicationController = Ember.ObjectController.extend({
            init: function () {
                var _this = this;
                window.addEventListener("message", function (event) {
                    if (event.data['type'] == 'gimme program') {
                        event.ports[0].postMessage({type: 'toolPath', toolPath: _this.get('model').computeSimulableToolpath(3000),
                            parameters: event.data.parameters});
                    }
                    if (event.data['type'] == 'toolPosition') {
                        var pos = event.data['position'];
                        _this.set('toolPosition', new util.Point(pos.x, pos.y, pos.z));
                        _this.set('model.startPoint', new util.Point(pos.x, pos.y, pos.z));
                    }
                }, false);
            },
            currentOperation: null,
            toolPosition: null,
            addShapes: function (shapeDefinitions) {
                var shape = this.get('model').createShape(shapeDefinitions.join(' '));
                var contour = this.get('model').createOperation({outline: shape});
                this.transitionToRoute('operation', contour);
            }
        });

        Visucam.OperationController = Ember.ObjectController.extend({
            specialTemplate: function () {
                return Operations[this.get('type')].specialTemplate;
            }.property('type'),
            operationDescriptors: function () {
                return Object.keys(Operations).map(function (key) {
                    return $.extend({class: key}, Operations[key]);
                });
            }.property()
        });
        Visucam.OperationListItemController = Ember.ObjectController.extend({
            needs: ['operation'],
            actions: {
                delete: function () {
                    var operation = this.get('model');

                    if (this.get('isCurrent')) {
                        this.transitionToRoute('index').then(function () {
                            operation.get('job').deleteOperation(operation);
                        });
                    } else {
                        operation.get('job').deleteOperation(operation);
                    }
                }
            },
            isCurrent: function () {
                return this.get('controllers.operation.model') === this.get('model');
            }.property('controllers.operation.model')
        });

        function collectVertices(toolpath, defaultZ) {
            var res = [];
            toolpath.forEachPoint(function (x, y, z, _) {
                res.push(x, y, z);
            }, defaultZ);
            return new Float32Array(res);
        }

        Visucam.ApplicationView = Ember.View.extend({
            didInsertElement: function () {
                var canvas = $('<canvas id="myCanvas" style="visibility: hidden; display:none">');
                this.$().append(canvas);
                this.set('importCanvas', canvas);
            },
            dragEnter: function (event) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
            },
            dragOver: function (event) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
            },
            drop: function (event) {
                var _this = this;
                event.preventDefault();
                event.stopPropagation();
                var files = event.dataTransfer.files;
                var file = files[0];
                var reader = new FileReader();
                reader.onload = function (e) {
                    var res = svgImporter(_this.get('importCanvas'), e.target.result);
                    _this.get('controller').addShapes(res);
                };
                reader.readAsText(file);
            }
        });

        Visucam.ThreeDView = Ember.View.extend({
            classNames: ['ThreeDView'],
            didInsertElement: function () {
                var threeDView = new TreeDView.ThreeDView(this.$());
                threeDView.normalToolpathNode.material = new THREE.LineBasicMaterial({linewidth: 1.2, color: 0x6688aa});
                threeDView.rapidMaterial = new THREE.LineBasicMaterial({linewidth: 1.2, color: 0xdd4c2f, depthWrite: false});
                threeDView.outlineMaterial = new THREE.LineBasicMaterial({linewidth: 1.2, color: 0x000000});
                threeDView.highlightMaterial = new THREE.LineBasicMaterial({depthWrite: false, overdraw: true, linewidth: 6,
                    color: 0xdd4c2f, opacity: 0.5, transparent: true});
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
                var highlightDisplay = this.get('highlightDisplay');
                highlightDisplay.clear();
                var operation = this.get('controller.currentOperation');
                if (operation) {
                    var toolpath2 = operation.get('toolpath');
                    toolpath2.forEach(function (toolpath) {
                        threeDView.normalToolpathNode.addCollated(collectVertices(toolpath, operation.get('contourZ')));
                    });
                    highlightDisplay.addPolyLines(cam.pathDefToPolygons(operation.get('outline.definition')));
                }
                threeDView.reRender();
            }.observes('controller.currentOperation', 'controller.currentOperation.toolpath.@each', 'controller.currentOperation.toolpath', 'controller.safetyZ'),
            synchronizeJob: function () {
                var threeDView = this.get('nativeComponent');
                var travelDisplay = this.get('travelDisplay');
                travelDisplay.clear();
                var travelMoves = this.get('controller.transitionTravels');
                travelDisplay.addPolyLines(travelMoves.map(function (move) {
                    return move.path;
                }));
                threeDView.reRender();
            }.observes('controller.transitionTravels'),
            synchronizeOutlines: function () {
                var outlinesDisplay = this.get('outlinesDisplay');
                outlinesDisplay.clear();
                this.get('controller.shapes').forEach(function (shape) {
                    outlinesDisplay.addPolyLines(cam.pathDefToPolygons(shape.get('definition')));
                });
                this.get('nativeComponent').zoomExtent();
            }.observes('controller.shapes.@each'),
            synchronizeToolPosition: function () {
                var threeDView = this.get('nativeComponent');
                var position = this.get('controller.toolPosition');
                threeDView.setToolVisibility(true);
                threeDView.setToolPosition(position.x, position.y, position.z);
            }.observes('controller.toolPosition')
        });
    });
