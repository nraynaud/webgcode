"use strict";
function createFixturePlate(machine) {
    var toolDiameter = 3;
    var toolRadius = toolDiameter / 2;

    var plugHole = machine.createOutline('M40,25' + createRelativeRectangle(-15.5, 15.5));
    var cornerHoles = machine.drillCorners(plugHole);
    machine.registerToolPathArray(cornerHoles);


    var plugHoleToolPath = machine.contouring(plugHole, toolRadius, true, true);
    machine.registerToolPathArray(plugHoleToolPath);

    var spindleRadius = 65.5 / 2;
    var circle = machine.createOutline(createCircle(47 + spindleRadius, 40, spindleRadius));
    var circleToolPath = machine.contouring(circle, toolRadius, true, true);
    machine.registerToolPathArray(circleToolPath);

    var rectangle = machine.createOutline('M0,0' + createRelativeRectangle(120, 80));
    var rectangleToolPath = machine.contouring(rectangle, toolRadius, false, true);
    machine.registerToolPathArray(rectangleToolPath);

    var travelZ = 10;
    var workZ = -5;

    machine.setParams(workZ, travelZ, 500);
}

function createZFixture(machine) {
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
    var rectangle = machine.createOutline('M0,0' + shape);
    var contours = machine.contouring(rectangle, toolRadius, false, false);
    var toolPath = machine.rampToolPath(contours[0], 0, workZ, 5);
    machine.registerToolPath(toolPath);
    machine.setParams(workZ, travelZ, 500);
}

function createFrontPowerPlate(machine) {
    var toolDiameter = 5.5;
    var toolRadius = toolDiameter / 2;
    var stockThickness = 19;
    var travelZ = 5;
    var workZ = -19;

    machine.setParams(workZ, travelZ, 500);
    var plateWidth = 155;
    var plateHeight = 75;

    var switchWidth = 22;
    var switchHeight = 29;

    var switchTopMargin = 11;

    var plugHeight = 20.6;
    var plugWidth = 28.5;

    var plugCenterX = 40;

    var plugSwitchSeparation = 2;

    function cornerForCenter(centerCoord, width) {
        return centerCoord - width / 2;
    }

    var plateOutline = machine.createOutline('M0,0' + createRelativeRectangle(plateWidth, plateHeight));
    var switchBottom = plateHeight - switchTopMargin - switchHeight;
    var switchOutline = machine.createOutline('M' + cornerForCenter(plugCenterX, switchWidth) + ',' + switchBottom + createRelativeRectangle(switchWidth, switchHeight));
    var plugBottom = switchBottom - plugSwitchSeparation - plugHeight;
    var plugOutline = machine.createOutline('M' + cornerForCenter(plugCenterX, plugWidth) + ',' + plugBottom + createRelativeRectangle(plugWidth, plugHeight));

    function makeToolPath(outline, inside) {
        var toolpath = machine.rampToolPath(machine.contouring(outline, toolRadius, inside, false)[0], 0, workZ, 3);
        machine.registerToolPath(toolpath);

    }

    makeToolPath(switchOutline, true);
    makeToolPath(plugOutline, true);
    makeToolPath(plateOutline, false);
}