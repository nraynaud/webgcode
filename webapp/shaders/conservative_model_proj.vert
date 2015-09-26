attribute vec3 prevPoint;
attribute vec3 nextPoint;
uniform vec2 hPixel;
uniform vec2 hPixelWorld;
varying vec3 AABB_min;
varying vec3 AABB_max;
varying vec3 positionK;

float cross2d(vec2 v1, vec2 v2) {
    return v1.x * v2.y - v1.y * v2.x;
}

// http://http.developer.nvidia.com/GPUGems2/gpugems2_chapter42.html
void main() {
    vec3 eyeDirection = vec3(0.0, 0.0, -1.0);
    vec3 p1 = prevPoint, p2 = position, p3 = nextPoint;
    vec2 e1 = normalize(p2.xy - p1.xy);
    vec2 e2 = normalize(p2.xy - p3.xy);
// project the side on the bisector
// http://stackoverflow.com/a/32515402/72637
    float halfsine = sqrt((1.0 - dot(e1, e2)) / 2.0);
    vec2 resultPoint2D = p2.xy + length(hPixelWorld) / halfsine * normalize(e1 + e2);

// project the 2D point to the triangle plane in 3D
// grab the triangle normal
    vec3 normal = normalize(cross(p2.xyz - p1.xyz, p3.xyz - p2.xyz));
// grab the Z for (x=0, y=0)
    float d = dot(normal, p2.xyz);
// the new Z is the distance from the 2D projected point to its projection on the triangle plane
    float t = (dot(normal, vec3(resultPoint2D, 0.0)) - d) / (dot(normal, eyeDirection));

//I suspect the normalize() function is a bit off and sometimes give a number slightly bigger than 1, and sqrt() is unhappy
    float normalZSquared = clamp(normal.z * normal.z, 0.0,  1.0);
//shift the whole triangle up because Z is sampled at pixel center, but the maximum Z is at a corner.
//A mostly vertical triangle might send the Z very high or very low, well clamp that in the fragment shader
    float cornerPessimization = sqrt(1.0 - normalZSquared) * length(hPixelWorld);
    vec4 shiftedPosition = vec4(resultPoint2D, t + cornerPessimization, 1.0);
    vec4 projectedShiftedPosition = projectionMatrix * modelViewMatrix * shiftedPosition;

//compute the Axis Aligned bounding box
    vec4 prevPos = projectionMatrix * modelViewMatrix * vec4(p1, 1.0);
    vec4 currPos = projectionMatrix * modelViewMatrix * vec4(p2, 1.0);
    vec4 nextPos = projectionMatrix * modelViewMatrix * vec4(p3, 1.0);
    vec3 minBounds = prevPos.xyz;
    minBounds = min(currPos.xyz, minBounds);
    minBounds = min(nextPos.xyz, minBounds);
    vec3 maxBounds = prevPos.xyz;
    maxBounds = max(currPos.xyz, maxBounds);
    maxBounds = max(nextPos.xyz, maxBounds);
// extend the box by one pixel
    minBounds = minBounds - vec3(hPixel, 0.0);
    maxBounds = maxBounds + vec3(hPixel, 0.0);

    AABB_min = minBounds;
    AABB_max = maxBounds;
    gl_PointSize = 10.0;
    positionK = projectedShiftedPosition.xyz;
    gl_Position = projectedShiftedPosition;
}