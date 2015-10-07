'use strict';
define(['Ember', 'cnc/ui/threeDView', 'THREE', 'cnc/util', 'cnc/cam/3D/toolProfile', 'cnc/app/job/jobView'],
    function (Ember, TreeDView, THREE, util, toolProfile, JobView) {
        var ApplicationView = Ember.View.extend({
            classNames: ['rootview']
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
                    this.$()[0].executeScript({code: 'document.getElementsByTagName("pre")[0].innerHTML;'}, function (res) {
                        var authData = JSON.parse(res[0]);
                        _this.get('controller').send('loginWithToken', authData);
                    });
                }
            }
        });

        function collectVertices(toolpath, defaultZ) {
            var res = [];
            toolpath.forEachPoint(function (x, y, z, _) {
                res.push(new util.Point(x, y, z));
            }, defaultZ);
            return res;
        }

        var ShapeWrapper = Ember.Object.extend({
            willDestroy: function () {
                this._super();
                this.get('outlineDisplay').remove();
            },
            copyShapeToOutline: function () {
                var outlineDisplay = this.get('outlineDisplay');
                var shape = this.get('shape');
                outlineDisplay.clear();
                outlineDisplay.addPolyLines(shape.get('polyline'));
                var meshGeometry = shape.get('meshGeometry');
                if (meshGeometry)
                    outlineDisplay.addMesh(meshGeometry);
                outlineDisplay.setVisibility(this.get('shape.visible'));
            }.observes('shape.polyline', 'shape.meshGeometry').on('init'),
            visibleChanged: function () {
                this.get('outlineDisplay').setVisibility(this.get('shape.visible'));
            }.observes('shape.visible')
        });

        var OperationWrapper = Ember.Object.extend({
            init: function () {
                this.set('toolPathNode', this.get('threeDNode').createChild());
                this.set('missedAreaNode', this.get('threeDNode').createChild());
                this.get('missedAreaNode').meshMaterial = new THREE.MeshBasicMaterial({
                    opacity: 0.35,
                    side: THREE.DoubleSide,
                    transparent: true,
                    color: 0x660000
                });
                this.set('leftStock', this.get('threeDNode').createChild());
                this.get('leftStock').meshMaterial = new THREE.MeshBasicMaterial({
                    opacity: 0.15,
                    side: THREE.DoubleSide,
                    transparent: true,
                    color: 0x660aa66
                });
            },
            willDestroy: function () {
                this._super();
                this.get('threeDNode').remove();
            },
            syncView: function () {
                var operation = this.get('operation');
                var node = this.get('toolPathNode');
                node.clear();
                var toolpath2 = operation.get('toolpath');
                if (toolpath2)
                    node.addPolyLines(toolpath2.map(function (toolpath) {
                        return collectVertices(toolpath, operation.get('contourZ'));
                    }));
            },
            observer: function () {
                Ember.run.debounce(this, 'syncView', 1);
            }.observes('operation.toolpath.@each', 'operation.toolpath', 'operation.missedArea').on('init'),
            syncMissedArea: function () {
                var node = this.get('missedAreaNode');
                node.clear();
                var missedArea = this.get('operation.missedArea');
                if (missedArea)
                    node.displayMeshData(missedArea);
            },
            observer2: function () {
                Ember.run.debounce(this, 'syncMissedArea', 1);
            }.observes('operation.missedArea').on('init'),
            syncLeaveStock: function () {
                var node = this.get('leftStock');
                node.clear();
                var leftStock = this.get('operation.leftStock');
                if (leftStock)
                    node.displayMeshData(leftStock);
            },
            observer3: function () {
                Ember.run.debounce(this, 'syncLeaveStock', 1);
            }.observes('operation.leftStock').on('init'),
            visibleChanged: function () {
                this.get('threeDNode').setVisibility(this.get('controller.currentOperation') == this.get('operation'));
            }.observes('controller.currentOperation').on('init')
        });

        function wrapModelCollection(collection, wrapElement) {
            var views = [];
            collection.get('content').addArrayObserver({
                arrayWillChange: function (observedObj, start, removeCount, addCount) {
                    for (var i = start; i < start + removeCount; i++)
                        views[i].destroy();
                    views.replace(start, removeCount, []);
                },
                arrayDidChange: function (observedObj, start, removeCount, addCount) {
                    var newItems = [];
                    for (var i = start; i < start + addCount; i++)
                        newItems.push(wrapElement(observedObj[i]));
                    views.replace(start, 0, newItems);
                }
            });
            collection.forEach(function (shape) {
                views.push(wrapElement(shape));
            });
        }

        var ThreeDView = Ember.View.extend({
            classNames: ['ThreeDView'],
            didInsertElement: function () {
                var threeDView = new TreeDView.ThreeDView(this.$());
                threeDView.normalToolpathNode.lineMaterial = new THREE.LineBasicMaterial({
                    linewidth: 1.5,
                    color: 0x6688aa
                });
                threeDView.disabledToolpathNode.lineMaterial = new THREE.LineBasicMaterial({
                    linewidth: 1.2,
                    color: 0x8899bb
                });
                threeDView.rapidMaterial = new THREE.LineBasicMaterial({
                    linewidth: 1.2,
                    color: 0xdd4c2f
                });
                threeDView.outlineMaterial = new THREE.LineBasicMaterial({linewidth: 1.2, color: 0x000000});
                threeDView.highlightMaterial = new THREE.LineBasicMaterial({
                    depthWrite: false, overdraw: true, linewidth: 6,
                    color: 0xdd4c2f, opacity: 0.5, transparent: true
                });
                this.set('nativeComponent', threeDView);
                this.set('travelDisplay', threeDView.createDrawingNode(threeDView.rapidMaterial, new THREE.MeshLambertMaterial({
                    color: 0xFEEFFE
                })));
                this.set('outlinesDisplay', threeDView.createDrawingNode(threeDView.outlineMaterial, new THREE.MeshLambertMaterial({
                    color: 0xFEEFFE
                })));
                this.set('highlightDisplay', threeDView.createOverlayNode(threeDView.highlightMaterial, new THREE.MeshLambertMaterial({
                    color: 0xdd4c2f, opacity: 0.5
                })));

                this.synchronizeJob();
                wrapModelCollection(this.get('controller.shapes'), function (shape) {
                    return ShapeWrapper.create({
                        shape: shape,
                        outlineDisplay: threeDView.createDrawingNode(threeDView.outlineMaterial, new THREE.MeshLambertMaterial({
                            color: 0xFEEFFE
                        }))
                    });
                });
                var _this = this;
                wrapModelCollection(this.get('controller.operations'), function (operation) {
                    return OperationWrapper.create({
                        operation: operation,
                        threeDNode: threeDView.normalToolpathNode.createChild(),
                        controller: _this.get('controller')
                    });
                });
                this.synchronizeCurrentShape();
            },
            synchronizeCurrentShape: function () {
                var highlightDisplay = this.get('highlightDisplay');
                highlightDisplay.clear();
                var shape = this.get('controller.currentShape');
                if (shape) {
                    var polyline = shape.get('polyline');
                    if (polyline)
                        highlightDisplay.addPolyLines(polyline);
                    var meshGeometry = shape.get('meshGeometry');
                    if (meshGeometry)
                        highlightDisplay.addMesh(meshGeometry.clone());
                }
                this.get('nativeComponent').reRender();
            }.observes('controller.currentShape', 'controller.currentShape.polyline'),
            synchronizeJob: function () {
                var threeDView = this.get('nativeComponent');
                var travelDisplay = this.get('travelDisplay');
                travelDisplay.clear();
                if (this.get('controller.showTravel')) {
                    var travelMoves = this.get('controller.transitionTravels');
                    travelDisplay.addPolyLines(travelMoves.map(function (move) {
                        return move.path;
                    }));
                }
                threeDView.reRender();
            }.observes('controller.transitionTravels', 'controller.showTravel'),
            synchronizeToolPosition: function () {
                var threeDView = this.get('nativeComponent');
                var position = this.get('controller.toolPosition');
                threeDView.setToolVisibility(true);
                threeDView.setToolPosition(position.x, position.y, position.z);
            }.observes('controller.toolPosition')
        });

        var ToolView = Ember.View.extend({
            tagName: 'canvas',
            didInsertElement: function () {
                var ctx = this.get('element').getContext('2d');
                this.set('canvas', ctx);
                this.updateImage();
            },
            updateImage: function () {
                var ctx = this.get('canvas');
                var leaveStock = this.get('controller.3d_leaveStock');
                var profile = toolProfile.createTool(this.get('controller.tool'), 100, 1, leaveStock);
                var max = -Infinity;
                var min = Infinity;
                for (var i = 0; i < profile.length; i++) {
                    if (isFinite(profile[i]) && !isNaN(profile[i])) {
                        max = Math.max(profile[i], max);
                        min = Math.min(profile[i], min);
                    }
                }
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                var radius = this.get('controller.job.toolDiameter') / 2 + leaveStock;
                var middleX = ctx.canvas.width / 2;
                var factorY = ctx.canvas.height / 2 / (max - min);
                var factorX = ctx.canvas.width / 2 / radius;
                var factor = Math.min(factorX, factorY);

                function drawProfile(profile, radius) {
                    var startX = middleX - radius * factor;
                    for (i = 0; i < profile.length; i++) {
                        var x = startX + (i / profile.length * radius) * factor;
                        if (i == 0)
                            ctx.moveTo(x, 0);
                        ctx.lineTo(x, Math.max(ctx.canvas.height - (profile[profile.length - i - 1] - min) * factor, 0));
                    }
                    for (i = 0; i < profile.length; i++) {
                        x = startX + (1 + i / profile.length) * radius * factor;
                        ctx.lineTo(x, Math.max(ctx.canvas.height - ( profile[i] - min) * factor, 0));
                        if (i + 1 >= profile.length)
                            ctx.lineTo(x, 0);
                    }
                }

                ctx.strokeStyle = "blue";
                ctx.save();
                ctx.setLineDash([8, 3]);
                ctx.beginPath();
                drawProfile(profile, radius);
                ctx.stroke();
                ctx.restore();
                profile = toolProfile.createTool(this.get('controller.tool'), 100, 1, 0);
                ctx.strokeStyle = "black";
                ctx.beginPath();
                drawProfile(profile, this.get('controller.job.toolDiameter') / 2);
                ctx.stroke();
            }.observes('controller.model.tool', 'controller.3d_leaveStock')
        });

        return {
            ThreeDView: ThreeDView,
            LoginView: LoginView,
            ApplicationView: ApplicationView,
            JobView: JobView,
            ToolView: ToolView
        };
    });