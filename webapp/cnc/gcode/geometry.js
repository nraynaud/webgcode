"use strict";
define(['cnc/util'], function (util) {
    function differentiator(stepCollector) {
        var previousPoint = null;
        return function (point) {
            if (previousPoint) {
                point.dx = point.x - previousPoint.x;
                point.dy = point.y - previousPoint.y;
                point.dz = point.z - previousPoint.z;
                if (point.dx != 0 || point.dy != 0 || point.dz != 0)
                    stepCollector(point);
            }
            previousPoint = point;
        };
    }

    function unaryOp(input, op) {
        var result = {};
        $.each(util.AXES, function (_, coord) {
            result[coord] = op(input[coord]);
        });
        return result;
    }

    function rasterizeLine(line, stepSize, stepCollector) {
        function findBiggestAxis(dv) {
            var max = -Infinity;
            var biggestAxis;
            $.each(util.AXES, function (_, axis) {
                var l = Math.abs(dv[axis]);
                if (l > max) {
                    max = l;
                    biggestAxis = axis;
                }
            });
            return biggestAxis;
        }

        function putOnGrid(val) {
            return Math.round(val / stepSize);
        }

        var fromStep = unaryOp(line.from, putOnGrid);
        var toStep = unaryOp(line.to, putOnGrid);

        function binaryOp(i1, i2, op) {
            var result = {};
            $.each(util.AXES, function (_, coord) {
                result[coord] = op(i1[coord], i2[coord]);
            });
            return result;
        }

        var dv = binaryOp(toStep, fromStep, function (i1, i2) {
            return i1 - i2;
        });
        line.dv = dv;
        var a = findBiggestAxis(dv);
        var steps = Math.abs(toStep[a] - fromStep[a]);
        var filter = differentiator(stepCollector);
        for (var i = 0; i <= steps; i++) {
            var ratio = i / steps;
            var point = binaryOp(fromStep, toStep, function (from, to) {
                return Math.round((from * (steps - i) + to * i) / steps);
            });
            point.l = ratio;
            filter(point);
        }
    }

    function rasterizeArc(arc, stepSize, stepCollector, pointAtRatio) {
        function clampToGrid(val) {
            return Math.round(val / stepSize);
        }

        var arcSteps = Math.ceil(arc.radius * Math.abs(arc.angularDistance) / stepSize);
        var startPoint = pointAtRatio(0);
        var endPoint = pointAtRatio(1);
        var linearSteps = Math.ceil(Math.abs(endPoint[arc.plane.lastCoord] - startPoint[arc.plane.lastCoord]) / stepSize);
        var steps = Math.max(arcSteps, linearSteps);
        var filter = differentiator(stepCollector);
        for (var i = 0; i <= steps; i++) {
            var ratio = i / steps;
            var point = pointAtRatio(ratio);
            point = unaryOp(point, clampToGrid);
            point.l = ratio;
            filter(point);
        }
    }

    return {
        rasterizeLine: rasterizeLine,
        rasterizeArc: rasterizeArc
    }
});
