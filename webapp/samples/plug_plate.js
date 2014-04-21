"use strict";
var plugPlate = (function () {
    var toolRadius = 3;

    var holeDiameter = 15.70;
    var flatsSeparations = 14.50;

    var holePatternSeparation = 25;
    var holeCount = 1;
    var holeBottom = 4;
    var holesCenters = [];

    for (var i = 0; i < holeCount; i++)
        holesCenters.push({x: 0, y: i * holePatternSeparation});

    function drillHoles(machine) {
        machine.setParams(-10, 10, 600);
        $.each(holesCenters, function (i, hole) {
            machine.registerToolPath(machine.peckDrill(hole.x, hole.y, holeBottom, 5, 1));
        });
        machine.peckDrill()
    }

    function createShape(x, y, machine) {
        var circle = geom.createCircle(x, y, holeDiameter / 2);
        var rectangle = geom.op('M', x - flatsSeparations / 2, y - holeDiameter) + geom.createRelativeRectangle(flatsSeparations, holeDiameter * 2);

        machine.setParams(-3, 10, 600);
        machine.createOutline(rectangle);
        var clipperCircle = machine.toClipper(machine.createOutline(circle), null);
        var clipperRectangle = machine.toClipper(machine.createOutline(rectangle), null);
        var polygon = machine.polyOp(clipperCircle, clipperRectangle, ClipperLib.ClipType.ctIntersection);
        polygon = machine.contourClipper(polygon, toolRadius, true);
        machine.registerToolPathArray(machine.rampToolPathArray(machine.fromClipper(polygon, true, machine.contourAreaPositive(true, false)), 0, -4, 2));
    }

    function makeShape(machine) {
        $.each(holesCenters, function (i, hole) {
            createShape(hole.x, hole.y, machine);
        });
    }

    function createZLimitSwitchPusher(machine) {
        var ySpan = 9.5;
        var xSpan = 25;
        var circleRadius = ySpan / 2;

        var toolDiameter = 4;
        var toolRadius = toolDiameter / 2;

        function createBracket(machine) {
            var op = geom.op;
            var shape = machine.createOutline(op('M', 0, 0) + op('l', xSpan, 0)
                + 'a ' + circleRadius + ',' + circleRadius + ' 0 0 1 0,' + ySpan + op('l', -xSpan, 0) + 'Z');
            machine.setParams(-3.1, 5, 300);
            var contour = machine.contouring(shape, toolRadius, false, true);
            machine.registerToolPathArray(machine.rampToolPathArray(contour, 0, -3.1, 6));
        }

        createBracket(machine);
    }

    function createZLimitSwitchBracket(machine) {
        var xSpan = 17;
        var ySpan = 55;
        var stockThickness = 3.1;

        var cornerRadius = 2;
        var toolDiameter = 4;
        var toolRadius = toolDiameter / 2;

        var shape = machine.filletWholePolygon(machine.createOutline(geom.op('M', 0, 0) + geom.createRelativeRectangle(xSpan, ySpan)), cornerRadius);
        var contour = machine.contouring(shape, toolRadius, false, true);
        machine.setParams(-stockThickness, 5, 300);
        machine.registerToolPathArray(machine.rampToolPathArray(contour, 0, -stockThickness, 6));
    }

    return {drillHoles: drillHoles, makeShape: makeShape};
})();