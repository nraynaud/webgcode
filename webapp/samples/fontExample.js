"use strict";
define(['RSVP', 'cnc/cam', 'clipper', 'libs/opentype', 'cnc/text', 'cnc/pocket'],
    function (RSVP, cam, clipper, opentype, text, pocket) {
        RSVP.on('error', function (reason) {
            console.log(reason);
        });

        function testFont(machine, whenDone, twoDView) {
            function displayClipper(clipperPoly, attr) {
                var res1 = machine.createOutline(null).attr(attr);
                machine.fromClipper(clipperPoly).map(function (poly) {
                    if (poly.path.length > 1)
                        cam.pushOnPath(res1, poly);
                });
                return res1;
            }

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

            machine.setParams(-1, 1, 1000);
            text.getText('Seymour One', null, 'Quite long text', 30).then(function (textOutline) {
                var toolRadius = 2 / 2;
                var radialEngagementRatio = 0.9;
                var outline = machine.createOutline(textOutline, 'gray');
                var poly2 = machine.toClipper(outline);
                twoDView.zoomExtent();
                var work = pocket.createPocket(poly2, toolRadius * machine.clipperScale, radialEngagementRatio, false);
                var toComplete = work.workArray.length;
                work.workArray.forEach(function (workunit) {
                    var computingPoly = displayClipper(workunit.polygon, {class: 'computingPolygon', fill: 'url(#computingFill)'});
                    workunit.promise.then(function (toolpath) {
                        for (var i = 0; i < toolpath.length; i++)
                            registerPocket(toolpath[i]);
                        computingPoly.remove();
                        toComplete--;
                        if (toComplete == 0)
                            whenDone();
                    });
                    workunit.undercutPromise.then(function (polygon) {
                        displayClipper(polygon, {class: 'undercutPolygon'});
                    });
                });
            }).catch(function (reason) {
                console.log('error', reason.stack);
                throw reason;
            });
            return true;
        }

        return {testFont: testFont};
    });
