"use strict";

define(['cnc/simulation', 'cnc/parser', 'cnc/util'], function (simulation, parser, util) {
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
            simulatedPath.push(x, y, z, t);
        }

        var errors = [];
        simulation.simulate2(parser.evaluate(code, null, null, null, errors), pushPoint);
        return {totalTime: totalTime, simulatedPath: new Float32Array(simulatedPath),
            min: {x: xmin, y: ymin, z: zmin}, max: {x: xmax, y: ymax, z: zmax},
            errors: errors};
    }

    return {simulateGCode: simulateGCode}
});