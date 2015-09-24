highp float encodingFactor = (exp2(24.0) - 1.0) / exp2(24.0);

uniform sampler2D modelHeight;
uniform vec2 gridSize;
varying vec2 vUv;

highp float DecodeFloatRGB(vec3 rgb) {
    return dot(rgb, vec3(1.0, 1.0 / 255.0, 1.0 / 255.0 / 255.0)) / encodingFactor;
}
highp float FakeDecodeFloatRGB(vec3 rgb) {
    return rgb.r;
}
float readValue(float dx,float dy) {
    return FakeDecodeFloatRGB(texture2D(modelHeight, vUv +  vec2(dx, dy) / gridSize).rgb);
}

void main() {
    vec2 clr = vec2(readValue(-1.0, +0.0), readValue(+1.0, +0.0));
    vec2 ctb =  vec2(readValue(+0.0, -1.0), readValue(+0.0, +1.0));

    vec2 diag1 = vec2(readValue(-1.0, -1.0), readValue(+1.0, +1.0));
    vec2 diag2 = vec2(readValue(+1.0, -1.0), readValue(-1.0, +1.0));

    float height = readValue(0.0, 0.0);
    float red = 0.0;
    vec2 h2 = vec2(height, height);
    bool aligned = all(greaterThan(h2, clr)) || all(greaterThan(h2, ctb));
    bool diagonal = all(greaterThan(h2, diag1)) || all(greaterThan(h2, diag2));
    bool isFlat = all(equal(vec4(h2, h2), vec4(clr, ctb)));
    if (aligned
        || diagonal
        || isFlat)
        red = 1.0;
    else
        discard;

    gl_FragColor = vec4(red * height * 2.0, 0.5 * red * (1.0 - height), red * (1.0 - height) ,1.0);
}