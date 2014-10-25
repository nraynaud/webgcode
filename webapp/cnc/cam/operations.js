"use strict";
define(['cnc/cam/cam', 'cnc/cam/toolpath', 'cnc/cam/pocket'], function (cam, tp, pocket) {

    return {
        'SimpleEngravingOperation': {
            label: 'Simple Engraving',
            specialTemplate: 'simpleEngraving',
            properties: {engraving_Z: -5},
            computeToolpath: function (op) {
                var z = op.get('engraving_Z');
                var safetyZ = op.get('job.safetyZ');
                var polygons = cam.pathDefToPolygons(op.get('outline.definition'));
                var toolpath = [];
                for (var i = 0; i < polygons.length; i++)
                    if (polygons[i].length) {
                        var path = new tp.GeneralPolylineToolpath();
                        toolpath.push(path);
                        path.pushPointXYZ(polygons[i][0].x, polygons[i][0].y, safetyZ);
                        for (var j = 0; j < polygons[i].length; j++)
                            path.pushPointXYZ(polygons[i][j].x, polygons[i][j].y, z);
                    }
                op.set('toolpath', toolpath);
            }
        },
        'SimpleContourOperation': {
            label: 'Simple Contour',
            specialTemplate: 'simpleContour',
            properties: {simple_contourZ: -5, contour_inside: true, contour_leaveStock: 0, contour_climbMilling: true},
            computeToolpath: function (op) {
                var machine = new cam.Machine(null);
                machine.setParams(op.get('simple_contourZ'), 10, 100);
                var polygon = cam.pathDefToClipper(op.get('outline.definition'));
                var offset = parseFloat(op.get('job.toolDiameter')) / 2 + parseFloat(op.get('contour_leaveStock'));
                var inside = op.get('contour_inside');
                var polygon1 = machine.contourClipper(polygon, offset, inside);
                var contourZ = op.get('simple_contourZ');
                var safetyZ = op.get('job.safetyZ');
                var areaPositive = machine.contourAreaPositive(inside, op.get('contour_climbMilling'));
                var toolpath = machine.fromClipper(polygon1, true, areaPositive).map(function (path) {
                    var startPoint = path.getStartPoint();
                    var generalPath = path.asGeneralToolpath(contourZ);
                    // plunge from safety plane
                    generalPath.pushPointInFront(startPoint.x, startPoint.y, safetyZ);
                    //close the loop
                    generalPath.pushPointXYZ(startPoint.x, startPoint.y, contourZ);
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
                contour_inside: true,
                contour_leaveStock: 0,
                contour_climbMilling: true
            },
            computeToolpath: function (op) {
                var machine = new cam.Machine(null);
                machine.setParams(op.get('ramping_startZ'), 10, 100);
                var clipperPolygon = cam.pathDefToClipper(op.get('outline.definition'));
                var offset = parseFloat(op.get('job.toolDiameter')) / 2 + parseFloat(op.get('contour_leaveStock'));
                var inside = op.get('contour_inside');
                var contour = machine.contourClipper(clipperPolygon, offset, inside);
                var startZ = parseFloat(op.get('ramping_startZ'));
                var stopZ = parseFloat(op.get('ramping_stopZ'));
                var turns = parseFloat(op.get('ramping_turns'));
                var areaPositive = machine.contourAreaPositive(inside, op.get('contour_climbMilling'));
                var toolpath = machine.rampToolPathArray(machine.fromClipper(contour, true, areaPositive), startZ, stopZ, turns);
                var safetyZ = op.get('job.safetyZ');
                toolpath.forEach(function (path) {
                    var startPoint = path.getStartPoint();
                    path.pushPointInFront(startPoint.x, startPoint.y, safetyZ);
                });
                op.set('toolpath', toolpath);
            }
        },
        'PocketOperation': {
            label: 'Pocket',
            specialTemplate: 'operationPocket',
            properties: {
                pocket_depth: -5, pocket_engagement: 50, pocket_leaveStock: 0.1
            },
            computeToolpath: function (op) {
                var clipperPolygon = cam.pathDefToClipper(op.get('outline.definition'));
                var machine = new cam.Machine(null);
                var leaveStock = op.get('pocket_leaveStock');
                if (leaveStock)
                    clipperPolygon = machine.offsetPolygon(clipperPolygon, -leaveStock);
                var scaledToolRadius = parseFloat(op.get('job.toolDiameter')) / 2 * cam.CLIPPER_SCALE;
                var result = pocket.createPocket(clipperPolygon, scaledToolRadius, op.get('pocket_engagement') / 100, true);
                var z = op.get('pocket_depth');
                var safetyZ = op.get('job.safetyZ');
                var toolpath = [];
                toolpath.clear();
                var promises = result.workArray.map(function (unit) {
                    return unit.promise
                });
                RSVP.all(promises).then(function (workResult) {
                    workResult.forEach(function (result) {
                        result.forEach(function (pocketResult, index) {
                            var path = machine.fromClipper([pocketResult.spiraledToolPath.path]);
                            path.forEach(function (path) {
                                var startPoint = path.getStartPoint();
                                var generalPath = path.asGeneralToolpath(z);
                                if (index == 0)
                                // plunge from safety plane
                                    generalPath.pushPointInFront(startPoint.x, startPoint.y, safetyZ);
                                toolpath.pushObject(generalPath);
                            });
                        });
                    });
                    op.set('toolpath', toolpath);
                });
            }
        }
    };
});