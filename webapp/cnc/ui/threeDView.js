"use strict";
define(['THREE', 'TWEEN', 'cnc/util', 'libs/threejs/OrbitControls', 'cnc/ui/cubeManipulator', 'require'],
    function (THREE, TWEEN, util, OrbitControls, cubeManipulator, require) {
//stolen from http://stackoverflow.com/a/8809472/72637
        function generateUUID() {
            var d = performance.now();
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }

        var worker = new Worker(require.toUrl('worker.js') + '#3DView');

        var resultMap = {};

        worker.onmessage = function (event) {
            var callback = resultMap[event.data.id];
            if (callback) {
                delete resultMap[event.data.id];
                callback(event.data);
            }
        };

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

        function OutlineNode(node, lineMaterial, meshMaterial, view) {
            this.node = node;
            this.lineMaterial = lineMaterial;
            this.meshMaterial = meshMaterial;
            this.bufferedGeometry = null;
            this.view = view;
        }

        OutlineNode.prototype = {
            setVisibility: function (visible) {
                this.node.traverse(function (node) {
                    node.visible = visible;
                });
                this.view.reRender();
            },
            createChild: function () {
                var node = new THREE.Object3D();
                this.node.add(node);
                return new OutlineNode(node, this.lineMaterial, this.meshMaterial, this.view);
            },
            remove: function () {
                var node = this.node;
                for (var i = 0; i < node.children.length; i++) {
                    var geometry = node.children[i].geometry;
                    if (geometry)
                        geometry.dispose();
                }
                node.parent.remove(node);
            },
            clear: function () {
                this.bufferedGeometry = null;
                var node = this.node;
                while (node.children.length) {
                    var child = node.children[0];
                    child.geometry.dispose();
                    node.remove(child);
                }
            },
            addMesh: function (meshGeometry) {
                this.node.add(new THREE.Mesh(meshGeometry, this.meshMaterial));
            },
            addPolyLines: function (polylines) {
                if (!polylines.length)
                    return;
                var id = generateUUID();
                var _this = this;
                resultMap[id] = function (data) {
                    for (var i = 0; i < data.result.length; i++) {
                        var buffer = data.result[i].position;
                        var indexBuffer = data.result[i].index;
                        var bufferedGeometry = new THREE.BufferGeometry();
                        bufferedGeometry.addAttribute('position', new THREE.BufferAttribute(buffer, 3));
                        bufferedGeometry.setIndex(new THREE.BufferAttribute(indexBuffer, 1));
                        bufferedGeometry.clearGroups();
                        bufferedGeometry.addGroup(0, data.result[i].count * 2);
                        _this.node.add(new THREE.LineSegments(bufferedGeometry, new THREE.MultiMaterial([_this.lineMaterial])));
                    }
                    _this.view.reRender();
                };
                worker.postMessage({id: id, operation: 'uiPreparePolylines', polylines: polylines});
            },
            displayMeshData: function (result) {
                for (var i = 0; i < result.length; i++) {
                    var bufferedGeometry = new THREE.BufferGeometry();
                    bufferedGeometry.addAttribute('position', new THREE.BufferAttribute(result[i].positions, 3));
                    bufferedGeometry.setIndex(new THREE.BufferAttribute(result[i].indices, 1));
                    this.addMesh(bufferedGeometry);
                }
                this.view.reRender();
            },
            addCollated: function (rawVertices) {
                var maxPoints = 20000;

                var vertices = rawVertices instanceof Float32Array ? rawVertices : new Float32Array(rawVertices);
                var pointsAdded = vertices.length / 3;

                var startIndex = 0;
                var buffer;
                var indexBuffer;
                if (this.bufferedGeometry == null) {
                    buffer = new Float32Array(maxPoints * 3);
                    indexBuffer = new Uint16Array(maxPoints * 2);
                    this.bufferedGeometry = new THREE.BufferGeometry();
                    var posAtt = new THREE.BufferAttribute(buffer, 3);
                    posAtt.dynamic = true;
                    this.bufferedGeometry.addAttribute('position', posAtt);
                    var indexAtt = new THREE.BufferAttribute(indexBuffer, 1);
                    indexAtt.dynamic = true;
                    this.bufferedGeometry.setIndex(indexAtt);
                    this.bufferedGeometry.dynamic = true;
                    this.node.add(new THREE.LineSegments(this.bufferedGeometry, new THREE.MultiMaterial([this.lineMaterial])));
                } else {
                    var lastGroup = this.bufferedGeometry.groups[this.bufferedGeometry.groups.length - 1];
                    startIndex = lastGroup.start / 2 + lastGroup.count / 2 + 1;
                    buffer = this.bufferedGeometry.attributes.position.array;
                    indexBuffer = this.bufferedGeometry.index.array;
                }

                var choppedPointAdded = Math.min(startIndex + pointsAdded, maxPoints) - startIndex;
                var segmentsAdded = choppedPointAdded - 1;
                buffer.set(vertices.subarray(0, choppedPointAdded * 3), startIndex * 3);

                for (var i = startIndex; i < startIndex + segmentsAdded; i++) {
                    indexBuffer[i * 2] = i;
                    indexBuffer[i * 2 + 1] = i + 1;
                }
                this.bufferedGeometry.clearGroups();
                this.bufferedGeometry.addGroup(0, (startIndex + segmentsAdded ) * 2);
                this.bufferedGeometry.groupsNeedUpdate = true;

                this.bufferedGeometry.index.needsUpdate = true;
                this.bufferedGeometry.attributes.position.needsUpdate = true;
                if (choppedPointAdded < pointsAdded) {
                    this.bufferedGeometry = null;
                    return this.addCollated(vertices.subarray((choppedPointAdded - 1) * 3));
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
            var toolbit = new THREE.Mesh(new THREE.CylinderGeometry(2, 0, 10, 20, 2, false), new THREE.MeshPhongMaterial({
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
            this.overlayScene.add(directionalLight.clone());
            this.overlayScene.add(directionalLight2.clone());
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
            this.rapidToolpathNode = this.createOverlayNode(this.rapidMaterial);
            this.normalToolpathNode = this.createDrawingNode(this.normalMaterial, new THREE.MeshBasicMaterial({
                color: 0x6622BB,
                opacity: 0.5,
                side: THREE.DoubleSide,
                transparent: true
            }));
            this.disabledToolpathNode = this.createDrawingNode(this.normalMaterial, new THREE.MeshBasicMaterial({
                color: 0x6622DD,
                opacity: 0.5,
                side: THREE.DoubleSide,
                transparent: true
            }));
            this.reRender();
        }

        ThreeDView.prototype = {
            addToolpathFragment: function (fragment) {
                this[fragment.speedTag === 'rapid' ? 'rapidToolpathNode' : 'normalToolpathNode'].addCollated(fragment.vertices);
            },
            clearView: function () {
                this.clearToolpath();
            },
            clearToolpath: function () {
                this.rapidToolpathNode.clear();
                this.normalToolpathNode.clear();
                this.disabledToolpathNode.clear();
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
                // new TWEEN.Tween(this.camera.position).to(tweenVector(newPosition), 500).start();
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
            createDrawingNode: function (lineMaterial, meshMaterial) {
                var node = new THREE.Object3D();
                this.drawing.add(node);
                return new OutlineNode(node, lineMaterial, meshMaterial, this);
            },
            createOverlayNode: function (lineMaterial, meshMaterial) {
                var node = new THREE.Object3D();
                this.overlayScene.add(node);
                return new OutlineNode(node, lineMaterial, meshMaterial, this);
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