"use strict";
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

        function sideWithJoin(len, dx, dy) {
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

        return sideWithJoin(xSpan / 3, 1, 0) + sideWithJoin(xSpan / 3, 1, 0) + sideWithJoin(xSpan / 3, 1, 0)
            + op('l', 0, ySpan)
            + sideWithJoin(xSpan, -1, 0)
            + op('l', 0, -ySpan)
            + 'z';
    }

    function createShape(joinOrientation, x, y) {
        var outline = machine.createOutline('M' + x + ',' + y + crateJoiningShape(45, 20, joinOrientation)).attr({id: 'outline'});
        var rectangle = machine.filletWholePolygon(outline, 1.5);
        outline.node.pathSegList.clear();
        rectangle[0].pushOnPath(outline);
        var rectangleToolPath = contouring(outline, toolRadius, false, false);
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
    var travelZ = 6;
    var workZ = -1;

    machine.setParams(workZ, travelZ, 3000);

    var width = 53;
    var height = 100;
    var stepOver = 0.2;

    var toolPath = [];
    var absoluteStepOver = toolDiameter * stepOver;
    var startY = toolRadius - absoluteStepOver;
    var stopY = height - toolRadius + absoluteStepOver;
    for (var x = toolRadius - absoluteStepOver; x <= width - toolRadius + absoluteStepOver; x += toolDiameter * (1 - stepOver)) {
        var line = new GeneralPolylineToolpath();
        line.pushPoint(x, startY, workZ);
        line.pushPoint(x, stopY, workZ);
        toolPath.push(line);
    }
    console.log(toolPath);
    machine.registerToolPathArray(toolPath);

}