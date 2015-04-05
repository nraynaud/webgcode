"use strict";
define(['cnc/util', 'cnc/cam/cam', 'clipper', 'libs/jsparse'], function (util, cam, clipper, jp) {
    clipper.Error = function (message) {
        throw new Error(message);
    };

    jp.memoize = false;

    var decimalRegex = '[+-]?(?:\\d*\\.)?\\d+';
    var interpolationRegex = /^(G\d+)?/;
    var dCodeRegex = /D(\d+)$/;
    var displacementRegex = /(?:X([+-]?\d+))?(?:Y([+-]?\d+))?(?:I([+-]?\d+))?(?:J([+-]?\d+))?/;
    var newLinesRegex = /\r?\n|\r/gm;
    var commentRegex = /G(?:4|04)[^*]*[*]/gm;
    var extendedInstructionRegex = /([%][^%]*)[*][%]/gm;

    function fixOrientations(polys) {
        return union(polys, clipper.PolyFillType.pftEvenOdd);
    }

    function union(polys, filltype, other) {
        var res = [];

        var c = new clipper.Clipper();
        c.AddPaths(polys, clipper.PolyType.ptSubject, true);
        c.AddPaths(other == null ? [] : other, clipper.PolyType.ptClip, true);
        c.Execute(clipper.ClipType.ctUnion, res, filltype, filltype);
        return res;
    }

    function subtract(left, right) {
        var filltype = clipper.PolyFillType.pftEvenOdd;
        var res = [];
        var c = new clipper.Clipper();
        c.AddPaths(left, clipper.PolyType.ptSubject, true);
        c.AddPaths(right, clipper.PolyType.ptClip, true);
        c.Execute(clipper.ClipType.ctDifference, res, filltype, filltype);
        return res;
    }

    return function (gerberText) {
        var currentPoint = new util.Point(0, 0);
        var coordinateParser = null;
        var unitFactor = null;
        var darkPolarity = true;
        var repetition = {xCount: 1, yCount: 1, xSpacing: 0, ySpacing: 0};
        var currentAperture = null;
        var currentInterpolationMode = 'G01';
        var isInMultiquadrant = false;
        var isInRegion = false;

        var currentLayer = [];

        var tracks = [];
        var flashes = [];
        var areas = [];

        var aperturesTable = [];

        function parseDistance(str) {
            return unitFactor * parseFloat(str);
        }

        function collectCurrentWork() {
            console.log('collectCurrentWork', darkPolarity);
            closeCurrentPath();
            var poly = union(areas, clipper.PolyFillType.pftNonZero).concat(flashes, tracks);
            tracks = [];
            flashes = [];
            areas = [];
            if (darkPolarity)
                currentLayer = union(poly, clipper.PolyFillType.pftNonZero, currentLayer);
            else
                currentLayer = subtract(currentLayer, union(poly, clipper.PolyFillType.pftNonZero));

        }

        function createCircle(radius, center, steps, startAngle) {
            if (!center)
                center = new util.Point(0, 0);
            if (steps == null)
                steps = 30;
            if (startAngle == null)
                startAngle = 0;
            var poly = [];
            for (var i = 0; i < steps; i++) {
                var angle = startAngle + 2 * Math.PI * i / steps;
                poly.push(center.add(new util.Point(Math.cos(angle), Math.sin(angle)).scale(radius)).round());
            }
            return poly;
        }

        function createRectangle(xSize, ySize, center) {
            if (!center)
                center = new util.Point(0, 0);
            return [
                new util.Point(-xSize / 2, -ySize / 2).add(center).round(),
                new util.Point(+xSize / 2, -ySize / 2).add(center).round(),
                new util.Point(+xSize / 2, +ySize / 2).add(center).round(),
                new util.Point(-xSize / 2, +ySize / 2).add(center).round(),
                new util.Point(-xSize / 2, -ySize / 2).add(center).round()];
        }

        function createHole(holeTxtX, holeTxtY) {
            var holeX = parseDistance(holeTxtX);
            var holeY = parseDistance(holeTxtY);
            if (isNaN(holeY))
                if (isNaN(holeX))
                    return [];
                else
                    return [createCircle(holeX / 2)];
            else
                return [createRectangle(holeX, holeY)];
        }

        var shapesDict = {
            C: function (args) {
                var diameter = parseDistance(args[0]);
                var hole = createHole(args[1], args[2]);
                var poly = [createCircle(diameter / 2)];
                return {type: 'C', diameter: diameter, hole: hole, poly: subtract(poly, hole)};
            },
            R: function (args) {
                var xSize = parseDistance(args[0]);
                var ySize = parseDistance(args[1]);
                var hole = createHole(args[2], args[3]);
                var poly = [createRectangle(xSize, ySize)];
                return {type: 'R', xSize: xSize, ySize: ySize, hole: hole, poly: subtract(poly, hole)};
            },
            O: function (args) {
                var xSize = parseDistance(args[0]);
                var ySize = parseDistance(args[1]);
                var hole = createHole(args[2], args[3]);
                var e1, e2;
                if (xSize < ySize) {
                    e1 = createCircle(xSize / 2, new util.Point(0, -ySize / 2));
                    e2 = createCircle(xSize / 2, new util.Point(0, ySize / 2));
                } else {
                    e1 = createCircle(ySize / 2, new util.Point(-xSize / 2, 0));
                    e2 = createCircle(ySize / 2, new util.Point(xSize / 2, 0));
                }
                var poly = union([createRectangle(xSize, ySize), e1, e2], clipper.PolyFillType.pftPositive);
                return {type: 'O', xSize: xSize, ySize: ySize, hole: hole, poly: subtract(poly, hole)};
            },
            P: function (args) {
                var diameter = parseDistance(args[0]);
                var vertices = parseFloat(args[1]);
                var angle = parseFloat(args[2]);
                if (isNaN(angle))
                    angle = 0;
                var shape = createCircle(diameter / 2, null, vertices, angle * Math.PI / 180);
                var hole = createHole(args[3], args[4]);
                return {type: 'P', hole: hole, poly: subtract([shape], hole)};
            }
        };

        function parseApertureDef(def) {
            var parsed = def.split(',');
            var name = parsed[0];
            var args = parsed[1].split('X');
            var parser = shapesDict[name];
            if (parser)
                return parser(args);
            console.log('no parser for', name, shapesDict);
        }

        function computeValue(str, args) {
            var Expr = function (state) {
                return Expr(state);
            };

            var number = jp.join_action(jp.repeat1(jp.range('0', '9')), '');
            var decimalPart = jp.join_action(jp.sequence('.', jp.optional(number)), '');
            var integerAndDecimal = jp.action(jp.sequence(number, jp.optional(decimalPart)), function (ast) {
                return ast[1] !== false ? ast[0] + ast[1] : ast[0];
            });
            var unsignedNumber = jp.choice(integerAndDecimal, decimalPart);
            var decimal = jp.action(jp.sequence(jp.optional(jp.choice('+', '-')), unsignedNumber), function (ast) {
                return parseFloat(ast[0] !== false ? ast[0] + ast[1] : ast[1]);
            });

            var bracketedExpression = jp.action(jp.wsequence(jp.expect('('), Expr, jp.expect(')')), function (ast) {
                return ast[0];
            });
            var Variable = jp.action(jp.sequence(jp.expect('$'), number), function (ast) {
                return args[parseInt(ast) - 1];
            });

            var Value = jp.choice(decimal, Variable, bracketedExpression, Expr);

            function operator_action(p, func) {
                return jp.action(p, function (ast) {
                    return func;
                });
            }

            var Times = operator_action('x', function (lhs, rhs) {
                return lhs * rhs;
            });
            var Divides = operator_action('/', function (lhs, rhs) {
                return lhs / rhs;
            });
            var Plus = operator_action('+', function (lhs, rhs) {
                return parseFloat(lhs) + parseFloat(rhs);
            });
            var Minus = operator_action('-', function (lhs, rhs) {
                return lhs - rhs;
            });

            var Product = jp.chainl(Value, jp.choice(Times, Divides));
            Expr = jp.chainl(Product, jp.choice(Plus, Minus));
            return Expr(jp.ps(str)).ast;
        }

        var macroShapeDict = {
            '1': function (params) {
                var diameter = parseDistance(params[2]);
                var x = parseDistance(params[3]);
                var y = parseDistance(params[4]);
                return createCircle(diameter / 2, new util.Point(x, y));
            },
            '2': function (params) {
                console.log('Vector Line', params);
                return [];
            },
            '21': function (params) {
                console.log('Center Line', params);
                var w = parseDistance(params[2]);
                var h = parseDistance(params[3]);
                var x = parseDistance(params[4]);
                var y = parseDistance(params[5]);
                var angle = parseFloat(params[6]);
                if (angle != 0)
                    throw new Error('angle != 0 is not yet supported (was ' + angle + '°)');
                return createRectangle(w, h, new util.Point(x, y));
            },
            '22': function (params) {
                console.log('Lower Left Line', params);
                return [];
            },
            '4': function (params) {
                console.log('Outline', params);
                return [];
            },
            '5': function (params) {
                console.log('Polygon', params);
                return [];
            },
            '6': function (params) {
                console.log('Moiré', params);
                return [];
            },
            '7': function (params) {
                console.log('Thermal', params);
                return [];
            }
        };

        function parseMacro(command) {
            var res = command.split('*');
            var name = res[0].substring(2);
            var code = res.slice(1);
            shapesDict[name] = function (args) {
                console.log('executing', name);
                console.log('inputs', args.map(function (a, i) {
                    return '$' + (i + 1) + ': ' + a;
                }).join(', '));
                var shape = [];
                for (var i = 0; i < code.length; i++) {
                    var instruction = code[i];
                    if (instruction[0].match(/[1-9]/)) {
                        var decomposition = instruction.split(',');
                        var values = [decomposition[0]];
                        for (var j = 1; j < decomposition.length; j++) {
                            var obj = decomposition[j];
                            values.push(computeValue(obj, args));
                        }
                        console.log('**', instruction, ' ==>', values.join(','));
                        var unitShape = macroShapeDict[decomposition[0]](values, shape);
                        if (parseInt(values[1]))
                            shape.push(unitShape);
                        else
                            shape = subtract(shape, [unitShape]);
                    } else if (instruction[0] == '$') {
                        var res = instruction.split('=');
                        args[parseInt(res[0].substring(1))] = computeValue(res[1], args);
                    }
                }
                return {type: name, poly: shape};
            };
        }

        var firstLetterDict = {
            A: function (command) {
                if (command[1] == 'M')
                    return parseMacro(command);
                if (command[1] != 'D')
                    return;
                var result = command.split(/ADD(\d+)/);
                var apertureDef = parseApertureDef(result[2]);
                var index = parseInt(result[1]);
                apertureDef.index = index;
                aperturesTable[index] = apertureDef;
            },
            F: function (command) {
                var result = command.split(/FS(L|T)(A|I)X(\d)(\d)Y(\d)(\d)/);
                var integers = parseInt(result[3]);
                var decimals = parseInt(result[4]);
                var omittedZero = result[1];
                if (result[2] != 'A')
                    throw new Error("incremental coordinates are not supported");
                coordinateParser = function (str) {
                    return unitFactor * parseInt(str) * Math.pow(10, omittedZero == 'L' ? -decimals : integers - str.length);
                };
            },
            L: function (command) {
                if (command[1] == 'N')
                    return;
                console.log('POLARITY', command);
                var newPolarity = command == 'LPD';
                if (newPolarity != darkPolarity)
                    collectCurrentWork();
                darkPolarity = newPolarity;
            },
            M: function (command) {
                var result = command.split(/MO(IN|MM)/);
                unitFactor = result[1] == 'MM' ? cam.CLIPPER_SCALE : 25.4 * cam.CLIPPER_SCALE;
            },
            S: function (command) {
                var result = command.split(new RegExp('SR(?:X(\\d+)Y(\\d+)I(' + decimalRegex + ')J(' + decimalRegex + '))'));
                var xc = result[1];
                var yc = result[2];
                var xs = result[3];
                var ys = result[4];
                xc = xc == null ? 1 : parseInt(xc);
                yc = yc == null ? 1 : parseInt(yc);
                xs = xs == null ? 0 : parseDistance(xs);
                ys = ys == null ? 0 : parseDistance(ys);

                repetition.xCount = xc;
                repetition.yCount = yc;
                repetition.xSpacing = xs;
                repetition.ySpacing = ys;
            },
            T: function (command) {
                //ignore T for now
            }
        };

        function g1() {
            currentInterpolationMode = 'G01';
        }

        function g2() {
            currentInterpolationMode = 'G02';
        }

        function g3() {
            currentInterpolationMode = 'G03';
        }

        function ignore() {
        }

        var gcodes = {
            G01: g1,
            G1: g1,
            G02: g2,
            G2: g2,
            G03: g3,
            G3: g3,
            G36: function () {
                closeCurrentPath();
                isInRegion = true;
            },
            G37: function () {
                closeCurrentPath();
                isInRegion = false;
            },
            G54: ignore,
            G55: ignore,
            G70: ignore,
            G71: ignore,
            G74: function () {
                isInMultiquadrant = false;
            },
            G75: function () {
                isInMultiquadrant = true;
            },
            G90: ignore,
            G91: ignore
        };

        function currentApertureAtPoint(point) {
            return currentAperture.poly.map(function (poly) {
                return poly.map(function (vertex) {
                    return new util.Point(vertex.X + point.x, vertex.Y + point.y).round();
                });
            });
        }

        var currentPath = [currentPoint];

        function closeCurrentPath() {
            if (currentPath.length > 1)
                if (!isInRegion) {
                    //there is a strange behavior in clipper, if the start and end pattern overlap (very short segment), it makes a lens hole in the track
                    //so we re-unionize the ends.
                    tracks.pushObjects(union(clipper.Clipper.MinkowskiSum(currentAperture.poly[0], [currentPath], clipper.PolyFillType.pftEvenOdd, false)
                        .concat(currentPath.map(function (point) {
                            return currentApertureAtPoint(point)[0];
                        })), clipper.PolyFillType.pftNonZero));
                } else
                    areas.pushObjects(fixOrientations([currentPath]));
            currentPath = [currentPoint.round()];
        }

        function pushPoint(x, y, i, j, dCode) {
            var nextPoint = new util.Point(isNaN(x) ? currentPoint.x : x, isNaN(y) ? currentPoint.y : y);
            i = isNaN(i) ? 0 : i;
            j = isNaN(j) ? 0 : j;
            var moving = !(isNaN(x) && isNaN(y));
            if (dCode === 1) {
                if (moving) {
                    if (currentInterpolationMode == 'G01')
                        currentPath.push(nextPoint.round());
                    else {
                        var sqRadius = new util.Point(i, j).sqDistance();
                        var center, aEnd, aStart;
                        if (isInMultiquadrant) {
                            center = currentPoint.add(new util.Point(i, j));
                            aEnd = Math.atan2(nextPoint.y - center.y, nextPoint.x - center.x);
                            aStart = Math.atan2(currentPoint.y - center.y, currentPoint.x - center.x);
                            aEnd = aEnd >= 0 ? aEnd : aEnd + Math.PI * 2;
                            aStart = aStart >= 0 ? aStart : aStart + Math.PI * 2;
                            aStart = currentInterpolationMode == 'G02' && aStart < aEnd ? aStart + Math.PI * 2 : aStart;
                            aEnd = currentInterpolationMode == 'G03' && aEnd < aStart ? aEnd + Math.PI * 2 : aEnd;
                        } else {
                            var candidates = [currentPoint.add(new util.Point(i, j)), currentPoint.add(new util.Point(-i, j)),
                                currentPoint.add(new util.Point(-i, -j)), currentPoint.add(new util.Point(i, -j))];
                            candidates.sort(function (candidate) {
                                return nextPoint.sqDistance(candidate) - sqRadius;
                            });
                            for (var k = 0; k < candidates.length; k++) {
                                center = candidates[k];
                                aEnd = Math.atan2(nextPoint.y - center.y, nextPoint.x - center.x);
                                aStart = Math.atan2(currentPoint.y - center.y, currentPoint.x - center.x);
                                aEnd = aEnd >= 0 ? aEnd : aEnd + Math.PI * 2;
                                aStart = aStart >= 0 ? aStart : aStart + Math.PI * 2;
                                aStart = currentInterpolationMode == 'G02' && aStart < aEnd ? aStart + Math.PI * 2 : aStart;
                                aEnd = currentInterpolationMode == 'G03' && aEnd < aStart ? aEnd + Math.PI * 2 : aEnd;
                                var angle = aEnd - aStart;
                                if (Math.abs(angle) < Math.PI / 2)
                                    break;
                            }
                        }
                        var radius = center.distance(nextPoint);
                        var steps = 40;
                        for (var l = 0; l <= steps; l++) {
                            var pos = aStart + (aEnd - aStart) / steps * l;
                            currentPath.push(center.add(new util.Point(Math.cos(pos), Math.sin(pos)).scale(radius)).round());
                        }
                        currentPath.push(nextPoint.round());
                    }
                }
            }
            currentPoint = nextPoint;
            if (dCode === 2) {
                closeCurrentPath();
            } else if (dCode === 3) {
                closeCurrentPath();
                var e = currentApertureAtPoint(nextPoint.round());
                flashes.pushObjects(e);
            }
        }

        function parseCommand(command) {
            var parser = firstLetterDict[command[0]];
            if (!parser) {
                var res = command.split(interpolationRegex);
                var gcode = res[1];
                var movement = null;
                if (gcode) {
                    movement = res[2];
                    var handlers = gcodes[gcode];
                    if (handlers)
                        handlers();
                    else
                        console.log('G', gcode, handlers);
                } else
                    movement = res[0];
                var res2 = movement.split(dCodeRegex);
                var dCode = parseFloat(res2[1]);
                if (dCode >= 10) {
                    closeCurrentPath();
                    currentAperture = aperturesTable[dCode];
                    return;
                }
                if (isNaN(dCode))
                    return;
                var res3 = displacementRegex.exec(res2[0]);
                pushPoint(coordinateParser(res3[1]), coordinateParser(res3[2]), coordinateParser(res3[3]), coordinateParser(res3[4]), dCode);
            } else
                return parser(command);
        }

        function toPathDef() {
            return cam.clipperToPathDef(currentLayer);
        }

        gerberText = gerberText.replace(newLinesRegex, '');
        var commentLessFragments = gerberText.split(commentRegex);
        for (var i = 0; i < commentLessFragments.length; i++) {
            var fragment = commentLessFragments[i];
            if (fragment.length == 0)
                continue;
            var res = fragment.split(extendedInstructionRegex);
            //ok, now res is a mix of [normalInst*normalInst*, %extended, %extended, normalInst*normalInst*]
            for (i = 0; i < res.length; i++) {
                fragment = res[i];
                if (fragment.length == 0)
                    continue;
                var commands;
                if (fragment[0] == '%')
                    commands = [fragment.substring(1)];
                else
                    commands = fragment.split('*');
                for (var j = 0; j < commands.length; j++)
                    if (commands[j].length) {
                        var items = parseCommand(commands[j]);
                        if (items)
                            parseCommand(items);
                    }
            }
        }
        collectCurrentWork();
        return toPathDef();
    }
});