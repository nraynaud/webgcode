function filterPath(path, stepSize) {
    "use strict";
    var newPath = [];
    var previousPoint = null;
    $.each(path, function (_, point) {
        point.dx = Math.round((point.x - (previousPoint ? previousPoint.x : 0)) / stepSize);
        point.dy = Math.round((point.y - (previousPoint ? previousPoint.y : 0)) / stepSize);
        point.dz = Math.round((point.z - (previousPoint ? previousPoint.z : 0)) / stepSize);
        if (point.dx != 0 || point.dy != 0 || point.dz != 0) {
            newPath.push(point);
            previousPoint = point;
        }
    });
    return newPath;
}

function unaryOp(input, op) {
    var result = {};
    $.each(AXES, function (_, coord) {
        result[coord] = op(input[coord]);
    });
    return result;
}
function rasterizeLine(line, stepSize) {
    function findBiggestAxis(dv) {
        var max = -Infinity;
        var biggestAxis;
        $.each(AXES, function (_, axis) {
            var l = Math.abs(dv[axis]);
            if (l > max) {
                max = l;
                biggestAxis = axis;
            }
        });
        return biggestAxis;
    }


    function binaryOp(i1, i2, op) {
        var result = {};
        $.each(['x', 'y', 'z'], function (_, coord) {
            result[coord] = op(i1[coord], i2[coord]);
        });
        return result;
    }

    function clampToGrid(val) {
        return Math.round(val / stepSize) * stepSize;
    }

    var dv = binaryOp(line.to, line.from, function (i1, i2) {
        return i1 - i2;
    });
    line.dv = dv;
    var a = findBiggestAxis(dv);
    var path = [];
    var steps = Math.abs(Math.round(line.to[a] / stepSize) - Math.round(line.from[a] / stepSize));
    var previousPoint = null;
    for (var i = 0; i <= steps; i++) {
        var ratio = i / steps;
        var point = binaryOp(line.from, line.to, function (from, to) {
            return clampToGrid((from * (steps - i) + to * i) / steps);
        });
        point.l = ratio;
        path.push(point);
        previousPoint = point;
    }
    return filterPath(path, stepSize);
}

function rasterizeArc(arc, stepSize) {
    function clampToGrid(val) {
        return Math.round(val / stepSize) * stepSize;
    }

    var path = [];
    var arcSteps = Math.ceil(arc.radius * Math.abs(arc.angularDistance) / stepSize);
    var startPoint = COMPONENT_TYPES.arc.pointAtRatio(arc, 0, true);
    var endPoint = COMPONENT_TYPES.arc.pointAtRatio(arc, 1, true);
    var linearSteps = Math.ceil(Math.abs(endPoint[arc.plane.lastCoord] - startPoint[arc.plane.lastCoord]) / stepSize);
    var steps = Math.max(arcSteps, linearSteps);
    console.log('steps', steps);
    var previousPoint = null;
    for (var i = 0; i <= steps; i++) {
        var ratio = i / steps;
        var point = COMPONENT_TYPES.arc.pointAtRatio(arc, ratio);
        point = {x: point[0], y: point[1], z: point[2]};
        point = unaryOp(point, clampToGrid);
        point.l = ratio;
        path.push(point);
        previousPoint = point;
    }
    return filterPath(path, stepSize);
}