"use strict";

var box2 = (function () {
    var plankThickness = 19;
    var wallThickness = 6;
    var outLength = 150;
    var outWidth = 90;
    var bottomWallThickness = 3;
    var bottomPlankThickness = 4.20;

    var toolDiameter = 3;
    var toolRadius = toolDiameter / 2;

    var cornerRadius = 3.14;

    function createOutlines(machine) {
        var outsideShape = geom.op('M', 0, 0) + geom.createRelativeRectangle(outWidth, outLength);
        var insideShape = geom.op('M', wallThickness, wallThickness) + geom.createRelativeRectangle(outWidth - 2 * wallThickness, outLength - 2 * wallThickness);
        var outsideOutline = machine.filletWholePolygon(machine.createOutline(outsideShape), cornerRadius);
        var insideOutline = machine.filletWholePolygon(machine.createOutline(insideShape), cornerRadius);
        return {outsideOutline: outsideOutline, insideOutline: insideOutline};
    }

    function createBottomOutline(machine) {
        var bottomWallShape = geom.op('M', bottomWallThickness, bottomWallThickness) + geom.createRelativeRectangle(outWidth - 2 * bottomWallThickness, outLength - 2 * bottomWallThickness);
        return machine.filletWholePolygon(machine.createOutline(bottomWallShape), cornerRadius);
    }

    function cutInnerWallAndBottomRecess(machine) {
        machine.setParams(-plankThickness, 10, 900);
        var outlines = createOutlines(machine);
        var bottomWallOutline = createBottomOutline(machine);
        machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(outlines.insideOutline, toolRadius, true, false), -0, -plankThickness, 4));
        machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(bottomWallOutline, toolRadius, true, true), -0, -bottomPlankThickness, 1));
    }

    function cutOuterWall(machine) {
        machine.setParams(-plankThickness, 10, 900);
        var outlines = createOutlines(machine);
        machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(outlines.outsideOutline, toolRadius, false, false), -0, -plankThickness, 4));
    }

    function createBoxFloor(machine) {
        var floorShape = geom.op('M', -outWidth + bottomWallThickness, bottomWallThickness) + geom.createRelativeRectangle(outWidth - 2 * bottomWallThickness, outLength - 2 * bottomWallThickness);
        var bottomWallOutline = machine.filletWholePolygon(machine.createOutline(floorShape), cornerRadius);
        machine.setParams(-bottomPlankThickness, 10, 900);
        machine.registerToolPathArray(machine.contouring(bottomWallOutline, toolRadius, false, false));
    }

    function drillStructuralHoles(machine) {
        var holeDepthInsupport = 7;
        var holeBottom = -plankThickness - holeDepthInsupport;
        machine.setParams(holeBottom, 10, 1000);

        function drillCenterWall(xRatio, yRatio) {
            var xMin = wallThickness / 2;
            var xSpan = outWidth - wallThickness;
            var yMin = wallThickness / 2;
            var ySpan = outLength - wallThickness;
            machine.registerToolPath(machine.peckDrill(xMin + xRatio * xSpan, yMin + yRatio * ySpan, holeBottom, 0, 3));
        }

        drillCenterWall(0, 0);
        drillCenterWall(1 / 2, 0);
        drillCenterWall(1, 0);
        drillCenterWall(1, 1 / 4);
        drillCenterWall(1, 2 / 4);
        drillCenterWall(1, 3 / 4);
        drillCenterWall(1, 1);
        drillCenterWall(1 / 2, 1);
        drillCenterWall(0, 1);
        drillCenterWall(0, 3 / 4);
        drillCenterWall(0, 2 / 4);
        drillCenterWall(0, 1 / 4);

        function drillCornerHole(xRatio, yRatio) {
            var margin = 4;
            var xMin = wallThickness + toolDiameter + margin;
            var yMin = wallThickness + toolDiameter + margin;
            var xSpan = outWidth - 2 * xMin;
            var ySpan = outLength - 2 * yMin;
            machine.registerToolPath(machine.peckDrill(xMin + xRatio * xSpan, yMin + yRatio * ySpan, holeBottom, 0, 2));
        }

        drillCornerHole(0, 0);
        drillCornerHole(1, 0);
        drillCornerHole(1, 1);
        drillCornerHole(0, 1);
    }

    return {
        cutInnerWallAndBottomRecess: cutInnerWallAndBottomRecess,
        cutOuterWall: cutOuterWall,
        drillStructuralHoles: drillStructuralHoles};
})();
