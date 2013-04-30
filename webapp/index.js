var VENDOR_ID = 0x0483;
var PRODUCT_ID = 0xFFFF;
var DEVICE_INFO = {"vendorId": VENDOR_ID, "productId": PRODUCT_ID};

var permissionObj = {permissions: [
    {'usbDevices': [DEVICE_INFO] }
]};
document.getElementById("reset").addEventListener('click', function () {
    "use strict";
    chrome.permissions.request(permissionObj, function (result) {
        if (result) {
            chrome.usb.findDevices(DEVICE_INFO,
                function (devices) {
                    if (!devices || !devices.length) {
                        console.log('no device found');
                        return;
                    }
                    console.log('Found device', devices[0]);
                    var device = devices[0];
                    chrome.usb.closeDevice(device, function (res) {
                        console.log('reset', res);
                    });
                });
        } else {
            console.log('App was not granted the "usbDevices" permission.');
            console.log(chrome.runtime.lastError);
        }
    });
});
document.getElementById("perms").addEventListener('click', function () {
    "use strict";

    chrome.permissions.request(permissionObj, function (result) {
        if (result) {
            chrome.usb.findDevices(DEVICE_INFO,
                function (devices) {
                    if (!devices || !devices.length) {
                        console.log('no device found');
                        return;
                    }
                    console.log('Found device', devices[0]);
                    var device = devices[0];
                    chrome.usb.claimInterface(device, 0, function () {
                        console.log('claimed');
                        chrome.usb.setInterfaceAlternateSetting(device, 0, 0, function () {
                            console.log('setInterfaceAlternateSetting');
                            var transfer = {
                                direction: 'in',
                                endpoint: 1,
                                length: 1
                            };

                            function onInterrupt(usbEvent) {
                                if (usbEvent.resultCode) {
                                    console.log("interrupt Error", usbEvent.error);
                                    return;
                                }
                                console.log('interrupt');
                                var buffer = new Int8Array(usbEvent.data);
                                var val = buffer[0];
                                document.getElementById("lol").style.color = val ? 'red' : 'blue';
                                chrome.usb.interruptTransfer(device, transfer, onInterrupt);
                            }

                            chrome.usb.interruptTransfer(device, transfer, onInterrupt);
                        });
                    });

                });
        } else {
            console.log('App was not granted the "usbDevices" permission.');
            console.log(chrome.runtime.lastError);
        }
    });
});


