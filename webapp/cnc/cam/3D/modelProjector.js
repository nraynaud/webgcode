"use strict";
define([], function () {

    function Projector() {
        var scene = new THREE.Scene();
        this.scene = scene;

        var fragmentShader = [
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
            '   gl_FragData[0] = vec4(EncodeFloatRGB(1.0 - gl_FragCoord.z), 1.0);',
            '}'].join('\n');
        this.meshMaterial = new THREE.ShaderMaterial({
            depthTest: true,
            sizeAttenuation: false,
            linewidth: 1,
            uniforms: {pixelDiagonal: {type: 'f'}},
            vertexShader: [
                'uniform float pixelDiagonal;',
                'void main() {',
                '   vec3 pos = position;',
                '   float zError = sqrt(1.0 - normal.z * normal.z) * pixelDiagonal;',
                '   pos.z = pos.z + zError;',
                '   gl_PointSize = 1.0;',
                '   gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);',
                '}'].join('\n'),
            // depth encoding : http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/
            fragmentShader: fragmentShader
        });
        this.linePointMaterial = new THREE.ShaderMaterial({
            depthTest: true,
            sizeAttenuation: false,
            linewidth: 1,
            vertexShader: [
                'void main() {',
                '   gl_PointSize = 1.0;',
                '   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                '}'].join('\n'),
            // depth encoding : http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/
            fragmentShader: fragmentShader
        });
        this.displaySide = 1024;
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1);
        scene.add(this.camera);
        this.modelBuffer = new THREE.WebGLRenderTarget(this.displaySide, this.displaySide,
            {minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType});
    }

    Projector.prototype = {
        render: function (renderer, buffer) {
            var w = (this.camera.right - this.camera.left) / buffer.width;
            var h = (this.camera.top - this.camera.bottom) / buffer.height;
            this.meshMaterial.uniforms.pixelDiagonal.value = Math.sqrt(w * w + h * h) / 2;
            renderer.render(this.scene, this.camera, buffer, true);
        },
        setGeometry: function (meshGeometry) {
            if (this.model) {
                this.scene.remove(this.model);
                this.model = null;
            }
            this.model = new THREE.Object3D();

            // we add the vertices to force webgl to raster on at least 1 pixel
            // in case a "mountain" is spiky enough to slip thought the sampling grid.
            var pointsGeom = new THREE.BufferGeometry();
            pointsGeom.addAttribute('position', meshGeometry.attributes.position.clone());

            // we should add all the edges too because a whole "ridge" might be sharp enough to slip through
            // the raster grid
            // I have a problem where the end of some lines "poke" slightly through the surface I don't know why.
            // question here: http://stackoverflow.com/questions/27097236/strange-artefacts-in-depth-buffer-with-lines
            // by orienting the lines towards -z, I don't get the poky things
            var positions = meshGeometry.attributes.position.array;
            var lines = [];
            var vertical = new THREE.Vector3(0, 0, 1);

            function push(x1, y1, z1, x2, y2, z2) {
                var v = new THREE.Vector3(x2 - x1, y2 - y1, z2 - z1);
                if (v.dot(vertical) / v.length() / vertical.length() > 0)
                    lines.push(x1, y1, z1, x2, y2, z2);
                else
                    lines.push(x2, y2, z2, x1, y1, z1);
            }

            for (var i = 0; i < positions.length; i += 9) {
                var x1 = positions[i];
                var y1 = positions[i + 1];
                var z1 = positions[i + 2];

                var x2 = positions[i + 3];
                var y2 = positions[i + 4];
                var z2 = positions[i + 5];

                var x3 = positions[i + 6];
                var y3 = positions[i + 7];
                var z3 = positions[i + 8];

                push(x1, y1, z1, x2, y2, z2);
                push(x2, y2, z2, x3, y3, z3);
                push(x3, y3, z3, x1, y1, z1);
            }

            var linesGeometry = new THREE.BufferGeometry();
            linesGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(lines), 3));
            this.model.add(new THREE.Line(linesGeometry, this.linePointMaterial, THREE.LinePieces));
            this.model.add(new THREE.PointCloud(pointsGeom, new THREE.ShaderMaterial(this.linePointMaterial)));
            var mesh = new THREE.Mesh(meshGeometry, this.meshMaterial);
            this.model.add(mesh);
            mesh.geometry.computeBoundingBox();
            this.modelBbox = mesh.geometry.boundingBox;
            this.scene.add(this.model);
            this.model.updateMatrixWorld();
            this.resetCamera();
        },
        resetCamera: function () {
            var bbox = this.modelBbox;
            var bboxSize = bbox.size();
            var modelRatio = bboxSize.y / bboxSize.x;
            console.log('modelRatio', modelRatio);
            this.aspectRatio = bboxSize.x / bboxSize.y;
            this.displaySideMm = (bboxSize.x > bboxSize.y ? bboxSize.x : bboxSize.y) * 1.1;
            this.camera.lookAt(new THREE.Vector3(0, 0, bbox.min.z));
            this.camera.near = 1;
            this.camera.position.set(0, 0, bbox.max.z + 10 + this.camera.near);
            this.camera.far = this.camera.position.z - bbox.min.z;
            this.zRatio = 1 / (this.camera.far - this.camera.near);
            console.log('near, far', this.camera.near, this.camera.far, this.zRatio);
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
        }
    };

    return Projector;
});