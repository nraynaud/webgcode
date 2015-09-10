"use strict";
define([], function () {

    function Projector() {
        var scene = new THREE.Scene();
        this.scene = scene;
        this.angle = 0;

        this.vertexShader = [
            'attribute vec3 prevPoint;',
            'attribute vec3 nextPoint;',
            'uniform vec2 hPixel;',
            'uniform vec2 hPixelWorld;',
            'varying vec3 AABB_min;',
            'varying vec3 AABB_max;',
            'varying vec4 pPlane;',
            'varying vec2 delta;',

            'float cross2d(vec2 v1, vec2 v2) {',
            '    return v1.x * v2.y - v1.y * v2.x; ',
            '}',
            // https://www.opengl.org/sdk/docs/man/html/gl_FrontFacing.xhtml
            'bool isFrontFacing(vec2 p1, vec2 p2, vec2 p3) {',
            '    float a = cross2d(p2-p1, p2-p3);',
            '    return a > 0.0;',
            '}',

            // we are encoding the distance to point in z
            'vec3 translatePoint(vec2 point, vec2 dir1, vec2 dir2, vec2 e1, vec2 e2, vec2 centroid) {',
            '    vec2 e1TranslatedPoint = point + dir1;',
            '    vec2 e2TranslatedPoint = point + dir2;',
            //http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
            '    float u = cross2d(e2TranslatedPoint - e1TranslatedPoint, e2) / cross2d(e2, e1);',
            '    vec2 result = e1TranslatedPoint + u * e1;',
            '    float dist = length(result - centroid);',
            '    return vec3(result, dist);',
            '}',


            // http://http.developer.nvidia.com/GPUGems2/gpugems2_chapter42.html
            // https://github.com/Christoopher/VCT/blob/master/src/Shaders/buildFragList.geom
            'void main() {',
            '    vec3 eyeDirection = vec3(0.0, 0.0, -1.0);',
            '    vec3 p1 = prevPoint, p2 = position, p3 = nextPoint;',
            '    if (!isFrontFacing(p1.xy, p2.xy, p3.xy)) {vec3 temp = p1;p1 = p3; p3 = temp;}',
            //move the vertex in 2D
            '    vec2 e1 = p2.xy - p1.xy;',
            '    vec2 e1Normal = normalize(vec2(e1.y, -e1.x));',
            //'    vec2 e1Translate = sign(e1Normal) * hPixelWorld;',
            '    vec2 e1Translate = e1Normal * length(hPixelWorld);',

            '    vec2 e2 = p3.xy - p2.xy;',
            '    vec2 e2Normal = normalize(vec2(e2.y, -e2.x));',
            //'    vec2 e2Translate = sign(e2Normal) * hPixelWorld;',
            '    vec2 e2Translate = e2Normal * length(hPixelWorld);',

            '    vec3 possibilities[4];',
            '    vec2 centroid = ((p1+p2+p3)/3.0).xy;',
            '    possibilities[0] = translatePoint(p2.xy, +e1Translate, +e2Translate, e1, e2, centroid);',
            '    possibilities[1] = translatePoint(p2.xy, -e1Translate, +e2Translate, e1, e2, centroid);',
            '    possibilities[2] = translatePoint(p2.xy, -e1Translate, -e2Translate, e1, e2, centroid);',
            '    possibilities[3] = translatePoint(p2.xy, +e1Translate, -e2Translate, e1, e2, centroid);',
            '    vec3 currentBest = possibilities[0];',
            '    if (possibilities[1].z >= currentBest.z)',
            '        currentBest = possibilities[1];',
            '    if (possibilities[2].z >= currentBest.z)',
            '        currentBest = possibilities[2];',
            '    if (possibilities[3].z >= currentBest.z)',
            '        currentBest = possibilities[3];',

            '    vec2 resultPoint2D = currentBest.xy;',

            //project the 2D point to the triangle plane in 3D
            //grab the normal
            '    vec3 normal = normalize(cross(p2.xyz - p1.xyz, p3.xyz - p2.xyz));',
            // grab the Z for (x=0, y=0)
            '    float d = dot(normal, p2.xyz);',
            //project the moved point
            '    float t = (dot(normal, vec3(resultPoint2D, 0.0)) - d) / (dot(normal, eyeDirection));',

            //shift the whole triangle up because Z is sampled at pixel center, but the worst Z is at a corner.
            //A vertical triangle might send the Z very high or very low, we'll handle that in the fragment shader
            //'    float cornerPessimization = sqrt(1.0 - normal.z * normal.z) *  length(hPixelWorld);',
            '    float cornerPessimization = 0.0;',
            '    vec4 shiftedPosition = vec4(resultPoint2D, t + cornerPessimization, 1.0);',
            '    vec4 projectedShiftedPosition = projectionMatrix * modelViewMatrix * shiftedPosition;',
            //'    vec4 projectedShiftedPosition = projectionMatrix * modelViewMatrix * vec4(p2, 1.0);',

            '    vec2 conservationMargin = hPixel;',
            '    vec4 prevPos = projectionMatrix * modelViewMatrix * vec4(p1, 1.0);',
            '    vec4 currentPos = projectionMatrix * modelViewMatrix * vec4(p2, 1.0);',
            '    vec4 nextPos = projectionMatrix * modelViewMatrix * vec4(p3, 1.0);',

            '    vec3 minBounds = prevPos.xyz;',
            '    minBounds = min(currentPos.xyz, minBounds);',
            '    minBounds = min(nextPos.xyz, minBounds);',
            '    vec3 maxBounds = prevPos.xyz;',
            '    maxBounds = max(currentPos.xyz, maxBounds);',
            '    maxBounds = max(nextPos.xyz, maxBounds);',
            '    AABB_min = minBounds - vec3(conservationMargin, 0.0);',
            '    AABB_max = maxBounds + vec3(conservationMargin, 0.0);',
            // we have to fiddle a bit, for some unclear reasons, the fragment shader is in non-normalized pixel space
            '    AABB_min.xy = (AABB_min.xy + 1.0) / 2.0 / hPixel;',
            '    AABB_max.xy = (AABB_max.xy + 1.0) / 2.0 / hPixel;',

            '    gl_PointSize = 10.0;',
            //'    gl_Position = finalPos;',
            '    gl_Position = projectedShiftedPosition;',
            '}'].join('\n');

        this.fragmentShader = [
            '#extension GL_OES_standard_derivatives : enable ',
            'varying vec3 AABB_min;',
            'varying vec3 AABB_max;',
            'varying vec4 pPlane;',
            'varying vec2 delta;',
            'uniform vec2 hPixel;',
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
            '    vec2 pos = gl_FragCoord.xy / gl_FragCoord.w;',
            '    float worstZ = gl_FragCoord.z;',

            //let's destroy the fragments that are really out there between the input corner and the dilated corner
            //'    if( pos.x < AABB_min.x || pos.y < AABB_min.y ',
            //'            || pos.x > AABB_max.x || pos.y > AABB_max.y)',
            //'        discard;',

            // ok, we were pessimistic and stuff, but one thing holds true:
            // the Z value can never ever be higher than any Z value of the input vertices,
            // so we clip now to get back to some reality
            //'    worstZ = min(worstZ, AABB_max.z);',
            //'    worstZ = max(worstZ, AABB_min.z);',
            '    ',
            '    gl_FragData[0] = vec4(EncodeFloatRGB(1.0 - worstZ), 1.0);',
            '}'].join('\n');
        this.shaderAttributes = {prevPoint: {type: 'v3', value: null}, nextPoint: {type: 'v3', value: null}};
        this.shaderUniforms = {hPixel: {type: 'v2'}, hPixelWorld: {type: 'v2'}};
        this.meshMaterial = new THREE.ShaderMaterial({
            depthTest: true,
            sizeAttenuation: false,
            linewidth: 1,
            uniforms: this.shaderUniforms,
            attributes: this.shaderAttributes,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader
        });
        this.displaySide = 1024;
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1);
        scene.add(this.camera);
        this.modelBuffer = new THREE.WebGLRenderTarget(this.displaySide, this.displaySide,
            {minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType});
    }

    Projector.prototype = {
        render: function (renderer, buffer) {
            this.meshMaterial.uniforms.hPixel.value = new THREE.Vector2(1 / buffer.width, 1 / buffer.height);
            var w = (this.camera.right - this.camera.left) / buffer.width;
            var h = (this.camera.top - this.camera.bottom) / buffer.height;
            console.log('up', this.camera.up);
            this.meshMaterial.uniforms.hPixelWorld.value = new THREE.Vector2(w * 2, h * 2);
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
            console.log(bbox);
            var bboxSize = bbox.size();
            this.aspectRatio = bboxSize.x / bboxSize.y;
            this.displaySideMm = (bboxSize.x > bboxSize.y ? bboxSize.x : bboxSize.y) * 1.1;
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