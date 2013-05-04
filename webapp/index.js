"use strict";
var DEVICE_INFO = {"vendorId": 0x0483, "productId": 0xFFFF};
var PERMISSIONS = {permissions: [
    {'usbDevices': [DEVICE_INFO] }
]};
var bodyElement = document.getElementById("body");
var permissionElement = document.getElementById("perms");
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
        var xd = point.dx >= 0 ? 1 : 0;
        var ys = point.dy ? 1 : 0;
        var yd = point.dy >= 0 ? 1 : 0;
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
        webView.contentWindow.postMessage({type: 'gimme program'}, 'http://localhost');
    }
});
function resetDevice() {
    currentDevice = null;
    chrome.usb.findDevices(DEVICE_INFO, function (devices) {
        if (!devices || !devices.length) {
            resetDevice();
            return;
        }
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
            bindDevice();
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
                bodyElement.style.backgroundColor = 'blue';
                var transfer = {direction: 'in', endpoint: 1, length: 1};
                chrome.usb.interruptTransfer(device, transfer, interruptHandler(device));
            });
        });
    });
}
permissionElement.addEventListener('click', function () {
    chrome.permissions.request(PERMISSIONS, function (result) {
        if (result) {
            permissionElement.style.visibility = 'hidden';
            sendButton.style.visibility = 'visible';
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
        permissionElement.style.visibility = 'visible';
        sendButton.style.visibility = 'hidden';
    }
});

