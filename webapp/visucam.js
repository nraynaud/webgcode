"use strict";
require(['Ember', 'EmberFire', 'cnc/app/models', 'cnc/ui/views', 'cnc/ui/threeDView', 'cnc/cam/operations',
        'libs/svg', 'cnc/svgImporter', 'cnc/cad/wabble', 'cnc/util', 'templates', 'libs/svg-import', 'bootstrap'],
    function (Ember, DS, models, views, TreeDView, Operations, SVG, svgImporter, Wabble, util, templates, _) {
        Ember.TEMPLATES['application'] = Ember.TEMPLATES['visucamApp'];

        window.Visucam = Ember.Application.create({});

        Visucam.Backend = Ember.Object.extend({
            init: function () {
                this.get('firebase').onAuth(this.updateAuth, this);
                this.updateAuth();
            },
            updateAuth: function () {
                var auth = this.get('firebase').getAuth();
                this.set('auth', auth);
                if (auth && auth.provider != 'anonymous')
                    this.get('storageRoot').update({displayName: this.get('username')});
            },
            firebase: new Firebase('https://popping-fire-1042.firebaseio.com/'),
            isConnected: function () {
                return this.get('auth') != null;
            }.property('auth'),
            username: function () {
                if (this.get('isConnected'))
                    switch (this.get('auth.provider')) {
                        case 'twitter' :
                            return this.get('auth.twitter.displayName');
                        case 'github' :
                            return this.get('auth.github.displayName');
                        case 'facebook' :
                            return this.get('auth.facebook.displayName');
                        case 'anonymous' :
                            return 'anonymous';
                    }
            }.property('isConnected', 'auth'),
            storageRoot: function () {
                if (this.get('isConnected'))
                    return this.get('firebase').child('users').child(this.get('auth.uid'));
                return this.get('firebase');
            }.property('firebase', 'auth')
        });
        var BACKEND = Visucam.Backend.create();

        Visucam.ApplicationAdapter = DS.FirebaseAdapter.extend({
            backend: BACKEND,
            firebase: BACKEND.get('storageRoot'),
            updateRef: function () {
                //we have to hack the Adapter because changing the reference was not planned
                this._ref = this.get('backend.storageRoot').ref();
                this._findAllMapForType = {};
                this._recordCacheForType = {};
            }.observes('backend.storageRoot')
        });
        Visucam.NumberView = views.NumberField;

        Visucam.PointTransform = models.PointTransform;
        Visucam.Job = models.Job;
        Visucam.Operation = models.Operation;
        Visucam.Shape = models.Shape;

        var wabble = new Wabble(13, 15, 1, 1, 5, 8, 3);

        Visucam.Router.map(function () {
            this.resource('job', {path: 'jobs/:job_id'}, function () {
                this.resource('operation', {path: 'operations/:operation_id'});
            });
        });

        Visucam.IndexRoute = Ember.Route.extend({
            model: function () {
                if (BACKEND.get('isConnected'))
                    return this.store.find('job');
                return null;
            }
        });

        Visucam.JobRoute = Ember.Route.extend({
            model: function (params) {
                return this.store.find('job', params.job_id);
            }
        });
        Visucam.JobIndexRoute = Ember.Route.extend({
            setupController: function (controller, model) {
                this._super.apply(this, arguments);
                this.controllerFor('job').set('currentOperation', null);
            }
        });

        Visucam.OperationRoute = Ember.Route.extend({
            model: function (params) {
                return this.store.find('operation', params.operation_id);
            },
            afterModel: function (model) {
                if (!model)
                    this.transitionTo('/');
            },
            setupController: function (controller, model) {
                this._super.apply(this, arguments);
                this.controllerFor('job').set('currentOperation', model);
            }
        });

        Visucam.IndexController = Ember.ObjectController.extend({
            needs: ['application'],
            actions: {
                createExample: function () {
                    var job = this.store.createRecord('job', {name: 'Cycloidal Drive Sample', toolDiameter: 2});
                    var shape = wabble.getEccentricShape();
                    var outline = job.createShape(shape);
                    job.createOperation({name: 'Eccentric Hole', type: 'PocketOperation', outline: outline});
                    job.createOperation({name: 'Output Holes', type: 'PocketOperation', outline: job.createShape(wabble.getOutputHolesShape()), contour_inside: true});
                    job.createOperation({name: 'Crown', type: 'RampingContourOperation', outline: job.createShape(wabble.getRotorShape()), contour_inside: false});
                    job.createOperation({name: 'Pins', type: 'RampingContourOperation', outline: job.createShape(wabble.getPinsShape()), contour_inside: false});
                    job.createOperation({name: 'Output Pins', type: 'RampingContourOperation', outline: job.createShape(wabble.getOutputPinsShape()), contour_inside: false});
                    job.saveAll();
                    this.transitionToRoute('job', job);
                }
            },
            isConnected: Ember.computed.alias('controllers.application.backend.isConnected')
        });

        Visucam.ApplicationController = Ember.ObjectController.extend({
            actions: {
                logintwitter: function () {
                    this.get('backend.firebase').authWithOAuthPopup("twitter", function (error, authData) {
                        console.log(arguments);
                    });
                },
                logingithub: function () {
                    this.get('backend.firebase').authWithOAuthPopup("github", function (error, authData) {
                        console.log(arguments);
                    });
                },
                loginfacebook: function () {
                    this.get('backend.firebase').authWithOAuthPopup("facebook", function (error, authData) {
                        console.log(arguments);
                    });
                },
                loginanonymous: function () {
                    this.get('backend.firebase').authAnonymously(function (error, authData) {
                        console.log(arguments);
                    });
                },
                logout: function () {
                    this.get('backend.firebase').unauth();
                    this.transitionToRoute('index');
                }
            },
            backend: BACKEND,
            addShapes: function (shapeDefinitions) {
                var shape = this.get('model').createShape(shapeDefinitions.join(' '));
                var contour = this.get('model').createOperation({outline: shape});
                this.transitionToRoute('operation', contour);
            },
            authProviderIcon: function () {
                var icons = {
                    facebook: 'fa fa-facebook',
                    twitter: 'fa fa-twitter',
                    github: 'fa fa-github',
                    google: 'fa fa-google-plus',
                    anonymous: 'fa fa-eye-slash'
                };
                return icons[ this.get('backend.auth.provider')];
            }.property('backend.auth.provider'),
            authTitle: function () {
                return 'Authenticated with ' + this.get('backend.auth.provider');
            }.property('backend.auth.provider')
        });

        Visucam.JobController = Ember.ObjectController.extend({
            init: function () {
                this._super();
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
            toolPosition: null,
            currentOperation: null,
            actions: {
                save: function () {
                    this.get('model').saveAll();
                }
            },
            saveDisabled: function () {
                return !this.get('model.isDirty');
            }.property('model.isDirty')
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
            needs: ['job'],
            actions: {
                delete: function () {
                    var operation = this.get('model');
                    if (this.get('isCurrent'))
                        this.transitionToRoute('job', operation.get('job'))
                            .then(function () {
                                return operation.get('job');
                            })
                            .then(function (job) {
                                job.deleteOperation(operation);
                            });
                    else
                        operation.get('job').then(function (job) {
                            job.deleteOperation(operation);
                        });
                }
            },
            isCurrent: function () {
                return this.get('controllers.job.currentOperation') === this.get('model');
            }.property('controllers.job.currentOperation')
        });

        function collectVertices(toolpath, defaultZ) {
            var res = [];
            toolpath.forEachPoint(function (x, y, z, _) {
                res.push(x, y, z);
            }, defaultZ);
            return new Float32Array(res);
        }

        Visucam.ApplicationView = Ember.View.extend({
            classNames: ['rootview'],
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
            synchronizeCurrentOperationOutline: function () {
                var highlightDisplay = this.get('highlightDisplay');
                highlightDisplay.clear();
                var operation = this.get('controller.currentOperation');
                if (operation)
                    highlightDisplay.addPolyLines(operation.get('outline.polyline'));
            }.observes('controller.currentOperation.outline.polyline'),
            synchronizeCurrentOperation: function () {
                var threeDView = this.get('nativeComponent');
                threeDView.clearToolpath();
                var operation = this.get('controller.currentOperation');
                if (operation) {
                    var toolpath2 = operation.get('toolpath');
                    if (toolpath2)
                        toolpath2.forEach(function (toolpath) {
                            threeDView.normalToolpathNode.addCollated(collectVertices(toolpath, operation.get('contourZ')));
                        });
                }
                threeDView.reRender();
            }.observes('controller.currentOperation', 'controller.currentOperation.toolpath.@each', 'controller.currentOperation.toolpath'),
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
                    outlinesDisplay.addPolyLines(shape.get('polyline'));
                });
                this.get('nativeComponent').zoomExtent();
            }.observes('controller.shapes.@each.polyline'),
            synchronizeToolPosition: function () {
                var threeDView = this.get('nativeComponent');
                var position = this.get('controller.toolPosition');
                threeDView.setToolVisibility(true);
                threeDView.setToolPosition(position.x, position.y, position.z);
            }.observes('controller.toolPosition')
        });
    });
