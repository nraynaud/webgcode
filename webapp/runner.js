"use strict";
var runner = (function () {
    var ENDPOINT = 1;

    var SET_FEATURE = 0x03;
    var CLEAR_FEATURE = 0x01;
    var ENDPOINT_HALT = 0;
    var STALL_ERROR = 4;

    function haltRestartEndPoint(setClear, callback) {
        controlTransfer({direction: 'out', recipient: 'endpoint', requestType: 'standard',
            request: setClear, value: ENDPOINT_HALT, index: ENDPOINT, data: new ArrayBuffer(0)}, callback);
    }

    function restartEndPoint() {
        haltRestartEndPoint(CLEAR_FEATURE, function () {
            // restart the whole device to clear the stall
            // http://stackoverflow.com/questions/20646868/how-to-recover-from-a-stall-in-chrome-usb
            chrome.usb.resetDevice(currentDevice, resetDevice);
        });
    }

    var worker = null;

    function terminateWorker() {
        if (worker) {
            worker.terminate();
            worker = null;
        }
    }

    function flushBulkSend(device, endpoint, callback) {
        var transfer2 = {direction: 'out', endpoint: endpoint, data: new ArrayBuffer(0)};
        chrome.usb.bulkTransfer(device, transfer2, genericErrorFilter(callback));
    }

    function startWorker(plan, parameters) {
        worker = new Worker("worker.js");
        var workQueue = [];
        var running = false;

        function loop() {
            if (workQueue.length) {
                running = true;
                sendSpeed(currentDevice, workQueue.shift(), loop);
            } else {
                //starved or finished
                running = false;
                if (worker == null) {
                    //finished
                    flushBulkSend(currentDevice, ENDPOINT);
                    $(runner).trigger('available');
                }
            }
        }

        function sendSpeed(device, formattedData, callback) {
            var transfer2 = {direction: 'out', endpoint: ENDPOINT, data: formattedData};
            chrome.usb.bulkTransfer(device, transfer2,
                genericErrorFilter(callback, function (errorCode, message) {
                    terminateWorker();
                    if (errorCode == STALL_ERROR)
                        restartEndPoint();
                    else
                        console.log('error in bulkSend', errorCode, message);
                    $(runner).trigger('available');
                }));
        }

        worker.onmessage = function (event) {
            var work = event.data;
            if (work != null)
                workQueue.push(work);
            else
                terminateWorker();
            if (!running)
                loop();
        };
        worker.postMessage({plan: plan, parameters: parameters});
        return worker;
    }

    function sendProgram(plan, parameters) {
        if (!worker) {
            $(runner).trigger('running');
            startWorker(plan, parameters);
        }
    }

    window.addEventListener("message", function (event) {
        var message = event.data;
        if (message['type'] == 'program' && currentDevice)
            sendProgram(message['program'], parameters);
    });

    return {
        sendPlan: sendProgram,
        stop: function () {
            haltRestartEndPoint(SET_FEATURE, worker ? null : restartEndPoint);
        }
    };
})();