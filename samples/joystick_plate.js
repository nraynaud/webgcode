"use strict";
function createFixturePlate(paper) {
    var toolDiameter = 3;
    var toolRadius = toolDiameter / 2;

    var plugHole = createOutline('M40,25' + createRelativeRectangle(-15.5, 15.5));
    var cornerHoles = drillCorners(plugHole);

    var plugHoleToolPath = contouring(plugHole, toolRadius, true, true);
    showClipperPolygon(paper, plugHoleToolPath, 'blue');

    var spindleRadius = 65.5 / 2;
    var circle = createOutline(createCircle(47 + spindleRadius, 40, spindleRadius));
    var circleToolPath = contouring(circle, toolRadius, true, true);
    showClipperPolygon(paper, circleToolPath, 'blue');

    var rectangle = createOutline('M0,0' + createRelativeRectangle(120, 80));
    var rectangleToolPath = contouring(rectangle, toolRadius, false, true);
    showClipperPolygon(paper, rectangleToolPath, 'blue');

    var ops = cornerHoles.concat([plugHoleToolPath, circleToolPath, rectangleToolPath]);
    var travelZ = 10;
    var workZ = -5;
    return createGCode(workZ, travelZ, ops);
}

function createZFixture(paper) {
    var toolDiameter = 3.2;
    var toolRadius = toolDiameter / 2;
    var stockThickness = 19;
    var travelZ = 10;
    var workZ = -19;
    var length = 43;
    var width = 40;
    var grooveToSide = 11.5;
    var grooveDepth = 5.5;

    function lineTo(x, y) {
        return  'l' + x + ',' + y;
    }

    var shape = lineTo(0, grooveToSide) + lineTo(4, 0) + lineTo(0, width - 2 * grooveToSide) + lineTo(-4, 0) +
        lineTo(0, grooveToSide) + lineTo(length, 0) + lineTo(0, -width) + 'z';
    var rectangle = createOutline('M0,0' + shape);
    var rectangleToolPath = contouring(rectangle, toolRadius, false, false);

    showClipperPolygon(paper, rectangleToolPath, 'blue');
    return rampToolPath(rectangleToolPath, 0, workZ, 5, travelZ);
}