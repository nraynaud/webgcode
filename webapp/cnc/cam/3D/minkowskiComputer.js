"use strict";
define(['THREE', 'shader!spatial_vUv.vert', 'shader!minkowski.frag'], function (THREE, minkowskiVert, minkowskiFrag) {
    function MinkowskiComputer(minXMM, maxXMM, minYMM, maxYMM) {
        if (this == null)
            throw "this is a constructor, you forgot 'new'";
        var geometry = new THREE.PlaneBufferGeometry(maxXMM - minXMM, maxYMM - minYMM);
        geometry.translate((minXMM + maxXMM) / 2, (minYMM + maxYMM) / 2, 0);
        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            depthTest: true,
            linewidth: 10,
            uniforms: {
                aabb: {type: 'v4', value: null},
                modelHeight: {type: 't'},
                toolProfile: {type: 't', value: null},
                toolToPartRatio: {type: 'v2', value: null},
                terrainRatio: {type: 'v2', value: null},
                terrainTranslation: {type: 'v2', value: null},
                minZ: {type: 'f', value: -Infinity}
            },
            defines: {
                radialSamples: null
            },
            vertexShader: minkowskiVert,
            fragmentShader: minkowskiFrag
        });
        this.object = new THREE.Mesh(geometry, this.material);
        this.camera = new THREE.OrthographicCamera(minXMM, maxXMM, maxYMM, minYMM, 0, 2);
        this.scene = new THREE.Scene();
        this.scene.add(this.object);
        this.scene.add(this.camera);
    }

    MinkowskiComputer.prototype = {
        setParams: function (toolProfile, toolToPartRatio, minZ, outputFloats, terrainRatio, terrainTranslation, modelHeightBuffer) {
            var pixelsOnRadius = toolProfile.length;
            var uniforms = this.material.uniforms;
            uniforms.toolProfile.value = new THREE.DataTexture(new Float32Array(toolProfile), pixelsOnRadius, 1,
                THREE.LuminanceFormat, THREE.FloatType, THREE.Texture.DEFAULT_MAPPING, THREE.ClampToEdgeWrapping,
                THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter);
            uniforms.toolProfile.value.generateMipmaps = false;
            uniforms.toolProfile.value.needsUpdate = true;
            uniforms.toolToPartRatio.value = toolToPartRatio;
            uniforms.minZ.value = minZ != null ? minZ : -Infinity;
            uniforms.terrainRatio.value = terrainRatio;
            uniforms.terrainTranslation.value = terrainTranslation;
            uniforms.modelHeight.value = modelHeightBuffer;
            this.material.defines.radialSamples = pixelsOnRadius;
            if (outputFloats)
                this.material.defines.OUTPUT_FLOATS = true;
            this.material.needsUpdate = true;
        },
        setCamera: function (left, right, bottom, top) {
            this.camera.up.set(0, 1, 0);
            this.camera.lookAt(this.camera.position.clone().sub(new THREE.Vector3(0, 0, 1)));
            this.camera.bottom = bottom;
            this.camera.top = top;
            this.camera.left = left;
            this.camera.right = right;
            this.camera.updateProjectionMatrix();
            this.camera.updateMatrixWorld();
            var uniforms = this.material.uniforms;
            uniforms.aabb.value = new THREE.Vector4(this.camera.left, this.camera.bottom, this.camera.right, this.camera.top);
            uniforms.aabb.value.needsUpdate = true;
        },
        render: function (renderer, outputBuffer) {
            renderer.render(this.scene, this.camera, outputBuffer, true);
        }
    };
    return MinkowskiComputer;
});