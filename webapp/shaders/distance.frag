// expected #define: float pointCount

uniform sampler2D points;
uniform vec2 gridSize;
uniform mat4 projectionMatrix2;
uniform mat4 viewMatrix2;
//we receive the scale either by distanceScale or by the textureScale
//if distanceScale is 0.0 then we go fetch it in the texture
uniform float distanceScale;
uniform sampler2D textureScale;

varying vec2 vUv;

float readScale;

/*INCLUDE_FRAGLIB*/
vec3 FakeEncodeFloatRGB(highp float v) {
    return vec3(v, 0.0, 0.0);
}

float myDist(vec2 p1, vec2 p2) {
    vec2 diff = p1 - p2;
    return dot(diff, diff);
}
vec2 getPoint(int index) {
    vec4 coords = vec4(texture2D(points, vec2((0.5 + float(index)) / float(pointCount), 0.5)).ra, 0.0, 1.0);
    // pass it though the camera matrix
    return vec2(0.5, 0.5) + vec2(0.5, 0.5) * (projectionMatrix2 * viewMatrix2 * coords).xy;
}
//http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
highp float lineDist(vec2 p, vec2 a, vec2 b) {
    highp vec2 pa = p - a, ba = b - a;
    highp float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return myDist(pa, ba * h) / readScale;
}

void main() {
    readScale = distanceScale == 0.0 ? texture2D(textureScale, vec2(0.5, 0.5)).r : distanceScale;
    highp float dist = myDist(getPoint(0),  vUv.xy) / readScale;
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
    if (!inside)
        discard;
    gl_FragColor = vec4(dist, 0.0, 0.0, 1.0);
}