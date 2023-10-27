// expected #define: float pointCount
highp float encodingFactor = (exp2(24.0) - 1.0) / exp2(24.0);

uniform sampler2D points;
uniform vec2 gridSize;
uniform mat4 projectionMatrix2;
uniform mat4 viewMatrix2;

varying vec2 vUv;

vec2 getPoint(int index) {
    vec4 coords = vec4(texture2D(points, vec2((0.5 + float(index)) / float(pointCount), 0.5)).ra, 0.0, 1.0);
    // pass it though the camera matrix
    return vec2(0.5, 0.5) + vec2(0.5, 0.5) * (projectionMatrix2 * viewMatrix2 * coords).xy;
}

void main() {
    float intersectionCount = 0.0;
    for (int i = 1; i < pointCount; i++) {
        vec2 prev = getPoint(i - 1);
        vec2 curr = getPoint(i);
        float xi = curr.x, yi = curr.y;
        float xj = prev.x, yj = prev.y;
        //https://github.com/substack/point-in-polygon/blob/master/index.js
        //http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        if ((yi > vUv.y != yj > vUv.y ) && (vUv.x < (xj - xi) * (vUv.y - yi) / (yj - yi) + xi))
            intersectionCount++;
    }
    bool inside = mod(intersectionCount, 2.0) == 1.0;
    if (!inside)
        discard;
    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}