"use strict";
var DEVICE_INFO = {"vendorId": 0x0483, "productId": 0xFFFF};
var PERMISSIONS = {permissions: [
    {'usbDevices': [DEVICE_INFO]}
]};
var CONTROL_COMMANDS = {REQUEST_POSITION: 0, REQUEST_PARAMETERS: 1, REQUEST_STATE: 2, REQUEST_TOGGLE_MANUAL_STATE: 3, REQUEST_ZERO_AXIS: 4};
var EVENTS = {PROGRAM_END: 1, PROGRAM_START: 2, MOVED: 3, ENTER_MANUAL_MODE: 4, EXIT_MANUAL_MODE: 5};
var STATES = {READY: 0, RUNNING_PROGRAM: 1, MANUAL_CONTROL: 2};
var bodyElement = document.getElementById("body");
var webView = document.getElementById("webView");

var manualControl = $('#manualControl');
var parameters = {
    stepsPerMillimeter: 640,
    maxSpeed: 2000,
    maxAcceleration: 100,
    clockFrequency: 200000,
    position: {x: 0, y: 0, z: 0}
};

$('#webView').bind('loadstop', function () {
    fetchPosition();
});
var currentDevice = null;

chrome.app.window.onClosed.addListener(function () {
    myWorker.terminate();
    closeDevice(function () {
    });
});

window.addEventListener("message", function (event) {
    var message = event.data;
    if (message['type'] == 'program' && currentDevice)
        sendPlan(message['program']);
}, false);

function flushBulkSend(device, endpoint, callback) {
    var transfer2 = {direction: 'out', endpoint: endpoint, data: new ArrayBuffer(0)};
    chrome.usb.bulkTransfer(device, transfer2, function (usbEvent) {
        callback(usbEvent);
    });
}

function initWorker() {
    var myWorker = new Worker("worker.js");
    var workQueue = [];
    var running = false;

    function pollQueue() {
        function loop() {
            if (workQueue.length)
                sendSpeed(currentDevice, workQueue.shift(), function () {
                    loop();
                });
            else {
                running = false;
                $('#send').removeAttr('disabled');
            }
        }

        if (!running) {
            running = true;
            loop();
        }
    }

    myWorker.onmessage = function (event) {
        workQueue.push(event.data);
        pollQueue();
    };
    return myWorker;
}

var planWorker = initWorker();
function sendPlan(plan) {
    planWorker.postMessage({plan: plan, parameters: parameters});
}

function sendSpeed(device, formattedData, callback) {
    var transfer2 = {direction: 'out', endpoint: 1, data: formattedData};
    chrome.usb.bulkTransfer(device, transfer2, function (usbEvent) {
        if (usbEvent.resultCode) {
            callback(usbEvent);
            console.log('error in bulkSend', usbEvent);
            return;
        }
        flushBulkSend(device, 1, function (usbEvent) {
            callback(usbEvent);
        });
    });
}

$('#send').click(function () {
    if (currentDevice) {
        $('#send').attr('disabled', 'disabled');
        webView.contentWindow.postMessage({type: 'gimme program'}, '*');
    } else
        closeDevice();
});

function closeDevice(callback) {
    bodyElement.style.backgroundColor = 'black';
    $('#connect').show();
    $('#send').hide();
    if (currentDevice) {
        var savedDevice = currentDevice;
        currentDevice = null;
        chrome.usb.releaseInterface(savedDevice, 0, function () {
            chrome.usb.closeDevice(savedDevice, callback);
        });
    } else
        callback();
}

function pollInterrupt() {
    if (!currentDevice)
        return;
    var transfer = {direction: 'in', endpoint: 1, length: 16};
    chrome.usb.interruptTransfer(currentDevice, transfer, interruptHandler(currentDevice));
}


