"use strict";

define(['Ember', 'jQuery', 'cnc/util', 'cnc/cam/cam'], function (Ember, $, util, cam) {

    var JobController = Ember.ObjectController.extend({
        init: function () {
            this._super();
            var _this = this;
            window.addEventListener("message", Ember.run.bind(this, function (event) {
                if (event.data['type'] == 'gimme program') {
                    var parameters = event.data.parameters;
                    var toolPath = _this.get('model').computeCompactToolPath();
                    console.time('postMessage');
                    event.ports[0].postMessage({
                        type: 'compactToolPath',
                        parameters: parameters,
                        toolPath: toolPath,
                        hasMore: false,
                        startSpindleBefore: _this.get('model.startSpindle'),
                        stopSpindleAfter: _this.get('model.startSpindle'),
                        startSocketBefore: _this.get('model.startSocket'),
                        stopSocketAfter: _this.get('model.startSocket')
                    });
                    console.timeEnd('postMessage');
                }
                if (event.data['type'] == 'toolPosition') {
                    var pos = event.data['position'];
                    var newPos = new util.Point(pos.x, pos.y, pos.z);
                    if (_this.get('toolPosition').sqDistance(newPos))
                        _this.set('toolPosition', newPos);
                    if (_this.get('model.startPoint').sqDistance(newPos))
                        _this.set('model.startPoint', newPos);
                }
                if (event.data['type'] == 'current operations') {
                    _this.set('runningOperations', event.data['operations']);
                }
            }), false);
        },
        runningOperations: [],
        toolPosition: null,
        currentOperation: null,
        currentShape: null,
        showTravel: true,
        deleteSlider: 0,
        addShapes: function (shapeDefinitions, name, params) {
            var shape = this.get('model').createShape(shapeDefinitions.join(' '), name, params);
            return this.transitionToRoute('shape', shape);
        },
        addSTL: function (stlData, name) {
            var shape = this.get('model').createShape('', name);
            shape.set('stlModel', stlData);
            return this.transitionToRoute('shape', shape);
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
            },
            getGcode: function () {
                var program = this.get('model.wholeProgram').path;
                var currentFeed = this.get('model.feedrate');
                var code = cam.dumpGCode(currentFeed, function (collector) {
                    for (var i = 0; i < program.length; i++) {
                        var fragment = program[i];
                        if (fragment.feedrate)
                            collector.changeWorkSpeed(fragment.feedrate);
                        var gotoFunc;
                        if (fragment.speedTag == 'normal')
                            gotoFunc = collector.goToWorkSpeed.bind(collector);
                        if (fragment.speedTag == 'rapid')
                            gotoFunc = collector.goToTravelSpeed.bind(collector);
                        for (var j = 0; j < fragment.path.length; j++)
                            gotoFunc(fragment.path[j]);
                    }
                });
                var url = window.URL.createObjectURL(new Blob([code], {type: 'application/octet-binary'}));
                try {
                    $('<a download="test.nc"></a>').attr('href', url)[0].click();
                } finally {
                    window.URL.revokeObjectURL(url);
                }
            }
        },
        saveDisabled: function () {
            return !this.get('model.isDirty')
                && this.get('model.shapes').every(function (shape) {
                    return !(shape.get('isDirty') || shape.get('manualDefinition.isDirty'));
                })
                && this.get('model.operations').every(function (operation) {
                    return !operation.get('isDirty');
                });
        }.property('model.isDirty', 'model.shapes.@each.isDirty', 'model.shapes.@each.manualDefinition.isDirty', 'model.operations.@each.isDirty'),
        syncCanSendProgram: function () {
            window.postMessage({canSendProgram: this.get('model.canSendProgram')}, '*');
        }.observes('model.canSendProgram', 'model').on('init')
    });

    return JobController;
});