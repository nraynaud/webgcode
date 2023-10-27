uniform sampler2D modelHeight;
uniform vec2 gridSize;
varying vec2 vUv;

float readValue(float dx,float dy) {
    return texture2D(modelHeight, vUv +  vec2(dx, dy) / gridSize).r;
}

void main() {
    vec2 clr = vec2(readValue(-1.0, +0.0), readValue(+1.0, +0.0));
    vec2 ctb =  vec2(readValue(+0.0, -1.0), readValue(+0.0, +1.0));

    vec2 diag1 = vec2(readValue(-1.0, -1.0), readValue(+1.0, +1.0));
    vec2 diag2 = vec2(readValue(+1.0, -1.0), readValue(-1.0, +1.0));

    float height = readValue(0.0, 0.0);
    float ridge = 0.0;
    vec2 h2 = vec2(height, height);
    bool aligned = all(greaterThan(h2, clr)) || all(greaterThan(h2, ctb));
    bool diagonal = all(greaterThan(h2, diag1)) || all(greaterThan(h2, diag2));
    bool isFlat = all(equal(vec4(h2, h2), vec4(clr, ctb)));
    if (aligned || diagonal || isFlat)
        ridge = 1.0;
    else
        discard;
    vec2 diff2 = min(min(clr, ctb), min(diag1, diag2));
    float diff = height - min(diff2.x, diff2.y);

    gl_FragColor = vec4(height, 0.0, 0.0, 1.0);
}