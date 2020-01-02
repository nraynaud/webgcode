"use strict";

define(['Ember', 'cnc/cam/operations', 'cnc/util', 'cnc/cad/wabble', 'cnc/cam/text', 'cnc/app/job/jobController'],
    function (Ember, Operations, util, Wabble, text, JobController) {
        var wabble = new Wabble(13, 15, 1, 1, 5, 8, 3);
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
                        contour_inside: true, leaveStock: 0, contour_climbMilling: false
                    }, {
                        name: 'Output Holes Roughing', type: 'PocketOperation', outline: outputHoles,
                        contour_inside: true
                    }, {
                        name: 'Output Holes Finishing', type: 'SimpleContourOperation', outline: outputHoles,
                        contour_inside: true, leaveStock: 0, contour_climbMilling: false
                    }, {
                        name: 'Crown Roughing', type: 'RampingContourOperation', outline: rotor, contour_inside: false
                    }, {
                        name: 'Crown Finishing', type: 'SimpleContourOperation', outline: rotor,
                        contour_inside: false, leaveStock: 0, contour_climbMilling: false
                    }, {
                        name: 'Pins Roughing', type: 'RampingContourOperation', outline: pins, contour_inside: false
                    }, {
                        name: 'Pins Finishing', type: 'SimpleContourOperation', outline: pins,
                        contour_inside: false, leaveStock: 0, contour_climbMilling: false
                    }, {
                        name: 'Output Pins Roughing', type: 'RampingContourOperation', outline: outputPins,
                        contour_inside: false
                    }, {
                        name: 'Output Pins Finishing', type: 'SimpleContourOperation', outline: outputPins,
                        contour_inside: false, leaveStock: 0, contour_climbMilling: false
                    }].forEach(function (op) {
                            job.createOperation(op);
                        });
                    this.transitionToRoute('job', job).then(function () {
                        job.saveAll();
                    });
                },
                createJob: function () {
                    var job = this.store.createRecord('job');
                    var _this = this;
                    return job.saveAll().then(function () {
                        _this.transitionToRoute('job', job);
                    });
                }
            }
        });

        var ShapeController = Ember.ObjectController.extend({
            init: function () {
                var _this = this;
                text.getFontList().then(function (list) {
                    _this.set('fonts', list);
                });
            },
            shapeTypes: ['rectangle', 'circle', 'text', 'point', 'slice'],
            isManual: function () {
                return this.get('type') === 'manual';
            }.property('type'),
            isRectangle: function () {
                return this.get('isManual') && this.get('manualDefinition.type') === 'rectangle';
            }.property('isManual', 'manualDefinition.type'),
            isCircle: function () {
                return this.get('isManual') && this.get('manualDefinition.type') === 'circle';
            }.property('isManual', 'manualDefinition.type'),
            isText: function () {
                return this.get('isManual') && this.get('manualDefinition.type') === 'text';
            }.property('isManual', 'manualDefinition.type'),
            isPoint: function () {
                return this.get('isManual') && this.get('manualDefinition.type') === 'point';
            }.property('isManual', 'manualDefinition.type'),
            isSlice: function () {
                return this.get('isManual') && this.get('manualDefinition.type') === 'slice';
            }.property('isManual', 'manualDefinition.type'),
            fonts: null,
            fontChanged: function () {
                if (this.get('isText') && this.get('fonts'))
                    this.set('model.manualDefinition.fontFile', text.searchFontInList(this.get('fonts'), this.get('manualDefinition.fontName')).files['regular']);
            }.observes('manualDefinition.fontName'),
            stlShapes: Ember.computed.filter('job.shapes', function (shape) {
                return shape.get('stlModel') != null;
            })
        });

        var OperationController = Ember.ObjectController.extend({
            needs: ['job'],
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
                if (this.get('type') === '3DlinearOperation')
                    return this.get('stlShapes');
                return this.get('NonStlShapes');
            }.property('stlShapes', 'NonStlShapes', 'type'),
            operationDescriptors: function () {
                return Object.keys(Operations).map(function (key) {
                    return $.extend({class: key}, Operations[key]);
                });
            }.property(),
            isVTool: function () {
                return this.get('3d_toolType').indexOf('v') === 0;
            }.property('3d_toolType'),
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
            ],
            noRamping: Ember.computed.not('pocket_ramping_entry'),
            cannotChangeFeedrate: Ember.computed.not('feedrateOverride')
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
                },
                toggleEnabled: function () {
                    this.set('enabled', !this.get('enabled'));
                },
                moveEarlier: function () {
                    var operations = this.get('job.orderedOperations');
                    var operation = this.get('model');
                    var previous = operations[operations.indexOf(operation) - 1];
                    var index = this.get('index');
                    this.set('model.index', previous.get('index'));
                    previous.set('index', index);
                },
                moveLater: function () {
                    var operations = this.get('job.orderedOperations');
                    var operation = this.get('model');
                    var next = operations[operations.indexOf(operation) + 1];
                    var index = this.get('index');
                    this.set('model.index', next.get('index'));
                    next.set('index', index);
                }
            },
            isCurrent: function () {
                return this.get('controllers.job.currentOperation') === this.get('model');
            }.property('controllers.job.currentOperation'),
            isRunning: function () {
                return this.get('controllers.job.runningOperations').contains(this.get('model.id'));
            }.property('controllers.job.runningOperations'),
            isNotFirst: function () {
                return this.get('index') > this.get('job.orderedOperations.firstObject.index');
            }.property('index'),
            isNotLast: function () {
                return this.get('index') < this.get('job.orderedOperations.lastObject.index');
            }.property('index')
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
                },
                toggleHide: function () {
                    this.set('visible', !this.get('visible'));
                }
            },
            isCurrent: function () {
                return this.get('controllers.job.currentShape') === this.get('model');
            }.property('controllers.job.currentShape')
        });
        return {
            IndexController: IndexController,
            JobController: JobController,
            ShapeController: ShapeController,
            OperationController: OperationController,
            OperationListItemController: OperationListItemController,
            ShapeListItemController: ShapeListItemController
        }
    });
