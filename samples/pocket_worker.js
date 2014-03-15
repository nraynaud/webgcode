"use strict";
importScripts('../webapp/libs/clipper_unminified.js', '../webapp/libs/require.js');
var work = [];
self.onmessage = function (event) {
    console.log('message received');
    work.push(event.data);
};

require(['../webapp/cnc/cam.js'], function (cam) {
    console.log('in worker');
    var clipperScale = Math.pow(2, 20);

    function offsetPolygon(polygon, radius) {
        var result = new ClipperLib.PolyTree();
        var co = new ClipperLib.ClipperOffset(2, 0.0001 * clipperScale);
        co.AddPaths(polygon, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
        co.Execute(result, radius * clipperScale);
        return result;
    }

    self.onmessage = function (event) {
        console.log('message received');
        var data = event.data;
        handlePocket(data.poly, data.toolRadius, data.radialEngagementRatio);
    };
    for (var i = 0; i < work.length; i++)
        handlePocket(work[i].poly, work[i].toolRadius, work[i].radialEngagementRatio);

    function handlePocket(shapePoly, toolRadius, radialEngagementRatio) {
        function displayClipper(clipperPoly, color, polyline) {
            self.postMessage({
                polygon: clipperPoly,
                color: color,
                polyline: polyline
            });
        }

        self.postMessage({
            finished: true,
            result: cam.createPocket(shapePoly, toolRadius, radialEngagementRatio, displayClipper)
        });
    }
});
