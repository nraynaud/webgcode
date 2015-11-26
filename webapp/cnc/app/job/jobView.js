"use strict";
define(['Ember', 'cnc/import/svgImporter', 'cnc/import/gerberImporter', 'cnc/import/excellonImporter', 'cnc/util'],
    function (Ember, svgImporter, gerberImporter, excellonImporter, util) {
        var JobView = Ember.View.extend({
            classNames: ['job'],
            classNameBindings: ['isBusy'],
            didInsertElement: function () {
                var _this = this;
                this.$('#deleteBlock').hover(function () {
                    $(this).data('hovering', true);
                    _this.displayFakeDelete(false);
                }, function () {
                    $(this).data('hovering', false);
                    if (_this.get('controller.deleteSlider') == 0)
                        _this.displayFakeDelete(true);
                });
                this.$('#deleteSlider').mouseup(function () {
                    if (_this.get('controller.deleteSlider') == 1) {
                        _this.get('controller').send('delete');
                        _this.displayFakeDelete(true);
                    }
                    _this.set('controller.deleteSlider', 0);
                });
                var currentSwap1 = null;
                var currentSwap2 = null;
                /*
                 //sadly removed because drag/drop doesn't work in chrome applications.
                 Sortable.create(this.$('#operationList')[0], {
                 draggable: ".list-group-item",
                 filter: "script",
                 animation: 150,
                 scroll: this.$('.jobDetail')[0],
                 handle: ".arrow-panel",
                 ghostClass: 'drag-ghost',
                 onEnd: function (evt) {
                 var tmp = currentSwap1.get('index');
                 currentSwap1.set('index', currentSwap2.get('index'));
                 currentSwap2.set('index', tmp);
                 },
                 onMove: function (evt) {
                 currentSwap1 = Ember.View.views[$(evt.dragged).attr('id')].get('parameters.context.model');
                 var view = Ember.View.views[$(evt.related).attr('id')];
                 if (view)
                 currentSwap2 = view.get('parameters.context.model');
                 }
                 });*/
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

                function loadStl(file) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        _this.get('controller').addSTL(e.target.result, file.name);
                    };
                    reader.readAsBinaryString(file);
                }

                function loadSvg(file) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var res = svgImporter(e.target.result);
                        _this.get('controller').addShapes(res, file.name);
                    };
                    reader.readAsText(file);
                }

                function loadGerber(file) {
                    Number.isInteger = Number.isInteger || function (value) {
                        return typeof value === "number" &&
                            isFinite(value) &&
                            Math.floor(value) === value;
                    };
                    _this.set('isBusy', true);
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        try {
                            var res = gerberImporter(e.target.result);
                            _this.get('controller').addShapes([res], file.name);
                        } catch (error) {
                            if (error.message == 'unrecognized file') {
                                console.log('unrecognized gerber, trying excellon');
                                var res2 = excellonImporter(e.target.result);
                                var keys = Object.keys(res2.holes);
                                if (keys.length)
                                    console.log('found holes in excellon file', res2);
                                for (var i = 0; i < keys.length; i++) {
                                    var shapes = [];
                                    var k = keys[i];
                                    var diameter = res2.defs[k];
                                    var positions = res2.holes[k];
                                    var right = new util.Point(diameter / 1.8, 0);
                                    var top = new util.Point(0, diameter / 1.8);
                                    for (var j = 0; j < positions.length; j++) {
                                        var pos = positions[j];
                                        shapes.push('M' + pos.sub(right).svg() + 'L' + pos.add(right).svg());
                                        shapes.push('M' + pos.sub(top).svg() + 'L' + pos.add(top).svg());
                                    }

                                    var diameterString = Number.isInteger(diameter) ? diameter.toString() : diameter.toFixed(3);
                                    _this.get('controller').addShapes([shapes], file.name + ' D' + diameterString + 'mm', {
                                        drillData: JSON.stringify({
                                            defs: res2.defs,
                                            holes: {k: positions}
                                        })
                                    });
                                }

                            }
                            else
                                throw new Error(error.message + error.stack);
                        } finally {
                            _this.set('isBusy', false);
                        }
                    };
                    reader.readAsText(file);
                }

                event.preventDefault();
                event.stopPropagation();
                var files = event.dataTransfer.files;
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (file.type.indexOf('svg') != -1 || file.name.match(/\.svg/i))
                        loadSvg(file);
                    else if (file.type.indexOf('stl') != -1 || file.name.match(/\.stl/i))
                        loadStl(file);
                    else loadGerber(file);
                }
            },
            displayFakeDelete: function (displayFake) {
                this.$('#fakeDelete').toggle(displayFake);
                this.$('#realDelete').toggle(!displayFake);
            },
            observeDeleteSlider: function () {
                var val = this.get('controller.deleteSlider');
                if (this.$()) {
                    this.$('#deleteBlock').css('background-color', 'rgba(255, 0, 0, ' + val + ')');
                    if (val == 1) {
                        $('#slideToDelete').hide();
                        $('#releaseToDelete').show();
                    } else {
                        $('#slideToDelete').show();
                        $('#releaseToDelete').hide();
                    }
                    if (val == 0 && !this.$('#deleteBlock').data('hovering'))
                        this.displayFakeDelete(true);
                }
            }.observes('controller.deleteSlider')
        });
        return JobView;
    });