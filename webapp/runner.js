"use strict";
define(['jQuery'], function ($) {
    var ENDPOINT = 1;
    var SET_FEATURE = 0x03;
    var CLEAR_FEATURE = 0x01;
    var ENDPOINT_HALT = 0;
    var STALL_ERROR = 4;

    function Runner(device) {
        this.device = device;
        this.worker = null;
    }

    Runner.prototype = {
        haltRestartEndPoint: function (setClear) {
            return this.device.controlTransfer({direction: 'out', recipient: 'endpoint', requestType: 'standard',
                request: setClear, value: ENDPOINT_HALT, index: ENDPOINT, data: new ArrayBuffer(0)});
        },
        getCodeChannel: function () {
            $(this).trigger('running');
            this.worker = new Worker("worker.js");
            var workQueue = [];
            var running = false;
            var _this = this;

            function loop() {
                if (workQueue.length) {
                    running = true;
                    sendSpeed(workQueue.shift()).then(loop, function (errorCode) {
                        console.log('sendSpeed errorCode', errorCode);
                        _this.terminateWorker();
                        if (errorCode == STALL_ERROR)
                            return _this.haltRestartEndPoint(CLEAR_FEATURE);
                        else
                            console.log('error in bulkSend', errorCode, chrome.runtime.lastError);
                        $(this).trigger('available');
                        return null;
                    });
                } else {
                    //starved or finished
                    running = false;
                    if (_this.worker == null)
                        sendSpeed(new ArrayBuffer(0)).finally(function () {//flush
                            $(_this).trigger('available');
                        });
                }
            }

            function sendSpeed(formattedData) {
                return _this.device.bulkTransfer({direction: 'out', endpoint: ENDPOINT, data: formattedData});
            }

            this.worker.onmessage = function (event) {
                var work = event.data;
                if (work != null)
                    workQueue.push(work);
                else
                    _this.terminateWorker();
                if (!running)
                    loop();
            };
            var channel = new MessageChannel();
            this.worker.postMessage({operation: 'acceptProgram'}, [channel.port1]);
            return channel.port2;
        },
        terminateWorker: function () {
            if (this.worker) {
                this.worker.terminate();
                this.worker = null;
            }
        },
        stop: function () {
            var _this = this;
            return _this.haltRestartEndPoint(SET_FEATURE)
                .then(function () {
                    _this.terminateWorker();
                    return _this.haltRestartEndPoint(CLEAR_FEATURE);
                })
                .then(function () {
                    // restart the whole device to clear the stall
                    // http://stackoverflow.com/questions/20646868/how-to-recover-from-a-stall-in-chrome-usb
                    return _this.device.reset();
                });
        }
    };
    return Runner;
});