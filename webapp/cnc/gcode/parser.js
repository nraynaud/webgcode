"use strict";
// general unit policy:
// lengths in mm
// feedrate in mm/min
// speed in mm/s
// angles in radians
define(['libs/jsparse', 'cnc/util'], function (jp, util) {
    // the line has to exactly match to be quick-parsed
    var RE_CHECKER = /^([FGHIJKLMNPRSTXYZ][-+]?[0-9]*\.?[0-9]+)+$/i;
    var RE_PARSER = /([FGHIJKLMNPRSTXYZ])([-+]?[0-9]*\.?[0-9]+)/ig;

    function tryToQuicklyParse(str) {
        //try a speedy parsing
        if (RE_CHECKER.test(str)) {
            var res = {};
            var match;
            while ((match = RE_PARSER.exec(str)) !== null) {
                var key = match[1].toLowerCase();
                var value = parseFloat(match[2]);
                if (res[key] == null)
                    res[key] = [value];
                else
                    res[key].push(value);
            }
            return res;
        }
        return null;
    }

    jp.memoize = false;
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

    var NON_MODAL = {
        10: dataInput
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
        40: 'unsupported',
        41: 'unsupported',
        42: 'unsupported',
        49: {},//skip
        54: {currentOrigin: 1},
        55: {currentOrigin: 2},
        56: {currentOrigin: 3},
        57: {currentOrigin: 4},
        58: {currentOrigin: 5},
        59: {currentOrigin: 6},
        59.1: {currentOrigin: 7},
        59.2: {currentOrigin: 8},
        59.3: {currentOrigin: 9},
        61: {pathControl: 61},
        61.1: {pathControl: 61.1},
        64: {pathControl: 64},
        80: {motionMode: noMotion},
        90: {distanceMode: absoluteDistance},
        91: {distanceMode: incrementalDistance},
        94: {}//skip, default
    };

    function absoluteDistance(previous, parsedMove) {
        return $.extend(cloneObject(previous), parsedMove);
    }

    function incrementalDistance(previous, parsedMove) {
        var result = cloneObject(previous);
        $.each(['x', 'y', 'z', 'e'], function (_, axis) {
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

    function dataInput(line, machineState) {
        console.log(JSON.stringify(line));
        if (line['l'] != 2)
            throw {name: 'unsupported G10', message: 'only G10 L2 is supported'};
        var origin = line['p'];
        if (origin == null)
            throw {name: 'unsupported G10', message: 'you did not define P'};
        if (origin < 1 || origin > 9)
            throw {name: 'unsupported G10', message: 'should be in [0-9], was ' + origin};
        if (line['r'])
            throw {name: 'unsupported G10', message: 'axis rotation is not supported'};
        var parsedMove = detectAxisMove(line, machineState.unitMode);
        $.extend(machineState.origins[origin], parsedMove);
    }

    function moveCWArcMode(line, machineState) {
        parseArc(line, true, machineState);
    }

    function moveCCWArcMode(line, machineState) {
        parseArc(line, false, machineState);
    }

    function moveFeedrate(line, machineState) {
        moveStraightLine(line, machineState, machineState.feedRate, 'normal');
    }

    function moveTraverseRate(line, machineState) {
        moveStraightLine(line, machineState, machineState.travelFeedRate, 'rapid');
    }

    function moveStraightLine(line, machineState, speed, speedTag) {
        var parsedMove = detectAxisMove(line, machineState.unitMode);
        if (parsedMove)
            addPathComponent(machineState.absolutePoint(parsedMove), machineState, speed, speedTag);
    }

    function noMotion(line, machineState) {
        //do nothing
    }

    function detectAxisMove(line, unitMode) {
        var result = {};
        $.each(['x', 'y', 'z', 'e'], function (_, axis) {
            var parsed = line[axis];
            if (parsed !== undefined && parsed.length)
                result[axis] = unitMode(parsed[parsed.length - 1]);
        });
        return Object.keys(result).length ? result : null;
    }

    function cloneObject(old) {
        return $.extend({}, old);
    }

    function createPoint(obj) {
        return new util.Point(obj.x, obj.y, obj.z);
    }

    function addPathComponent(point, machineState, speed, speedTag) {
        var hadMovement = false;
        $.each(['x', 'y', 'z', 'e'], function (_, axis) {
            hadMovement = hadMovement || Math.abs(point[axis] - machineState.position[axis]) > 0.00001;
        });
        if (hadMovement) {
            machineState.addPathFragment({
                type: 'line', from: createPoint(machineState.position), to: createPoint(point),
                feedRate: speed, lineNo: machineState.lineNo, speedTag: speedTag
            });
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
            if (xMatch === undefined && yMatch === undefined) {
                throw {
                    name: 'no center',
                    message: 'circle has neither radius nor in plane center (' + plane.firstCenterCoord.toUpperCase() + ', ' + plane.secondCenterCoord.toUpperCase() + ')'
                };
            }
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
        var targetPos = machineState.absolutePoint(parsedMove);
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
        machineState.addPathFragment({
            type: 'arc',
            from: createPoint(currentPosition),
            to: createPoint(targetPos),
            plane: plane,
            center: {first: centerX, second: centerY},
            centerInPlane: new util.Point(centerX, centerY),
            fromAngle: angularStart,
            angularDistance: angularDiff,
            radius: radius,
            feedRate: machineState.feedRate,
            lineNo: machineState.lineNo,
            speedTag: 'normal'
        });
        machineState.position = targetPos;
    }

    function createMachine(travelFeedRate, maxFeedRate, initialPosition, pathListener) {
        if (pathListener == null)
            pathListener = function () {
            };
        if (initialPosition == null) {
            initialPosition = new util.Point(0, 0, 0);
        }
        var origins = [];
        for (var i = 0; i < 10; i++)
            origins.push(new util.Point(0, 0, 0));
        var path = [];
        var machineState = {
            position: new util.Point(0, 0, 0),
            distanceMode: absoluteDistance,
            motionMode: moveTraverseRate,
            unitMode: mmConverter,
            planeMode: XY_PLANE,
            feedRate: Math.min(200, maxFeedRate),
            travelFeedRate: Math.min(travelFeedRate, maxFeedRate),
            pathControl: 61,
            path: path,
            parser: createParser(),
            origins: origins,
            currentOrigin: 1,
            addPathFragment: function (fragment) {
                path.push(fragment);
                pathListener(fragment);
            },
            absolutePoint: function (parsedMove) {
                var currentOrigin = machineState.origins[machineState.currentOrigin];
                $.each(['x', 'y', 'z', 'e'], function (_, axis) {
                    if (parsedMove[axis] != null)
                        parsedMove[axis] += currentOrigin[axis];
                });
                return machineState.distanceMode(machineState.position, parsedMove);
            }
        };
        $.each(['x', 'y', 'z', 'e'], function (_, axis) {
            machineState.position[axis] = initialPosition[axis];
        });
        return machineState;
    }

    function createParser() {
        var memory = {};
        var number = jp.join_action(jp.repeat1(jp.range('0', '9')), '');
        var decimalPart = jp.join_action(jp.sequence('.', jp.optional(number)), '');
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
        var word = jp.wsequence(jp.choice.apply(null, 'EFGIJKLMNPRSTXYZ'.split('')), readExpression);
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
        return {
            decimal: decimal, expression: expression, affectation: affectation, line: line, memory: memory,
            clearMemory: function () {
                for (var key in memory)
                    if (memory.hasOwnProperty(key))
                        delete memory[key];
            }, parseLine: function (str) {
                var quick = tryToQuicklyParse(str);
                if (quick)
                    return quick;
                //go uppercase for this parser
                return wholeLine(jp.ps(str.toUpperCase())).ast;
            }
        };
    }

    function cleanLineUp(originalLine) {
        //drop spaces
        var line = originalLine.replace(/[\t ]+/g, '');
        // drop comments
        line = line.replace(/[(][^)]*[)]/g, '');
        line = line.replace(/;.*$/, '');
        return line;
    }

    function handleLineAst(parsed, machineState, maxFeedRate, originalLine, lineNo, errorCollector) {
        var fCode = parsed['f'];
        if (fCode != undefined && fCode.length)
            machineState.feedRate = Math.min(machineState.unitMode(fCode[0]), maxFeedRate);
        var gCode = parsed['g'];
        var nonModal = null;
        for (var i = 0; gCode !== undefined && i < gCode.length; i++) {
            var codeNum = gCode[i];
            var transition = GROUPS_TRANSITIONS[codeNum];
            if (transition != null)
                if (transition === 'unsupported')
                    errorCollector.push({
                        lineNo: lineNo,
                        message: 'G' + codeNum + ' is not supported, skipping',
                        line: originalLine
                    });
                else
                    $.extend(machineState, transition);
            else {
                var nonModal2 = NON_MODAL[codeNum];
                if (nonModal2) {
                    if (nonModal == null) {
                        nonModal = nonModal2;
                        nonModal(parsed, machineState);
                    } else
                        errorCollector.push({
                            lineNo: lineNo,
                            message: 'More than one non-modal on same line G' + gCode + ', skipping',
                            line: originalLine
                        });
                } else
                    errorCollector.push({
                        lineNo: lineNo,
                        message: 'Did not understand G' + codeNum + ', skipping',
                        line: originalLine
                    });
            }
        }
        if (nonModal == null)
            machineState.motionMode(parsed, machineState);
    }

    function evaluate(text, travelFeedRate, maxFeedRate, initialPosition, errorCollector, fragmentListener) {
        if (errorCollector == null)
            errorCollector = [];
        if (travelFeedRate == null)
            travelFeedRate = maxFeedRate;
        if (maxFeedRate == null)
            maxFeedRate = travelFeedRate;
        if (maxFeedRate == null && travelFeedRate == null) {
            maxFeedRate = 3000;
            travelFeedRate = 3000;
        }
        var machineState = createMachine(travelFeedRate, maxFeedRate, initialPosition, fragmentListener);
        var arrayOfLines = text.split(/\r?\n/);
        for (var lineNo = 0; lineNo < arrayOfLines.length; lineNo++) {
            var originalLine = arrayOfLines[lineNo];
            if (originalLine.match(/[\t ]*%[\t ]*/))
                continue;
            var line = cleanLineUp(originalLine);
            var parsed = machineState.parser.parseLine(line);
            machineState.lineNo = lineNo;
            if (parsed == undefined)
                errorCollector.push({lineNo: lineNo, message: "did not understand line", line: originalLine});
            else
                try {
                    handleLineAst(parsed, machineState, maxFeedRate, originalLine, lineNo, errorCollector);
                } catch (error) {
                    errorCollector.push({
                        lineNo: lineNo,
                        message: error.name + ': ' + error.message,
                        line: originalLine
                    });
                }
        }
        return machineState.path;
    }

    return {
        evaluate: evaluate,
        createParser: createParser
    };
});