"use strict";
var DEVICE_INFO = {"vendorId": 0x0483, "productId": 0xFFFF};
var PERMISSIONS = {permissions: [
    {'usbDevices': [DEVICE_INFO]}
]};
var CONTROL_COMMANDS = {REQUEST_POSITION: 0, REQUEST_PARAMETERS: 1, REQUEST_STATE: 2, REQUEST_TOGGLE_MANUAL_STATE: 3, REQUEST_ZERO_AXIS: 4};
var EVENTS = {PROGRAM_END: 1, PROGRAM_START: 2, MOVED: 3, ENTER_MANUAL_MODE: 4, EXIT_MANUAL_MODE: 5};
var bodyElement = document.getElementById("body");
var webView = document.getElementById("webView");

var parameters = {
    stepsPerMillimeter: 640,
    maxSpeed: 2000,
    maxAcceleration: 100,
    clockFrequency: 200000,
    position: {x: 0, y: 0, z: 0}
};

function webviewProtocol() {
    var parser = $('<a></a>').attr('href', webView.src)[0];
    return parser.protocol + '//' + parser.host;
}
$('#webView').bind('loadstop', function () {
    fetchPosition();
});
var currentDevice = null;

chrome.app.window.onClosed.addListener(function () {
    closeDevice(function () {
    });
});

window.addEventListener("message", function (event) {
    var message = event.data;
    if (message['type'] == 'program' && currentDevice)
        sendPlan(message['program'], function () {
            $('#send').removeAttr('disabled');
        });
}, false);

function flushBulkSend(device, endpoint, callback) {
    var transfer2 = {direction: 'out', endpoint: endpoint, data: new ArrayBuffer(0)};
    chrome.usb.bulkTransfer(device, transfer2, function (usbEvent) {
        callback(usbEvent);
    });
}

function sendPlan(plan, callback) {
    var program = planProgram(plan, parameters.maxAcceleration, 1 / parameters.stepsPerMillimeter, parameters.clockFrequency, parameters.position);
    sendSpeed(currentDevice, program.program, function (usbEvent) {
        callback(usbEvent);
    });
}

function sendSpeed(device, speedData, callback) {
    var programLength = speedData.length * 3;
    var formattedData = new ArrayBuffer(programLength + 4);
    new DataView(formattedData).setUint32(0, programLength, true);
    var view = new DataView(formattedData, 4);

    function bin(axis) {
        var xs = axis ? '1' : '0';
        var xd = axis >= 0 ? '1' : '0';
        return '' + xd + xs;
    }

    for (var i = 0; i < speedData.length; i++) {
        var point = speedData[i];
        view.setUint16(i * 3, point.time, true);
        var word = '00' + bin(point.dz) + bin(point.dy) + bin(point.dx);
        view.setUint8(i * 3 + 2, parseInt(word, 2), true);
    }
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
        webView.contentWindow.postMessage({type: 'gimme program'}, webviewProtocol());
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
window.setInterval(fetchPosition, 50);
//var intervalPositionFetcherID = null;
function interruptHandler(device) {
    return function (usbEvent) {
        if (!usbEvent.resultCode) {
            var event = new Int32Array(usbEvent.data);
            if (event[0] == EVENTS.PROGRAM_END) {
                console.log('PROGRAM_END');
                //window.clearInterval(intervalPositionFetcherID);
                //intervalPositionFetcherID = null;
                fetchPosition();
                $('#spinner').hide();
            } else if (event[0] == EVENTS.PROGRAM_START) {
                console.log('PROGRAM_START');
                $('#spinner').show();
                //intervalPositionFetcherID = window.setInterval(fetchPosition, 200);
            } else if (event[0] == EVENTS.MOVED) {
                console.log('MOVED');
                handlePosition({data: usbEvent.data.slice(4)});
            } else if (event[0] == EVENTS.ENTER_MANUAL_MODE) {
                console.log('ENTER_MANUAL_MODE');
            } else if (event[0] == EVENTS.EXIT_MANUAL_MODE) {
                console.log('EXIT_MANUAL_MODE');
            }
            var transfer = {direction: 'in', endpoint: 1, length: 16};
            chrome.usb.interruptTransfer(device, transfer, interruptHandler(device));
        } else {
            console.log(chrome.runtime.lastError);
            console.log(usbEvent);
            closeDevice();
        }
    };
}

function handlePosition(usbEvent) {
    if (usbEvent.resultCode)
        return false;
    var buffer = new Int32Array(usbEvent.data);
    var x = buffer[0] / parameters.stepsPerMillimeter;
    var y = buffer[1] / parameters.stepsPerMillimeter;
    var z = buffer[2] / parameters.stepsPerMillimeter;
    parameters.position = {x: x, y: y, z: z};
    $('#xpos').text(x.toFixed(3));
    $('#ypos').text(y.toFixed(3));
    $('#zpos').text(z.toFixed(3));
    webView.contentWindow.postMessage({type: 'toolPosition', position: parameters.position}, webviewProtocol());
    return true;
}

function fetchPosition() {
    if (currentDevice)
        chrome.usb.controlTransfer(currentDevice, {
            requestType: 'vendor',
            recipient: 'interface',
            direction: 'in',
            request: CONTROL_COMMANDS.REQUEST_POSITION,
            value: 0,
            index: 0,
            length: 24
        }, function (usbEvent) {
            if (!handlePosition(usbEvent))
                console.log(chrome.runtime.lastError);
        });
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
                    console.log(parameters);
                }
            });
            fetchPosition();
            var transfer = {direction: 'in', endpoint: 1, length: 16};
            chrome.usb.interruptTransfer(device, transfer, interruptHandler(device));
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
$('#manualControl').click(function () {
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
$('.zeroButton').click(function (eventevent) {
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
        console.log(e);
    });
});