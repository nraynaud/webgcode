"use strict";
// general unit policy:
// lengths in mm
// feedrate in mm/min
// speed in mm/s
// angles in radians

var parser = (function () {
    var XY_PLANE = {
        firstCoord: 'x',
        secondCoord: 'y',
        lastCoord: 'z',
        firstCenterCoord: 'i',
        secondCenterCoord: 'j'
    };
    var YZ_PLANE = {
        firstCoord: 'y',
        secondCoord: 'z',
        lastCoord: 'x',
        firstCenterCoord: 'j',
        secondCenterCoord: 'k'
    };

    var XZ_PLANE = {
        firstCoord: 'x',
        secondCoord: 'z',
        lastCoord: 'y',
        firstCenterCoord: 'i',
        secondCenterCoord: 'k'
    };

    var GROUPS_TRANSITIONS = {
        0: {motionMode: moveTraverseRate},
        1: {motionMode: moveFeedrate},
        2: {motionMode: moveCWArcMode},
        3: {motionMode: moveCCWArcMode},
        4: {},//skip, doesn't influence tool path
        17: {planeMode: XY_PLANE},
        18: {planeMode: XZ_PLANE},
        19: {planeMode: YZ_PLANE},
        20: {unitMode: inchesConverter},
        21: {unitMode: mmConverter},
        40: {},//skip
        49: {},//skip
        54: {},//skip
        61: {pathControl: 61},
        61.1: {pathControl: 61.1},
        64: {pathControl: 64},
        80: {motionMode: noMotion},
        90: {distanceMode: absoluteDistance},
        91: {distanceMode: incrementalDistance}
    };

    function absoluteDistance(previous, parsedMove) {
        return $.extend(cloneObject(previous), parsedMove);
    }

    function incrementalDistance(previous, parsedMove) {
        var result = cloneObject(previous);
        $.each(util.AXES, function (_, axis) {
            if (parsedMove[axis] != null)
                result[axis] += parsedMove[axis];
        });
        return result;
    }

    function mmConverter(length) {
        return length;
    }

    function inchesConverter(length) {
        return length * 25.4;
    }

    function moveCWArcMode(line, machineState) {
        parseArc(line, true, machineState);
    }

    function moveCCWArcMode(line, machineState) {
        parseArc(line, false, machineState);
    }

    function moveFeedrate(line, machineState) {
        moveStraightLine(line, machineState, machineState.feedRate);
    }

    function moveTraverseRate(line, machineState) {
        moveStraightLine(line, machineState, machineState.travelFeedRate);
    }

    function moveStraightLine(line, machineState, speed) {
        var parsedMove = detectAxisMove(line, machineState.unitMode);
        if (parsedMove)
            move(parsedMove, machineState, speed);
    }

    function noMotion(line, machineState) {
        //do nothing
    }

    function detectAxisMove(line, unitMode) {
        var result = {};
        $.each(util.AXES, function (_, axis) {
            var parsed = line[axis];
            if (parsed !== undefined && parsed.length)
                result[axis] = unitMode(parsed[parsed.length - 1]);
        });
        return Object.keys(result).length ? result : null;
    }

    function cloneObject(old) {
        return $.extend({}, old);
    }

    function move(parsedMove, machineState, speed) {
        var newPos = machineState.distanceMode(machineState.position, parsedMove);
        addPathComponent(newPos, machineState, speed);
    }

    function addPathComponent(point, machineState, speed) {
        var hadMovement = false;
        $.each(util.AXES, function (_, axis) {
            hadMovement = hadMovement || Math.abs(point[axis] - machineState.position[axis]) > 0.00001;
        });
        if (hadMovement) {
            machineState.path.push({type: 'line', from: cloneObject(machineState.position), to: cloneObject(point), feedRate: speed});
            machineState.position = point;
        }
    }

    function findCircle(line, unitMode, targetPos, plane, currentPosition, clockwise) {
        var radius, toCenterX, toCenterY;
        var radiusMatch = line['r'];
        if (radiusMatch != undefined && radiusMatch.length) {
            //radius notation
            radius = unitMode(radiusMatch[radiusMatch.length - 1]);
            var dx = targetPos[plane.firstCoord] - currentPosition[plane.firstCoord];
            var dy = targetPos[plane.secondCoord] - currentPosition[plane.secondCoord];
            var mightyFactor = 4 * radius * radius - dx * dx - dy * dy;
            mightyFactor = -Math.sqrt(mightyFactor) / util.length(dx, dy);
            if (!clockwise)
                mightyFactor = -mightyFactor;
            if (radius < 0) {
                mightyFactor = -mightyFactor;
                radius = -radius;
            }
            toCenterX = 0.5 * (dx - (dy * mightyFactor));
            toCenterY = 0.5 * (dy + (dx * mightyFactor));
        } else {
            //center notation
            var xMatch = line[plane.firstCenterCoord];
            var yMatch = line[plane.secondCenterCoord];
            toCenterX = xMatch ? unitMode(xMatch[xMatch.length - 1]) : 0;
            toCenterY = yMatch ? unitMode(yMatch[yMatch.length - 1]) : 0;
            radius = util.length(toCenterX, toCenterY);
        }
        return {radius: radius, toCenterX: toCenterX, toCenterY: toCenterY};
    }

// I can't do maths, code stolen there: https://github.com/grbl/grbl/blob/master/gcode.c#L430
// to keep sanity, think firstCoord is X and secondCoord is Y and the plane transposer will do the changes
    function parseArc(line, clockwise, machineState) {
        var parsedMove = detectAxisMove(line, machineState.unitMode);
        if (!parsedMove)
            return;
        var currentPosition = machineState.position;
        var unitMode = machineState.unitMode;
        var targetPos = machineState.distanceMode(machineState.position, detectAxisMove(line, unitMode));
        var plane = machineState.planeMode;
        var xCoord = plane.firstCoord;
        var yCoord = plane.secondCoord;
        var circle = findCircle(line, unitMode, targetPos, plane, currentPosition, clockwise);
        var radius = circle.radius;
        var toCenterX = circle.toCenterX;
        var toCenterY = circle.toCenterY;
        var centerX = currentPosition[xCoord] + toCenterX;
        var centerY = currentPosition[yCoord] + toCenterY;
        var targetCenterX = targetPos[xCoord] - centerX;
        var targetCenterY = targetPos[yCoord] - centerY;
        var angularDiff = Math.atan2(-toCenterX * targetCenterY + toCenterY * targetCenterX,
            -toCenterX * targetCenterX - toCenterY * targetCenterY);
        if (clockwise && angularDiff >= 0)
            angularDiff -= 2 * Math.PI;
        if (!clockwise && angularDiff <= 0)
            angularDiff += 2 * Math.PI;
        var angularStart = Math.atan2(-toCenterY, -toCenterX);
        machineState.path.push({
            type: 'arc',
            from: currentPosition,
            to: targetPos,
            plane: plane,
            center: {first: centerX, second: centerY},
            fromAngle: angularStart,
            angularDistance: angularDiff,
            radius: radius,
            feedRate: machineState.feedRate});
        machineState.position = targetPos;
    }

    function createMachine(travelFeedRate, maxFeedRate, initialPosition) {
        if (initialPosition === undefined) {
            initialPosition = {};
            $.each(util.AXES, function (_, axis) {
                initialPosition[axis] = 0;
            });
        }
        var machineState = {position: {},
            distanceMode: absoluteDistance,
            motionMode: moveTraverseRate,
            unitMode: mmConverter,
            planeMode: XY_PLANE,
            feedRate: Math.min(200, maxFeedRate),
            travelFeedRate: Math.min(travelFeedRate, maxFeedRate),
            pathControl: 61,
            path: [],
            parser: createParser()};
        $.each(util.AXES, function (_, axis) {
            machineState.position[axis] = initialPosition[axis];
        });
        return machineState;
    }

    function createParser() {
        var jp = jsparse;
        var memory = {};
        var number = jp.join_action(jp.repeat1(jp.range('0', '9')), '');
        var decimalPart = jp.join_action(jp.sequence('.', number), '');
        var integerAndDecimal = jp.action(jp.sequence(number, jp.optional(decimalPart)), function (ast) {
            return ast[1] !== false ? ast[0] + ast[1] : ast[0];
        });
        var unsignedNumber = jp.choice(integerAndDecimal, decimalPart);
        var decimal = jp.action(jp.sequence(jp.optional(jp.choice('+', '-')), unsignedNumber), function (ast) {
            return parseFloat(ast[0] !== false ? ast[0] + ast[1] : ast[1]);
        });
        var identifier = jp.join_action(jp.repeat1(jp.choice('_', jp.range('0', '9'), jp.range('a', 'z'), jp.range('A', 'Z'))), '');
        var varName = jp.action(jp.wsequence(jp.expect('<'), identifier, jp.expect('>')), function (ast) {
            return ast[0].toLowerCase();
        });
        var parameter = jp.sequence(jp.expect('#'), jp.choice(number, varName));
        var parameterRead = jp.action(parameter, function (ast) {
            var res = memory[ast];
            return res === undefined ? 0 : res;
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
            'EXISTS': function () {
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
            '**': Math.pow,
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
        var bracketedExpression = jp.action(jp.wsequence(jp.expect('['), expression, jp.expect(']')), function (ast) {
            return ast[0];
        });
        expression = jp.whitespace(jp.choice(functionCall, bracketedExpression, parameterRead, decimal, expression));
        //push expression by precedence layer
        $.each(binopStack, function (_, layer) {
            var choices = [];
            $.each(layer, function (_, choice) {
                choices.push(binOp(choice));
            });
            expression = jp.chainl(expression, jp.choice.apply(null, choices));
        });
        var readExpression = jp.choice(bracketedExpression, decimal, parameterRead);
        var affectation = jp.action(jp.wsequence(parameter, jp.expect('='), readExpression), function (ast) {
            return {variable: ast[0], value: ast[1]};
        });
        var word = jp.wsequence(jp.choice.apply(null, 'FGIJKLMPRSTXYZfgijklmrpstxyz'.split('')), readExpression);
        var line = jp.action(jp.wsequence(jp.repeat0(jp.choice(affectation, word)), jp.end), function (ast) {
            var res = {};
            var affectations = [];

            function appendProperty(key, value) {
                if (res[key] === undefined)
                    res[key] = [value];
                else
                    res[key].push(value);
            }

            $.each(ast[0], function (_, element) {
                if (Array.isArray(element))
                    appendProperty(element[0].toLowerCase(), element[1]);
                else
                    affectations.push(element);
            });
            $.each(affectations, function (_, affectation) {
                memory[affectation.variable] = affectation.value;
            });
            return res;
        });
        var wholeLine = jp.action(jp.wsequence(line, jp.expect(jp.end)), function (ast) {
            return ast[0];
        });
        return {decimal: decimal, expression: expression, affectation: affectation, line: line, memory: memory,
            clearMemory: function () {
                for (var key in memory)
                    if (memory.hasOwnProperty(key))
                        delete memory[key];
            }, parseLine: function (str) {
                return wholeLine(jp.ps(str));
            }};
    }

    function evaluate(text, travelFeedRate, maxFeedRate, initialPosition) {
        if (travelFeedRate == null)
            travelFeedRate = maxFeedRate;
        if (maxFeedRate == null)
            maxFeedRate = travelFeedRate;
        if (maxFeedRate == null && travelFeedRate == null) {
            maxFeedRate = 3000;
            travelFeedRate = 3000;
        }
        var machineState = createMachine(travelFeedRate, maxFeedRate, initialPosition);
        var arrayOfLines = text.match(/[^\r\n]+/g);
        $.each(arrayOfLines, function (lineNo, originalLine) {
            if (originalLine.match(/[\t ]*%[\t ]*/))
                return;
            //drop spaces, go uppercase
            var line = originalLine.replace(/[\t ]+/g, '').toUpperCase();
            // drop comments
            line = line.replace(/[(][^)]*[)]/g, '');
            line = line.replace(/;.*$/, '');
            //drop line number
            line = line.replace(/^N[0-9]+/, '');
            var parsed = machineState.parser.parseLine(line).ast;
            if (parsed == undefined)
                console.log('could not parse ', line);
            var fCode = parsed['f'];
            if (fCode != undefined && fCode.length)
                machineState.feedRate = Math.min(machineState.unitMode(fCode[0]), maxFeedRate);
            var gCode = parsed['g'];
            for (var i = 0; gCode !== undefined && i < gCode.length; i++) {
                var codeNum = gCode[i];
                var transition = GROUPS_TRANSITIONS[codeNum];
                if (transition != null)
                    $.extend(machineState, transition);
                else {
                    console.log('Did not understand G' + gCode + ', skipping');
                    console.log(originalLine);
                }
            }
            machineState.motionMode(parsed, machineState);
        });
        return machineState.path;
    }

    return {
        evaluate: evaluate,
        createParser: createParser};
})();