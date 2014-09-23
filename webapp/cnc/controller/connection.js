"use strict";
define(['RSVP', 'jQuery', 'Ember'], function (rsvp, $, Ember) {
    var DEVICE_INFO = {"vendorId": 0x0483, "productId": 0xFFFF};

    function emberizePromisize(usbFunction, firstArgs) {
        return new rsvp.Promise(function (resolve, reject) {
            function callback() {
                if (chrome.runtime.lastError)
                    reject(chrome.runtime.lastError, arguments, arguments[0].resultCode);
                else
                    resolve.apply(null, arguments);
            }

            usbFunction.apply(null, firstArgs.concat([Ember.run.bind(null, callback)]));
        });
    }

    // the chrome API is copied here for aesthetic reasons. It gives us a complete prototype
    function claimInterface(handle, interfaceNumber) {
        return emberizePromisize(chrome.usb.claimInterface, [handle, interfaceNumber]);
    }

    function releaseInterface(handle, interfaceNumber) {
        return emberizePromisize(chrome.usb.releaseInterface, [handle, interfaceNumber]);
    }

    function resetDevice(handle) {
        return emberizePromisize(chrome.usb.resetDevice, [handle])
    }

    function closeDevice(handle) {
        return emberizePromisize(chrome.usb.closeDevice, [handle])
    }

    function findDevices(options) {
        return emberizePromisize(chrome.usb.findDevices, [options]);
    }

    /*
     Just an object holding a USB connection to the device, and exposing a low-level communication API.
     */
    return Ember.Object.extend({
        currentDevice: null,
        usbObservers: {},
        DEVICE_INFO: DEVICE_INFO,
        DEFAULT_TRANSFER_INFO: {requestType: 'vendor', recipient: 'interface', direction: 'in', value: 0, index: 0},
        claim: function (device) {
            return claimInterface(device, 0).then(function () {
                return device;
            });
        },
        bind: function () {
            var _this = this;
            return _this.find()
                .then(function (device) {
                    return _this.claim(device);
                })
                .then(function (device) {
                    _this.set('currentDevice', device);
                    return device;
                })
        },
        find: function () {
            var _this = this;
            return findDevices(_this.DEVICE_INFO).then(function (devices) {
                if (!devices.length) {
                    _this.set('currentDevice', null);
                    throw null;
                } else
                    return devices[0];
            });
        },
        promisedTransfer: function (usbFunction, transferInfo) {
            return emberizePromisize(usbFunction, [this.get('currentDevice'), transferInfo])
                .then(function (usbEvent) {
                    var errorCode = usbEvent.resultCode;
                    if (errorCode) {
                        var error = chrome.runtime.lastError;
                        console.error(errorCode, error);
                        throw errorCode;
                    }
                    return usbEvent.data;
                });
        },
        reset: function () {
            var _this = this;
            if (_this.get('currentDevice') != null)
                return resetDevice(_this.get('currentDevice'))
                    .finally(function () {
                        _this.set('currentDevice', null);
                    });
            return null;
        },
        close: function () {
            var _this = this;
            return closeDevice(this.get('currentDevice'))
                .finally(function () {
                    _this.set('currentDevice', null);
                });
        },
        release: function () {
            return releaseInterface(this.get('currentDevice'), 0);
        },
        createTransferPacket: function (transferInfo) {
            return $.extend({}, this.DEFAULT_TRANSFER_INFO, transferInfo);
        },
        controlTransfer: function (partialTransferInfo) {
            return this.promisedTransfer(chrome.usb.controlTransfer, this.createTransferPacket(partialTransferInfo));
        },
        bulkTransfer: function (transfer) {
            return this.promisedTransfer(chrome.usb.bulkTransfer, transfer);
        },
        interruptTransfer: function (transfer) {
            return this.promisedTransfer(chrome.usb.interruptTransfer, transfer);
        },
        opened: function () {
            return this.get('currentDevice') != null;
        }.property('currentDevice')
    });
});