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

        var IN_CHROME_APP = window['chrome'] && window['chrome']['permissions'];

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
            isAuthenticated: function () {
                return this.get('auth') != null;
            }.property('auth'),
            username: function () {
                if (this.get('isAuthenticated'))
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
            }.property('isAuthenticated', 'auth'),
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
                }
            },
            afterAuth: Ember.run.bind(this, function (error, authData) {
                if (error)
                    console.log('afterAuth error', error);
                console.log(arguments);
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
        Visucam.JobRoute = Ember.Route.extend({
            model: function (params) {
                var _this = this;
                return this.store.find('job', params.job_id).then(null, function () {
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
