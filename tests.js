"use strict";
require(['libs/jsparse', 'cnc/parser', 'cnc/simulation'], function (jp, parser, simulation) {
    test("G0 evaluation", function () {
        var code = 'G0 X10';
        var result = parser.evaluate(code);
        equal(result.length, 1, '"' + code + '" code length');
        deepEqual(result[0], {
            feedRate: 3000,
            lineNo: 0,
            from: {x: 0, y: 0, z: 0},
            to: {x: 10, y: 0, z: 0},
            type: "line"}, '"' + code + '" second component check');
    });
    test("G0 evaluation with expression", function () {
        var code = 'G0 X[5+5]';
        var result = parser.evaluate(code);
        equal(result.length, 1, '"' + code + '" code length');
        deepEqual(result[0], {
            feedRate: 3000,
            lineNo: 0,
            from: {x: 0, y: 0, z: 0},
            to: {x: 10, y: 0, z: 0},
            type: "line"}, '"' + code + '" second component check');
    });
    test("G1 evaluation", function () {
        var code = 'G1 X10';
        var result = parser.evaluate(code);
        equal(result.length, 1, '"' + code + '" code length');
        deepEqual(result[0], {
            feedRate: 200,
            lineNo: 0,
            from: {x: 0, y: 0, z: 0},
            to: {x: 10, y: 0, z: 0},
            type: "line"}, '"' + code + '" second component check');
    });
    test("G2 evaluation", function () {
        var code = 'G2 X10 Y0 Z0 I5 J0 F200';
        var result = parser.evaluate(code);
        equal(result.length, 1, '"' + code + '" code length');
        deepEqual(result[0], {
            angularDistance: -Math.PI,
            center: {
                first: 5,
                second: 0
            },
            feedRate: 200,
            lineNo: 0,
            from: { x: 0, y: 0, z: 0
            },
            fromAngle: -Math.PI,
            plane: {
                firstCenterCoord: "i",
                firstCoord: "x",
                lastCoord: "z",
                secondCenterCoord: "j",
                secondCoord: "y"
            },
            radius: 5,
            to: {x: 10, y: 0, z: 0},
            type: "arc"
        }, '"' + code + '" second component check');
    });
    test("G3 evaluation", function () {
        var code = 'G3 X5 Y5 Z0 I5 J0 F200';
        var result = parser.evaluate(code);
        equal(result.length, 1, '"' + code + '" code length');
        deepEqual(result[0], {
            angularDistance: 3 * Math.PI / 2,
            center: {
                first: 5,
                second: 0
            },
            feedRate: 200,
            lineNo: 0,
            from: { x: 0, y: 0, z: 0
            },
            fromAngle: -Math.PI,
            plane: {
                firstCenterCoord: "i",
                firstCoord: "x",
                lastCoord: "z",
                secondCenterCoord: "j",
                secondCoord: "y"
            },
            radius: 5,
            to: {x: 5, y: 5, z: 0},
            type: "arc"
        }, '"' + code + '" second component check');
    });
    test("jsparse number evaluation", function () {

        function testValue(str, expected, specialParser) {
            if (specialParser == undefined)
                specialParser = parser.createParser();
            var parsed = jp.wsequence(specialParser.expression, jp.expect(jp.end))(jp.ps(str));
            deepEqual(parsed.ast[0], expected, str + ' = ' + expected);
        }

        function testValues(values, specialParser) {
            $.each(values, function (_, input) {
                testValue(input[0], input[1], specialParser);
            });
        }

        $.each(["-10", "+1.5", "-1.5", "1", "1.5", ".5", "-.5", "+.55"], function (_, str) {
            testValue(str, parseFloat(str));
        });
        testValues([
            ['1+2', 3],
            ['-1+2', 1],
            ['-1+-2', -3],
            ['1+2+-1', 2],
            ['1+2++1', 4]
        ]);
        testValues([
            ['1-2', -1],
            ['-1-+2', -3],
            ['-1-2', -3],
            ['1-2-1', -2],
            ['1+2--1', 4]
        ]);
        testValues([
            ['1*2', 2],
            ['-1*+2', -2],
            ['-1*2', -2],
            ['1*2-1', 1],
            ['1+2*-1', -1],
            ['1/2', 0.5],
            ['-1/+2', -0.5],
            ['-1/2', -0.5],
            ['1/2-1', -0.5],
            ['1+2/-1', -1],
            ['2/-1*3+1', -5],
            ['[1 + 2] * -1', -3]
        ]);
        testValues([
            ['3**2', 9],
            ['3**2**3', Math.pow(Math.pow(3, 2), 3)], //yeah, it's left in g-code
            ['3**2+3', 12]
        ]);
        testValues([
            ['3**2LT100+100', 1],
            ['1EQ0', 0],
            ['1EQ1', 1],
            ['0EQ1', 0],
            ['1NE0', 1],
            ['1NE1', 0],
            ['0NE1', 1],
            ['1GT0', 1],
            ['1GT1', 0],
            ['0GT1', 0],
            ['1GE0', 1],
            ['1GE1', 1],
            ['0GE1', 0],
            ['1LT0', 0],
            ['1LT1', 0],
            ['0LT1', 1],
            ['1LE0', 0],
            ['1LE1', 1],
            ['0LE1', 1],
            ['1AND1', 1],
            ['1AND0', 0],
            ['0AND0', 0],
            ['1XOR1', 0],
            ['1XOR0', 1],
            ['0XOR0', 0],
            ['1OR1', 1],
            ['1OR0', 1],
            ['0OR0', 0]
        ]);
        testValues([
            ['EXP[2-1]', Math.E],
            ['ABS[-1]', 1],
            ['ACOS[1]', 0],
            ['ASIN[1]', Math.PI / 2],
            ['COS[0]', 1],
            ['EXP[1]', Math.E],
            ['FIX[2.8]', 2],
            ['FIX[-2.8]', -3],
            ['FUP[2.8]', 3],
            ['FUP[ -2.8 ]', -2],
            ['ATAN[-1] / [1]', -Math.PI / 4],
            ['ATAN[-1] / [1] / [-0.5]', Math.PI / 2]
        ]);
        var p1 = parser.createParser();
        p1.memory['var1'] = 3;
        testValues([
            ['#3 + 5', 5],
            ['#<_3_aa_b2z>+ 5', 5],
            ['#<var1>', 3],
            ['#<VAR1>', 3]
        ], p1);

        var p2 = parser.createParser();
        p2.line(jp.ps('#54 = [COS[0]]'));
        p2.line(jp.ps('#<lol>=12\n'));
        //check that affectation are done after reading on the same line
        p2.line(jp.ps('#<v1>=10 #<v2>=[#<v1>+1]\n'));
        testValues([
            ['#54', 1],
            ['#<lol>', 12],
            ['#<undefined>', 0],
            ['#<v2>', 1],
            ['#<v1>', 10]
        ], p2);
        deepEqual(parser.createParser().parseLine("#4 = 4.000000 #5 = 5.000000 G1 X10 F[3000] X [12+#4]").ast, {
            f: [3000],
            g: [1],
            x: [10, 12]});
        deepEqual(parser.createParser().parseLine('G02X10Y30R10 ').ast, {
            g: [2],
            r: [10],
            x: [10],
            y: [30]});
        deepEqual(parser.createParser().parseLine('G01Z[-1.000000*#7+#10]F#4 ').ast, {
            g: [1],
            f: [0],
            z: [0]});
    });
    test("simple speed planning", function () {
        var data = [
            {length: 3, maxAcceleration: 8, squaredSpeed: 16, originalSpeed: 4}
        ];
        simulation.planSpeed(data);
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
        simulation.planSpeed(data);
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
        simulation.planSpeed(data);
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
    test("rd(x, y, z)", function () {
        equal(rd(0, 2, 1), 1.7972103521033886);
        equal(rd(2, 3, 4), 0.16510527294261057);
    });
    test("rf(x, y, z)", function () {
        equal(rf(1, 2, 4), 0.6850858166334359);
        equal(rf(1, 2, 0), 1.31102877714606);
        equal(rf(2, 3, 4), 0.5840828416771515);
    });
    test("E(m)", function () {
        equal(completeEllipticIntegralSecondKind(0.5), 1.350643881047675);
    });
    test("E(phi,m)", function () {
        equal(incompleteEllipticIntegralSecondKind(Math.PI / 4, 0.5), 0.748186504177661);
        equal(incompleteEllipticIntegralSecondKind(Math.PI / 4, 0.7), 0.7323015038648828);
        equal(incompleteEllipticIntegralSecondKind(Math.PI / 2, 0.7), 1.2416705679458233);
        equal(incompleteEllipticIntegralSecondKind(-Math.PI / 2, 0.7), -1.2416705679458233);
        equal(incompleteEllipticIntegralSecondKind(-3 * Math.PI + 0.5, 0.5), -7.613952326493532);
    });
});