window.setInterval(fetchPosition, 100);
function interruptHandler() {
    return function (usbEvent) {
        if (!usbEvent.resultCode) {
            var event = new Int32Array(usbEvent.data);
            if (event[0] == EVENTS.PROGRAM_END) {
                console.log('PROGRAM_END');
            } else if (event[0] == EVENTS.PROGRAM_START) {
                console.log('PROGRAM_START');
                $('#spinner').show();
            } else if (event[0] == EVENTS.MOVED) {
                console.log('MOVED');
            } else if (event[0] == EVENTS.ENTER_MANUAL_MODE) {
                console.log('ENTER_MANUAL_MODE');
            } else if (event[0] == EVENTS.EXIT_MANUAL_MODE) {
                console.log('EXIT_MANUAL_MODE');
            }
        } else {
            console.log(chrome.runtime.lastError);
            console.log(usbEvent);
            closeDevice();
        }
    };
}
var previousState = null;
function fetchState() {
    if (currentDevice) {
        chrome.usb.controlTransfer(currentDevice, {
            requestType: 'vendor',
            recipient: 'interface',
            direction: 'in',
            request: CONTROL_COMMANDS.REQUEST_STATE,
            value: 0,
            index: 0,
            length: 8
        }, function (usbEvent) {
            var state = new DataView(usbEvent.data).getUint32(0, true);
            if (state == previousState)
                return;
            if (state == STATES.READY) {
                $('#spinner').hide();
                manualControl.removeAttr('disabled');
                manualControl.text('Manual Control');
            } else if (state == STATES.MANUAL_CONTROL) {
                $('#spinner').hide();
                manualControl.removeAttr('disabled');
                manualControl.text('Stop Manual Control');
            } else if (state == STATES.RUNNING_PROGRAM) {
                $('#spinner').show();
                manualControl.attr('disabled', 'disabled');
            }
            previousState = state;
        });
    }
}

function handlePosition(usbEvent) {
    if (usbEvent.resultCode)
        return false;
    var buffer = new Int32Array(usbEvent.data);
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
    fetchState();
    return true;
}

function fetchPosition() {
    if (currentDevice) {
        pollInterrupt();
        chrome.usb.controlTransfer(currentDevice, {
            requestType: 'vendor',
            recipient: 'interface',
            direction: 'in',
            request: CONTROL_COMMANDS.REQUEST_POSITION,
            value: 0,
            index: 0,
            length: 16
        }, function (usbEvent) {
            if (!handlePosition(usbEvent))
                console.log(chrome.runtime.lastError);
        });
    }
}

function resetDevice() {
    closeDevice(bindDevice);
}

function bindDevice() {
    chrome.usb.findDevices(DEVICE_INFO, function (devices) {
        if (!devices || !devices.length) {
            console.log('no device found');
            $('#connect').show();
            $('#send').hide();
            return;
        }
        var device = devices[0];
        chrome.usb.claimInterface(device, 0, function () {
            if (chrome.runtime.lastError) {
                resetDevice();
                return;
            }
            currentDevice = device;
            $('#connect').hide();
            $('#send').show();
            bodyElement.style.backgroundColor = 'blue';
            chrome.usb.controlTransfer(currentDevice, {
                requestType: 'vendor',
                recipient: 'interface',
                direction: 'in',
                request: CONTROL_COMMANDS.REQUEST_PARAMETERS,
                value: 0,
                index: 0,
                length: 16
            }, function (res) {
                if (chrome.runtime.lastError)
                    console.log(chrome.runtime.lastError);
                else {
                    var params = new Int32Array(res.data);
                    parameters.stepsPerMillimeter = params[0];
                    parameters.maxSpeed = params[1];
                    parameters.maxAcceleration = params[2];
                    parameters.clockFrequency = params[3];
                }
            });
            fetchPosition();
        });
    });
}
$('#connect').click(function () {
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
        $('#connect').show();
        $('#send').hide();
    }
});
$('.paramField').bind('input', function () {
    $('.axisButton').prop('disabled', $('.paramField:invalid').length > 0);
});
$('.axisButton').click(function (event) {
    var text = "G91 G1 F" + $('#feedRateField').val() + " " + $(event.target).data('axis') + $('#incrementField').val();
    console.log(text);
    sendPlan(text, fetchPosition);
});
manualControl.click(function () {
    chrome.usb.controlTransfer(currentDevice, {
        requestType: 'vendor',
        recipient: 'interface',
        direction: 'out',
        request: CONTROL_COMMANDS.REQUEST_TOGGLE_MANUAL_STATE,
        value: 0,
        index: 0,
        data: new ArrayBuffer(0)
    }, function (e) {
        console.log(e);
    });
});
$('.zeroButton').click(function (event) {
    var axis = $(event.target).data('axis');
    var value = parseInt({X: '001', Y: '010', Z: '100'}[axis], 2);
    chrome.usb.controlTransfer(currentDevice, {
        requestType: 'vendor',
        recipient: 'interface',
        direction: 'out',
        request: CONTROL_COMMANDS.REQUEST_ZERO_AXIS,
        value: value,
        index: 0,
        data: new ArrayBuffer(0)
    }, function (e) {
    });
});