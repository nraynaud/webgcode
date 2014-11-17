"use strict";
define(['Ember', 'cnc/svgImporter', 'cnc/ui/threeDView', 'THREE', 'libs/threejs/STLLoader',
        'libs/threejs/postprocessing/EffectComposer', 'libs/threejs/postprocessing/RenderPass',
        'libs/threejs/postprocessing/ShaderPass', 'libs/threejs/postprocessing/CopyShader'],
    function (Ember, svgImporter, TreeDView, THREE, STLLoader, EffectComposer, RenderPass, ShaderPass, CopyShader) {
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

                function loadStl(file) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        _this.get('controller').addSTL(e.target.result, 'Imported ' + file.name);
                    };
                    reader.readAsBinaryString(file);
                }

                function loadSvg(file) {
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

                event.preventDefault();
                event.stopPropagation();
                var files = event.dataTransfer.files;
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (file.type.indexOf('svg') != -1)
                        loadSvg(file);
                    else if (file.type.indexOf('stl') != -1 || file.name.match(/\.stl/i))
                        loadStl(file);
                }
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
                this.synchronizeCurrentShape();
            },
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
            synchronizeCurrentShape: function () {
                var highlightDisplay = this.get('highlightDisplay');
                highlightDisplay.clear();
                var shape = this.get('controller.currentShape');
                if (shape && shape.get('polyline'))
                    highlightDisplay.addPolyLines(shape.get('polyline'));
                this.get('nativeComponent').reRender();
            }.observes('controller.currentShape', 'controller.currentShape.polyline'),
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
                var _this = this;
                var outlinesDisplay = this.get('outlinesDisplay');
                outlinesDisplay.clear();
                this.get('controller.shapes').forEach(function (shape) {
                    var polyline = shape.get('polyline');
                    outlinesDisplay.addPolyLines(polyline);
                    var stlModel = shape.get('stlModel');
                    if (stlModel)
                        outlinesDisplay.node.add(_this.get('nativeComponent').loadSTL(decodeURI(stlModel)));
                });
                this.get('nativeComponent').zoomExtent();
            }.observes('controller.shapes.@each.polyline', 'controller.shapes.@each.stlModel'),
            synchronizeToolPosition: function () {
                var threeDView = this.get('nativeComponent');
                var position = this.get('controller.toolPosition');
                threeDView.setToolVisibility(true);
                threeDView.setToolPosition(position.x, position.y, position.z);
            }.observes('controller.toolPosition')
        });

        var ShapeView = Ember.View.extend({
            classNames: ['shapeView'],
            init: function () {
                console.log('init');
                this._super.apply(this, arguments);
                this.renderer = new THREE.WebGLRenderer({antialias: false, alpha: true});
                var width = 320;
                var height = 200;
                this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 100);
                this.scene = new THREE.Scene();
                this.scene.add(this.camera);
                this.renderer.sortObjects = false;
                this.renderer.autoClear = false;
                this.set('scene', this.scene);
            },
            didInsertElement: function () {
                console.log('didInsertElement');
                var $container = this.$();
                var width = $container.width();
                var height = $container.height();
                this.renderer.setSize(width, height);
                $container.append(this.renderer.domElement);
                this.displayModel();
            },
            displaySTL: function () {
                this.displayModel();
            }.observes('controller.model.stlModel'),
            displayModel: function () {
                if (this.state == 'inDOM') {
                    var $container = this.$();
                    var width = $container.width();
                    var height = $container.height();
                    this.renderer.setSize(width, height);
                    this.renderer.setViewport(0, 0, width, height);
                    var displayRatio = height / width;
                    var model = this.get('controller.stlModel');
                    if (model) {
                        var geometry = new STLLoader().parse(decodeURI(model));
                        var object = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({wireframe: true, color: 0xFEEFFE}));
                        this.scene.add(object);
                        object.geometry.computeBoundingBox();
                        var bbox = object.geometry.boundingBox;
                        var bboxSize = object.geometry.boundingBox.size();
                        var center = bbox.center();
                        var modelRatio = bboxSize.y / bboxSize.x;
                        var ratio = displayRatio < modelRatio ? bboxSize.y / height : bboxSize.x / width;
                        this.camera.left = -width / 2 * ratio;
                        this.camera.right = width / 2 * ratio;
                        this.camera.top = height / 2 * ratio;
                        this.camera.bottom = -height / 2 * ratio;
                        this.camera.position.x = center.x;
                        this.camera.position.y = center.y;
                        this.camera.position.z = bbox.max.z;
                        this.camera.lookAt(center);
                        this.camera.far = bbox.max.z - bbox.min.z;
                        this.camera.updateProjectionMatrix();
                        var overrideMaterial = new THREE.ShaderMaterial({
                            uniforms: {
                                zRange: { type: "f", value: this.camera.far }
                            },
                            vertexShader: [
                                'void main() {',
                                '   gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);',
                                '}'].join('\n'),
                            fragmentShader: [
                                'uniform float zRange;',
                                'void main() {',
                                '    gl_FragColor = vec4(1.0-gl_FragCoord.z,0.0,0.5,1.0);',
                                '}'].join('\n')
                        });
                        var target = new THREE.WebGLRenderTarget(width, height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});
                        var composer = new EffectComposer(this.renderer, target);
                        composer.addPass(new RenderPass(this.scene, this.camera, overrideMaterial));
                        var radius = 5;
                        var collected = [];
                        for (var i = -radius; i <= radius; i++)
                            for (var j = -radius; j <= radius; j++) {
                                if (j != 0 && i != 0 && i * i + j * j <= radius * radius)
                                    collected.push('   sum = max(sum, texture2D(tDiffuse, vec2(vUv.x + ' + i + '.0 * w, vUv.y + ' + j + '.0 * h)).r);');
                            }
                        var pass2 = new ShaderPass({
                            uniforms: {
                                "tDiffuse": { type: "t", value: null },
                                "h": { type: "f", value: 1.0 / height },
                                "w": { type: "f", value: 1.0 / width }

                            },
                            vertexShader: [
                                "varying vec2 vUv;",
                                "void main() {",
                                "   vUv = uv;",
                                "   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
                                "}"
                            ].join("\n"),
                            fragmentShader: [
                                "uniform sampler2D tDiffuse;",
                                "uniform float h;",
                                "uniform float w;",
                                "varying vec2 vUv;",
                                "void main() {",
                                "   float sum = texture2D(tDiffuse, vec2(vUv.x, vUv.y)).r;"]
                                .concat(collected, [
                                    "   gl_FragColor = vec4(sum, 0.5, 0.0, 1.0);",
                                    "}"]).join("\n")
                        });
                        //pass2 = new ShaderPass(CopyShader);
                        pass2.renderToScreen = true;
                        composer.addPass(pass2);
                        composer.render();
                        //this.renderer.render(this.scene, this.camera);
                    }
                }
            }
        });

        return {
            ThreeDView: ThreeDView,
            LoginView: LoginView,
            ApplicationView: ApplicationView,
            JobView: JobView,
            ShapeView: ShapeView
        };
    });