// expected #define: int gridX, gridY
const vec2 gridSize = vec2(gridX, gridY);

uniform sampler2D modelHeight;
varying vec2 vUv;

highp float myDist(vec2 p1, vec2 p2) {
    highp vec2 diff = p1 - p2;
    return dot(diff, diff);
}

void main() {
    for(int i = 0; i < gridX; i++)
        for(int j = 0; j < gridY; j++) {
            highp vec2 pos = vec2(float(i) + 0.5, float(j) + 0.5) / gridSize;
            highp float sqRadius = texture2D(modelHeight, pos).r;
            highp float sqDist = myDist(pos, vUv);
            if (sqDist <= sqRadius && sqRadius != 0.0) {
                gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
                return;
            }
        }
    discard;
}