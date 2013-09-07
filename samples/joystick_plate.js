"use strict";
function createPlate(paper) {
    function createPath(d) {
        return paper.path(d, true).attr({'vector-effect': 'non-scaling-stroke', fill: 'none', stroke: 'red'});
    }

    var toolDiameter = 3;
    var toolRadius = toolDiameter / 2;
    var plugHole = createPath('M40,25l0,15.5l-15.5,0l0,-15.5z');
    var cornerHoles = drillCorners(plugHole);

    var plugHoleToolPath = contouring(plugHole, -toolRadius);
    showClipperPolygon(paper, plugHoleToolPath, 'blue');

    var circle = createPath(createCircle(47 + 65.5 / 2, 40, 65.5 / 2));
    var circleToolPath = contouring(circle, -toolRadius);
    showClipperPolygon(paper, circleToolPath, 'blue');

    var rectangle = createPath('M0,0L120,0L120,80L0,80Z');
    var rectangleToolPath = contouring(rectangle, toolRadius);
    showClipperPolygon(paper, rectangleToolPath, 'blue');

    var ops = cornerHoles.concat([plugHoleToolPath, circleToolPath, rectangleToolPath]);
    var travelZ = 10;
    var workZ = -5;
    return createGCode(workZ, travelZ, ops);
}