// expected #define: float pointCount
highp float encodingFactor = (exp2(24.0) - 1.0) / exp2(24.0);

uniform sampler2D points;
uniform vec2 gridSize;
uniform mat4 projectionMatrix2;
uniform mat4 viewMatrix2;
uniform float distanceScale;

varying vec2 vUv;

vec3 EncodeFloatRGB(highp float v) {
    vec3 enc = fract(vec3(1.0, 255.0, 255.0 * 255.0) * encodingFactor * v);
    enc -= enc.yzz * vec3(1.0 / 255.0, 1.0 / 255.0, 0.0);
    return enc;
}
vec3 FakeEncodeFloatRGB(highp float v) {
    return vec3(v, 0.0, 0.0);
}
vec2 getPoint(int index) {
    vec4 coords = vec4(texture2D(points, vec2((0.5 + float(index)) / float(pointCount), 0.5)).ra, 0.0, 1.0);
    // pass it though the camera matrix
    return vec2(0.5, 0.5) + vec2(0.5, 0.5) * (projectionMatrix2 * viewMatrix2 * coords).xy;
}
//http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
float lineDist(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return distance(pa, ba * h) / distanceScale;
}

void main() {
    float dist = distance(getPoint(0),  vUv.xy) / distanceScale;
    float intersectionCount = 0.0;
    for (int i = 1; i < pointCount; i++) {
        vec2 prev = getPoint(i - 1);
        vec2 curr = getPoint(i);
        dist = min(dist, lineDist(vUv, prev, curr));

        float xi = curr.x, yi = curr.y;
        float xj = prev.x, yj = prev.y;
        //https://github.com/substack/point-in-polygon/blob/master/index.js
        //http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        if ((yi > vUv.y != yj > vUv.y ) && (vUv.x < (xj - xi) * (vUv.y - yi) / (yj - yi) + xi))
            intersectionCount++;
    }
    bool inside = mod(intersectionCount, 2.0) == 1.0;
    gl_FragColor = inside ? vec4(FakeEncodeFloatRGB(dist), 1.0) : vec4(0.0, 0.0, 0.0, 0.0);
}