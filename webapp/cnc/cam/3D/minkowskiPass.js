"use strict";
define(['libs/threejs/postprocessing/ShaderPass'], function (ShaderPass) {
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
                'uniform vec2 toolToPartRatio;',
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
                '   highp float displacement = texture2D(toolProfile, vec2(0.5 / float(radialSamples)'
                + ' + length(pos) / float(radialSamples) * float(radialSamples - 1), 0.5)).r;',
                '   return 1.0 - color.r - displacement;',
                '}',
                'void main() {',
                '   highp int radiusSquared = radialSamples * radialSamples;',
                '   highp float sum = readHeight(vec2(0.0, 0.0));',
                '   for (int i = -radialSamples; i <= radialSamples; i++)',
                '       for (int j = -radialSamples; j <= radialSamples; j++)',
                '           if (i * i + j * j <= radiusSquared)',
                '               sum = max(sum, readHeight(vec2(i, j) / float(radialSamples)));',
                '   float z = max(minZ, sum);',
                '#ifdef OUTPUT_FLOATS ',
                '   gl_FragColor = vec4(z, 0.0, 0.0, 1.0);',
                '#else',
                '   gl_FragColor = vec4(EncodeFloatRGB(z), 1.0);',
                '#endif',
                '}'].join('\n')
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