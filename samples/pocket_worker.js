"use strict";
importScripts('../webapp/libs/clipper_unminified.js', '../webapp/libs/require.js');
if (!self['console'])
    var console = {log: function () {
    }};
var work = [];
self.onmessage = function (event) {
    console.log('message received');
    work.push(event.data);
};

require(['../webapp/cnc/cam.js'], function (cam) {
    console.log('in worker');

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
