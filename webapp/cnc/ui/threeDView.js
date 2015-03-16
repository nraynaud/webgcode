"use strict";
define(['THREE', 'TWEEN', 'cnc/util', 'libs/threejs/OrbitControls', 'cnc/ui/cubeManipulator'],
    function (THREE, TWEEN, util, OrbitControls, cubeManipulator) {

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

        function PolylineNode(node, material) {
            this.node = node;
            this.material = material;
            this.bufferedGeometry = null;
        }

        PolylineNode.prototype = {
            clear: function () {
                this.bufferedGeometry = null;
                var node = this.node;
                while (node.children.length) {
                    var child = node.children[0];
                    child.geometry.dispose();
                    node.remove(child);
                }
            },
            addPolyLines: function (polylines) {
                for (var i = 0; i < polylines.length; i++) {
                    var poly = polylines[i];
                    var rawVertices = new Float32Array(poly.length * 3);
                    for (var j = 0; j < poly.length; j++) {
                        rawVertices[j * 3 + 0] = poly[j].x;
                        rawVertices[j * 3 + 1] = poly[j].y;
                        rawVertices[j * 3 + 2] = poly[j].z;
                    }
                    this.addCollated(rawVertices);
                }
            },
            addCollated: function (rawVertices) {
                var maxPoints = 10000;

                function typedArrayConcat(first, second, constructor) {
                    var firstLength = first.length,
                        result = new constructor(firstLength + second.length);
                    result.set(first);
                    result.set(second, firstLength);
                    return result;
                }

                var vertices = rawVertices instanceof Float32Array ? rawVertices : new Float32Array(rawVertices);
                var pointsAdded = vertices.length / 3;

                if (pointsAdded > maxPoints) {
                    for (var i = 0; i < vertices.length; i += (maxPoints - 1) * 3) {
                        var group = vertices.subarray(i, i + maxPoints * 3);
                        this.addCollated(group);
                    }
                    return;
                }
                var currentPoints = this.bufferedGeometry ? this.bufferedGeometry.attributes.position.array.length / 3 : 0;
                if (this.bufferedGeometry && (pointsAdded + currentPoints > maxPoints)) {
                    this.bufferedGeometry = null;
                    currentPoints = 0;
                }
                var startIndex = currentPoints;
                var newIndices = new Uint16Array((pointsAdded - 1) * 2);
                for (i = 0; i < pointsAdded - 1; i++) {
                    newIndices[i * 2] = startIndex + i;
                    newIndices[i * 2 + 1] = startIndex + i + 1;
                }
                if (this.bufferedGeometry == null) {
                    this.bufferedGeometry = new THREE.BufferGeometry();
                    this.bufferedGeometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
                    this.bufferedGeometry.addAttribute('index', new THREE.BufferAttribute(newIndices, 1));
                    this.node.add(new THREE.Line(this.bufferedGeometry, this.material, THREE.LinePieces));
                } else {
                    var attributes = this.bufferedGeometry.attributes;
                    attributes.position.array = typedArrayConcat(attributes.position.array, vertices, Float32Array);
                    attributes.index.array = typedArrayConcat(attributes.index.array, newIndices, Uint16Array);
                    attributes.position.needsUpdate = true;
                    attributes.index.needsUpdate = true;
                }
            }
        };

        function ThreeDView($container) {
            var _this = this;
            var width = $container.width();
            var height = $container.height();
            if (webglSupported())
                this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
            else
                this.renderer = new THREE.CanvasRenderer({alpha: true});
            this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20000);
            this.scene = new THREE.Scene();
            this.overlayScene = new THREE.Scene();
            this.camera.position.copy(new THREE.Vector3(0, -40, 80));
            this.camera.up.set(0, 0, 1);
            this.renderer.sortObjects = false;
            this.renderer.setSize(width, height);
            this.renderer.autoClear = false;
            this.resizeHandler = function () {
                _this.camera.aspect = $container.width() / $container.height();
                _this.camera.updateProjectionMatrix();
                _this.renderer.setSize($container.width(), $container.height());
                _this.reRender();
            };
            $(window).resize(this.resizeHandler);
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
            this.controls.keys = [65, 83, 68];
            this.controls.addEventListener('change', function () {
                _this.reRender();
            });
            function createGrid() {
                var size = 10, step = 5;
                var grid = new THREE.GridHelper(size, step);
                grid.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
                grid.setColors(0xFF7F2A, 0xFF7F2A);
                return grid;
            }

            this.scene.add(createGrid());
            function createAxis(x, y, z, color) {
                var obj = new THREE.Object3D();
                var lineGeometry = new THREE.Geometry();
                var dir = new THREE.Vector3(x, y, z);
                var normDir = dir.clone().normalize();
                lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0), dir);
                var coneGeometry = new THREE.CylinderGeometry(0, 0.5, 1, 10, 1);
                coneGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, dir.length(), 0));
                var cone = new THREE.Mesh(coneGeometry, new THREE.MeshBasicMaterial({color: color}));
                if (normDir.y > 0.99999)
                    cone.quaternion.set(0, 0, 0, 1);
                else if (normDir.y < -0.99999)
                    cone.quaternion.set(1, 0, 0, 0);
                else {
                    var axis = new THREE.Vector3();
                    axis.set(normDir.z, 0, -normDir.x).normalize();
                    var radians = Math.acos(normDir.y);
                    cone.quaternion.setFromAxisAngle(axis, radians);
                }
                obj.add(new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({color: color})));
                obj.add(cone);
                return obj;
            }

            var axes = new THREE.Object3D();
            axes.add(createAxis(10, 0, 0, 0xFF0000));
            axes.add(createAxis(0, 10, 0, 0x00FF00));
            axes.add(createAxis(0, 0, 10, 0x0000FF));
            this.overlayScene.add(axes);
            this.drawing = new THREE.Object3D();
            this.tool = new THREE.Object3D();
            var toolbit = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 10, 20, 2, false), new THREE.MeshPhongMaterial({
                emissive: 0xEF0000,
                specular: 0x0F0000,
                shininess: 204,
                color: 0xF0F0F0,
                opacity: 0.5,
                transparent: true
            }));
            toolbit.translateY(5);
            var spindle = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 15, 25, 2, false), new THREE.MeshPhongMaterial({
                emissive: 0xEFEFEF,
                specular: 0x0F0F0F,
                shininess: 204,
                color: 0xF0F0F0,
                opacity: 0.5,
                transparent: true
            }));
            spindle.translateY(17.5);
            this.tool.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
            this.tool.add(toolbit);
            this.tool.add(spindle);
            this.tool.matrixAutoUpdate = true;
            this.setToolVisibility(false);
            this.scene.add(this.tool);
            this.scene.add(this.drawing);
            var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(1000, 1000, 1000);
            this.scene.add(directionalLight);
            var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight2.position.set(-1000, -1000, 1000);
            this.scene.add(directionalLight2);
            this.normalMaterial = new THREE.LineBasicMaterial({linewidth: 1.5, color: 0xFFFFFF});
            this.rapidMaterial = new THREE.LineBasicMaterial({linewidth: 1.5, color: 0xFF0000});
            this.outlineMaterial = new THREE.LineBasicMaterial({linewidth: 1.5, color: 0xFFFF00});
            this.highlightMaterial = new THREE.LineBasicMaterial({
                depthWrite: false, overdraw: true, linewidth: 6,
                color: 0xFF00FF, opacity: 0.5, transparent: true
            });
            //needed because requestAnimationFrame can't pass a "this".
            this.requestAnimationFrameCallback = this.actuallyRender.bind(this);
            $container.prepend(cubeManipulator(this));
            $container.prepend($('<div class="3DWarning" title="maybe one day" style="position:absolute; top:0; right: 0;">Sorry, there is no mouse selection in this view.</div>'));
            this.rapidToolpathNode = this.createDrawingNode(this.rapidMaterial);
            this.normalToolpathNode = this.createDrawingNode(this.normalMaterial);
            this.reRender();
        }

        ThreeDView.prototype = {
            loadSTL: function (meshGeometry) {
                meshGeometry.computeFaceNormals();
                meshGeometry.computeVertexNormals();
                return new THREE.Mesh(meshGeometry, new THREE.MeshLambertMaterial({
                    color: 0xFEEFFE,
                    shading: THREE.SmoothShading
                }));
            },
            addToolpathFragment: function (fragment) {
                this[fragment.speedTag == 'rapid' ? 'rapidToolpathNode' : 'normalToolpathNode'].addCollated(fragment.vertices);
            },
            clearView: function () {
                this.clearToolpath();
            },
            clearToolpath: function () {
                this.rapidToolpathNode.clear();
                this.normalToolpathNode.clear();
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
                return new PolylineNode(node, material);
            },
            createOverlayNode: function (material) {
                var node = new THREE.Object3D();
                this.overlayScene.add(node);
                return new PolylineNode(node, material);
            },
            reRender: function () {
                if (!this.renderRequested) {
                    this.renderRequested = true;
                    requestAnimationFrame(this.requestAnimationFrameCallback);
                }
            },
            destroy: function () {
                $(window).off('resize', $(window), this.resizeHandler);
                this.renderer.domElement.remove();
            }
        };
        return {ThreeDView: ThreeDView};
    });