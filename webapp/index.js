"use strict";
var DEVICE_INFO = {"vendorId": 0x0483, "productId": 0xFFFF};
var PERMISSIONS = {permissions: [
    {'usbDevices': [DEVICE_INFO]}
]};
var CONTROL_COMMANDS = {REQUEST_POSITION: 0, REQUEST_PARAMETERS: 1, REQUEST_STATE: 2, REQUEST_TOGGLE_MANUAL_STATE: 3,
    REQUEST_ZERO_AXIS: 4};
var EVENTS = {PROGRAM_END: 1, PROGRAM_START: 2, MOVED: 3, ENTER_MANUAL_MODE: 4, EXIT_MANUAL_MODE: 5};
var STATES = {READY: 0, RUNNING_PROGRAM: 1, MANUAL_CONTROL: 2};
var DEFAULT_TRANSFER_INFO = {requestType: 'vendor', recipient: 'interface', direction: 'in', value: 0, index: 0};

var bodyElement = document.getElementById("body");
var webView = document.getElementById("webView");

var manualControl = $('#manualControl');
var spinner = $('#spinner');
var connectButton = $('#connect');
var sendButton = $('#send');
var stopButton = $('#stop');

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

$(runner).on('running', function () {
    stopButton.show();
    sendButton.attr('disabled', 'disabled');
});
$(runner).on('available', function () {
    sendButton.removeAttr('disabled');
});

function genericErrorFilter(callback, errorCallback) {
    return function (usbEvent) {
        var errorCode = usbEvent.resultCode;
        if (errorCode) {
            var error = chrome.runtime.lastError;
            console.log(error);
            findDevice(function (device) {
                if (device)
                    console.log('error, but device is still here');
                if (errorCallback)
                    errorCallback(errorCode, error);
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
    closeDevice();
});

window.addEventListener("message", function (event) {
    var message = event.data;
    if (message['type'] == 'codeChange')
        chrome.storage.local.set({code: message['code']});
}, false);

sendButton.click(function () {
    if (currentDevice) {
        sendButton.attr('disabled', 'disabled');
        webView.contentWindow.postMessage({type: 'gimme program', parameters: parameters}, '*', [runner.getCodeChannel()]);
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
    spinner.css('visibility', 'hidden');
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

/**
 * do a transfer if one is not already pending.
 * @param tranferFunc
 * @param device
 * @param guardName transfer name, will be checked against already running tranfer of this name
 * @param tranfert
 * @param callback
 */
function guardedTransfer(tranferFunc, device, guardName, tranfert, callback) {
    if (device && !usbObservers[guardName]) {
        usbObservers[guardName] = true;
        tranferFunc(device, tranfert,
            genericErrorFilter(function (data) {
                usbObservers[guardName] = false;
                callback(data);
            }, function () {
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
    if (event == EVENTS.PROGRAM_END)
        console.log('PROGRAM_END');
    else if (event == EVENTS.PROGRAM_START) {
        console.log('PROGRAM_START');
        spinner.css('visibility', 'visible');
    } else if (event == EVENTS.MOVED)
        console.log('MOVED');
    else if (event == EVENTS.ENTER_MANUAL_MODE)
        console.log('ENTER_MANUAL_MODE');
    else if (event == EVENTS.EXIT_MANUAL_MODE)
        console.log('EXIT_MANUAL_MODE');
}

/**
 *
 * @param transferInfo will be merged with common default params (in, vendor, interface, value:0, index:0)
 * @param {Function?} callback will be called on no success
 * @param {Function?} errorCallback will be called on error
 */
function controlTransfer(transferInfo, callback, errorCallback) {
    if (currentDevice)
        chrome.usb.controlTransfer(currentDevice, $.extend({}, DEFAULT_TRANSFER_INFO, transferInfo), genericErrorFilter(callback, errorCallback));
}

function fetchState() {
    var stateTransfer = $.extend({}, DEFAULT_TRANSFER_INFO, {request: CONTROL_COMMANDS.REQUEST_STATE, length: 8});
    guardedTransfer(chrome.usb.controlTransfer, currentDevice, 'state', stateTransfer, function (data) {
        var state = new DataView(data).getUint32(0, true);
        if (state == currentState)
            return;
        if (state == STATES.READY) {
            spinner.css('visibility', 'hidden');
            manualControl.removeAttr('disabled');
            stopButton.hide();
            manualControl.text('Manual Control');
            console.log('state: READY');
        } else if (state == STATES.MANUAL_CONTROL) {
            spinner.css('visibility', 'hidden');
            manualControl.removeAttr('disabled');
            manualControl.text('Stop Manual Control');
            console.log('state: MANUAL_CONTROL');
        } else if (state == STATES.RUNNING_PROGRAM) {
            spinner.css('visibility', 'visible');
            manualControl.attr('disabled', 'disabled');
            console.log('state: RUNNING_PROGRAM');
        }
        currentState = state;
    });
    var positionTransfer = $.extend({}, DEFAULT_TRANSFER_INFO, {request: CONTROL_COMMANDS.REQUEST_POSITION, length: 16});
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
            stopButton.hide();
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
            manualControl.show();
            stopButton.hide();
            bodyElement.style.backgroundColor = 'blue';
            controlTransfer({request: CONTROL_COMMANDS.REQUEST_PARAMETERS, length: 16 }, function (data) {
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
stopButton.click(function () {
    runner.stop();
    sendButton.removeAttr('disabled');
    stopButton.hide();
});
chrome.permissions.contains(PERMISSIONS, function (result) {
    if (result)
        bindDevice();
    else {
        connectButton.show();
        sendButton.hide();
        stopButton.hide();
        manualControl.hide();
    }
});
$('.paramField').bind('input', function () {
    $('.axisButton').prop('disabled', $('.paramField:invalid').length > 0);
});
$('.axisButton').click(function (event) {
    var text = "G91 G1 F" + $('#feedRateField').val() + " " + $(event.target).data('axis') + $('#incrementField').val();
    runner.getCodeChannel().postMessage({type: 'gcode', program: text, parameters: parameters});
});
manualControl.click(function () {
    controlTransfer({direction: 'out', request: CONTROL_COMMANDS.REQUEST_TOGGLE_MANUAL_STATE, data: new ArrayBuffer(0)});
});
$('.zeroButton').click(function (event) {
    var axis = $(event.target).data('axis');
    var value = parseInt({X: '001', Y: '010', Z: '100'}[axis], 2);
    controlTransfer({direction: 'out', request: CONTROL_COMMANDS.REQUEST_ZERO_AXIS, value: value, data: new ArrayBuffer(0)});
});