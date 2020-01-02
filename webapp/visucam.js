"use strict";
require(['jQuery', 'Ember', 'EmberData', 'cnc/app/models', 'cnc/ui/views', 'cnc/app/view',
        'cnc/app/controller', 'templates', 'bootstrap'],
    function ($, Ember, DS, models, views, appViews, controller, templates, _) {
        Ember.TEMPLATES['application'] = Ember.TEMPLATES['visucamApp'];

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

        Visucam.ApplicationSerializer = DS.JSONSerializer.extend();

        Visucam.ApplicationAdapter = DS.Adapter.extend({
            generateIdForRecord: function (store, inputProperties) {
                return Math.random().toString(32).slice(2).substr(0, 5);
                ;
            },
            deleteRecord(store, type, snapshot) {
                return Ember.RSVP.resolve(true);
            }
        });

        Visucam.Router.map(function () {
            this.resource('job', {path: 'jobs/:job_id'}, function () {
                this.resource('operation', {path: 'operations/:operation_id'});
                this.resource('shape', {path: 'shapes/:shape_id'});
            });
        });

        Visucam.ApplicationRoute = Ember.Route.extend({
            actions: {
                error: function (reason) {
                    console.log(reason);
                    if (reason.stack)
                        console.log(reason.stack);
                    this.transitionTo('index');
                },
            },
        });

        Visucam.IndexRoute = Ember.Route.extend({
            model: function () {
                return this.store.find('jobSummary');
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
                    console.error('error', error);
                    if (error && error.stack)
                        console.error(error.stack);
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
                return this.modelFor('job').get('operations').findBy('id', params.operation_id);
            },
            afterModel: function (model) {
                if (!model)
                    this.transitionTo('job', this.modelFor('job'));
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
    });
