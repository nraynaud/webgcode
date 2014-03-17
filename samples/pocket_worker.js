"use strict";
importScripts('../webapp/libs/clipper_unminified.js', '../webapp/libs/require.js');
if (!self['console'])
    var console = {log: function () {
    }};
var work = [];
self.onmessage = function (event) {
    work.push(event.data);
};

require(['../webapp/cnc/cam.js'], function (cam) {
    console.log('in worker');

    self.onmessage = function (event) {
        var data = event.data;
        handlePocket(data.poly, data.toolRadius, data.radialEngagementRatio);
    };
    for (var i = 0; i < work.length; i++)
        handlePocket(work[i].poly, work[i].toolRadius, work[i].radialEngagementRatio);

    function handlePocket(shapePoly, toolRadius, radialEngagementRatio) {
        console.log('start worker computation');
        function displayClipper(clipperPoly, color, polyline) {
            self.postMessage({
                polygon: clipperPoly,
                color: color,
                polyline: polyline
            });
        }

        var result = cam.createPocket(shapePoly, toolRadius, radialEngagementRatio, displayClipper);
        console.log('worker computation done');
        self.postMessage({
            finished: true,
            result: result
        });
    }
});
