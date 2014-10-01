"use strict";
define(['THREE', 'TWEEN', 'libs/threejs/OrbitControls', 'libs/threejs/CSS3DRenderer', 'cnc/util'],
    function (THREE, TWEEN, OrbitControls, CSS3DRenderer, util) {

        function webglSupported() {
            try {
                var canvas = document.createElement('canvas');
                return !!window.WebGLRenderingContext && ( canvas.getContext('webgl') || canvas.getContext('experimental-webgl') );
            } catch (e) {
                return false;
            }
        }

        function tweenVector(v) {
            return new util.Point(v.x, v.y, v.z);
        }

        function Node(node, material) {
            this.node = node;
            this.material = material;
        }

        Node.prototype = {
            clear: function () {
                var node = this.node;
                while (node.children.length)
                    node.remove(node.children[0]);
            },
            addPolyLines: function (polylines) {
                for (var i = 0; i < polylines.length; i++) {
                    var poly = polylines[i];
                    var lineGeometry = new THREE.Geometry();
                    for (var j = 0; j < poly.length; j++)
                        lineGeometry.vertices.push(new THREE.Vector3(poly[j].x, poly[j].y, poly[j].z));
                    this.node.add(new THREE.Line(lineGeometry, this.material));
                }
            }
        };

        function createIcon(view) {
            var renderer = new CSS3DRenderer();
            var width = 100;
            var height = 100;
            renderer.setSize(width, height);
            renderer.domElement.style.position = 'absolute';
            renderer.domElement.style.top = 0;
            $(renderer.domElement).addClass('viewCube');
            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(40, width / height, 1, 100);
            camera.up.set(0, 0, 1);
            camera.position.set(200, 100, 250);
            var controls = new OrbitControls(camera, renderer.domElement);
            controls.noZoom = true;
            controls.noPan = true;
            controls.maxDistance = 250;
            controls.minDistance = 250;
            controls.update();
            function myChangePropagator() {
                var radius = view.camera.position.clone().sub(view.controls.target).length();
                view.camera.position.copy(camera.position);
                view.camera.position.normalize().multiplyScalar(radius).add(view.controls.target);
                view.reRender();
            }

            controls.addEventListener('change', function () {
                renderer.render(scene, camera);
            });
            controls.addEventListener('start', function () {
                view.controls.removeEventListener('change', updatePositionFromView);
                controls.addEventListener('change', myChangePropagator);
            });
            controls.addEventListener('end', function () {
                controls.removeEventListener('change', myChangePropagator);
                view.controls.addEventListener('change', updatePositionFromView);
            });
            var r = Math.PI / 2;
            var d = 49.5;//slight inset to help mask the seams between the faces
            var faces = [
                {pos: [d, 0, 0], rot: [r, r, 0], name: 'Right', camera: [1, 0, 0]},
                {pos: [-d, 0, 0], rot: [r, -r, 0], name: 'Left', camera: [-1, 0, 0]},
                {pos: [0, d, 0], rot: [-r, 0, 2 * r], name: 'Back', camera: [0, 1, 0]},
                {pos: [0, -d, 0], rot: [r, 0, 0], name: 'Front', camera: [0, -1, 0]},
                {pos: [0, 0, d], rot: [0, 0, 0], name: 'Top', camera: [0, 0, 1]},
                {pos: [0, 0, -d], rot: [0, 2 * r, 2 * r], name: 'Bottom', camera: [0, 0, -1]}
            ];
            var cube = new THREE.Object3D();
            scene.add(cube);
            function createFace(face) {
                var element = $('<div></div>')
                    .html(face.name)
                    .addClass('cubeFace');

                function mouseMoveHandler() {
                    element.unbind('click', clickHandler);
                    element.unbind('mousemove', mouseMoveHandler);
                }

                function clickHandler() {
                    view.zoomExtent(new THREE.Vector3().fromArray(face.camera));
                    element.unbind('click', clickHandler);
                    element.unbind('mousemove', mouseMoveHandler);
                }

                element.mousedown(function () {
                    element.click(clickHandler);
                    element.mousemove(mouseMoveHandler);
                });
                var object = new THREE.CSS3DObject(element[0]);
                object.position.fromArray(face.pos);
                object.rotation.fromArray(face.rot);
                return object;
            }

            for (var i = 0; i < faces.length; i++)
                cube.add(createFace(faces[i]));
            renderer.render(scene, camera);
            function updatePositionFromView() {
                camera.position.copy(view.camera.position);
                camera.position.sub(view.controls.target);
                controls.update();
            }

            view.controls.addEventListener('change', updatePositionFromView);
            return $(renderer.domElement);
        }

        function ThreeDView($container) {
            var _this = this;
            var width = $container.width();
            var height = $container.height();
            if (webglSupported())
                this.renderer = new THREE.WebGLRenderer({antialias: true});
            else
                this.renderer = new THREE.CanvasRenderer();
            this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20000);
            this.scene = new THREE.Scene();
            this.overlayScene = new THREE.Scene();
            this.camera.position.copy(new THREE.Vector3(0, -40, 80));
            this.camera.up.set(0, 0, 1);
            this.renderer.sortObjects = false;
            this.renderer.setSize(width, height);
            this.renderer.autoClear = false;
            function resize() {
                _this.camera.aspect = $container.width() / $container.height();
                _this.camera.updateProjectionMatrix();
                _this.renderer.setSize($container.width(), $container.height());
                _this.reRender();
            }

            $(window).resize(resize);
            $container.append(this.renderer.domElement);
            this.scene.add(this.camera);
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.rotateSpeed = 1.0;
            this.controls.zoomSpeed = 1.2;
            this.controls.panSpeed = 0.8;
            this.controls.noZoom = false;
            this.controls.noPan = false;
            this.controls.staticMoving = true;
            this.controls.dynamicDampingFactor = 0.3;
            this.controls.minDistance = 3;
            this.controls.keys = [ 65, 83, 68 ];
            this.controls.addEventListener('change', function () {
                _this.reRender();
            });
            function createGrid() {
                var size = 10, step = 5;
                var grid = new THREE.GridHelper(size, step);
                grid.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
                grid.setColors(0xFF7F2A, 0xFF7F2A);
                return  grid;
            }

            this.scene.add(createGrid());
            function createAxis(x, y, z, color) {
                return new THREE.ArrowHelper(new THREE.Vector3(x, y, z), new THREE.Vector3(0, 0, 0), 10, color, 1, 1);
            }

            var axes = new THREE.Object3D();
            axes.add(createAxis(10, 0, 0, 0xFF0000));
            axes.add(createAxis(0, 10, 0, 0x00FF00));
            axes.add(createAxis(0, 0, 10, 0x0000FF));
            this.overlayScene.add(axes);
            this.drawing = new THREE.Object3D();
            this.tool = new THREE.Object3D();
            var toolbit = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 10, 20, 2, false), new THREE.MeshPhongMaterial({emissive: 0xEF0000, specular: 0x0F0000, shininess: 204, color: 0xF0F0F0, opacity: 0.5, transparent: true}));
            toolbit.translateY(5);
            var spindle = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 15, 25, 2, false), new THREE.MeshPhongMaterial({emissive: 0xEFEFEF, specular: 0x0F0F0F, shininess: 204, color: 0xF0F0F0, opacity: 0.5, transparent: true}));
            spindle.translateY(17.5);
            this.tool.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
            this.tool.add(toolbit);
            this.tool.add(spindle);
            this.tool.matrixAutoUpdate = true;
            this.setToolVisibility(false);
            this.scene.add(this.tool);
            this.scene.add(this.drawing);
            this.toolpath = new THREE.Object3D();
            this.drawing.add(this.toolpath);
            this.normalMaterial = new THREE.LineBasicMaterial({linewidth: 1.5, color: 0xFFFFFF});
            this.rapidMaterial = new THREE.LineBasicMaterial({linewidth: 1.5, color: 0xFF0000});
            this.outlineMaterial = new THREE.LineBasicMaterial({linewidth: 1.5, color: 0xFFFF00});
            this.highlightMaterial = new THREE.LineBasicMaterial({depthWrite: false, overdraw: true, linewidth: 6,
                color: 0xFF00FF, opacity: 0.5, transparent: true});
            //needed because requestAnimationFrame can't pass a "this".
            this.requestAnimationFrameCallback = this.actuallyRender.bind(this);
            $container.prepend(createIcon(this));
            this.reRender();
        }

        ThreeDView.prototype = {
            addCollated: function (parentObject, rawVertices, attributeName, material) {

                function typedArrayConcat(first, second, constructor) {
                    var firstLength = first.length,
                        result = new constructor(firstLength + second.length);
                    result.set(first);
                    result.set(second, firstLength);
                    return result;
                }

                var vertices = new Float32Array(rawVertices);
                var pointsAdded = vertices.length / 3;
                var currentPoints = this[attributeName] ? this[attributeName].attributes.position.array.length / 3 : 0;
                if (this[attributeName] && (pointsAdded + currentPoints >= 30000)) {
                    this[attributeName] = null;
                    currentPoints = 0;
                }
                var startIndex = currentPoints;
                var newIndices = new Uint16Array((pointsAdded - 1) * 2);
                for (var i = 0; i < pointsAdded - 1; i++) {
                    newIndices[i * 2] = startIndex + i;
                    newIndices[i * 2 + 1] = startIndex + i + 1;
                }
                if (this[attributeName] == null) {
                    this[attributeName] = new THREE.BufferGeometry();
                    this[attributeName].addAttribute('position', new THREE.BufferAttribute(vertices, 3));
                    this[attributeName].addAttribute('index', new THREE.BufferAttribute(newIndices, 1));
                    parentObject.add(new THREE.Line(this[attributeName], material, THREE.LinePieces));
                } else {
                    var attributes = this[attributeName].attributes;
                    attributes.position.array = typedArrayConcat(attributes.position.array, vertices, Float32Array);
                    attributes.index.array = typedArrayConcat(attributes.index.array, newIndices, Uint16Array);
                    attributes.position.needsUpdate = true;
                    attributes.index.needsUpdate = true;
                }
            },
            addToolpathFragment: function (toolpathObject, fragment) {
                return fragment.speedTag == 'rapid'
                    ? this.addCollated(toolpathObject, fragment.vertices, 'rapidMoves', this.rapidMaterial)
                    : this.addCollated(toolpathObject, fragment.vertices, 'normalMoves', this.normalMaterial);
            },
            displayPath: function (path) {
                this.clearView();
                for (var i = 0; i < path.length; i++)
                    this.addToolpathFragment(this.toolpath, path[i]);
                this.zoomExtent();
                return this.toolpath;
            },
            clearView: function () {
                this.clearToolpath();
            },
            clearToolpath: function () {
                this.rapidMoves = null;
                this.normalMoves = null;
                this.clearNode(this.toolpath);
            },
            computeDrawingBBox: function () {
                var bbox = new THREE.Box3();
                this.drawing.updateMatrixWorld(true);
                var _this = this;
                this.drawing.traverse(function (node) {
                    if (node.geometry) {
                        node.geometry.computeBoundingBox();
                        bbox.union(node.geometry.boundingBox.clone().applyMatrix4(_this.drawing.matrixWorld));
                    }
                });
                return bbox;
            },
            zoomExtent: function (newRelativePosition) {
                var bbox = this.computeDrawingBBox();
                var extentMiddle = bbox.center();
                var radius = bbox.getBoundingSphere().radius;
                var previousTarget = this.controls.target.clone();
                new TWEEN.Tween(this.controls.target).to(tweenVector(extentMiddle), 500).start();
                var distance = radius / Math.tan(this.camera.fov / 2);
                var relativePosition = newRelativePosition != null ? newRelativePosition : this.camera.position.clone().sub(previousTarget);
                var newPosition = relativePosition.normalize().multiplyScalar(distance).add(extentMiddle);
                new TWEEN.Tween(this.camera.position).to(tweenVector(newPosition), 500).start();
                this.controls.update();
                this.reRender();
            },
            clearNode: function (node) {
                while (node.children.length)
                    node.remove(node.children[0]);
            },
            setToolVisibility: function (visible) {
                this.tool.traverse(function (child) {
                    child.visible = visible;
                });
            },
            setToolPosition: function (x, y, z) {
                this.tool.position.setX(x);
                this.tool.position.setY(y);
                this.tool.position.setZ(z);
                this.reRender();
            },
            actuallyRender: function () {
                this.renderRequested = false;
                var reanimate = TWEEN.update();
                this.controls.update();
                this.renderer.clear();
                this.renderer.render(this.scene, this.camera);
                if (this.renderer instanceof THREE.WebGLRenderer)
                    this.renderer.clear(false, true, false);
                this.renderer.render(this.overlayScene, this.camera);
                if (reanimate)
                    this.reRender();
            },
            createDrawingNode: function (material) {
                var node = new THREE.Object3D();
                this.drawing.add(node);
                return new Node(node, material);
            },
            createOverlayNode: function (material) {
                var node = new THREE.Object3D();
                this.overlayScene.add(node);
                return new Node(node, material);
            },
            reRender: function () {
                if (!this.renderRequested) {
                    this.renderRequested = true;
                    requestAnimationFrame(this.requestAnimationFrameCallback);
                }
            }
        };
        return {ThreeDView: ThreeDView};
    })
;