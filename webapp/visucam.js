"use strict";
require(['Ember', 'EmberData', 'cnc/ui/views', 'cnc/ui/threeDView', 'cnc/cam/cam',
        'cnc/cam/toolpath', 'cnc/cam/operations', 'libs/svg', 'cnc/svgImporter', 'templates', 'libs/svg-import'],
    function (Ember, DS, views, TreeDView, cam, tp, Operations, SVG, svgImporter, templates) {
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
            init: function () {
                this.computeToolpath();
                this.installObservers();
            },
            name: 'New Operation',
            type: 'SimpleEngravingOperation',
            job: null,
            outline: null,
            toolpath: null,
            installObservers: function () {
                var properties = Operations[this.get('type')].properties;
                var _this = this;
                Object.keys(properties).forEach(function (key) {
                    _this.addObserver(key, _this, _this.computeToolpath)
                });
            }.observes('type'),
            uninstallObservers: function () {
                var properties = Operations[this.get('type')].properties;
                var _this = this;
                Object.keys(properties).forEach(function (key) {
                    _this.removeObserver(key, _this, _this.computeToolpath)
                });
            }.observesBefore('type'),
            computeToolpath: function () {
                Operations[this.get('type')]['computeToolpath'](this);
            }.observes('type', 'job.toolDiameter', 'job.safetyZ'),
            unknownProperty: function (key) {
                return Operations[this.get('type')].properties[key];
            }
        });


        Visucam.Job = Ember.Object.extend({
            init: function () {
                this.syncSecurityZ();
            },
            safetyZ: 5,
            toolDiameter: 3,
            operations: [],
            shapes: [],
            deleteOperation: function (operation) {
                var operations = this.get('operations');
                var index = operations.indexOf(operation);
                operations.removeAt(index);
            },
            findOperation: function (id) {
                var operations = this.get('operations');
                for (var i = 0; i < operations.length; i++) {
                    var op = operations[i];
                    if (op.id == id)
                        return op;
                }
            },
            transitionTravels: function () {
                var operations = this.get('operations');
                var travelBits = [];
                var pathFragments = [];
                for (var i = 0; i < operations.length; i++) {
                    var toolpath = operations[i].get('toolpath');
                    for (var j = 0; j < toolpath.length; j++)
                        pathFragments.push(toolpath[j]);
                }
                for (i = 0; i < pathFragments.length - 1; i++) {
                    var endPoint = pathFragments[i].getStopPoint();
                    var destinationPoint = pathFragments[i + 1].getStartPoint();
                    var travel = new tp.GeneralPolylineToolpath();
                    travel.pushPoint(endPoint.x, endPoint.y, endPoint.z);
                    travel.pushPoint(endPoint.x, endPoint.y, this.get('safetyZ'));
                    travel.pushPoint(destinationPoint.x, destinationPoint.y, this.get('safetyZ'));
                    travelBits.push(travel);
                }
                return travelBits;
            }.property('operations.@each.toolpath'),
            syncSecurityZ: function () {
                var safetyZ = this.get('safetyZ');
                this.get('operations').forEach(function (operation) {
                    operation.set('safetyZ', safetyZ);
                });
            }.observes('safetyZ', 'operations.@each.safetyZ'),
            createOperation: function (params) {
                var id = this.get('operations').length + 1;
                params = $.extend({}, params, {id: id, job: this});
                var operation = Visucam.Operation.create(params);
                this.get('operations').pushObject(operation);
                return operation;
            },
            createShape: function (def) {
                var id = this.get('shapes').length + 1;
                var shape = Visucam.Shape.create({id: id, definition: def});
                this.get('shapes').pushObject(shape);
                return shape;
            }
        });

        var doc = Visucam.Job.create({
            safetyZ: 10,
            operations: [],
            shapes: []
        });

        var shape1 = doc.createShape('M0,0L100,0L100,100');
        var shape2 = doc.createShape('M25, 35 A10, 10 0 0 0 35, 25 A10, 10 0 0 0 25, 15 A10, 10 0 0 0 15, 25 A10, 10 0 0 0 25, 35Z');
        var shape3 = doc.createShape('M50,50L80,50L80,80L50,80 Z');
        var shape4 = doc.createShape('M-10,-10 L-100,-10 L-100,-100 L-10,-100Z M-20,-20 L-20,-80L-80,-80L-80,-20Z ');
        doc.createOperation({name: 'Engraving', type: 'SimpleEngravingOperation', outline: shape1});
        doc.createOperation({name: 'Inner Profiling 1', type: 'RampingContourOperation', outline: shape2});
        doc.createOperation({name: 'Inner Profiling 2', type: 'SimpleContourOperation', outline: shape3, inside: true, contourZ: -13});
        doc.createOperation({name: 'Outer Profiling 3', outline: shape4, inside: false, stopZ: -15, turns: 5});

        Visucam.Router.map(function () {
            this.resource('operation', {path: '/operations/:operation_id'});
        });
        Visucam.ApplicationRoute = Ember.Route.extend({
            model: function () {
                return doc;
            }
        });
        Visucam.IndexRoute = Ember.Route.extend({
            needs: ['operation'],
            model: function () {
                return doc;
            },
            actions: {
                didTransition: function () {
                    this.controllerFor("application").set('currentOperation', null);
                }
            }
        });
        Visucam.OperationRoute = Ember.Route.extend({
            model: function (params) {
                var operation = doc.findOperation(params.operation_id);
                if (!operation)
                    this.transitionTo('/');
                return operation;
            },
            setupController: function (controller, model) {
                this.controllerFor("application").set('currentOperation', model);
                controller.set('model', model);
            }
        });

        Visucam.ApplicationController = Ember.ObjectController.extend({
            needs: ['operation'],
            currentOperation: null,
            checkCurrentOperationIsDeleted: function () {
                if (this.get('operations') && this.get('currentOperation') && this.get('operations').indexOf(this.get('currentOperation')) == -1)
                    this.transitionToRoute('/');
            }.observes('operations.@each'),
            addShapes: function (shapeDefinitions) {
                var shape = this.get('model').createShape(shapeDefinitions.join(' '));
                var contour = this.get('model').createOperation({outline: shape});
                this.transitionToRoute('operation', contour);
            }
        });

        Visucam.OperationController = Ember.ObjectController.extend({
            init: function () {
                this._super();
            },
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
            needs: ['application'],
            actions: {
                'delete': function () {
                    this.get('job').deleteOperation(this.get('model'));
                }
            },
            isCurrent: function () {
                return this.get('controllers.application.currentOperation') === this.get('model');
            }.property('controllers.application.currentOperation')
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
            }.observes('controller.currentOperation', 'controller.currentOperation.toolpath', 'controller.safetyZ'),
            synchronizeJob: function () {
                var threeDView = this.get('nativeComponent');
                var travelDisplay = this.get('travelDisplay');
                travelDisplay.clear();
                var travelMoves = this.get('controller.transitionTravels');
                travelDisplay.addPolyLines(travelMoves.map(function (move) {
                    return move.path;
                }));
                threeDView.zoomExtent();
                threeDView.reRender();
            }.observes('controller.transitionTravels'),
            synchronizeOutlines: function () {
                console.log('synchronizeOutlines');
                var outlinesDisplay = this.get('outlinesDisplay');
                outlinesDisplay.clear();
                this.get('controller.shapes').forEach(function (shape) {
                    outlinesDisplay.addPolyLines(cam.pathDefToPolygons(shape.get('definition')));
                });
            }.observes('controller.shapes.@each')
        });
    });