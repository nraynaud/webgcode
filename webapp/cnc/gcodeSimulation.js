"use strict";

define(['cnc/simulation', 'cnc/parser', 'cnc/util'], function (simulation, parser, util) {
    function simulateGCode(code) {
        var simulatedPath = [];
        var posData = [
            {label: 'x position(s->mm)', shadowSize: 0, color: 'red', data: []},
            {label: 'y position(s->mm)', shadowSize: 0, color: 'green', data: []},
            {label: 'z position(s->mm)', shadowSize: 0, color: 'blue', data: []}
        ];

        var speedData = [
            {label: 'x speed(s->mm/s)', shadowSize: 0, color: 'red', data: [
                [0, 0]
            ]},
            {label: 'y speed(s->mm/s)', shadowSize: 0, color: 'green', data: [
                [0, 0]
            ]},
            {label: 'z speed(s->mm/s)', shadowSize: 0, color: 'blue', data: [
                [0, 0]
            ]},
            {label: '|speed|(s->mm/s)', shadowSize: 0, color: 'rgba(0, 0, 0, 0.4)', data: [
                [0, 0]
            ]}
        ];
        var accelerationData = [
            {label: 'x acc(s->mm/s^2)', shadowSize: 0, color: 'red', data: [
                [0, 0]
            ]},
            {label: 'y acc(s->mm/s^2)', shadowSize: 0, color: 'green', data: [
                [0, 0]
            ]},
            {label: 'z acc(s->mm/s^2)', shadowSize: 0, color: 'blue', data: [
                [0, 0]
            ]},
            {label: '|acceleration|(s->mm/s^2)', shadowSize: 0, color: 'rgba(0, 0, 0, 0.4)', data: [
                [0, 0]
            ]}
        ];

        function pushPoint(x, y, z, t) {
            simulatedPath.push(x, y, z);
            posData[0].data.push([t, x]);
            posData[1].data.push([t, y]);
            posData[2].data.push([t, z]);
            var previous = posData[0].data.length - 2;
            if (previous >= 0) {
                var previousDate = posData[0].data[previous][0];
                var dt = t - previousDate;
                var speedDate = (t + previousDate) / 2;
                var dx = x - posData[0].data[previous][1];
                var dy = y - posData[1].data[previous][1];
                var dz = z - posData[2].data[previous][1];
                var sx = dx / dt;
                var sy = dy / dt;
                var sz = dz / dt;
                speedData[0].data.push([speedDate, sx]);
                speedData[1].data.push([speedDate, sy]);
                speedData[2].data.push([speedDate, sz]);
                speedData[3].data.push([speedDate, util.length(dx, dy, dz) / dt]);
                if (previous >= 1) {
                    var previousSpeedDate = speedData[0].data[previous - 1][0];
                    var pDSx = sx - speedData[0].data[previous - 1][1];
                    var pDSy = sy - speedData[1].data[previous - 1][1];
                    var pDSz = sz - speedData[2].data[previous - 1][1];
                    var accelerationDate = (previousSpeedDate + speedDate) / 2;
                    accelerationData[0].data.push([accelerationDate, pDSx / (speedDate - previousSpeedDate)]);
                    accelerationData[1].data.push([accelerationDate, pDSy / (speedDate - previousSpeedDate)]);
                    accelerationData[2].data.push([accelerationDate, pDSz / (speedDate - previousSpeedDate)]);
                    accelerationData[3].data.push([accelerationDate, util.length(pDSx, pDSy, pDSz) / (speedDate - previousSpeedDate)]);
                }
            }
        }

        var errors = [];
        simulation.simulate2(parser.evaluate(code, null, null, null, errors), pushPoint);
        return {simulatedPath: new Float32Array(simulatedPath), posData: posData, speedData: speedData, accelerationData: accelerationData, errors: errors};
    }

    return {simulateGCode: simulateGCode}
});