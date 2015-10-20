"use strict";
define(['THREE', 'shader!model_proj.vert', 'shader!model_proj.frag', 'shader!conservative_model_proj.vert',
        'shader!conservative_model_proj.frag'],
    function (THREE, normalVertexShader, normalFragmentShader, vertexShader, fragmentShader) {

        function Projector() {
            var scene = new THREE.Scene();
            this.scene = scene;
            this.angle = 0;
            this.normalVertexShader = normalVertexShader;
            this.normalFragmentShader = normalFragmentShader;
            this.vertexShader = vertexShader;
            this.fragmentShader = fragmentShader;
            this.shaderAttributes = {prevPoint: {type: 'v3', value: []}, nextPoint: {type: 'v3', value: []}};
            this.shaderUniforms = {hPixel: {type: 'v2'}, hPixelWorld: {type: 'v2'}};
            this.meshMaterial = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                depthTest: true,
                linewidth: 1,
                uniforms: this.shaderUniforms,
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShader
            });
            this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1);
            scene.add(this.camera);
        }

        Projector.prototype = {
            render: function (renderer, buffer) {
                var extension = renderer.getContext().getExtension('EXT_frag_depth');
                if (!extension && this.meshMaterial.vertexShader != this.normalVertexShader) {
                    console.log('EXT_frag_depth webgl extension is not supported, the projection won\'t be conservative');
                    this.meshMaterial.vertexShader = this.normalVertexShader;
                    this.meshMaterial.fragmentShader = this.normalFragmentShader;
                }
                this.meshMaterial.uniforms.hPixel.value = new THREE.Vector2(1 / buffer.width, 1 / buffer.height);
                var w = (this.camera.right - this.camera.left) / buffer.width;
                var h = (this.camera.top - this.camera.bottom) / buffer.height;
                this.meshMaterial.uniforms.hPixelWorld.value = new THREE.Vector2(w / 2, h / 2);
                renderer.render(this.scene, this.camera, buffer, true);
            },
            setGeometry: function (meshGeometry) {
                this.inputGeometry = meshGeometry;
                if (this.model) {
                    this.scene.remove(this.model);
                    this.model = null;
                }
                this.model = new THREE.Object3D();

                var originalPosition = meshGeometry.attributes.position;
                var attribute = originalPosition.clone();
                var triangleCount = attribute.count / 3;

                for (var triangleIndex = 0; triangleIndex < triangleCount; triangleIndex++) {
                    attribute.copyAt(triangleIndex * 3 + 0, originalPosition, triangleIndex * 3 + 2);
                    attribute.copyAt(triangleIndex * 3 + 1, originalPosition, triangleIndex * 3 + 0);
                    attribute.copyAt(triangleIndex * 3 + 2, originalPosition, triangleIndex * 3 + 1);
                }
                meshGeometry.addAttribute('prevPoint', attribute);
                attribute = originalPosition.clone();
                for (triangleIndex = 0; triangleIndex < triangleCount; triangleIndex++) {
                    attribute.copyAt(triangleIndex * 3 + 0, originalPosition, triangleIndex * 3 + 1);
                    attribute.copyAt(triangleIndex * 3 + 1, originalPosition, triangleIndex * 3 + 2);
                    attribute.copyAt(triangleIndex * 3 + 2, originalPosition, triangleIndex * 3 + 0);
                }
                meshGeometry.addAttribute('nextPoint', attribute);
                meshGeometry.needsUpdate = true;

                var mesh = new THREE.Mesh(meshGeometry, this.meshMaterial);
                this.model.add(mesh);
                this.modelBbox = this.computeCameraBoundingBox();
                this.scene.add(this.model);
                this.model.updateMatrixWorld();
                this.resetCamera();
            },
            resetCamera: function () {
                var bbox = this.modelBbox;
                var bboxSize = bbox.size();
                this.aspectRatio = bboxSize.x / bboxSize.y;
                this.camera.lookAt(new THREE.Vector3(0, 0, bbox.min.z));
                this.camera.near = 1;
                this.camera.position.set(0, 0, bbox.max.z + 10 + this.camera.near);
                this.camera.far = this.camera.position.z - bbox.min.z;
                this.zRatio = 1 / (this.camera.far - this.camera.near);
                this.setCamera(bbox.min.x, bbox.max.x, bbox.min.y, bbox.max.y);
            },
            setCamera: function (left, right, bottom, top) {
                this.camera.bottom = bottom;
                this.camera.top = top;
                this.camera.left = left;
                this.camera.right = right;
                this.camera.updateProjectionMatrix();
                this.camera.updateMatrixWorld();
            },
            pushZInverseProjOn: function (matrix) {
                var pos = new THREE.Vector3().setFromMatrixPosition(matrix);
                pos.z = this.camera.position.z - this.camera.far;
                matrix.scale(new THREE.Vector3(1, 1, this.camera.far - this.camera.near));
                matrix.setPosition(pos);
            },
            setAngle: function (angleDeg) {
                this.angle = angleDeg;
                this.camera.up.set(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), angleDeg * Math.PI / 180);
                this.camera.lookAt(this.camera.position.clone().sub(new THREE.Vector3(0, 0, 1)));
                this.camera.updateProjectionMatrix();
                this.camera.updateMatrixWorld();
                this.modelBbox = this.computeCameraBoundingBox();
            },
            computeCameraBoundingBox: function () {
                var vector = new THREE.Vector3();
                var m = new THREE.Matrix4();
                m.lookAt(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), -this.angle * Math.PI / 180));
                var boundingBox = new THREE.Box3();
                var positions = this.inputGeometry.attributes.position.array;
                if (positions) {
                    var bb = boundingBox;
                    bb.makeEmpty();
                    for (var i = 0, il = positions.length; i < il; i += 3) {
                        vector.set(positions[i], positions[i + 1], positions[i + 2]);
                        vector.applyMatrix4(m);
                        bb.expandByPoint(vector);
                    }
                }

                if (positions === undefined || positions.length === 0) {
                    boundingBox.min.set(0, 0, 0);
                    boundingBox.max.set(0, 0, 0);
                }

                if (isNaN(boundingBox.min.x) || isNaN(boundingBox.min.y) || isNaN(boundingBox.min.z)) {
                    console.error('THREE.BufferGeometry.computeBoundingBox: Computed min/max have NaN values. The "position" attribute is likely to have NaN values.');
                }
                return boundingBox;
            }
        };

        return Projector;
    });