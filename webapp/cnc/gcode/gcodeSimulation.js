"use strict";

define(['cnc/gcode/simulation', 'cnc/gcode/parser', 'cnc/util', 'require'], function (simulation, parser, util, require) {
    function simulateGCode(code, initialPosition, fragmentHandler) {
        var accumulator = util.createSimulationAccumulator(fragmentHandler);
        var errors = [];
        var map = [];

        function fragmentListener(fragment) {
            if (accumulator.isEmpty())
                accumulator.accumulatePoint(fragment.from, fragment.speedTag);
            if (fragment.type == 'line') {
                var array = [fragment.from, fragment.to];
                array.speedTag = fragment.speedTag;
                map[fragment.lineNo] = array;
                accumulator.accumulatePoint(fragment.to, fragment.speedTag);
            } else {
                var tolerance = 0.001;
                var steps = Math.ceil(Math.PI / Math.acos(1 - tolerance / fragment.radius) * Math.abs(fragment.angularDistance) / (Math.PI * 2));
                var points = [];
                for (var j = 0; j <= steps; j++) {
                    var point = simulation.COMPONENT_TYPES['arc'].pointAtRatio(fragment, j / steps, true);
                    points.push(point);
                    accumulator.accumulatePoint(point, fragment.speedTag);
                }
                map[fragment.lineNo] = points;
            }
        }

        var toolPath = parser.evaluate(code, null, null, initialPosition, errors, fragmentListener);
        accumulator.closeFragment();
        var info = simulation.collectToolpathInfo(toolPath);
        return {
            totalTime: info.totalTime,
            min: info.min, max: info.max,
            errors: errors, lineSegmentMap: map};
    }

    function simulateWorkerSide(event) {
        try {
            self.postMessage(simulateGCode(event.data.code, event.data.initialPosition, function (fragment) {
                self.postMessage({
                    type: 'fragment',
                    fragment: fragment
                }, [fragment.vertices]);
            }));
        } catch (error) {
            console.log('error ' + error.message);
        } finally {
            self.close();
        }
    }

    function parseInWorker(code, initialPosition, resultHandler, fragmentHandler) {
        var worker = new Worker(require.toUrl('worker.js'));
        worker.onerror = function (error) {
            console.log('worker error', error);
            console.log('trying again without worker');
            parseImmediately(code, initialPosition, resultHandler);
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
            code: code,
            initialPosition: initialPosition
        });
    }

    function parseImmediately(code, initialPosition, resultHandler, fragmentHandler) {
        resultHandler(simulateGCode(code, initialPosition, fragmentHandler));
    }

    return {
        simulateGCode: simulateGCode,
        parseImmediately: parseImmediately,
        parseInWorker: parseInWorker,
        simulateWorkerSide: simulateWorkerSide};
});
