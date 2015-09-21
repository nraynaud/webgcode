"use strict";
define([], function () {

    function Projector() {
        var scene = new THREE.Scene();
        this.scene = scene;
        this.angle = 0;
        this.normalVertexShader = [
            'attribute vec3 prevPoint;',
            'attribute vec3 nextPoint;',
            'void main() {',
            '    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            '}'].join('\n');

        this.normalFragmentShader = [
            'void main() {',
            '    gl_FragData[0] = vec4(1.0 - gl_FragCoord.z, 0.0, 0.0, 1.0);',
            '}'].join('\n');
        this.vertexShader = [
            'attribute vec3 prevPoint;',
            'attribute vec3 nextPoint;',
            'uniform vec2 hPixel;',
            'uniform vec2 hPixelWorld;',
            'varying vec3 AABB_min;',
            'varying vec3 AABB_max;',
            'varying vec3 positionK;',

            'float cross2d(vec2 v1, vec2 v2) {',
            '    return v1.x * v2.y - v1.y * v2.x; ',
            '}',

            // http://http.developer.nvidia.com/GPUGems2/gpugems2_chapter42.html
            'void main() {',
            '    vec3 eyeDirection = vec3(0.0, 0.0, -1.0);',
            '    vec3 p1 = prevPoint, p2 = position, p3 = nextPoint;',
            '    vec2 e1 = normalize(p2.xy - p1.xy);',
            '    vec2 e2 = normalize(p2.xy - p3.xy);',
            // project the side on the bisector
            // http://stackoverflow.com/a/32515402/72637
            '    float halfsine = sqrt((1.0 - dot(e1, e2)) / 2.0);',
            '    vec2 resultPoint2D = p2.xy + length(hPixelWorld) / halfsine * normalize(e1 + e2);',

            // project the 2D point to the triangle plane in 3D
            // grab the triangle normal
            '    vec3 normal = normalize(cross(p2.xyz - p1.xyz, p3.xyz - p2.xyz));',
            // grab the Z for (x=0, y=0)
            '    float d = dot(normal, p2.xyz);',
            // the new Z is the distance from the 2D projected point to its projection on the triangle plane
            '    float t = (dot(normal, vec3(resultPoint2D, 0.0)) - d) / (dot(normal, eyeDirection));',

            //shift the whole triangle up because Z is sampled at pixel center, but the maximum Z is at a corner.
            //A mostly vertical triangle might send the Z very high or very low, we'll clamp that in the fragment shader
            '    float cornerPessimization = sqrt(1.0 - normal.z * normal.z) *  length(hPixelWorld);',
            '    vec4 shiftedPosition = vec4(resultPoint2D, t + cornerPessimization, 1.0);',
            '    vec4 projectedShiftedPosition = projectionMatrix * modelViewMatrix * shiftedPosition;',

            //compute the Axis Aligned bounding box
            '    vec4 prevPos = projectionMatrix * modelViewMatrix * vec4(p1, 1.0);',
            '    vec4 currPos = projectionMatrix * modelViewMatrix * vec4(p2, 1.0);',
            '    vec4 nextPos = projectionMatrix * modelViewMatrix * vec4(p3, 1.0);',
            '    vec3 minBounds = prevPos.xyz;',
            '    minBounds = min(currPos.xyz, minBounds);',
            '    minBounds = min(nextPos.xyz, minBounds);',
            '    vec3 maxBounds = prevPos.xyz;',
            '    maxBounds = max(currPos.xyz, maxBounds);',
            '    maxBounds = max(nextPos.xyz, maxBounds);',
            // extend the box by one pixel
            '    minBounds = minBounds - vec3(hPixel, 0.0);',
            '    maxBounds = maxBounds + vec3(hPixel, 0.0);',

            '    AABB_min = minBounds;',
            '    AABB_max = maxBounds;',
            '    gl_PointSize = 10.0;',
            '    positionK = projectedShiftedPosition.xyz;',
            '    gl_Position = projectedShiftedPosition;',
            '}'].join('\n');

        this.fragmentShader = [
            '#extension GL_EXT_frag_depth : require',
            'varying vec3 AABB_min;',
            'varying vec3 AABB_max;',
            'varying vec3 positionK;',
            // depth encoding : http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/
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
            '    vec2 pos = positionK.xy;',
            //let's destroy the fragments that are really out there between the input corner and the dilated corner
            '    if( pos.x < AABB_min.x || pos.y < AABB_min.y ',
            '            || pos.x > AABB_max.x || pos.y > AABB_max.y)',
            '        discard;',
            // ok, we were pessimistic, but one thing still holds:
            // the true Z value can never ever be higher or lower than any Z value of the input vertices,
            // so we clip to get back to some reality
            '    float z = clamp(positionK.z, AABB_min.z, AABB_max.z);',
            // go back to fragment world
            '    z =  (0.5 * z + 0.5);',
            // update the depth buffer, since what was a nice triangle is now a triangle with 2 bent corners (flattened by the Z clamp).
            '    gl_FragDepthEXT = z;',
            '    gl_FragData[0] = vec4(1.0 - z, 0.0, 0.0, 1.0);',
            '}'].join('\n');
        this.shaderAttributes = {prevPoint: {type: 'v3', value: []}, nextPoint: {type: 'v3', value: []}};
        this.shaderUniforms = {hPixel: {type: 'v2'}, hPixelWorld: {type: 'v2'}};
        this.meshMaterial = new THREE.ShaderMaterial({
            doublesided: true,
            depthTest: true,
            sizeAttenuation: false,
            linewidth: 1,
            uniforms: this.shaderUniforms,
            attributes: this.shaderAttributes,
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
            var triangleCount = attribute.length / attribute.itemSize / 3;

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