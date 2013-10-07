"use strict";
var DEVICE_INFO = {"vendorId": 0x0483, "productId": 0xFFFF};
var PERMISSIONS = {permissions: [
    {'usbDevices': [DEVICE_INFO]}
]};
var CONTROL_COMMANDS = {REQUEST_POSITION: 0, REQUEST_PARAMETERS: 1, REQUEST_STATE: 2, REQUEST_TOGGLE_MANUAL_STATE: 3, REQUEST_ZERO_AXIS: 4};
var EVENTS = {PROGRAM_END: 1, PROGRAM_START: 2, MOVED: 3, ENTER_MANUAL_MODE: 4, EXIT_MANUAL_MODE: 5};
var STATES = {READY: 0, RUNNING_PROGRAM: 1, MANUAL_CONTROL: 2};
var DEFAULT_TRANSFERT_INFO = {requestType: 'vendor', recipient: 'interface', direction: 'in', value: 0, index: 0};

var bodyElement = document.getElementById("body");
var webView = document.getElementById("webView");

var manualControl = $('#manualControl');
var spinner = $('#spinner');
var connectButton = $('#connect');
var sendButton = $('#send');

var parameters = {
    stepsPerMillimeter: 640,
    maxSpeed: 2000,
    maxAcceleration: 100,
    clockFrequency: 200000,
    position: {x: 0, y: 0, z: 0}
};

var positionFetcherIntervalID = null;
var usbObservers = {};
var currentDevice = null;
var currentState = null;

function genericErrorFilter(callback, errorCallback) {
    return function (usbEvent) {
        if (usbEvent.resultCode) {
            var error = chrome.runtime.lastError;
            console.log(error);
            findDevice(function (device) {
                if (device)
                    console.log('error, but device is still here');
                if (errorCallback)
                    errorCallback(usbEvent.resultCode, error)
            });
        } else if (callback)
            callback(usbEvent.data);
    };
}

$('#webView').bind('load', function () {
    chrome.storage.local.get('code', function (res) {
        if (res['code'])
            webView.contentWindow.postMessage({type: 'setCode', code: res['code']}, '*');
    });
});

chrome.app.window.onClosed.addListener(function () {
    myWorker.terminate();
    closeDevice(function () {
    });
});

window.addEventListener("message", function (event) {
    var message = event.data;
    if (message['type'] == 'program' && currentDevice)
        sendPlan(message['program']);
    if (message['type'] == 'codeChange')
        chrome.storage.local.set({code: message['code']});
}, false);

function flushBulkSend(device, endpoint, callback) {
    var transfer2 = {direction: 'out', endpoint: endpoint, data: new ArrayBuffer(0)};
    chrome.usb.bulkTransfer(device, transfer2, genericErrorFilter(callback));
}

function initWorker() {
    var myWorker = new Worker("worker.js");
    var workQueue = [];
    var running = false;

    function loop() {
        if (workQueue.length)
            sendSpeed(currentDevice, workQueue.shift(), function () {
                loop();
            });
        else {
            running = false;
            flushBulkSend(currentDevice, 1);
            sendButton.removeAttr('disabled');
        }
    }

    function sendSpeed(device, formattedData, callback) {
        var transfer2 = {direction: 'out', endpoint: 1, data: formattedData};
        chrome.usb.bulkTransfer(device, transfer2,
            genericErrorFilter(callback, function (errorCode) {
                console.log('error in bulkSend', usbEvent, chrome.runtime.lastError);
                myWorker.terminate();
                workQueue = [];
                running = false;
            }));
    }

    myWorker.onmessage = function (event) {
        workQueue.push(event.data);
        if (!running) {
            running = true;
            loop();
        }
    };
    return myWorker;
}

function sendPlan(plan) {
    initWorker().postMessage({plan: plan, parameters: parameters});
}

sendButton.click(function () {
    if (currentDevice) {
        sendButton.attr('disabled', 'disabled');
        webView.contentWindow.postMessage({type: 'gimme program'}, '*');
    } else
        closeDevice();
});

function closeDevice(callback) {
    bodyElement.style.backgroundColor = 'black';
    if (positionFetcherIntervalID) {
        window.clearInterval(positionFetcherIntervalID);
        positionFetcherIntervalID = null;
    }
    connectButton.show();
    sendButton.hide();
    spinner.hide();
    manualControl.hide();
    if (currentDevice) {
        var savedDevice = currentDevice;
        currentDevice = null;
        chrome.usb.releaseInterface(savedDevice, 0, function () {
            chrome.usb.closeDevice(savedDevice, callback);
        });
    } else if (callback)
        callback();
}

function guardedTransfer(tranfertFunc, device, guardName, tranfert, callback) {
    if (device && !usbObservers[guardName]) {
        usbObservers[guardName] = true;
        tranfertFunc(device, tranfert,
            genericErrorFilter(function (data) {
                usbObservers[guardName] = false;
                callback(data);
            }, function (errorCode) {
                usbObservers[guardName] = false;
            }));
    }
}

function pollInterrupt() {
    var transfer = {direction: 'in', endpoint: 1, length: 16};
    guardedTransfer(chrome.usb.interruptTransfer, currentDevice, 'interrupt', transfer, handleInterrupt);
}

