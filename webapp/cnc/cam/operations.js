"use strict";
define(['RSVP', 'cnc/cam/cam', 'cnc/cam/toolpath', 'cnc/cam/pocket'], function (RSVP, cam, tp, pocket) {
    function attr(type, options) {
        return {type: type, options: options};
    }

    // stolen from https://github.com/kkaefer/node-morton/blob/master/lib/morton.js
    var X = [0, 1], Y = [0, 2];
    for (var i = 4; i < 0xFFFF; i <<= 2) {
        for (var j = 0, l = X.length; j < l; j++) {
            X.push((X[j] | i));
            Y.push((X[j] | i) << 1);
        }
    }

    // Only works for 24 bit input numbers (up to 16777215).
    function morton(x, y) {
        return (Y[y & 0xFF] | X[x & 0xFF]) +
            (Y[(y >> 8) & 0xFF] | X[(x >> 8) & 0xFF]) * 0x10000 +
            (Y[(y >> 16) & 0xFF] | X[(x >> 16) & 0xFF]) * 0x100000000;
    }

    function pointmetric(p) {
        return morton(p.x, p.y)
    }

    function pointComparison(p1, p2) {
        return pointmetric(p1) - pointmetric(p2);
    }

    return {
        'SimpleEngravingOperation': {
            label: 'Simple Engraving',
            specialTemplate: 'simpleEngraving',
            properties: {
                engraving_Z: attr('number', {defaultValue: -5})
            },
            computeToolpath: function (op) {
                return new RSVP.Promise(function (resolve, reject) {
                    var z = op.engraving_Z;
                    var safetyZ = op.job.safetyZ;
                    var polygons = op.outline.clipperPolyline;
                    var toolpath = [];
                    var machine = new cam.Machine(null);
                    for (var i = 0; i < polygons.length; i++)
                        if (polygons[i].length) {
                            var path = new tp.GeneralPolylineToolpath();
                            toolpath.push(path);
                            path.pushPointXYZ(polygons[i][0].x / machine.clipperScale, polygons[i][0].y / machine.clipperScale, safetyZ);
                            for (var j = 0; j < polygons[i].length; j++)
                                path.pushPointXYZ(polygons[i][j].x / machine.clipperScale, polygons[i][j].y / machine.clipperScale, z);
                        }
                    toolpath.sort(function (path1, path2) {
                        return pointComparison(path1.getStartPoint(), path2.getStartPoint());
                    });
                    resolve(toolpath);
                });
            }
        },
        'SimpleContourOperation': {
            label: 'Simple Contour',
            specialTemplate: 'simpleContour',
            properties: {
                simple_contourZ: attr('number', {defaultValue: -5}),
                contour_inside: attr('boolean', {defaultValue: true}),
                contour_leaveStock: attr('number', {defaultValue: 0}),
                contour_climbMilling: attr('boolean', {defaultValue: true})
            },
            computeToolpath: function (params) {
                return new RSVP.Promise(function (resolve, reject) {
                    var machine = new cam.Machine(null);
                    machine.setParams(params.simple_contourZ, 10, 100);
                    var offset = parseFloat(params.job.toolDiameter) / 2 + parseFloat(params.contour_leaveStock);
                    var polygon1 = machine.contourClipper(params.outline.clipperPolyline, offset, params.contour_inside);
                    var areaPositive = machine.contourAreaPositive(params.contour_inside, params.contour_climbMilling);
                    var contours = machine.fromClipper(polygon1, true, areaPositive);
                    contours.sort(function (path1, path2) {
                        return pointComparison(path1.getStartPoint(), path2.getStartPoint());
                    });
                    resolve(contours.map(function (path) {
                        var startPoint = path.getStartPoint();
                        var generalPath = path.asGeneralToolpath(params.simple_contourZ);
                        // plunge from safety plane
                        generalPath.pushPointInFront(startPoint.x, startPoint.y, params.job.safetyZ);
                        //close the loop
                        generalPath.pushPointXYZ(startPoint.x, startPoint.y, params.simple_contourZ);
                        return generalPath;
                    }));
                });
            }
        },
        'RampingContourOperation': {
            label: 'Ramping Contour',
            specialTemplate: 'rampingContour',
            properties: {
                ramping_startZ: attr('number', {defaultValue: 0}),
                ramping_stopZ: attr('number', {defaultValue: -5}),
                ramping_turns: attr('number', {defaultValue: 5}),
                contour_inside: attr('boolean', {defaultValue: true}),
                contour_leaveStock: attr('number', {defaultValue: 0}),
                contour_climbMilling: attr('boolean', {defaultValue: true})
            },
            computeToolpath: function (op) {
                return new RSVP.Promise(function (resolve, reject) {
                    var machine = new cam.Machine(null);
                    machine.setParams(op.ramping_startZ, 10, 100);
                    var clipperPolygon = op.outline.clipperPolyline;
                    var offset = parseFloat(op.job.toolDiameter) / 2 + parseFloat(op.contour_leaveStock);
                    var inside = op.contour_inside;
                    var contour = machine.contourClipper(clipperPolygon, offset, inside);
                    var areaPositive = machine.contourAreaPositive(inside, op.contour_climbMilling);
                    var toolpath2 = machine.fromClipper(contour, true, areaPositive);
                    var toolpath = machine.rampToolPathArray(toolpath2,
                        op.ramping_startZ, op.ramping_stopZ, op.ramping_turns);
                    var safetyZ = op.job.safetyZ;
                    toolpath.forEach(function (path) {
                        var startPoint = path.getStartPoint();
                        path.pushPointInFront(startPoint.x, startPoint.y, safetyZ);
                    });
                    toolpath.sort(function (path1, path2) {
                        return pointComparison(path1.getStartPoint(), path2.getStartPoint());
                    });
                    resolve(toolpath);
                });
            }
        },
        'PocketOperation': {
            label: 'Pocket',
            specialTemplate: 'operationPocket',
            properties: {
                pocket_depth: attr('number', {defaultValue: -5}),
                pocket_engagement: attr('number', {defaultValue: 50}),
                pocket_leaveStock: attr('number', {defaultValue: 0.1})
            },
            computeToolpath: function (op) {
                return new RSVP.Promise(function (resolve, reject) {
                    var clipperPolygon = op.outline.clipperPolyline;
                    var machine = new cam.Machine(null);
                    var leaveStock = op.pocket_leaveStock;
                    if (leaveStock)
                        clipperPolygon = machine.offsetPolygon(clipperPolygon, -leaveStock);
                    var scaledToolRadius = parseFloat(op.job.toolDiameter) / 2 * cam.CLIPPER_SCALE;
                    var result = pocket.createPocket(clipperPolygon, scaledToolRadius, op.pocket_engagement / 100, true);

                    var z = op.pocket_depth;
                    var safetyZ = op.job.safetyZ;
                    var toolpath = [];
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
                                    toolpath.push(generalPath);
                                });
                            });
                        });
                        resolve(toolpath);
                    });
                });
            }
        },
        '3DlinearOperation': {
            label: '3D linear milling',
            specialTemplate: '3DMilling',
            properties: {
                '3d_leaveStock': attr('number', {defaultValue: 0.5}),
                '3d_minZ': attr('number', {defaultValue: -1000}),
                '3d_toolType': attr('string', {defaultValue: 'cylinder'}),
                '3d_vToolAngle': attr('number', {defaultValue: 10}),
                '3d_vToolTipDiameter': attr('number', {defaultValue: 0.1}),
                '3d_diametralEngagement': attr('number', {defaultValue: 40}),
                '3d_pathOrientation': attr('string', {defaultValue: 0}),
                '3d_startPercent': attr('number', {defaultValue: 0}),
                '3d_stopPercent': attr('number', {defaultValue: 100}),
                '3d_zigZag': attr('boolean', {defaultValue: true})
            },
            computeToolpath: function (op) {
                return null;
            }
        },
        'DrillOperation': {
            label: 'Drilling',
            specialTemplate: 'drilling',
            properties: {
                drilling_startZ: attr('number', {defaultValue: 0}),
                drilling_stopZ: attr('number', {defaultValue: -5})
            },
            computeToolpath: function (op) {
                return new RSVP.Promise(function (resolve, reject) {
                    var start = op.drilling_startZ;
                    var stop = op.drilling_stopZ;
                    var point = op.outline.point;
                    var safetyZ = op.job.safetyZ;

                    function tpForPoint(point) {
                        var path = new tp.GeneralPolylineToolpath();
                        path.pushPointXYZ(point.x - op.job.offsetX, point.y - op.job.offsetY, safetyZ);
                        path.pushPointXYZ(point.x - op.job.offsetX, point.y - op.job.offsetY, start);
                        path.pushPointXYZ(point.x - op.job.offsetX, point.y - op.job.offsetY, stop);
                        return path;
                    }

                    if (op.outline.drillData) {
                        var result = [];
                        var data = JSON.parse(op.outline.drillData);
                        var keys = Object.keys(data.holes);
                        for (var i = 0; i < keys.length; i++) {
                            var points = data.holes[keys[i]];
                            for (var j = 0; j < points.length; j++)
                                result.push(points[j]);
                        }
                        result.sort(pointComparison);
                        resolve(result.map(function (point) {
                            return tpForPoint(point);
                        }));
                    } else
                        resolve([tpForPoint(point)]);
                });
            }
        }
    };
});