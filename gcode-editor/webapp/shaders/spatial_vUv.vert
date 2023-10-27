//will map the vUv so that 0,0 is the min of the bounding box and 1,1 is the max
//expects the axis aligned XY bounding box min in xy, max in zw

uniform vec4 aabb;
varying vec2 vUv;
void main() {
    vUv = (position.xy - aabb.xy) / (aabb.zw - aabb.xy);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}