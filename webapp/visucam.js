"use strict";
require(['Ember', 'cnc/ui/views', 'cnc/ui/threeDView', 'cnc/cam/cam',
        'cnc/cam/toolpath', 'cnc/cam/operations', 'libs/svg', 'cnc/svgImporter', 'cnc/cad/wabble', 'templates', 'libs/svg-import'],
    function (Ember, views, TreeDView, cam, tp, Operations, SVG, svgImporter, Wabble, templates) {
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
            }.observes('type', 'job.toolDiameter', 'job.safetyZ').on('init'),
            unknownProperty: function (key) {
                return Operations[this.get('type')].properties[key];
            }
        });

        Visucam.Job = Ember.Object.extend({
            safetyZ: 5,
            toolDiameter: 3,
            feedrate: 100,
            operations: [],
            shapes: [],
            deleteOperation: function (operation) {
                this.get('operations').removeObject(operation);
            },
            findOperation: function (id) {
                this.get('operations').findBy('id', Number(id));
            },
            transitionTravels: function () {
                var operations = this.get('operations');
                var travelBits = [];
                var pathFragments = [];
                operations.forEach( function(operation) {
                    pathFragments.pushObjects( operation.get('toolpath') );
                });
                for (var i = 0; i < pathFragments.length - 1; i++) {
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
            }.observes('safetyZ', 'operations.@each.safetyZ').on('init'),
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

        var doc = Visucam.Job.create();

        var wabble = new Wabble(13, 15, 1, 1);
        var shape1 = doc.createShape(wabble.getRotorShape());
        var shape2 = doc.createShape(wabble.getPinsShape());
        doc.createOperation({name: 'Crown', type: 'RampingContourOperation', outline: shape1, ramping_inside: false});
        doc.createOperation({name: 'Pins', type: 'RampingContourOperation', outline: shape2, ramping_inside: false});

        Visucam.Router.map(function () {
            this.resource('operation', {path: '/operations/:operation_id'});
        });
        Visucam.ApplicationRoute = Ember.Route.extend({
            model: function () {
                return doc;
            }
        });

        Visucam.IndexRoute = Ember.Route.extend({
            setupController: function(controller, model) {
              this._super.apply(this, arguments);
              this.controller.set('currentOperation', null);
            }
        });

        Visucam.OperationRoute = Ember.Route.extend({
            model: function (params) {
                return doc.findOperation(params.operation_id);
            },
            afterModel: function(model) {
                if (!model)
                    this.transitionTo('/');
            },
            setupController: function(controller, model) {
              this._super.apply(this, arguments);
              this.controllerFor('application').set('currentOperation', model);
            }
        });

        Visucam.ApplicationController = Ember.ObjectController.extend({
            currentOperation: null,
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

                    if( this.get('isCurrent') ) {
                        this.transitionToRoute('index').then( function() {
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
                var outlinesDisplay = this.get('outlinesDisplay');
                outlinesDisplay.clear();
                this.get('controller.shapes').forEach(function (shape) {
                    outlinesDisplay.addPolyLines(cam.pathDefToPolygons(shape.get('definition')));
                });
            }.observes('controller.shapes.@each')
        });
    });
