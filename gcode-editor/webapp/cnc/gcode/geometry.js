"use strict";
define([], function () {
    function differentiator(stepCollector) {
        var previousPoint = null;
        return function (point, ratio) {
            if (previousPoint) {
                var dx = point.x - previousPoint.x;
                var dy = point.y - previousPoint.y;
                var dz = point.z - previousPoint.z;
                if (dx != 0 || dy != 0 || dz != 0)
                    stepCollector(dx, dy, dz, ratio);
            }
            previousPoint = point;
        };
    }

    function rasterizeLine(line, stepSize, stepCollector) {
        var fromStep = line.from.scale(1 / stepSize).round();
        var toStep = line.to.scale(1 / stepSize).round();
        var dv = toStep.sub(fromStep);
        line.dv = dv;
        var steps = Math.max(Math.abs(dv.x), Math.abs(dv.y), Math.abs(dv.z));
        var filter = differentiator(stepCollector);
        for (var i = 0; i <= steps; i++) {
            var ratio = i / steps;
            filter(fromStep.lerp(toStep, ratio).round(), ratio);
        }
    }

    function rasterizeArc(arc, stepSize, stepCollector, pointAtRatio) {
        var arcSteps = Math.ceil(arc.radius * Math.abs(arc.angularDistance) / stepSize);
        var startPoint = pointAtRatio(0);
        var endPoint = pointAtRatio(1);
        var linearSteps = Math.ceil(Math.abs(endPoint[arc.plane.lastCoord] - startPoint[arc.plane.lastCoord]) / stepSize);
        var steps = Math.max(arcSteps, linearSteps);
        var filter = differentiator(stepCollector);
        for (var i = 0; i <= steps; i++) {
            var ratio = i / steps;
            filter(pointAtRatio(ratio).scale(1 / stepSize).round(), ratio);
        }
    }

    return {
        rasterizeLine: rasterizeLine,
        rasterizeArc: rasterizeArc
    }
});
