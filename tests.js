"use strict";
test("G0 evaluation", function () {
    var code = 'G0 X10';
    var result = evaluate(code);
    equal(result.length, 1, '"' + code + '" code length');
    deepEqual(result[0], {
        feedRate: 3000,
        from: {x: 0, y: 0, z: 0},
        to: {x: 10, y: 0, z: 0},
        type: "line"}, '"' + code + '" second component check');
});
test("G2 evaluation", function () {
    var code = 'G2 X10 Y0 Z0 I5 J0 F200';
    var result = evaluate(code);
    equal(result.length, 1, '"' + code + '" code length');
    deepEqual(result[0], {
        angularDistance: -Math.PI,
        center: {
            first: 5,
            second: 0
        },
        feedRate: 200,
        from: { x: 0, y: 0, z: 0
        },
        fromAngle: -Math.PI,
        plane: {
            firstCoord: "x",
            lastCoord: "z",
            secondCoord: "y"
        },
        radius: 5,
        to: {x: 10, y: 0, z: 0},
        type: "arc"
    }, '"' + code + '" second component check');
});
test("G3 evaluation", function () {
    var code = 'G3 X5 Y5 Z0 I5 J0 F200';
    var result = evaluate(code);
    equal(result.length, 1, '"' + code + '" code length');
    deepEqual(result[0], {
        angularDistance: 3 * Math.PI / 2,
        center: {
            first: 5,
            second: 0
        },
        feedRate: 200,
        from: { x: 0, y: 0, z: 0
        },
        fromAngle: -Math.PI,
        plane: {
            firstCoord: "x",
            lastCoord: "z",
            secondCoord: "y"
        },
        radius: 5,
        to: {x: 5, y: 5, z: 0},
        type: "arc"
    }, '"' + code + '" second component check');
});
function testSimulation(path) {
    var simulated = [];

    function pushPoint(x, y, z, t) {
        simulated.push([x, y, z, t]);
    }

    simulate2(path, pushPoint);
    return simulated;
}