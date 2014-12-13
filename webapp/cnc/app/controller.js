"use strict";

define(['Ember', 'cnc/cam/operations', 'cnc/util', 'cnc/cad/wabble', 'cnc/cam/3D/3Dcomputer'],
    function (Ember, Operations, util, Wabble, Computer) {
        var wabble = new Wabble(13, 15, 1, 1, 5, 8, 3);
        var LoginController = Ember.ObjectController.extend({
            actions: {
                loginWithToken: function (authData) {
                    var _this = this;
                    var service = this.get('model');
                    var payload;
                    if (service == 'twitter')
                        payload = {
                            user_id: authData.twitter.id,
                            oauth_token: authData.twitter.accessToken,
                            oauth_token_secret: authData.twitter.accessTokenSecret};
                    else
                        payload = authData[service].accessToken;
                    this.get('firebase.firebase').authWithOAuthToken(service, payload, function () {
                        console.log(arguments);
                        _this.transitionToRoute('index').then(function () {
                            Visucam.reset();
                        });
                    });
                }
            }
        });

        var IndexController = Ember.ObjectController.extend({
            needs: ['application'],
            actions: {
                createExample: function () {
                    var job = this.store.createRecord('job', {name: 'Cycloidal Drive Sample', toolDiameter: 2});
                    var eccentric = job.createShape(wabble.getEccentricShape(), 'Eccentric Hole');
                    var outputHoles = job.createShape(wabble.getOutputHolesShape(), 'Output Holes');
                    var rotor = job.createShape(wabble.getRotorShape(), 'Crown');
                    var pins = job.createShape(wabble.getPinsShape(), 'Pins');
                    var outputPins = job.createShape(wabble.getOutputPinsShape(), 'Output Pin');
                    job.createOperation({name: 'Eccentric Hole Roughing', job: job, type: 'PocketOperation',
                        outline: eccentric, contour_inside: true});
                    job.createOperation({name: 'Eccentric Hole Finishing', job: job, type: 'SimpleContourOperation',
                        outline: eccentric, contour_inside: true, contour_leaveStock: 0, contour_climbMilling: false});
                    job.createOperation({name: 'Output Holes Roughing', job: job, type: 'PocketOperation',
                        outline: outputHoles, contour_inside: true});
                    job.createOperation({name: 'Output Holes Finishing', job: job, type: 'SimpleContourOperation',
                        outline: outputHoles, contour_inside: true, contour_leaveStock: 0, contour_climbMilling: false});
                    job.createOperation({name: 'Crown Roughing', job: job, type: 'RampingContourOperation',
                        outline: rotor, contour_inside: false});
                    job.createOperation({name: 'Crown Finishing', job: job, type: 'SimpleContourOperation',
                        outline: rotor, contour_inside: false, contour_leaveStock: 0, contour_climbMilling: false});
                    job.createOperation({name: 'Pins Roughing', job: job, type: 'RampingContourOperation',
                        outline: pins, contour_inside: false});
                    job.createOperation({name: 'Pins Finishing', job: job, type: 'SimpleContourOperation',
                        outline: pins, contour_inside: false, contour_leaveStock: 0, contour_climbMilling: false});
                    job.createOperation({name: 'Output Pins Roughing', job: job, type: 'RampingContourOperation',
                        outline: outputPins, contour_inside: false});
                    job.createOperation({name: 'Output Pins Finishing', job: job, type: 'SimpleContourOperation',
                        outline: outputPins, contour_inside: false, contour_leaveStock: 0, contour_climbMilling: false});
                    this.transitionToRoute('job', job).then(function () {
                        job.saveAll();
                    });
                },
                createJob: function () {
                    var job = this.store.createRecord('job');
                    job.saveAll();
                    this.transitionToRoute('job', job);
                }
            }
        });

        var ApplicationController = Ember.ObjectController.extend({
            authProviderIcon: function () {
                var icons = {
                    facebook: 'fa fa-facebook',
                    twitter: 'fa fa-twitter',
                    github: 'fa fa-github',
                    google: 'fa fa-google-plus',
                    anonymous: 'fa fa-eye-slash'
                };
                return icons[this.get('firebase.auth.provider')];
            }.property('firebase.auth.provider'),
            authTitle: function () {
                return 'Authenticated with ' + this.get('firebase.auth.provider');
            }.property('firebase.auth.provider')
        });

        var JobController = Ember.ObjectController.extend({
            init: function () {
                this._super();
                var _this = this;
                window.addEventListener("message", function (event) {
                    if (event.data['type'] == 'gimme program') {
                        var parameters = event.data.parameters;
                        parameters.maxAcceleration = 75;
                        parameters.maxFeedrate = 2000;
                        var toolPath = _this.get('model').computeCompactToolPath();
                        console.log(parameters);
                        console.time('postMessage');
                        var chunkSize = 100000;
                        for (var i = 0, j = toolPath.length; i < j; i += chunkSize) {
                            var chunk = toolPath.slice(i, i + chunkSize);
                            event.ports[0].postMessage({type: 'compactToolPath', parameters: parameters,
                                toolPath: chunk, hasMore: i + chunkSize < toolPath.length});
                        }
                        console.timeEnd('postMessage');
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
            currentShape: null,
            showTravel: true,
            addShapes: function (shapeDefinitions, name) {
                var shape = this.get('model').createShape(shapeDefinitions.join(' '), name);
                var contour = this.get('model').createOperation({outline: shape});
                this.transitionToRoute('operation', contour);
            },
            addSTL: function (stlData, name) {
                var shape = this.get('model').createShape('', name);
                shape.set('stlModel', stlData);
                this.transitionToRoute('shape', shape);
            },
            actions: {
                save: function () {
                    this.get('model').saveAll();
                },
                createOperation: function () {
                    this.transitionToRoute('operation', this.get('model').createOperation({}));
                }
            },
            saveDisabled: function () {
                return !this.get('model.isDirty')
                && this.get('model.shapes').every(function (shape) {
                    return !shape.get('isDirty');
                })
                && this.get('model.operations').every(function (operation) {
                    return !operation.get('isDirty');
                });
            }.property('model.isDirty', 'model.shapes.@each.isDirty', 'model.operations.@each.isDirty')
        });

        var OperationController = Ember.ObjectController.extend({
            needs: ['job'],
            actions: {
                compute3D: function () {
                    var _this = this;
                    this.set('computing', true);
                    var model = this.get('model.outline.stlModel');
                    var safetyZ = this.get('controllers.job.safetyZ');
                    var toolDiameter = this.get('controllers.job.toolDiameter');
                    var leaveStock = this.get('3d_leaveStock');
                    var minZ = this.get('3d_minZ');
                    var type = this.get('3d_toolType');
                    var orientation = this.get('3d_pathOrientation');
                    var stepover = this.get('3d_diametralEngagement') * toolDiameter / 100;
                    var startRatio = this.get('3d_startPercent') / 100;
                    var stopRatio = this.get('3d_stopPercent') / 100;
                    var zigzag = this.get('3d_zigZag');
                    Computer.computeGrid(model, stepover, type, toolDiameter / 2, leaveStock, safetyZ, minZ, orientation, startRatio, stopRatio, zigzag)
                        .then(Ember.run.bind(this, function (result) {
                            _this.set('model.toolpath', result);
                        }))
                        .finally(Ember.run.bind(this, function () {
                            _this.set('computing', false);
                        }));
                }
            },
            specialTemplate: function () {
                return Operations[this.get('type')].specialTemplate;
            }.property('type'),
            operationDescriptors: function () {
                return Object.keys(Operations).map(function (key) {
                    return $.extend({class: key}, Operations[key]);
                });
            }.property(),
            toolShapes: function () {
                return [
                    {label: 'Cylinder', id: 'cylinder'},
                    {label: 'Ball Nose', id: 'ball'},
                    {label: 'V Shape', id: 'v'}
                ];
            }.property(),
            pathOrientations: [
                {label: 'X', id: 'x'},
                {label: 'Y', id: 'y'}
            ]
        });

        var OperationListItemController = Ember.ObjectController.extend({
            needs: ['job'],
            actions: {
                'delete': function () {
                    var operation = this.get('model');
                    if (this.get('isCurrent'))
                        this.transitionToRoute('job', operation.get('job'))
                            .then(function () {
                                return operation.get('job').deleteOperation(operation);
                            });
                    else
                        operation.get('job').deleteOperation(operation);
                }
            },
            isCurrent: function () {
                return this.get('controllers.job.currentOperation') === this.get('model');
            }.property('controllers.job.currentOperation')
        });
        var ShapeListItemController = Ember.ObjectController.extend({
            needs: ['job'],
            actions: {
                'delete': function () {
                    var shape = this.get('model');
                    var job = this.get('controllers.job.model');
                    if (this.get('isCurrent'))
                        this.transitionToRoute('job', job)
                            .then(function () {
                                return job.deleteShape(shape);
                            });
                    else
                        job.deleteShape(shape);
                }
            },
            isCurrent: function () {
                return this.get('controllers.job.currentShape') === this.get('model');
            }.property('controllers.job.currentShape')
        });
        return {
            LoginController: LoginController,
            IndexController: IndexController,
            ApplicationController: ApplicationController,
            JobController: JobController,
            OperationController: OperationController,
            OperationListItemController: OperationListItemController,
            ShapeListItemController: ShapeListItemController
        }
    });
