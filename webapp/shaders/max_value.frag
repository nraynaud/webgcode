// expected #define: int gridX, gridY
highp float encodingFactor = (exp2(24.0) - 1.0) / exp2(24.0);
const vec2 gridSize = vec2(gridX, gridY);

uniform sampler2D modelHeight;

highp float DecodeFloatRGB(vec3 rgb) {
    return dot(rgb, vec3(1.0, 1.0 / 255.0, 1.0 / 255.0 / 255.0)) / encodingFactor;
}

highp vec3 EncodeFloatRGB(highp float v) {
    highp vec3 enc = fract(vec3(1.0, 255.0, 255.0 * 255.0) * encodingFactor * v);
    enc -= enc.yzz * vec3(1.0 / 255.0, 1.0 / 255.0, 0.0);
    return enc;
}

vec3 FakeEncodeFloatRGB(highp float v) {
    return vec3(v, 0.0, 0.0);
}

highp float FakeDecodeFloatRGB(vec3 rgb) {
    return rgb.r;
}

float readValue(int dx,int dy) {
    return FakeDecodeFloatRGB(texture2D(modelHeight, vec2(float(dx), float(dy)) / gridSize).rgb);
}

void main() {
    float maxValue = readValue(0, 0);
    for(int i = 0; i < gridX; i++)
        for(int j = 0; j < gridY; j++)
            maxValue = max(maxValue, readValue(i, j));
    gl_FragColor = vec4(FakeEncodeFloatRGB(maxValue), 1.0);
}