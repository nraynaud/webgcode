"use strict";
define(['cnc/cam/cam'], function (cam) {

    return {
        'SimpleContourOperation': {
            label: 'Simple Contour',
            specialTemplate: 'simpleContour',
            properties: {contourZ: -5, inside: true},
            computeToolpath: function (op) {
                var machine = new cam.Machine(null);
                machine.setParams(op.get('contourZ'), 10, 100);
                var polygon = cam.pathDefToClipper(op.get('outline.definition'));
                var polygon1 = machine.contourClipper(polygon, parseFloat(op.get('job.toolDiameter')) / 2, op.get('inside'));
                var contourZ = op.get('contourZ');
                var safetyZ = op.get('job.safetyZ');
                var toolpath = machine.fromClipper(polygon1).map(function (path) {
                    var startPoint = path.getStartPoint();
                    var generalPath = path.asGeneralToolpath(contourZ);
                    // plunge from safety plane
                    generalPath.pushPointInFront(startPoint.x, startPoint.y, safetyZ);
                    //close the loop
                    generalPath.pushPoint(startPoint.x, startPoint.y, contourZ);
                    return generalPath;
                });
                op.set('toolpath', toolpath);
            }},
        'RampingContourOperation': {
            label: 'Ramping Contour',
            specialTemplate: 'rampingContour',
            properties: {
                startZ: 0,
                stopZ: -5,
                turns: 5,
                inside: true
            },
            computeToolpath: function (op) {
                var machine = new cam.Machine(null);
                machine.setParams(op.get('contourZ'), 10, 100);
                var clipperPolygon = cam.pathDefToClipper(op.get('outline.definition'));
                var contour = machine.contourClipper(clipperPolygon, parseFloat(op.get('job.toolDiameter')) / 2, op.get('inside'));
                var startZ = parseFloat(op.get('startZ'));
                var stopZ = parseFloat(op.get('stopZ'));
                var turns = parseFloat(op.get('turns'));
                var toolpath = machine.rampToolPathArray(machine.fromClipper(contour), startZ, stopZ, turns);
                var safetyZ = op.get('job.safetyZ');
                toolpath.forEach(function (path) {
                    var startPoint = path.getStartPoint();
                    path.pushPointInFront(startPoint.x, startPoint.y, safetyZ);
                });
                op.set('toolpath', toolpath);
            }
        }
    };
});