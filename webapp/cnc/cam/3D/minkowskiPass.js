"use strict";
define(['libs/threejs/postprocessing/ShaderPass'], function (ShaderPass) {
    var Pass = function () {
        var toolTexture = new THREE.DataTexture(new Float32Array(1), 1, 1, THREE.LuminanceFormat, THREE.FloatType);
        this.minkowskiPass = new ShaderPass({
            uniforms: {
                modelHeight: {type: 't'},
                toolProfile: {type: 't', value: toolTexture},
                toolToPartRatio: {type: 'f', value: null},
                terrainRatio: {type: 'v2', value: null},
                terrainTranslation: {type: 'v2', value: null},
                minZ: {type: 'f', value: -Infinity}
            },
            defines: {
                radialSamples: null
            },
            vertexShader: [
                'varying vec2 vUv;',
                'void main() {',
                '   vUv = uv;',
                '   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform sampler2D modelHeight;',
                'uniform sampler2D toolProfile;',
                'uniform float toolToPartRatio;',
                'uniform vec2 terrainRatio;',
                'uniform vec2 terrainTranslation;',
                'uniform float minZ;',
                'varying vec2 vUv;',
                'highp float factor = (exp2(24.0) - 1.0) / exp2(24.0);',
                'vec3 EncodeFloatRGB(highp float v) {',
                '   vec3 enc = fract(vec3(1.0, 255.0, 255.0 * 255.0) * factor * v);',
                '   enc -= enc.yzz * vec3(1.0 / 255.0, 1.0 / 255.0, 0.0);',
                '   return enc;',
                '}',
                'highp float DecodeFloatRGB(vec3 rgb) {',
                '   return dot(rgb, vec3(1.0, 1.0 / 255.0, 1.0 / 255.0 / 255.0)) / factor;',
                '}',
                'highp float readHeight(vec2 pos) {',
                '   highp vec4 color = texture2D(modelHeight, terrainRatio * vUv + terrainTranslation + pos * toolToPartRatio);',
                '   highp float displacement = texture2D(toolProfile, vec2(0.5 / float(radialSamples) + length(pos) / float(radialSamples) * float(radialSamples - 1), 0.5)).r;',
                '   return DecodeFloatRGB(color.rgb) - displacement;',
                '}',
                'void main() {',
                '   highp int radiusSquared = radialSamples * radialSamples;',
                '   highp float sum = readHeight(vec2(0.0, 0.0));',
                '   for (int i = -radialSamples; i <= radialSamples; i++)',
                '       for (int j = -radialSamples; j <= radialSamples; j++)',
                '           if (i * i + j * j <= radiusSquared)',
                '               sum = max(sum, readHeight(vec2(i, j) / float(radialSamples)));',
                '   gl_FragColor = vec4(EncodeFloatRGB(max(minZ, sum)), 1.0);',
                '}'].join('\n')
        }, 'modelHeight');
    };
    Pass.prototype = {
        setParams: function (toolProfile, toolToPartRatio) {
            var pixelsOnRadius = toolProfile.length;
            var uniforms = this.minkowskiPass.material.uniforms;
            uniforms.toolProfile.value.image.data = new Float32Array(toolProfile);
            uniforms.toolProfile.value.image.width = pixelsOnRadius;
            uniforms.toolProfile.value.needsUpdate = true;
            uniforms.toolToPartRatio.value = toolToPartRatio;
            this.minkowskiPass.material.defines.radialSamples = pixelsOnRadius;
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