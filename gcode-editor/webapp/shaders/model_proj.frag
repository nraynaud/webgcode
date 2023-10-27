void main() {
    gl_FragData[0] = vec4(1.0 - gl_FragCoord.z, 0.0, 0.0, 1.0);
}