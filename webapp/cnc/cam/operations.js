"use strict";
define(['cnc/cam/cam', 'cnc/cam/toolpath'], function (cam, tp) {

    return {
        'SimpleEngravingOperation': {
            label: 'Simple Engraving',
            specialTemplate: 'simpleEngraving',
            properties: {engraing_engravingZ: -5},
            computeToolpath: function (op) {
                var z = op.get('engraing_engravingZ');
                var safetyZ = op.get('job.safetyZ');
                var polygons = cam.pathDefToPolygons(op.get('outline.definition'));
                var toolpath = [];
                for (var i = 0; i < polygons.length; i++)
                    if (polygons[i].length) {
                        var path = new tp.GeneralPolylineToolpath();
                        toolpath.push(path);
                        path.pushPoint(polygons[i][0].x, polygons[i][0].y, safetyZ);
                        for (var j = 0; j < polygons[i].length; j++)
                            path.pushPoint(polygons[i][j].x, polygons[i][j].y, z);
                    }
                op.set('toolpath', toolpath);
            }
        },
        'SimpleContourOperation': {
            label: 'Simple Contour',
            specialTemplate: 'simpleContour',
            properties: {simple_contourZ: -5, simple_inside: true, simple_leaveStock: 0},
            computeToolpath: function (op) {
                var machine = new cam.Machine(null);
                machine.setParams(op.get('simple_contourZ'), 10, 100);
                var polygon = cam.pathDefToClipper(op.get('outline.definition'));
                var offset = parseFloat(op.get('job.toolDiameter')) / 2 + parseFloat(op.get('simple_leaveStock'));
                var polygon1 = machine.contourClipper(polygon, offset, op.get('simple_inside'));
                var contourZ = op.get('simple_contourZ');
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
                ramping_startZ: 0,
                ramping_stopZ: -5,
                ramping_turns: 5,
                ramping_inside: true,
                ramping_leaveStock: 0
            },
            computeToolpath: function (op) {
                var machine = new cam.Machine(null);
                machine.setParams(op.get('ramping_startZ'), 10, 100);
                var clipperPolygon = cam.pathDefToClipper(op.get('outline.definition'));
                var offset = parseFloat(op.get('job.toolDiameter')) / 2 + parseFloat(op.get('ramping_leaveStock'));
                var contour = machine.contourClipper(clipperPolygon, offset, op.get('ramping_inside'));
                var startZ = parseFloat(op.get('ramping_startZ'));
                var stopZ = parseFloat(op.get('ramping_stopZ'));
                var turns = parseFloat(op.get('ramping_turns'));
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