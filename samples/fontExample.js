"use strict";
define(['libs/rsvp-latest', 'cnc/cam', 'cnc/clipper', 'libs/opentype', 'cnc/text', 'cnc/pocket'],
    function (rsvp, cam, clipper, opentype, text, pocket) {
        RSVP.on('error', function (reason) {
            console.log(reason);
        });

        function testFont(machine, whenDone, twoDView) {
            function displayClipper(clipperPoly, attr) {
                var res1 = machine.createOutline(null).attr(attr);
                machine.fromClipper(clipperPoly).map(function (poly) {
                    if (poly.path.length > 1)
                        cam.pushOnPath(res1, poly);
                    res1.node.pathSegList.appendItem(res1.node.createSVGPathSegClosePath());
                });
            }

            machine.setParams(-1, 1, 1000);
            text.getText('Sofadi One', 'Quite Long text', 50).then(function (textOutline) {
                var toolRadius = 1 / 2;
                var radialEngagementRatio = 0.9;
                var outline = machine.createOutline(textOutline, 'gray');
                var poly2 = machine.toClipper(outline);
                twoDView.zoomExtent();
                var display = {
                    displayClipperComputingPoly: function (clipperPoly) {
                        var res1 = machine.createOutline(null).attr({class: 'computingPolygon'});
                        machine.fromClipper(clipperPoly).map(function (poly) {
                            if (poly.path.length > 1)
                                cam.pushOnPath(res1, poly);
                            res1.node.pathSegList.appendItem(res1.node.createSVGPathSegClosePath());
                        });
                        return res1;
                    }
                };
                return pocket.createPocket(poly2, toolRadius * machine.clipperScale, radialEngagementRatio, window.location.hash == '#worker', display);
            }).then(function (pocketToolPaths) {
                    function registerPocket(pocket) {
                        for (var j = 0; j < pocket.children.length; j++)
                            registerPocket(pocket.children[j]);
                        if (pocket.spiraledToolPath) {
                            machine.registerToolPath(machine.fromClipper([pocket.spiraledToolPath.path])[0]);
                            displayClipper(pocket.spiraledToolPath.shell, {stroke: 'none', fill: 'rgba(100, 100, 255, 0.2)',
                                'fill-rule': 'evenodd', title: 'spiral toolpath'});
                        } else
                            machine.registerToolPathArray(machine.fromClipper(pocket.contour));
                    }

                    for (var i = 0; i < pocketToolPaths.length; i++)
                        for (var j = 0; j < pocketToolPaths[i].length; j++) {
                            var pocket = pocketToolPaths[i][j];
                            registerPocket(pocket);
                        }
                    whenDone();
                }).catch(function (reason) {
                    console.log('error', reason.stack);
                    throw reason;
                });
            return true;
        }

        return {testFont: testFont};
    });
