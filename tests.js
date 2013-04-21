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
test("G1 evaluation", function () {
    var code = 'G1 X10';
    var result = evaluate(code);
    equal(result.length, 1, '"' + code + '" code length');
    deepEqual(result[0], {
        feedRate: 200,
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
test("simple speed planning", function () {
    var data = [
        {length: 3, maxAcceleration: 8, squaredSpeed: 16, originalSpeed: 4}
    ];
    planSpeed(data);
    var segment = {
        acceleration: {length: 0},
        deceleration: {length: 0},
        duration: 1.25,
        length: 3,
        maxAcceleration: 8,
        originalSpeed: 4,
        squaredSpeed: 16,
        fragments: [
            {duration: 0.5,
                fromSqSpeed: 0,
                length: 1,
                segment: null,
                startX: 0,
                stopX: 1,
                toSqSpeed: 16,
                type: "acceleration"},
            {duration: 0.25,
                length: 1,
                segment: null,
                startX: 1,
                stopX: 2,
                squaredSpeed: 16,
                type: "constant"},
            {duration: 0.5,
                fromSqSpeed: 16,
                length: 1,
                segment: null,
                startX: 2,
                stopX: 3,
                toSqSpeed: 0,
                type: "deceleration"}
        ]
    };
    $.each(segment.fragments, function (_, fragment) {
        fragment.segment = segment;
    });
    deepEqual(data, [segment], 'speed planning check');
});
test("short distance speed planning", function () {
    var data = [
        {length: 2, maxAcceleration: 8, squaredSpeed: 25, originalSpeed: 5}
    ];
    planSpeed(data);
    var segment = {
        acceleration: {length: 0},
        deceleration: {length: 0},
        duration: 1,
        length: 2,
        maxAcceleration: 8,
        originalSpeed: 5,
        squaredSpeed: 16,
        fragments: [
            {duration: 0.5,
                fromSqSpeed: 0,
                length: 1,
                segment: null,
                startX: 0,
                stopX: 1,
                toSqSpeed: 16,
                type: "acceleration"},
            {duration: 0.5,
                fromSqSpeed: 16,
                length: 1,
                segment: null,
                startX: 1,
                stopX: 2,
                toSqSpeed: 0,
                type: "deceleration"}
        ]
    };
    $.each(segment.fragments, function (_, fragment) {
        fragment.segment = segment;
    });
    deepEqual(data, [segment], 'should not go full speed');
});
test("two segments speed planning", function () {
    var data = [
        {length: 3, maxAcceleration: 8, squaredSpeed: 16, originalSpeed: 4},
        {length: 3, maxAcceleration: 8, squaredSpeed: 16, originalSpeed: 4}
    ];
    planSpeed(data);
    var segment1 = {
        acceleration: {length: 0},
        deceleration: {length: 1},
        duration: 1,
        length: 3,
        maxAcceleration: 8,
        originalSpeed: 4,
        squaredSpeed: 16,
        fragments: [
            {duration: 0.5,
                fromSqSpeed: 0,
                length: 1,
                segment: null,
                startX: 0,
                stopX: 1,
                toSqSpeed: 16,
                type: "acceleration"},
            {duration: 0.5,
                squaredSpeed: 16,
                length: 2,
                segment: null,
                startX: 1,
                stopX: 3,
                type: "constant"}
        ]
    };
    $.each(segment1.fragments, function (_, fragment) {
        fragment.segment = segment1;
    });
    var segment2 = {
        acceleration: {length: 1},
        deceleration: {length: 0},
        duration: 1,
        length: 3,
        maxAcceleration: 8,
        originalSpeed: 4,
        squaredSpeed: 16,
        fragments: [
            {duration: 0.5,
                length: 2,
                segment: null,
                startX: 0,
                stopX: 2,
                squaredSpeed: 16,
                type: "constant"},
            {duration: 0.5,
                fromSqSpeed: 16,
                toSqSpeed: 0,
                length: 1,
                segment: null,
                startX: 2,
                stopX: 3,
                type: "deceleration"}
        ]
    };
    $.each(segment2.fragments, function (_, fragment) {
        fragment.segment = segment2;
    });
    deepEqual(data, [segment1, segment2], 'should transition smoothly between segments');
});
function testSimulation(path) {
    var simulated = [];

    function pushPoint(x, y, z, t) {
        simulated.push([x, y, z, t]);
    }

    simulate2(path, pushPoint);
    return simulated;
}