"use strict";

define(function () {
    function sideWithJoin(len, dx, dy, tailWidth, tailHeight, tailSpread) {
        function op(l, x, y) {
            return  l + x + ',' + y;
        }

        var tailOverHang = (tailSpread - tailWidth) / 2;
        var rotMat = [
            [dx, -dy],
            [dy, dx]
        ];

        function rotate(x, y) {
            return [rotMat[0][0] * x + rotMat[0][1] * y, rotMat[1][0] * x + rotMat[1][1] * y];
        }

        var tail = [
            rotate(-tailOverHang, -tailHeight),
            rotate(tailSpread, 0),
            rotate(-tailOverHang, tailHeight)
        ];
        var tailText = '';
        $.each(tail, function (_, line) {
            tailText += op('l', line[0], line[1]);
        });
        var straightSpan = (len - tailWidth) / 2;
        return op('l', straightSpan * dx, straightSpan * dy)
            + tailText
            + op('l', straightSpan * dx, straightSpan * dy);
    }

    function createJoinTestSystem(machine) {
        var toolDiameter = 1.5;
        var toolRadius = toolDiameter / 2;

        function crateJoiningShape(xSpan, ySpan, direction) {
            function op(l, x, y) {
                return  l + x + ',' + y;
            }

            var tailWidth = 3;
            var tailHeight = direction * 5;
            var tailSpread = 8;

            return sideWithJoin(xSpan / 3, 1, 0, tailWidth, tailHeight, tailSpread) + sideWithJoin(xSpan / 3, 1, 0, tailWidth, tailHeight, tailSpread) + sideWithJoin(xSpan / 3, 1, 0, tailWidth, tailHeight, tailSpread)
                + op('l', 0, ySpan)
                + sideWithJoin(xSpan, -1, 0, tailWidth, tailHeight, tailSpread)
                + op('l', 0, -ySpan)
                + 'z';
        }

        function createShape(joinOrientation, x, y) {
            var definition = 'M' + x + ',' + y + crateJoiningShape(45, 20, joinOrientation);
            var outline = machine.createOutline(definition).attr({id: 'outline'});
            machine.filletWholePolygon(outline, 1.5);
            var rectangleToolPath = machine.contouring(outline, toolRadius, false, false);
            showClipperPolygon(machine.paper, rectangleToolPath, 'blue');
            return rectangleToolPath;
        }

        machine.registerToolPathArray(createShape(1, 0, 0));
        machine.registerToolPathArray(createShape(-1, 50, 0));
        var travelZ = 5;
        var workZ = -5;
        machine.setParams(workZ, travelZ, 600);
    }

    function drillBar(machine) {
        var toolDiameter = 3;
        var toolRadius = toolDiameter / 2;
        var travelZ = 5;
        var workZ = -5;

        function peckDrill(x, y, z, topZ, steps) {
            var polyline = new GeneralPolylineToolpath();
            for (var i = 1; i <= steps; i++) {
                polyline.pushPoint(x, y, topZ);
                polyline.pushPoint(x, y, topZ - (topZ - z) * i / steps);
            }
            return polyline;
        }

        machine.setParams(workZ, travelZ, 3000);

        for (var i = 1; i < 2; i++) {
            machine.registerToolPath(peckDrill(0, -i * 4, -43, 0, 3));
        }
    }

    function surfaceBar(machine) {
        var toolDiameter = 7;
        var toolRadius = toolDiameter / 2;
        var travelZ = 30;
        var workZ = 15;

        machine.setParams(workZ, travelZ, 3000);

        var width = 53;
        var height = 175;
        var stepOver = 0.8;

        var startZ = -6;
        var stopZ = -6;
        var zStep = 1;

        var toolPath = [];
        var absoluteStepOver = toolDiameter * stepOver;
        var startY = toolRadius - absoluteStepOver;
        var stopY = height - toolRadius + absoluteStepOver;

        for (var z = startZ; z >= stopZ; z -= zStep) {
            var direction = 1;
            var line = new GeneralPolylineToolpath();
            for (var x = toolRadius - absoluteStepOver; x <= width - toolRadius + absoluteStepOver; x += toolDiameter * (1 - stepOver)) {
                var from = direction > 0 ? startY : stopY;
                var to = direction > 0 ? stopY : startY;
                line.pushPoint(x, from, z);
                line.pushPoint(x, to, z);
                direction *= -1;
            }
            toolPath.push(line);
            console.log(line);
        }
        machine.registerToolPathArray(toolPath);
    }

    var wallThickness = 8;
    var tenonsWidth = 5;
    var wallHeight = 55;
    var shortWallLength = 102;

    function createShortWall(workZ) {
        function op(l, x, y) {
            return  l + x + ',' + y;
        }

        var toolDiameter = 2;
        var toolRadius = toolDiameter / 2;
        var travelZ = 35;
        machine.setParams(workZ, travelZ, 600);

        var width = shortWallLength;
        var length = wallHeight;

        var grooveDepth = wallThickness;
        var groovewidth = tenonsWidth;
        var bottomMarginBeforeGrooves = 6;
        var topMarginBeforeGrooves = 7;

        function endShape(xDirection) {
            var newLength = length - bottomMarginBeforeGrooves - topMarginBeforeGrooves + groovewidth;
            var number = Math.floor(newLength / (groovewidth * 2));
            var l = number * groovewidth * 2;
            var rest = newLength - l;
            var path = '';
            for (var i = 0; i < number; i++)
                path += sideWithJoin(l / number, xDirection, 0, groovewidth, grooveDepth, groovewidth);
            var topMargin = op('l', (topMarginBeforeGrooves - groovewidth / 2) * xDirection, 0) + op('l', rest * xDirection, 0);
            var bottomMargin = op('l', (bottomMarginBeforeGrooves - groovewidth / 2) * xDirection, 0);
            if (xDirection > 0)
                path = topMargin + path + bottomMargin;
            else
                path = bottomMargin + path + topMargin;
            return  path;
        }

        function createSlab(xSpan, ySpan) {
            var margin = 7;
            var xSign, xStart, ySign, yStart;
            if (xSpan < 0) {
                xSign = -1;
                xStart = length;
            } else {
                xSign = 1;
                xStart = 0;
            }
            if (ySpan < 0) {
                ySign = -1;
                yStart = width;
            } else {
                ySign = 1;
                yStart = 0;
            }
            var xMargin = xSign * margin;
            var yMargin = ySign * margin;
            var slabOutline = geom.createRelativeRectangle(xSpan + xMargin, ySpan + yMargin);
            return machine.createOutline(op('M', xStart - xMargin, yStart) + slabOutline, 'rgb(255,200,200)');
        }

        var shape = 'l0,' + width + endShape(1) + 'l0,' + (-width) + endShape(-1) + 'z';
        var outline = machine.createOutline('M0,0' + shape);
        var clipperOutline = machine.toClipper(outline);

        function createRectangleOfInterest(yDir) {
            var yStart = (yDir < 0 ? width : 0) + yDir * -5;
            return machine.createOutline(op('M', -5, yStart) + geom.createRelativeRectangle(length + 10, (grooveDepth + 10) * yDir), 'rgb(255,200,200)');
        }

        var rectangleOfInterest1 = machine.toClipper(createRectangleOfInterest(1))[0];
        var rectangleOfInterest2 = machine.toClipper(createRectangleOfInterest(-1))[0];
        var slabs = [
            [topMarginBeforeGrooves * 0.9, grooveDepth],
            [topMarginBeforeGrooves * 0.9, -grooveDepth],
            [-bottomMarginBeforeGrooves * 0.9, grooveDepth],
            [-bottomMarginBeforeGrooves * 0.9, -grooveDepth]
        ];

        slabs = $.map(slabs, function (slabDef, _) {
            return machine.toClipper(createSlab(slabDef[0], slabDef[1]));
        });
        var slabbedOutline = machine.polyOp(clipperOutline, slabs, ClipperLib.ClipType.ctUnion);
        var diff1 = machine.polyOp([rectangleOfInterest1, rectangleOfInterest2], slabbedOutline, ClipperLib.ClipType.ctDifference);
        return machine.contouring(outline, toolRadius, false, false);
    }

    function boxLongWall(machine) {
        function op(l, x, y) {
            return  l + x + ',' + y;
        }

        var toolDiameter = 2;
        var toolRadius = toolDiameter / 2;
        var travelZ = 35;
        var workZ = -9.5;
        machine.setParams(workZ, travelZ, 600);

        var width = 152;
        var length = wallHeight;

        var grooveDepth = -wallThickness;
        var groovewidth = tenonsWidth;
        var bottomMarginBeforeGrooves = 6;
        var topMarginBeforeGrooves = 7;

        function endShape(xDirection) {
            var newLength = length - bottomMarginBeforeGrooves - topMarginBeforeGrooves + groovewidth;
            var number = Math.floor(newLength / (groovewidth * 2));
            var l = number * groovewidth * 2;
            var rest = newLength - l;
            var path = '';
            for (var i = 0; i < number; i++)
                path += sideWithJoin(l / number, xDirection, 0, groovewidth, grooveDepth, groovewidth);
            var topMargin = op('l', (topMarginBeforeGrooves - groovewidth / 2) * xDirection, 0) + op('l', rest * xDirection, 0);
            var bottomMargin = op('l', (bottomMarginBeforeGrooves - groovewidth / 2) * xDirection, 0);
            if (xDirection > 0)
                path = topMargin + path + bottomMargin;
            else
                path = bottomMargin + path + topMargin;
            return  path;
        }

        function createSlab(xSpan, ySpan) {
            var margin = 7;
            var xSign, xStart, ySign, yStart;
            if (xSpan < 0) {
                xSign = -1;
                xStart = length;
            } else {
                xSign = 1;
                xStart = 0;
            }
            if (ySpan < 0) {
                ySign = -1;
                yStart = width;
            } else {
                ySign = 1;
                yStart = 0;
            }
            var xMargin = xSign * margin;
            var yMargin = ySign * margin;
            var slabOutline = geom.createRelativeRectangle(xSpan + xMargin, ySpan + yMargin);
            return machine.createOutline(op('M', xStart - xMargin, yStart) + slabOutline, 'rgb(255,200,200)');
        }

        var shape = 'l0,' + width + endShape(1) + 'l0,' + (-width) + endShape(-1) + 'z';
        var outline = machine.createOutline('M0,0' + shape);
        var clipperOutline = machine.toClipper(outline);

        function createRectangleOfInterest(yDir) {
            var yStart = (yDir < 0 ? width : 0) + yDir * (grooveDepth - 5);
            return machine.createOutline(op('M', -5, yStart) + geom.createRelativeRectangle(length + 10, (-grooveDepth + 10) * yDir), 'rgb(255,200,200)');
        }

        var rectangleOfInterest1 = machine.toClipper(createRectangleOfInterest(1))[0];
        var rectangleOfInterest2 = machine.toClipper(createRectangleOfInterest(-1))[0];
        var slabs = [
            [topMarginBeforeGrooves * 0.9, grooveDepth],
            [topMarginBeforeGrooves * 0.9, -grooveDepth],
            [-bottomMarginBeforeGrooves * 0.9, grooveDepth],
            [-bottomMarginBeforeGrooves * 0.9, -grooveDepth]
        ];

        slabs = $.map(slabs, function (slabDef, _) {
            return machine.toClipper(createSlab(slabDef[0], slabDef[1]));
        });
        var slabbedOutline = machine.polyOp(clipperOutline, slabs, ClipperLib.ClipType.ctUnion);
        var diff1 = machine.polyOp([rectangleOfInterest1, rectangleOfInterest2], slabbedOutline, ClipperLib.ClipType.ctDifference);
        return machine.contouring(outline, toolRadius, false, false);

    }

    function allWalls(machine) {
        var workZ = -11;
        var rampTurns = 6;
        $.each(createShortWall(0, 0, workZ), function (_, polygon) {
            var fragment = machine.rampToolPath(polygon, 0, workZ, rampTurns);
            machine.registerToolPath(fragment);
            // machine.registerToolPath(fragment.translated(wallHeight + 15, 0, 0));
        });

        $.each(boxLongWall(machine), function (_, polygon) {
            var fragment = machine.rampToolPath(polygon, 0, workZ, rampTurns);
            // machine.registerToolPath(fragment.translated(0, shortWallLength+20,0));
            // machine.registerToolPath(fragment.translated(wallHeight + 15, shortWallLength+20,0));
        });
    }

    function cut(machine) {
        var toolDiameter = 7;
        var toolRadius = toolDiameter / 2;
        var fromZ = -6;
        var toZ = -6;
        var step = -1;

        var travelZ = 30;


        machine.setParams(1, travelZ, 400);

        var toolPath = new GeneralPolylineToolpath();
        toolPath.pushPoint(0, 0, 0);
        toolPath.pushPoint(135, 0, 0);
        toolPath.pushPoint(135, -180, 0);
        toolPath.pushPoint(135 + 110, -180, 0);

        for (var z = fromZ; z >= toZ; z += step)
            machine.registerToolPath(toolPath.translated(0, 0, z));
    }

    return {
        cut: cut,
        allWalls: allWalls,
        boxLongWall: boxLongWall,
        surfaceBar: surfaceBar,
        createJoinTestSystem: createJoinTestSystem,
        drillBar: drillBar
    }
});