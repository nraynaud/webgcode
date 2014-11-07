"use strict";
define(['Ember', 'cnc/svgImporter', 'cnc/ui/threeDView'],
    function (Ember, svgImporter, TreeDView) {
        var ApplicationView = Ember.View.extend({
            classNames: ['rootview']
        });
        var JobView = Ember.View.extend({
            classNames: ['job'],
            didInsertElement: function () {
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
                    var canvas = $('<canvas id="myCanvas" style="visibility: hidden; display:none">');
                    _this.$().append(canvas);
                    try {
                        var res = svgImporter(canvas, e.target.result);
                        _this.get('controller').addShapes(res, 'Imported ' + file.name);
                    } finally {
                        canvas.remove();
                    }
                };
                reader.readAsText(file);
            }
        });

        var LoginView = Ember.View.extend({
            tagName: 'webview',
            classNames: ['loginFrame'],
            attributeBindings: ['src', ''],
            didInsertElement: function () {
                this.$().on('loadstop', Ember.run.bind(this, this.loadstop));
            },
            src: function () {
                return 'https://auth.firebase.com/v2/popping-fire-1042/auth/' + this.get('controller.model')
                + '?v=js-0.0.0&transport=json&suppress_status_codes=true'
            }.property('controller.model'),
            loadstop: function () {
                var _this = this;
                var service = _this.get('controller.model');
                var url = this.$().attr('src').split('?')[0];
                if (url.indexOf('/auth/' + service + '/callback') != -1) {
                    this.$()[0].executeScript({code: "document.getElementsByTagName('pre')[0].innerHTML;"}, function (res) {
                        var authData = JSON.parse(res[0]);
                        _this.get('controller').send('loginWithToken', authData);
                    });
                }
            }
        });

        function collectVertices(toolpath, defaultZ) {
            var res = [];
            toolpath.forEachPoint(function (x, y, z, _) {
                res.push(x, y, z);
            }, defaultZ);
            return new Float32Array(res);
        }

        var ThreeDView = Ember.View.extend({
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

        return {
            ThreeDView: ThreeDView,
            LoginView: LoginView,
            ApplicationView: ApplicationView,
            JobView: JobView
        };
    });