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
test("jsparse number evaluation", function () {
    var jp = jsparse;
    var parser = function () {
        var number = jp.action(jp.repeat1(jp.range('0', '9')), function (ast) {
            return ast.join('');
        });
        var decimalPart = jp.action(jp.sequence('.', number), function (ast) {
            return ast.join('');
        });
        var integerAndDecimal = jp.action(jp.sequence(number, jp.optional(decimalPart)), function (ast) {
            return ast[1] !== false ? ast[0] + ast[1] : ast[0];
        });
        var unsignedNumber = jp.choice(integerAndDecimal, decimalPart);
        var decimal = jp.action(jp.sequence(jp.optional(jp.choice('+', '-')), unsignedNumber), function (ast) {
            return parseFloat(ast[0] !== false ? ast[0] + ast[1] : ast[1]);
        });
        var identifier = jp.action(jp.wsequence('<', jp.repeat1(jp.choice('_', jp.range('0', '9'), jp.range('a', 'z'))), '>'), function (ast) {
            return ast.join('').toLowerCase();
        });
        var parameter = jp.action(jp.sequence(jp.expect('#'), jp.choice(number, identifier)), function (ast) {
            return 0;
        });
        var expression = function (state) {
            return expression(state);
        };
        var functions = {
            'ABS': Math.abs,
            'ACOS': Math.acos,
            'ASIN': Math.asin,
            'COS': Math.cos,
            'EXP': Math.exp,
            'FIX': Math.floor,
            'FUP': Math.ceil,
            'ROUND': Math.round,
            'LN': Math.log,
            'SIN': Math.sin,
            'SQRT': Math.sqrt,
            'TAN': Math.tan,
            'EXISTS': function (ast) {
                console.log('EXISTS TBD');
                return 1;
            }
        };

        var atanExpr = jp.wsequence(jp.expect('ATAN['), expression, jp.expect(']'), jp.expect('/'), jp.expect('['), expression, jp.expect(']'));
        atanExpr = jp.action(atanExpr, function (ast) {
            return Math.atan2(ast[0], ast[1]);
        });
        var exprs = [atanExpr];
        $.each(functions, function (name, funct) {
            exprs.push(jp.action(jp.wsequence(jp.expect(name + '['), expression, jp.expect(']')), funct));
        });

        var functionCall = jp.choice.apply(null, exprs);

        var binops = {
            '**': function (l, r) {
                return Math.pow(l, r);
            },
            '*': function (l, r) {
                return l * r;
            },
            '/': function (l, r) {
                return l / r;
            },
            'MOD': function (l, r) {
                return l % r;
            },
            '+': function (l, r) {
                return l + r;
            },
            '-': function (l, r) {
                return l - r;
            },
            'EQ': function (l, r) {
                return l === r ? 1 : 0;
            },
            'NE': function (l, r) {
                return l !== r ? 1 : 0;
            },
            'GT': function (l, r) {
                return l > r ? 1 : 0;
            },
            'GE': function (l, r) {
                return l >= r ? 1 : 0;
            },
            'LT': function (l, r) {
                return l < r ? 1 : 0;
            },
            'LE': function (l, r) {
                return l <= r ? 1 : 0;
            },
            'AND': function (l, r) {
                return l && r ? 1 : 0;
            },
            'OR': function (l, r) {
                return l || r ? 1 : 0;
            },
            'XOR': function (l, r) {
                return (l ? !r : r) ? 1 : 0;
            }
        };

        function binOp(op) {
            return jp.action(jp.whitespace(op), function () {
                return binops[op];
            });
        }

        var binopStack = [
            ['**'],
            ['*', '/', 'MOD'],
            ['+', '-'],
            ['EQ', 'NE', 'GT', 'GE', 'LT', 'LE'],
            ['AND', 'OR', 'XOR']
        ];
        expression = jp.whitespace(jp.choice(functionCall, jp.wsequence(jp.expect('['), expression, jp.expect(']')), parameter, decimal, expression));
        //push expression by precedence layer
        $.each(binopStack, function (_, layer) {
            var choices = [];
            $.each(layer, function (_, choice) {
                choices.push(binOp(choice));
            });
            expression = jp.chainl(expression, jp.choice.apply(null, choices));
        });
        return {decimal: decimal, expression: expression};
    }();

    function testValue(str, expected) {
        var parsed = parser.expression(jp.ps(str));
        equal(parsed.remaining.length, 0, "consume all the string");
        deepEqual(parsed.ast, expected, str + ' = ' + expected);
    }

    function testValues(values) {
        $.each(values, function (_, input) {
            testValue(input[0], input[1]);
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
        ['3**2**3', 729], //yeah, it's left in g-code
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
    testValues([
        ['#3 + 5', 5],
        ['#<_3_aa_b2z>+ 5', 5]
    ]);
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