// expected #define: int gridX, gridY
const vec2 gridSize = vec2(gridX, gridY);

uniform sampler2D modelHeight;

varying vec2 vUv;

float readValue(int dx,int dy) {
    return texture2D(modelHeight, vUv +  vec2(float(dx), float(dy)) / gridSize).r;
}

float median(vec3 v) {
    if (v.x > v.y)
        v.yx = v.xy;
    if (v.y > v.z)
        v.zy = v.yz;
    if (v.x > v.y)
        v.yx = v.xy;
    return v.y;
}

void main() {
    float top    = median(vec3(readValue(-1, 1), readValue(0, 1), readValue(1, 1)));
    float middle = median(vec3(readValue(-1, 0), readValue(0, 0), readValue(1, 0)));
    float bottom = median(vec3(readValue(-1, -1), readValue(0, -1), readValue(1, -1)));
    float result = median(vec3(top, middle, bottom));
    gl_FragColor =  vec4(result, 0.0, 0.0, 1.0);
}