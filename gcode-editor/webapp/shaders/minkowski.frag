uniform sampler2D modelHeight;
uniform sampler2D toolProfile;
uniform vec2 toolToPartRatio;
uniform vec2 terrainRatio;
uniform vec2 terrainTranslation;
uniform float minZ;
varying vec2 vUv;

/*INCLUDE_FRAGLIB*/

highp float readHeight(vec2 pos) {
    highp float model = texture2D(modelHeight, terrainRatio * vUv + terrainTranslation + pos * toolToPartRatio).r;
    highp float displacement = texture2D(toolProfile, vec2(0.5 / float(radialSamples)
        + length(pos) / float(radialSamples) * float(radialSamples - 1), 0.5)).r;
    return 1.0 - model - displacement;
}
void main() {
    highp int radiusSquared = radialSamples * radialSamples;
    highp float sum = readHeight(vec2(0.0, 0.0));
    for (int i = -radialSamples; i <= radialSamples; i++)
       for (int j = -radialSamples; j <= radialSamples; j++)
           if (i * i + j * j <= radiusSquared)
               sum = max(sum, readHeight(vec2(i, j) / float(radialSamples)));
    float z = max(minZ, sum);
#ifdef OUTPUT_FLOATS
    gl_FragColor = vec4(z, 0.0, 0.0, 1.0);
#else
    gl_FragColor = vec4(EncodeFloatRGB(z), 1.0);
#endif
}