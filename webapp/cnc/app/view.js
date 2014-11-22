'use strict';
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
                        outlinesDisplay.node.add(_this.get('nativeComponent').loadSTL(stlModel));
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
                this.renderer = new THREE.WebGLRenderer({antialias: false, alpha: true, precision: 'highp', autoClear: true});
                var width = 320;
                var height = 200;
                this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 100);
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
                function copy(src) {
                    var dst = new ArrayBuffer(src.byteLength);
                    new Uint8Array(dst).set(new Uint8Array(src));
                    return dst;
                }

                if (this.state == 'inDOM') {
                    var $container = this.$();
                    var width = $container.width() * 4;
                    var height = $container.height() * 4;
                    this.renderer.setSize(width, height);
                    this.renderer.setViewport(0, 0, width, height);
                    var displayRatio = height / width;
                    var model = this.get('controller.stlModel');
                    if (model) {
                        console.log(model.length);
                        console.time('parsing');
                        var geometry = new STLLoader().parse(model);
                        console.timeEnd('parsing');
                        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xFEEFFE}));
                        this.scene.add(mesh);
                        var pointsGeom = new THREE.BufferGeometry();
                        // we add the vertices to force the rasterizer to raster them as at least 1 pixel
                        // in case a "mountain" is spiky enough to slip thought the raster grid.
                        pointsGeom.addAttribute('position', geometry.attributes.position.clone());
                        this.scene.add(new THREE.PointCloud(pointsGeom));
                        // we should add all the edges too because a whole "ridge" might be sharp enough to slip through
                        // the raster grid but I have a problem where the end of some lines "poke" slightly through the surface
                        // I don't know why.
                        //this.scene.add(new THREE.WireframeHelper(mesh));
                        mesh.geometry.computeBoundingBox();
                        var bbox = mesh.geometry.boundingBox;
                        var bboxSize = mesh.geometry.boundingBox.size();
                        var center = bbox.center();
                        var modelRatio = bboxSize.y / bboxSize.x;
                        var ratio = displayRatio < modelRatio ? bboxSize.y / height : bboxSize.x / width;
                        var pixelsPerMm = 1 / ratio;
                        console.log('pixelsPerMm', pixelsPerMm);
                        this.camera.left = -width / 2 * ratio;
                        this.camera.right = width / 2 * ratio;
                        this.camera.top = height / 2 * ratio;
                        this.camera.bottom = -height / 2 * ratio;
                        this.camera.position.x = center.x;
                        this.camera.position.y = center.y;
                        this.camera.position.z = bbox.max.z + 1;
                        this.camera.lookAt(center);
                        this.camera.far = bbox.max.z - bbox.min.z + 1;
                        console.log('near, far', this.camera.near, this.camera.far);
                        this.camera.updateProjectionMatrix();
                        console.time('shader');
                        var operation = {
                            sizeAttenuation: false,
                            linewidth: 1,
                            vertexShader: [
                                'void main() {',
                                '   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                                '}'].join('\n'),
                            // depth encoding : http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/
                            fragmentShader: [
                                'highp float factor = (exp2(24.0) - 1.0) / exp2(24.0);',
                                'vec3 EncodeFloatRGB(highp float v) {',
                                '   vec3 enc = fract(vec3(1.0, 255.0, 255.0 * 255.0) * factor * v);',
                                '   enc -= enc.yzz * vec3(1.0 / 255.0, 1.0 / 255.0, 0.0);',
                                '   return enc;',
                                '}',
                                'highp float DecodeFloatRGB(vec3 rgb) {',
                                '   return dot(rgb, vec3(1.0, 1.0 / 255.0, 1.0 / 255.0 / 255.0)) / factor;',
                                '}',
                                'void main() {',
                                '   gl_FragColor = vec4(EncodeFloatRGB((1.0 - gl_FragCoord.z)), 1.0);',
                                '}'].join('\n')
                        };
                        var target = new THREE.WebGLRenderTarget(width, height,
                            {minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter});
                        var composer = new EffectComposer(this.renderer, target);
                        composer.addPass(new RenderPass(this.scene, this.camera, new THREE.ShaderMaterial(operation)));
                        var radiusMM = 1;
                        var pixelRadius = radiusMM * pixelsPerMm;
                        var zRatio = 1 / (this.camera.far - this.camera.near);
                        var pixelCount = Math.ceil(pixelRadius) + 1;
                        var toolProfile = new Uint8Array(pixelCount);
                        // 45° tool
                        for (var i = 0; i < pixelCount; i++) {
                            for (var j = 0; j < pixelCount; j++) {
                                console.log(i, i / pixelRadius * radiusMM * zRatio);
                                toolProfile[i * pixelCount * j] = 127;
                            }
                        }
                        var lwidth = 64;
                        var lheight = 64;
                        var pixels = new Float32Array(width * height);
                        for (var y = 0; y < height; ++y) {
                            for (var x = 0; x < width; ++x) {
                                var offset = (y * width + x);
                                pixels[offset] = ((x * y) / (width * height)) * 256000;
                            }
                        }

                        console.log(toolProfile);
                        var toolTexture = new THREE.DataTexture(pixels, lwidth, lheight, THREE.LuminanceFormat, THREE.FloatType);
                        toolTexture.needsUpdate = true;
                        console.log(pixelRadius);
                        var shader = {
                            uniforms: {
                                tDiffuse: {type: 't', value: null},
                                tToolProfile: {type: 't', value: toolTexture}
                            },
                            defines: {
                                radius: pixelRadius,
                                pixelCount: pixelCount + '.0',
                                w: (1.0 / width).toPrecision(10),
                                h: (1.0 / height).toPrecision(10)
                            },
                            vertexShader: [
                                'varying vec2 vUv;',
                                'void main() {',
                                '   vUv = uv;',
                                '   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                                '}'
                            ].join('\n'),
                            fragmentShader: [
                                'uniform sampler2D tDiffuse;',
                                'uniform sampler2D tToolProfile;',
                                'varying vec2 vUv;',
                                'highp float factor = (exp2(24.0) - 1.0) / exp2(24.0);',
                                'vec3 EncodeFloatRGB(highp float v) {',
                                '   vec3 enc = fract(vec3(1.0, 255.0, 255.0 * 255.0) * factor* v);',
                                '   enc -= enc.yzz * vec3(1.0 / 255.0, 1.0 / 255.0, 0.0);',
                                '   return enc;',
                                '}',
                                'highp float DecodeFloatRGB(vec3 rgb) {',
                                '   return dot(rgb, vec3(1.0, 1.0 / 255.0, 1.0 / 255.0 / 255.0)) / factor;',
                                '}',
                                'highp float readHeight(vec2 pos) {',
                                '   highp vec4 color = texture2D(tDiffuse, vUv + pos);',
                                '   highp float displacement = texture2D(tToolProfile, vec2(length(pos), 0.5)).r;',
                                '   return DecodeFloatRGB(color.rgb) - displacement;',
                                '}',
                                'void main() {',
                                '   highp float sum = readHeight(vec2(0.0, 0.0));',
                                '   for (float i = 0.0; i <= pixelCount; i++)',
                                '       for (float j = 0.0; j <= pixelCount; j++)',
                                '           if (i * i + j * j <= radius * radius) {',
                                '               vec2 point = vec2(i * w, j * h);',
                                '               sum = max(sum, readHeight(point * vec2(-1.0, +1.0)));',
                                '               sum = max(sum, readHeight(point * vec2(+1.0, -1.0)));',
                                '               sum = max(sum, readHeight(point * vec2(-1.0, -1.0)));',
                                '               sum = max(sum, readHeight(point * vec2(+1.0, +1.0)));',
                                '           }',
                                '   gl_FragColor = vec4(EncodeFloatRGB(sum), 1.0);',
                                '}'].join('\n')
                        };
                        var pass2 = new ShaderPass(shader);
                        //pass2 = new ShaderPass(CopyShader);
                        pass2.renderToScreen = true;
                        composer.addPass(pass2);
                        composer.render();
                        console.timeEnd('shader');
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