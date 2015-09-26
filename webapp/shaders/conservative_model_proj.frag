#extension GL_EXT_frag_depth : require
varying vec3 AABB_min;
varying vec3 AABB_max;
varying vec3 positionK;
// depth encoding : http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/
highp float factor = (exp2(24.0) - 1.0) / exp2(24.0);
vec3 EncodeFloatRGB(highp float v) {
   vec3 enc = fract(vec3(1.0, 255.0, 255.0 * 255.0) * factor * v);
   enc -= enc.yzz * vec3(1.0 / 255.0, 1.0 / 255.0, 0.0);
   return enc;
}
highp float DecodeFloatRGB(vec3 rgb) {
   return dot(rgb, vec3(1.0, 1.0 / 255.0, 1.0 / 255.0 / 255.0)) / factor;
}
void main() {
    vec2 pos = positionK.xy;
//lets destroy the fragments that are really out there between the input corner and the dilated corner
    if(any(bvec4(lessThan(pos, AABB_min.xy), greaterThan(pos, AABB_max.xy))))
        discard;
// ok, we were pessimistic, but one thing still holds:
// the true Z value can never ever be higher or lower than any Z value of the input vertices,
// so we clip to get back to some reality
    float z = clamp(positionK.z, AABB_min.z, AABB_max.z);
// go back to fragment world
    z =  (0.5 * z + 0.5);
// update the depth buffer, since what was a nice triangle is now a triangle with 2 bent corners (flattened by the Z clamp).
    gl_FragDepthEXT = z;
    gl_FragData[0] = vec4(1.0 - z, 0.0, 0.0, 1.0);
}