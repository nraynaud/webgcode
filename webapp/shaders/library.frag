// depth encoding : http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/
highp float lib_encoding_factor = (exp2(24.0) - 1.0) / exp2(24.0);
vec3 EncodeFloatRGB(highp float v) {
    vec3 enc = fract(vec3(1.0, 255.0, 255.0 * 255.0) * lib_encoding_factor * v);
    enc -= enc.yzz * vec3(1.0 / 255.0, 1.0 / 255.0, 0.0);
    return enc;
}
highp float DecodeFloatRGB(vec3 rgb) {
    return dot(rgb, vec3(1.0, 1.0 / 255.0, 1.0 / 255.0 / 255.0)) / lib_encoding_factor;
}
