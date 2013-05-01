"use strict";
var DEVICE_INFO = {"vendorId": 0x0483, "productId": 0xFFFF};
var PERMISSIONS = {permissions: [
    {'usbDevices': [DEVICE_INFO] }
]};
var textElement = document.getElementById("text");
var permissionElement = document.getElementById("perms");
function resetDevice() {
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
            textElement.style.color = 'black';
            resetDevice();
            return;
        }
        var buffer = new Int8Array(usbEvent.data);
        textElement.style.color = buffer[0] ? 'red' : 'blue';
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
                textElement.style.color = 'blue';
                chrome.usb.interruptTransfer(device, transfer, interruptHandler(device));
            });
        });
    });
}
permissionElement.addEventListener('click', function () {
    chrome.permissions.request(PERMISSIONS, function (result) {
        if (result) {
            permissionElement.style.visibility = 'hidden';
            textElement.style.visibility = 'visible';
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
        textElement.style.visibility = 'hidden';
    }
});

