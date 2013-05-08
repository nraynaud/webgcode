"use strict";
var DEVICE_INFO = {"vendorId": 0x0483, "productId": 0xFFFF};
var PERMISSIONS = {permissions: [
    {'usbDevices': [DEVICE_INFO] }
]};
var bodyElement = document.getElementById("body");
var sendButton = document.getElementById("send");
var webView = document.getElementById("webView");

var currentDevice = null;
window.addEventListener("message", function (event) {
    console.log(event);
    var message = event.data;
    if (message['type'] == 'program' && currentDevice) {
        sendSpeed(currentDevice, message['program'], function (usbEvent) {
            console.log('sent!');
            sendButton.disabled = false;
        });
    }
}, false);

webView.addEventListener('loadstop', function () {
    webView.contentWindow.postMessage('got path?', 'http://localhost');
});

function flushBulkSend(device, endpoint, callback) {
    var transfer2 = {direction: 'out', endpoint: endpoint, data: new ArrayBuffer(0)};
    chrome.usb.bulkTransfer(device, transfer2, function (usbEvent) {
        callback(usbEvent);
    });
}
function sendSpeed(device, speedData, callback) {
    var formattedData = new ArrayBuffer(speedData.length * 3);
    var view = new DataView(formattedData);
    for (var i = 0; i < speedData.length; i++) {
        var point = speedData[i];
        view.setUint16(i * 3, point.time, true);
        var xs = point.dx ? 1 : 0;
        var xd = point.dx <= 0 ? 1 : 0;
        var ys = point.dy ? 1 : 0;
        var yd = point.dy <= 0 ? 1 : 0;
        var zs = point.dz ? 1 : 0;
        var zd = point.dz >= 0 ? 1 : 0;
        var word = '00' + zd + zs + yd + ys + xd + xs;
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

sendButton.addEventListener('click', function () {
    if (currentDevice) {
        sendButton.disabled = true;
        var parser = document.createElement('a');
        parser.href = webView.src;

        webView.contentWindow.postMessage({type: 'gimme program'}, parser.protocol + '//' + parser.host);
    }
});
function resetDevice() {
    currentDevice = null;
    $('#connect').show();
    $('#send').hide();
    chrome.usb.findDevices(DEVICE_INFO, function (devices) {
        if (!devices || !devices.length)
            return;
        chrome.usb.closeDevice(devices[0], bindDevice);
    });
}

function interruptHandler(device) {
    return function (usbEvent) {
        if (usbEvent.resultCode) {
            bodyElement.style.backgroundColor = 'black';
            resetDevice();
            return;
        }
        var buffer = new Int8Array(usbEvent.data);
        bodyElement.style.backgroundColor = buffer[0] ? 'red' : 'blue';
        var transfer = {direction: 'in', endpoint: 1, length: 1};
        chrome.usb.interruptTransfer(device, transfer, interruptHandler(device));
    };
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
            chrome.usb.setInterfaceAlternateSetting(device, 0, 0, function () {
                if (chrome.runtime.lastError) {
                    resetDevice();
                    return;
                }
                currentDevice = device;
                $('#connect').hide();
                $('#send').show();
                bodyElement.style.backgroundColor = 'blue';
                var transfer = {direction: 'in', endpoint: 1, length: 1};
                chrome.usb.interruptTransfer(device, transfer, interruptHandler(device));
            });
        });
    });
}
$('#connect').click(function () {
    chrome.permissions.request(PERMISSIONS, function (result) {
        if (result) {
            bindDevice();
        } else {
            console.log('App was not granted the "usbDevices" permission.');
            console.log(chrome.runtime.lastError);
        }
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
    var text = "G1 F" + $('#feedRateField').val() + " " + $(event.target).data('axis') + $('#incrementField').val();
    console.log(text);
    var res = planProgram(text, 150, 1 / 640, 200000);
    sendSpeed(currentDevice, res.program, function () {
        console.log('sent');
    });
});