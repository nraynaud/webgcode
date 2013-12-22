"use strict";

var box2 = (function () {

    var plankThickness = 5;
    var wallThickness = 10;
    var outLength = 150;
    var outWidth = 90;
    var bottomWallThickness = 3;
    var bottomPlankThickness = 4.20;

    var cornerRadius = 3.14;

    function createWallSlice(machine) {
        var toolDiameter = 3;
        var toolRadius = toolDiameter / 2;
        var outsideShape = geom.op('M', 0, 0) + geom.createRelativeRectangle(outWidth, outLength);
        var insideShape = geom.op('M', wallThickness, wallThickness) + geom.createRelativeRectangle(outWidth - 2 * wallThickness, outLength - 2 * wallThickness);
        var outsideOutline = machine.filletWholePolygon(machine.createOutline(outsideShape), cornerRadius);
        var insideOutline = machine.filletWholePolygon(machine.createOutline(insideShape), cornerRadius);
        machine.createOutline(geom.createCircle(-3, 3, 3));
        machine.setParams(-10, 10, 900);
        machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(outsideOutline, toolRadius, false, false), -0, -plankThickness, 1));
        //machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(insideOutline, toolRadius, true, false), -0, -plankThickness, 4));
    }

    function createBottomWall(machine) {
        var toolDiameter = 3;
        var toolRadius = toolDiameter / 2;
        var outsideShape = geom.op('M', 0, 0) + geom.createRelativeRectangle(outWidth, outLength);
        var insideShape = geom.op('M', wallThickness, wallThickness) + geom.createRelativeRectangle(outWidth - 2 * wallThickness, outLength - 2 * wallThickness);
        var outsideOutline = machine.filletWholePolygon(machine.createOutline(outsideShape), cornerRadius);
        var insideOutline = machine.filletWholePolygon(machine.createOutline(insideShape), cornerRadius);

        var bottomWallShape = geom.op('M', bottomWallThickness, bottomWallThickness) + geom.createRelativeRectangle(outWidth - 2 * bottomWallThickness, outLength - 2 * bottomWallThickness);
        var bottomWallOutline = machine.filletWholePolygon(machine.createOutline(bottomWallShape), cornerRadius);
        machine.setParams(-bottomPlankThickness, 10, 900);
        machine.registerToolPathArray(machine.contouring(bottomWallOutline, toolRadius, true, true));
    }

    function createBoxFloor(machine) {
        var toolDiameter = 3;
        var toolRadius = toolDiameter / 2;
        var floorShape = geom.op('M', -outWidth + bottomWallThickness, bottomWallThickness) + geom.createRelativeRectangle(outWidth - 2 * bottomWallThickness, outLength - 2 * bottomWallThickness);
        var bottomWallOutline = machine.filletWholePolygon(machine.createOutline(floorShape), cornerRadius);
        machine.setParams(-bottomPlankThickness, 10, 900);
        machine.registerToolPathArray(machine.contouring(bottomWallOutline, toolRadius, false, false));
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

    function testFont(machine, whenDone) {
        opentype.load('webapp/libs/fonts/miss_fajardose/MissFajardose-Regular.ttf', function (err, font) {
            var path = font.getPath('Test');
            var res = '';
            for (var i = 0; i < path.commands.length; i++) {
                var command = path.commands[i];
                res += ' ' + command.type;
                if (command.type == 'M' || command.type == 'L')
                    res += ' ' + command.x + ',' + -command.y;
                else if (command.type == 'Q')
                    res += command.x1 + ',' + -command.y1 + ' ' + command.x + ',' + -command.y;
                else if (command.type == 'C')
                    res += command.x1 + ',' + -command.y1 + ' ' + command.x2 + ',' + -command.y2
                        + ' ' + command.x + ',' + -command.y;
            }
            var poly = machine.toClipper(machine.createOutline(res));
            poly = machine.polyOp(poly, [], ClipperLib.ClipType.ctUnion);
            machine.setParams(-19, 10, 1000);
            machine.registerToolPathArray(machine.fromClipper(machine.contourClipper(poly, 0.1, true)));
            whenDone();
        });
    }

    return {createWallSlice: createWallSlice,
        drillStructuralHoles: drillStructuralHoles,
        createBottomWall: createBottomWall,
        createBoxFloor: createBoxFloor,
        testFont: testFont
    };
})();
