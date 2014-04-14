"use strict";

define(['cnc/simulation', 'cnc/parser'], function (simulation, parser) {
    function simulateGCode(code) {
        var simulatedPath = [];

        var totalTime = 0;
        var xmin = +Infinity, ymin = +Infinity, zmin = +Infinity;
        var xmax = -Infinity, ymax = -Infinity, zmax = -Infinity;

        function pushPoint(x, y, z, t) {
            totalTime = Math.max(t, totalTime);
            xmin = Math.min(x, xmin);
            ymin = Math.min(y, ymin);
            zmin = Math.min(z, zmin);
            xmax = Math.max(x, xmax);
            ymax = Math.max(y, ymax);
            zmax = Math.max(z, zmax);
            simulatedPath.push(x, y, z);
        }

        var errors = [];
        var toolPath = parser.evaluate(code, null, null, null, errors);
        var map = [];
        for (var i = 0; i < toolPath.length; i++) {
            var segment = toolPath[i];
            if (segment.type == 'line')
                map[segment.lineNo] = [segment.from, segment.to];
            else {
                var tolerance = 0.05;
                var steps = Math.PI / Math.acos(1 - tolerance / segment.radius) * Math.abs(segment.angularDistance) / (Math.PI * 2);
                var points = [];
                for (var j = 0; j <= steps; j++)
                    points.push(simulation.COMPONENT_TYPES['arc'].pointAtRatio(segment, j / steps, true));
                map[segment.lineNo] = points;
            }
        }
        simulation.simulate2(toolPath, pushPoint);
        return {totalTime: totalTime, simulatedPath: new Float32Array(simulatedPath),
            min: {x: xmin, y: ymin, z: zmin}, max: {x: xmax, y: ymax, z: zmax},
            errors: errors, lineSegmentMap: map};
    }

    return {simulateGCode: simulateGCode}
});