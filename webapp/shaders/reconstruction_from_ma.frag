// expected #define: int gridX, gridY
const vec2 gridSize = vec2(gridX, gridY);

uniform sampler2D modelHeight;
varying vec2 vUv;

 float myDist(vec2 p1, vec2 p2) {
    vec2 diff = p1 - p2;
    return dot(diff, diff);
}

void main() {
    for(int i = 0; i < gridX; i++)
        for(int j = 0; j < gridY; j++) {
            vec2 pos = vec2(float(i) + 0.5, float(j) + 0.5) / gridSize;
            float sqRadius = texture2D(modelHeight, pos).r;
            float radius = sqrt(sqRadius);
            radius -= 0.05;
            if(radius <= 0.0)
                continue;
            radius = max(radius, 0.02);
            sqRadius = radius * radius;
            float sqDist = myDist(pos, vUv);
            if (sqDist <= sqRadius && sqRadius > 0.0) {
                gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
                return;
            }
        }
    discard;
}