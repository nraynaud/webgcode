"use strict";
importScripts('../webapp/libs/require.js');
requirejs.config({
    baseUrl: '.'
});
if (!self['console'])
    var console = {log: function () {
    }};
var work = [];
self.onmessage = function (event) {
    work.push(event.data);
};
self.onerror = function (event) {
    console.log(event.message);
};
self.onclose = function () {
    console.log('worker closing (inside)');
};
require(['cnc/cam', 'cnc/pocket'], function (cam, pocket) {
    self.onmessage = function (event) {
        var data = event.data;
        handlePocket(data.poly, data.scaledToolRadius, data.radialEngagementRatio);
    };
    for (var i = 0; i < work.length; i++)
        handlePocket(work[i].poly, work[i].scaledToolRadius, work[i].radialEngagementRatio);

    function displayUndercutPoly(polygon) {
        self.postMessage({
            operation: 'displayUndercutPoly',
            polygon: polygon
        });
    }

    function handlePocket(shapePoly, scaledToolRadius, radialEngagementRatio) {
        var display = {displayUndercutPoly: displayUndercutPoly};
        console.log('start worker computation');
        var result = pocket.doCreatePocket2(shapePoly, scaledToolRadius, radialEngagementRatio, display);
        console.log('worker computation done');
        self.postMessage({
            finished: true,
            result: result
        });
    }
});
