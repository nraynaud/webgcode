"use strict";
var plugPlate = (function () {
    var toolRadius = 2;

    var holeDiameter = 15.70;
    var flatsSeparations = 14.75;

    var holePatternSeparation = 25;
    var holeCount = 4;
    var holeBottom = 4;
    var holesCenters = [];

    for (var i = 1; i < holeCount; i++)
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

        machine.setParams(-3, 10, 280);
        machine.createOutline(rectangle);
        var clipperCircle = machine.toClipper(machine.createOutline(circle), null);
        var clipperRectangle = machine.toClipper(machine.createOutline(rectangle), null);
        var polygon = machine.polyOp(clipperCircle, clipperRectangle, ClipperLib.ClipType.ctIntersection);
        polygon = machine.contourClipper(polygon, toolRadius, true);
        machine.registerToolPathArray(machine.rampToolPathArray(machine.fromClipper(polygon, true, machine.contourAreaPositive(true, false)), 0, -3, 12));
    }

    function makeShape(machine) {
        $.each(holesCenters, function (i, hole) {
            createShape(hole.x, hole.y, machine);
        });
    }

    return {drillHoles: drillHoles, makeShape: makeShape};
})();