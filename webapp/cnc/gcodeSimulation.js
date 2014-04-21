"use strict";

define(['cnc/simulation', 'cnc/parser', 'require'], function (simulation, parser, require) {
    function simulateGCode(code, fragmentHandler) {
        var currentSpeedTag = null;
        var simulatedPath = [];
        var simulationFragments = [];

        function closeFragment() {
            if (simulatedPath.length) {
                var fragment = {vertices: new Float32Array(simulatedPath), speedTag: currentSpeedTag};
                simulationFragments.push(fragment);
                //repeat the last point as ne new first point, because we're breaking the polyline
                simulatedPath = simulatedPath.slice(-3);
                fragmentHandler(fragment);
            }
        }

        function accumulatePoint(point, segment) {
            if (currentSpeedTag != segment.speedTag || simulatedPath.length >= 5000) {
                closeFragment();
                currentSpeedTag = segment.speedTag;
            }
            simulatedPath.push(point.x, point.y, point.z);
        }

        var errors = [];
        var map = [];

        function fragmentListener(fragment) {
            if (simulationFragments.length == 0 && simulatedPath.length == 0)
                accumulatePoint(fragment.from, fragment);
            if (fragment.type == 'line') {
                var array = [fragment.from, fragment.to];
                array.speedTag = fragment.speedTag;
                map[fragment.lineNo] = array;
                accumulatePoint(fragment.to, fragment);
            } else {
                var tolerance = 0.001;
                var steps = Math.PI / Math.acos(1 - tolerance / fragment.radius) * Math.abs(fragment.angularDistance) / (Math.PI * 2);
                var points = [];
                for (var j = 0; j <= steps; j++) {
                    var point = simulation.COMPONENT_TYPES['arc'].pointAtRatio(fragment, j / steps, true);
                    points.push(point);
                    accumulatePoint(point, fragment);
                }
                map[fragment.lineNo] = points;
            }
        }

        var toolPath = parser.evaluate(code, null, null, null, errors, fragmentListener);
        closeFragment();

        var totalTime = 0;
        var xmin = +Infinity, ymin = +Infinity, zmin = +Infinity;
        var xmax = -Infinity, ymax = -Infinity, zmax = -Infinity;

        function pushPoint(x, y, z, t) {
            totalTime = Math.max(t, totalTime);
            xmin = Math.min(x, xmin);
            ymin = Math.min(y, ymin);
            zmin = Math.min(z, zmin);
            xmax = Math.max(x, xmax);
            ymax = Math.max(y, ymax);
            zmax = Math.max(z, zmax);
        }

        simulation.simulate2(toolPath, pushPoint);

        return {
            totalTime: totalTime, simulatedPath: simulationFragments,
            min: {x: xmin, y: ymin, z: zmin}, max: {x: xmax, y: ymax, z: zmax},
            errors: errors, lineSegmentMap: map};
    }

    function simulateWorkerSide(event) {
        try {
            self.postMessage(simulateGCode(event.data.code, function (fragment) {
                self.postMessage({
                    type: 'fragment',
                    fragment: fragment
                });
            }));
        } catch (error) {
            console.log('error');
        } finally {
            self.close();
        }
    }

    function parseInWorker(code, resultHandler, fragmentHandler) {
        var worker = new Worker(require.toUrl('worker.js'));
        worker.onerror = function (error) {
            console.log('worker error', error);
            console.log('trying again without worker');
            parseImmediately(code, resultHandler);
        };
        window.myWorker = worker;
        worker.onmessage = function (event) {
            worker.onerror = function (error) {
                console.log('worker error', error);
            };
            if (event.data.type == 'fragment')
                fragmentHandler(event.data.fragment);
            else {
                resultHandler(event.data);
                window.myWorker = null;
            }
        };
        worker.postMessage({
            operation: 'simulateGCode',
            code: code
        });
    }

    function parseImmediately(code, resultHandler, fragmentHandler) {
        resultHandler(simulateGCode(code, fragmentHandler));
    }

    function tryToParseInWorker(code, resultHandler, fragmentHandler) {
        try {
            parseInWorker(code, resultHandler, fragmentHandler);
        } catch (error) {
            console.log('worker error', error);
            console.log('trying again without worker');
            parseImmediately(code, resultHandler, fragmentHandler);
        }
    }

    return {
        simulateGCode: simulateGCode,
        parseImmediately: parseImmediately,
        parseInWorker: parseInWorker,
        tryToParseInWorker: tryToParseInWorker,
        simulateWorkerSide: simulateWorkerSide};
});