"use strict";
require(['jQuery', 'Ember', 'Firebase', 'EmberFire', 'cnc/app/models', 'cnc/ui/views', 'cnc/app/view',
        'cnc/cam/operations', 'cnc/cad/wabble', 'cnc/util', 'templates', 'libs/svg-import', 'bootstrap'],
    function ($, Ember, Firebase, DS, models, views, appViews, Operations, Wabble, util, templates, _) {
        Ember.TEMPLATES['application'] = Ember.TEMPLATES['visucamApp'];

        window.Visucam = Ember.Application.create({});
        Visucam.NumberView = views.NumberField;
        Visucam.PointTransform = models.PointTransform;
        Visucam.Job = models.Job;
        Visucam.Operation = models.Operation;
        Visucam.Shape = models.Shape;
        Visucam.ThreeDView = appViews.ThreeDView;
        Visucam.LoginView = appViews.LoginView;
        Visucam.ApplicationView = appViews.ApplicationView;

        var IN_CROME_APP = !!window.chrome.permissions;

        Firebase.INTERNAL.forceWebSockets();
        Visucam.Backend = Ember.Object.extend({
            init: function () {
                var firebase = new Firebase('https://popping-fire-1042.firebaseio.com/');
                this.set('firebase', firebase);
                firebase.onAuth(Ember.run.bind(this, this.updateAuth));
                this.updateAuth();
            },
            updateAuth: function () {
                var auth = this.get('firebase').getAuth();
                this.set('auth', auth);
                if (auth && auth.provider != 'anonymous')
                    this.get('storageRoot').update({displayName: this.get('username')});
            },
            auth: null,
            firebase: null,
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
            init: function () {
                this.firebase = BACKEND.get('storageRoot');
                this._super.apply(this, arguments);
            },
            backend: BACKEND,
            updateRef: function () {
                this.init();
            }.observes('backend.storageRoot')
        });

        var wabble = new Wabble(13, 15, 1, 1, 5, 8, 3);

        Visucam.Router.map(function () {
            this.resource('job', {path: 'jobs/:job_id'}, function () {
                this.resource('operation', {path: 'operations/:operation_id'});
            });
            this.resource('login', {path: 'login/:login_type'});
        });

        Visucam.ApplicationRoute = Ember.Route.extend({
            actions: {
                logintwitter: function () {
                    if (IN_CROME_APP)
                        this.transitionTo('login', 'twitter');
                    else
                        BACKEND.get('firebase').authWithOAuthPopup("twitter", this.get('afterAuth'));
                },
                logingithub: function () {
                    if (IN_CROME_APP)
                        this.transitionTo('login', 'github');
                    else
                        BACKEND.get('firebase').authWithOAuthPopup("github", this.get('afterAuth'));
                },
                loginfacebook: function () {
                    if (IN_CROME_APP)
                        this.transitionTo('login', 'facebook');
                    else
                        BACKEND.get('firebase').authWithOAuthPopup("facebook", this.get('afterAuth'));
                },
                loginanonymous: function () {
                    BACKEND.get('firebase').authAnonymously(this.get('afterAuth'));
                },
                logout: function () {
                    BACKEND.get('firebase').unauth();
                    this.transitionTo('index').then(this.get('afterAuth'));
                }
            },
            afterAuth: Ember.run.bind(this, function (error, authData) {
                console.log(arguments);
                Visucam.reset();
            })
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

        Visucam.LoginRoute = Ember.Route.extend({
            model: function (params) {
                if (['twitter', 'facebook', 'github'].indexOf(params.login_type) != -1)
                    return params.login_type;
            }

        });
        Visucam.LoginController = Ember.ObjectController.extend({
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
                    BACKEND.get('firebase').authWithOAuthToken(service, payload, function () {
                        console.log(arguments);
                        _this.transitionToRoute('index').then(function () {
                            Visucam.reset();
                        });
                    });
                }
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
                'delete': function () {
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
    });
