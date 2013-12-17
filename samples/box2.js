"use strict";

var box2 = (function () {

    var plankThickness = 20;
    var wallThickness = 10;
    var outLength = 150;
    var outWidth = 90;

    function createWallSlice(machine) {
        var toolDiameter = 6;
        var toolRadius = toolDiameter / 2;

        var cornerRadius = 3.14;

        var outsideShape = geom.op('M', 0, 0) + geom.createRelativeRectangle(outWidth, outLength);
        var insideShape = geom.op('M', wallThickness, wallThickness) + geom.createRelativeRectangle(outWidth - 2 * wallThickness, outLength - 2 * wallThickness);
        var outsideOutline = machine.filletWholePolygon(machine.createOutline(outsideShape), cornerRadius);
        var insideOutline = machine.filletWholePolygon(machine.createOutline(insideShape), cornerRadius);
        machine.createOutline(geom.createCircle(-3, 3, 3));
        machine.setParams(-10, 10, 800);
        machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(outsideOutline, toolRadius, false, false), 0, -plankThickness, 10));
        //machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(insideOutline, toolRadius, true, false), 0, -plankThickness, 6));
    }

    function drillStructuralHoles(machine) {
        var holeDepthInsupport = 7;
        var holeBottom = -plankThickness - holeDepthInsupport;
        machine.setParams(-19, 10, 1000);

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
    }

    return {createWallSlice: createWallSlice,
        drillStructuralHoles: drillStructuralHoles};
})();
