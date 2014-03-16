"use strict";
define(['../webapp/libs/rsvp-latest', '../webapp/cnc/cam'], function (rsvp, cam) {
    RSVP.on('error', function (reason) {
        console.log(reason);
    });

    function computePocketImmediately(polygon, toolRadius, radialEngagementRatio, displayClipper) {
        return function (resolve) {
            resolve(cam.createPocket(polygon, toolRadius, radialEngagementRatio, displayClipper));
        }
    }

    function computePocketInWorkers(polygon, toolRadius, radialEngagementRatio, displayClipper) {
        return function (resolve) {
            var worker = new Worker('samples/pocket_worker.js');
            worker.onmessage = function (event) {
                var data = event.data;
                if (data['finished']) {
                    var result = data['result'];
                    worker.terminate();
                    resolve(result);
                } else
                    displayClipper(data.polygon, data.color, data.polyline);
            };
            worker.postMessage({poly: polygon, toolRadius: toolRadius, radialEngagementRatio: radialEngagementRatio});
        };
    }

    function createPocket(machine, shapePoly) {
        function displayClipper(clipperPoly, color, polyline) {
            var res1 = machine.createOutline(null, color);
            machine.fromClipper(clipperPoly).map(function (poly) {
                if (poly.path.length > 1)
                    cam.pushOnPath(res1, poly);
                if (!polyline)
                    res1.node.pathSegList.appendItem(res1.node.createSVGPathSegClosePath());
                else {
                    var startPoint = poly.getStartPoint();
                    machine.createOutline(geom.createCircle(startPoint.x, startPoint.y, 0.5), color)
                }
            });
        }

        var toolRadius = .1 / 2;
        var radialEngagementRatio = 0.9;
        var polygons = cam.decomposePolytreeInTopLevelPolygons(shapePoly);
        return RSVP.all(polygons.map(function (poly) {
            var color = '#' + Math.floor(Math.random() * 16777215).toString(16);
            //sometimes the color is one number short.
            if (color.length < 7)
                color += '0';
            displayClipper(poly, color);
            return new RSVP.Promise(computePocketInWorkers(poly, toolRadius, radialEngagementRatio, displayClipper));
        }));
    }

    function testFont(machine, whenDone, twoDView) {
        machine.setParams(-1, 10, 1000);
        require(['webapp/libs/rsvp-latest'], function () {
            var getFont = function (url) {
                return new RSVP.Promise(function (resolve, reject) {
                    opentype.load(url, function (err, font) {
                        if (err)
                            reject(this);
                        else
                            resolve(font);
                    });
                });
            };

            getFont('webapp/libs/fonts/miss_fajardose/MissFajardose-Regular.ttf').then(function (font) {
                var path = font.getPath("test text", 0, 0, 30);
                var res = '';
                for (var i = 0; i < path.commands.length; i++) {
                    var command = path.commands[i];
                    res += ' ' + command.type;
                    if (command.type == 'M' || command.type == 'L')
                        res += ' ' + command.x + ',' + -command.y;
                    else if (command.type == 'Q')
                        res += command.x1 + ',' + -command.y1 + ' ' + command.x + ',' + -command.y;
                    else if (command.type == 'C')
                        res += command.x1 + ',' + -command.y1 + ' ' + command.x2 + ',' + -command.y2
                            + ' ' + command.x + ',' + -command.y;
                }
                var poly2 = machine.toClipper(machine.createOutline(res, 'gray'));
                twoDView.zoomExtent();
                var cpr = new ClipperLib.Clipper();
                var result = new ClipperLib.PolyTree();
                cpr.AddPaths(poly2, ClipperLib.PolyType.ptSubject, true);
                cpr.AddPaths([], ClipperLib.PolyType.ptClip, true);
                cpr.Execute(ClipperLib.ClipType.ctUnion, result, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
                return result;
            })
                .then(function (textGeometry) {
                    return createPocket(machine, textGeometry)
                })
                .then(function (pocketToolPaths) {

                    function registerPocket(pocket) {
                        for (var j = 0; j < pocket.children.length; j++)
                            registerPocket(pocket.children[j]);
                        machine.registerToolPathArray(machine.fromClipper(pocket.contour));
                    }

                    for (var i = 0; i < pocketToolPaths.length; i++)
                        for (var j = 0; j < pocketToolPaths[i].length; j++)
                            registerPocket(pocketToolPaths[i][j]);

                    whenDone();
                }).catch(function (reason) {
                    console.log('error', reason.stack);
                    throw reason;
                });
        });
        return true;
    }

    return {testFont: testFont};
});