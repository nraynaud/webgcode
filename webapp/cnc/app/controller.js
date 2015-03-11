"use strict";

define(['Ember', 'cnc/cam/operations', 'cnc/util', 'cnc/cad/wabble', 'cnc/cam/text'],
    function (Ember, Operations, util, Wabble, text) {
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
                            oauth_token_secret: authData.twitter.accessTokenSecret
                        };
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
                    [{
                        name: 'Eccentric Hole Roughing', type: 'PocketOperation', outline: eccentric,
                        contour_inside: true
                    }, {
                        name: 'Eccentric Hole Finishing', type: 'SimpleContourOperation', outline: eccentric,
                        contour_inside: true, contour_leaveStock: 0, contour_climbMilling: false
                    }, {
                        name: 'Output Holes Roughing', type: 'PocketOperation', outline: outputHoles,
                        contour_inside: true
                    }, {
                        name: 'Output Holes Finishing', type: 'SimpleContourOperation', outline: outputHoles,
                        contour_inside: true, contour_leaveStock: 0, contour_climbMilling: false
                    }, {
                        name: 'Crown Roughing', type: 'RampingContourOperation', outline: rotor, contour_inside: false
                    }, {
                        name: 'Crown Finishing', type: 'SimpleContourOperation', outline: rotor,
                        contour_inside: false, contour_leaveStock: 0, contour_climbMilling: false
                    }, {
                        name: 'Pins Roughing', type: 'RampingContourOperation', outline: pins, contour_inside: false
                    }, {
                        name: 'Pins Finishing', type: 'SimpleContourOperation', outline: pins,
                        contour_inside: false, contour_leaveStock: 0, contour_climbMilling: false
                    }, {
                        name: 'Output Pins Roughing', type: 'RampingContourOperation', outline: outputPins,
                        contour_inside: false
                    }, {
                        name: 'Output Pins Finishing', type: 'SimpleContourOperation', outline: outputPins,
                        contour_inside: false, contour_leaveStock: 0, contour_climbMilling: false
                    }].forEach(function (op) {
                            job.createOperation(op);
                        });
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
                            event.ports[0].postMessage({
                                type: 'compactToolPath',
                                parameters: parameters,
                                toolPath: chunk,
                                hasMore: i + chunkSize < toolPath.length
                            });
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
            deleteSlider: 0,
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
                    this.transitionToRoute('operation', this.get('model').createOperation());
                },
                createShape: function () {
                    var manualDefinition = this.store.createRecord('manualShape', {
                        type: 'rectangle',
                        width: 15,
                        height: 20,
                        x: 0,
                        y: 0,
                        radius: 5
                    });
                    var shape = this.get('model').createShape(null, 'New Shape', {
                        'type': 'manual'
                    });
                    shape.set('manualDefinition', manualDefinition);
                    this.transitionToRoute('shape', shape);
                },
                'delete': function () {
                    var _this = this;
                    this.get('model.jobSummary').then(function (jobSummary) {
                        return Ember.RSVP.hash({
                            summary: jobSummary.destroyRecord(),
                            job: _this.get('model').destroyRecord()
                        });
                    }).then(function () {
                        _this.transitionToRoute('index');
                    });
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

        var ShapeController = Ember.ObjectController.extend({
            init: function () {
                var _this = this;
                text.getFontList().then(function (list) {
                    _this.set('fonts', list);
                });
            },
            shapeTypes: ['rectangle', 'circle', 'text'],
            isManual: function () {
                return this.get('type') == 'manual';
            }.property('type'),
            isRectangle: function () {
                return this.get('isManual') && this.get('manualDefinition.type') == 'rectangle';
            }.property('isManual', 'manualDefinition.type'),
            isCircle: function () {
                return this.get('isManual') && this.get('manualDefinition.type') == 'circle';
            }.property('isManual', 'manualDefinition.type'),
            isText: function () {
                return this.get('isManual') && this.get('manualDefinition.type') == 'text';
            }.property('isManual', 'manualDefinition.type'),
            fonts: null,
            fontChanged: function () {
                console.log(this.get('manualDefinition.fontName'));
                if (this.get('fonts'))
                    this.set('model.manualDefinition.fontFile', text.searchFontInList(this.get('fonts'), this.get('manualDefinition.fontName')).files['regular']);
            }.observes('manualDefinition.fontName')
        });

        var OperationController = Ember.ObjectController.extend({
            needs: ['job'],
            actions: {
                compute3D: function () {
                    var safetyZ = this.get('controllers.job.safetyZ');
                    var toolDiameter = this.get('controllers.job.toolDiameter');
                    this.get('model').compute3D(safetyZ, toolDiameter);
                },
                pause: function () {
                    this.get('task').pause();
                },
                resume: function () {
                    this.get('task').resume();
                },
                cancel: function () {
                    this.get('task').cancel();
                }
            },
            specialTemplate: function () {
                return Operations[this.get('type')].specialTemplate;
            }.property('type'),
            stlShapes: Ember.computed.filter('job.shapes', function (shape) {
                return shape.get('stlModel') != null;
            }),
            NonStlShapes: Ember.computed.filter('job.shapes', function (shape) {
                return shape.get('stlModel') == null;
            }),
            suitableShapes: function () {
                if (this.get('type') == '3DlinearOperation')
                    return this.get('stlShapes');
                return this.get('NonStlShapes');
            }.property('stlShapes', 'NonStlShapes', 'type'),
            typeChanged: function () {
                var suitableShapes = this.get('suitableShapes');
                if (!suitableShapes.contains(this.get('outline')))
                    this.set('outline', suitableShapes.get('firstObject'));
            }.observes('suitableShapes'),
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
            ShapeController: ShapeController,
            OperationController: OperationController,
            OperationListItemController: OperationListItemController,
            ShapeListItemController: ShapeListItemController
        }
    });
