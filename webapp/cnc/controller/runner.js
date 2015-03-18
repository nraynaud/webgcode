"use strict";
define(['RSVP'], function (RSVP) {
    var ENDPOINT = 1;
    var SET_FEATURE = 0x03;
    var CLEAR_FEATURE = 0x01;
    var ENDPOINT_HALT = 0;
    var STALL_ERROR = 4;

    function Runner(connection) {
        this.connection = connection;
        this.worker = null;
    }

    Runner.prototype = {
        haltRestartEndPoint: function (setClear) {
            return this.connection.controlTransfer({direction: 'out', recipient: 'endpoint', requestType: 'standard',
                request: setClear, value: ENDPOINT_HALT, index: ENDPOINT, data: new ArrayBuffer(0)});
        },
        getCodeChannel: function (deferred) {
            this.worker = new Worker("worker.js");
            var workQueue = [];
            var sentToUSBProgramsCount = 0;
            var running = false;
            var _this = this;

            function loop() {
                if (workQueue.length) {
                    running = true;
                    chrome.power.requestKeepAwake('system');
                    sendSpeed(workQueue.shift()).then(loop, function (errorCode) {
                        console.log('sendSpeed errorCode', errorCode);
                        _this.terminateWorker();
                        if (errorCode != STALL_ERROR)
                            console.log('error in bulkSend', errorCode, chrome.runtime.lastError);
                        deferred.reject(chrome.runtime.lastError, arguments);
                        return null;
                    });
                } else {
                    //starved or finished
                    running = false;
                    if (_this.worker == null)
                        sendSpeed(new ArrayBuffer(0)).finally(function () {//flush
                            deferred.resolve();
                            chrome.power.releaseKeepAwake();
                        });
                }
            }

            function sendSpeed(formattedData) {
                sentToUSBProgramsCount++;
                if (_this.worker != null)
                    _this.worker.outputPort.postMessage({
                        operation: 'updateSentToUSBProgramsCount',
                        count: sentToUSBProgramsCount
                    });
                return _this.connection.bulkTransfer({direction: 'out', endpoint: ENDPOINT, data: formattedData});
            }

            var inputChannel = new MessageChannel();
            var outputChannel = new MessageChannel();
            this.worker.postMessage({operation: 'acceptProgram'}, [inputChannel.port1, outputChannel.port1]);
            this.worker.outputPort = outputChannel.port2;
            this.worker.outputPort.onmessage = function (event) {
                var work = event.data;
                if (work != null)
                    workQueue.push(work);
                else
                    _this.terminateWorker();
                if (!running)
                    loop();
            };
            return inputChannel.port2;
        },
        executeProgram: function (programMessage) {
            var deferred = RSVP.defer();
            this.getCodeChannel(deferred).postMessage(programMessage);
            return deferred.promise;
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
                });
        }
    };
    return Runner;
});