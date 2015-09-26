attribute vec3 prevPoint;
attribute vec3 nextPoint;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}