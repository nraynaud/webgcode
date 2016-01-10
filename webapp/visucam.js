"use strict";
require(['jQuery', 'Ember', 'Firebase', 'EmberFire', 'cnc/app/models', 'cnc/ui/views', 'cnc/app/view',
        'cnc/app/controller', 'templates', 'bootstrap'],
    function ($, Ember, Firebase, DS, models, views, appViews, controller, templates, _) {
        Ember.TEMPLATES['application'] = Ember.TEMPLATES['visucamApp'];

        Ember.Application.initializer({
            name: 'firebase-backend',
            initialize: function (container, application) {
                application.register('firebase:main', Visucam.Backend);
                application.inject('route', 'firebase', 'firebase:main');
                application.inject('controller', 'firebase', 'firebase:main');
                application.inject('adapter', 'backend', 'firebase:main');
            }
        });
        window.Visucam = Ember.Application.create({});
        Visucam.NumberField = views.NumberField;

        $.extend(Visucam, models);
        $.extend(Visucam, appViews);
        $.extend(Visucam, controller);

        Ember.Handlebars.registerHelper('number-input', function (options) {
            Ember.assert('You can only pass attributes to the `input` helper, not arguments', arguments.length < 2);
            return Ember.Handlebars.helpers.view.call(this, views.NumberField, options);
        });
        Ember.Handlebars.helper('number', function (value, options) {
            var escaped = Handlebars.Utils.escapeExpression(value.toPrecision(3));
            return new Ember.Handlebars.SafeString(escaped);
        });

        var IN_CHROME_APP = window['chrome'] && window['chrome']['permissions'];

        Firebase.INTERNAL.forceWebSockets();
        Visucam.Backend = Ember.Object.extend({
            init: function () {
                var _this = this;
                var firebase = new Firebase('https://popping-fire-1042.firebaseio.com/');
                this.set('firebase', firebase);
                firebase.onAuth(Ember.run.bind(this, this.updateAuth));
                this.updateAuth();
                this.set('isConnected', false);
                // https://www.firebase.com/docs/web/guide/offline-capabilities.html
                firebase.child('.info/connected').on('value', function (connected) {
                    _this.set('isConnected', connected.val());
                });
            },
            updateAuth: function () {
                var _this = this;
                var auth = this.get('firebase').getAuth();
                this.set('auth', auth);
                if (!auth)
                    return;
                if (IN_CHROME_APP)
                    chrome.storage.local.set({'firebaseToken': auth['token']});
                var displayName = this.get('auth.twitter.displayName') || this.get('auth.github.displayName') || this.get('auth.facebook.displayName');
                if (displayName) {
                    this.get('storageRoot').update({displayName: displayName});
                    this.set('username', displayName);
                } else
                    this.get('storageRoot').child('displayName').on('value', Ember.run.bind(this, function (dataSnapshot) {
                        _this.set('username', dataSnapshot.val());
                    }));
            },
            auth: null,
            firebase: null,
            isAuthenticated: function () {
                return this.get('auth') != null;
            }.property('auth'),
            storageRoot: function () {
                var firebase = this.get('firebase');
                if (this.get('isAuthenticated'))
                    return firebase.child('users').child(this.get('auth.uid'));
                return firebase;
            }.property('firebase', 'auth')
        });

        Visucam.ApplicationAdapter = DS.FirebaseAdapter.extend({
            init: function () {
                this.firebase = this.get('backend.storageRoot');
                this._super.apply(this, arguments);
            },
            updateRef: function () {
                this.init();
            }.observes('backend.storageRoot')
        });

        Visucam.Router.map(function () {
            this.resource('job', {path: 'jobs/:job_id'}, function () {
                this.resource('operation', {path: 'operations/:operation_id'});
                this.resource('shape', {path: 'shapes/:shape_id'});
            });
            this.resource('login', {path: 'login/:login_type'});
        });

        Visucam.ApplicationRoute = Ember.Route.extend({
            actions: {
                logintwitter: function () {
                    if (IN_CHROME_APP)
                        this.transitionTo('login', 'twitter');
                    else
                        this.get('firebase.firebase').authWithOAuthPopup("twitter", this.get('afterAuth'));
                },
                logingithub: function () {
                    if (IN_CHROME_APP)
                        this.transitionTo('login', 'github');
                    else
                        this.get('firebase.firebase').authWithOAuthPopup("github", this.get('afterAuth'));
                },
                loginfacebook: function () {
                    if (IN_CHROME_APP)
                        this.transitionTo('login', 'facebook');
                    else
                        this.get('firebase.firebase').authWithOAuthPopup("facebook", this.get('afterAuth'));
                },
                loginanonymous: function () {
                    this.get('firebase.firebase').authAnonymously(this.get('afterAuth'));
                },
                logout: function () {
                    this.get('firebase.firebase').unauth();
                    this.transitionTo('index').then(this.get('afterAuth'));
                },
                error: function (reason) {
                    console.log(reason);
                    if (reason.stack)
                        console.log(reason.stack);
                    this.transitionTo('index');
                },
                didTransition: function () {
                    var _this = this;
                    var firebase = _this.get('firebase.firebase');
                    if (firebase.getAuth() == null && IN_CHROME_APP)
                        chrome.storage.local.get('firebaseToken', function (result) {
                            var sessionId = result['firebaseToken'];
                            if (sessionId)
                                firebase.authWithCustomToken(sessionId, _this.get('afterAuth'));
                        });
                }
            },
            afterAuth: Ember.run.bind(this, function (error, authData) {
                if (error)
                    console.log('afterAuth error', error);
                Visucam.reset();
            })
        });

        Visucam.IndexRoute = Ember.Route.extend({
            model: function () {
                if (this.get('firebase.isAuthenticated'))
                    return this.store.find('jobSummary');
                return null;
            }
        });
        Visucam.JobLoadingRoute = Ember.Route.extend({
            templateName: 'loading'
        });
        Visucam.JobRoute = Ember.Route.extend({
            actions: {
                willTransition: function (transition) {
                    window.postMessage({canSendProgram: false}, '*');
                },
                didTransition: function (transition) {
                    this.controllerFor('job').syncCanSendProgram();
                }
            },
            model: function (params) {
                var _this = this;
                return this.store.find('job', params.job_id).then(null, function (error) {
                    console.log('error', error);
                    if (error && error.stack)
                        console.log(error.stack);
                    _this.transitionTo('index');
                });
            },
            setupController: function (controller, model) {
                this._super.apply(this, arguments);
                this.controllerFor('job').set('currentOperation', null);
                this.controllerFor('job').set('currentShape', null);
            }
        });
        Visucam.JobIndexRoute = Ember.Route.extend({
            setupController: function (controller, model) {
                this._super.apply(this, arguments);
                this.controllerFor('job').set('currentOperation', null);
                this.controllerFor('job').set('currentShape', null);
            }
        });

        Visucam.OperationRoute = Ember.Route.extend({
            model: function (params) {
                var job = this.modelFor('job');
                return job.get('operations').findBy('id', params.operation_id);
            },
            afterModel: function (model) {
                if (!model)
                    this.transitionTo('/');
            },
            setupController: function (controller, model) {
                this._super.apply(this, arguments);
                this.controllerFor('job').set('currentOperation', model);
                this.controllerFor('job').set('currentShape', null);
            }
        });
        Visucam.ShapeRoute = Ember.Route.extend({
            model: function (params) {
                var job = this.modelFor('job');
                return job.get('shapes').findBy('id', params.shape_id);
            },
            afterModel: function (model) {
                if (!model)
                    this.transitionTo('job', this.modelFor('job'));
            },
            setupController: function (controller, model) {
                this._super.apply(this, arguments);
                this.controllerFor('job').set('currentOperation', null);
                this.controllerFor('job').set('currentShape', model);
            }
        });
        Visucam.LoginRoute = Ember.Route.extend({
            model: function (params) {
                if (['twitter', 'facebook', 'github'].indexOf(params.login_type) != -1)
                    return params.login_type;
            }
        });
    });
