"use strict";
var DEVICE_INFO = {"vendorId": 0x0483, "productId": 0xFFFF};
var PERMISSIONS = {permissions: [
    {'usbDevices': [DEVICE_INFO] }
]};
var bodyElement = document.getElementById("body");
var permissionElement = document.getElementById("perms");
var sendButton = document.getElementById("send");

var currentDevice = null;

sendButton.addEventListener('click', function () {
    if (currentDevice) {
        console.log('sending bulk');
        var transfer2 = {
            direction: 'out',
            endpoint: 1,
            data: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1]).buffer
        };
        chrome.usb.bulkTransfer(currentDevice, transfer2, function (usbEvent) {
            console.log(chrome.runtime.lastError);
            if (usbEvent.resultCode) {
                console.log('error in bulkSend', usbEvent);
                return;
            }
            console.log('bulkSend ok');
        });
    }
});
function resetDevice() {
    currentDevice = null;
    chrome.usb.findDevices(DEVICE_INFO,
        function (devices) {
            if (!devices || !devices.length) {
                resetDevice();
                return;
            }
            chrome.usb.closeDevice(devices[0], function () {
                bindDevice();
            });
        });
}
var transfer = {
    direction: 'in',
    endpoint: 1,
    length: 1
};
function interruptHandler(device) {
    return function (usbEvent) {
        if (usbEvent.resultCode) {
            bodyElement.style.backgroundColor = 'black';
            resetDevice();
            return;
        }
        var buffer = new Int8Array(usbEvent.data);
        bodyElement.style.backgroundColor = buffer[0] ? 'red' : 'blue';
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
                chrome.usb.interruptTransfer(device, transfer, interruptHandler(device));
            });
        });
    });
}
permissionElement.addEventListener('click', function () {
    chrome.permissions.request(PERMISSIONS, function (result) {
        if (result) {
            permissionElement.style.visibility = 'hidden';
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
    }
});

