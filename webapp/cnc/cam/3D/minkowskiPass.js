"use strict";
define(['libs/threejs/postprocessing/ShaderPass', 'text!shaders/minkowski.vert', 'text!shaders/minkowski.frag'], function (ShaderPass, minkowskiVert, minkowskiFrag) {
    var Pass = function () {
        this.minkowskiPass = new ShaderPass({
            uniforms: {
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
        }, 'modelHeight');
    };
    Pass.prototype = {
        setParams: function (toolProfile, toolToPartRatio, minZ, outputFloats) {
            var pixelsOnRadius = toolProfile.length;
            var uniforms = this.minkowskiPass.material.uniforms;
            uniforms.toolProfile.value = new THREE.DataTexture(new Float32Array(toolProfile), pixelsOnRadius, 1,
                THREE.LuminanceFormat, THREE.FloatType, THREE.Texture.DEFAULT_MAPPING, THREE.ClampToEdgeWrapping,
                THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter);
            uniforms.toolProfile.value.generateMipmaps = false;
            uniforms.toolProfile.value.needsUpdate = true;
            uniforms.toolToPartRatio.value = toolToPartRatio;
            uniforms.minZ.value = minZ != null ? minZ : -Infinity;
            this.minkowskiPass.material.defines.radialSamples = pixelsOnRadius;
            if (outputFloats)
                this.minkowskiPass.material.defines.OUTPUT_FLOATS = true;
            this.minkowskiPass.material.needsUpdate = true;
        },
        render: function (renderer, outputBuffer, modelHeightBuffer, terrainRatio, terrainTranslation) {
            var uniforms = this.minkowskiPass.material.uniforms;
            uniforms.terrainRatio.value = terrainRatio;
            uniforms.terrainTranslation.value = terrainTranslation;
            this.minkowskiPass.render(renderer, outputBuffer, modelHeightBuffer);
        }
    };
    return Pass;
});