function handleInterrupt(data) {
    var event = new Int32Array(data)[0];
    if (event == EVENTS.PROGRAM_END) {
        console.log('PROGRAM_END');
    } else if (event == EVENTS.PROGRAM_START) {
        console.log('PROGRAM_START');
        spinner.show();
    } else if (event == EVENTS.MOVED) {
        console.log('MOVED');
    } else if (event == EVENTS.ENTER_MANUAL_MODE) {
        console.log('ENTER_MANUAL_MODE');
    } else if (event == EVENTS.EXIT_MANUAL_MODE) {
        console.log('EXIT_MANUAL_MODE');
    }
}

/**
 *
 * @param device
 * @param transferInfo will be merged with common default params (in, vendor, interface, value:0, index:0)
 * @param {Function?} callback will be called on no success
 * @param {Function?} errorCallback will be called on error
 */
function controlTransfer(device, transferInfo, callback, errorCallback) {
    if (device)
        chrome.usb.controlTransfer(currentDevice, $.extend({}, DEFAULT_TRANSFERT_INFO, transferInfo), genericErrorFilter(callback, errorCallback));
}

function fetchState() {
    var stateTransfer = $.extend({}, DEFAULT_TRANSFERT_INFO, {request: CONTROL_COMMANDS.REQUEST_STATE, length: 8});
    guardedTransfer(chrome.usb.controlTransfer, currentDevice, 'state', stateTransfer, function (data) {
        var state = new DataView(data).getUint32(0, true);
        if (state == currentState)
            return;
        if (state == STATES.READY) {
            spinner.hide();
            manualControl.removeAttr('disabled');
            manualControl.text('Manual Control');
            console.log('state: READY');
        } else if (state == STATES.MANUAL_CONTROL) {
            spinner.hide();
            manualControl.removeAttr('disabled');
            manualControl.text('Stop Manual Control');
            console.log('state: MANUAL_CONTROL');
        } else if (state == STATES.RUNNING_PROGRAM) {
            spinner.show();
            manualControl.attr('disabled', 'disabled');
            console.log('state: RUNNING_PROGRAM');
        }
        currentState = state;
    });
    var positionTransfer = $.extend({}, DEFAULT_TRANSFERT_INFO, {request: CONTROL_COMMANDS.REQUEST_POSITION, length: 16});
    guardedTransfer(chrome.usb.controlTransfer, currentDevice, 'position', positionTransfer, function (data) {
        var buffer = new Int32Array(data);
        var x = buffer[0] / parameters.stepsPerMillimeter;
        var y = buffer[1] / parameters.stepsPerMillimeter;
        var z = buffer[2] / parameters.stepsPerMillimeter;
        var feedRate = buffer[3] * 60;
        $('#currentFeedrate').text(feedRate);
        parameters.position = {x: x, y: y, z: z};
        $('#xpos').text(x.toFixed(3));
        $('#ypos').text(y.toFixed(3));
        $('#zpos').text(z.toFixed(3));
        webView.contentWindow.postMessage({type: 'toolPosition', position: parameters.position}, '*');
    });
}

function resetDevice() {
    closeDevice(bindDevice);
}

function findDevice(callback) {
    chrome.usb.findDevices(DEVICE_INFO, function (devices) {
        if (!devices || !devices.length)
            if (currentDevice)
                closeDevice(function () {
                    callback(null);
                });
            else
                callback(null);
        else
            callback(devices[0]);
    });
}

function bindDevice() {
    findDevice(function (device) {
        if (!device) {
            console.log('no device found');
            connectButton.show();
            sendButton.hide();
            manualControl.hide();
            return;
        }
        chrome.usb.claimInterface(device, 0, function () {
            if (chrome.runtime.lastError) {
                resetDevice();
                return;
            }
            currentDevice = device;
            connectButton.hide();
            sendButton.show();
            bodyElement.style.backgroundColor = 'blue';
            controlTransfer(currentDevice, {request: CONTROL_COMMANDS.REQUEST_PARAMETERS, length: 16 }, function (data) {
                var params = new Int32Array(data);
                parameters.stepsPerMillimeter = params[0];
                parameters.maxSpeed = params[1];
                parameters.maxAcceleration = params[2];
                parameters.clockFrequency = params[3];
            });
            positionFetcherIntervalID = window.setInterval(fetchState, 200);
            pollInterrupt();
        });
    });
}
connectButton.click(function () {
    chrome.permissions.request(PERMISSIONS, function (result) {
        if (result)
            bindDevice();
        else
            console.log('App was not granted the "usbDevices" permission.', chrome.runtime.lastError);
    });
});
chrome.permissions.contains(PERMISSIONS, function (result) {
    if (result)
        bindDevice();
    else {
        connectButton.show();
        sendButton.hide();
    }
});
$('.paramField').bind('input', function () {
    $('.axisButton').prop('disabled', $('.paramField:invalid').length > 0);
});
$('.axisButton').click(function (event) {
    var text = "G91 G1 F" + $('#feedRateField').val() + " " + $(event.target).data('axis') + $('#incrementField').val();
    sendPlan(text);
});
manualControl.click(function () {
    controlTransfer(currentDevice, {direction: 'out', request: CONTROL_COMMANDS.REQUEST_TOGGLE_MANUAL_STATE, data: new ArrayBuffer(0)}, genericErrorFilter());
});
$('.zeroButton').click(function (event) {
    var axis = $(event.target).data('axis');
    var value = parseInt({X: '001', Y: '010', Z: '100'}[axis], 2);
    controlTransfer(currentDevice, {direction: 'out', request: CONTROL_COMMANDS.REQUEST_ZERO_AXIS, value: value, data: new ArrayBuffer(0)}, genericErrorFilter());
});