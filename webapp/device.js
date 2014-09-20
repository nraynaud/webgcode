"use strict";
define(['RSVP', 'jQuery', 'Ember'], function (rsvp, $, Ember) {
    var DEVICE_INFO = {"vendorId": 0x0483, "productId": 0xFFFF};

    return Ember.Object.extend({
        init: function () {
            var _this = this;
            rsvp.on('error', function (reason) {
                console.error(reason, reason.stack);
                _this.reset();
            });
        },
        currentDevice: null,
        usbObservers: {},
        DEVICE_INFO: DEVICE_INFO,
        DEFAULT_TRANSFER_INFO: {requestType: 'vendor', recipient: 'interface', direction: 'in', value: 0, index: 0},
        claim: function (device) {
            return new rsvp.Promise(function (resolve, reject) {
                chrome.usb.claimInterface(device, 0, function () {
                    if (chrome.runtime.lastError)
                        reject(chrome.runtime.lastError);
                    resolve(device);
                });
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
            return new rsvp.Promise(function (resolve, reject) {
                chrome.usb.findDevices(_this.DEVICE_INFO, function (devices) {
                    if (!devices || !devices.length) {
                        _this.set('currentDevice', null);
                        reject('no suitable device found');
                    } else
                        resolve(devices[0]);
                });
            });
        },
        promisedTransfer: function (usbFunction, args) {
            var _this = this;
            return new RSVP.Promise(function (resolve, reject) {
                if (_this.get('currentDevice'))
                    usbFunction.apply(null, [_this.get('currentDevice')].concat(args, [function (usbEvent) {
                        var errorCode = usbEvent.resultCode;
                        if (errorCode) {
                            var error = chrome.runtime.lastError;
                            console.log(errorCode, error);
                            reject(errorCode);
                        } else
                            resolve(usbEvent.data);
                    }]));
                else
                    reject('no suitable device found');
            });
        },
        reset: function () {
            var _this = this;
            if (_this.get('currentDevice') != null)
                return new rsvp.Promise(function (resolve, reject) {
                    chrome.usb.resetDevice(_this.get('currentDevice'), resolve);
                })
                    .then(function () {
                        return _this.release();
                    })
                    .then(function () {
                        return _this.close();
                    })
                    .then(function () {
                        return _this.bind();
                    }).catch(function () {
                        console.log('caught error in reset(), not re-trying');
                    });
            return _this.bind().catch(function () {
                console.log('caught error in reset(), not re-trying');
            });
        },
        close: function () {
            var _this = this;
            new rsvp.Promise(function (resolve, reject) {
                chrome.usb.closeDevice(_this.get('currentDevice'), function () {
                    _this.set('currentDevice', null);
                    resolve();
                });
            });
        },
        release: function () {
            var _this = this;
            new rsvp.Promise(function (resolve, reject) {
                chrome.usb.releaseInterface(_this.get('currentDevice'), 0, resolve);
            });
        },
        createTransferPacket: function (transferInfo) {
            return $.extend({}, this.DEFAULT_TRANSFER_INFO, transferInfo);
        },
        controlTransfer: function (transferInfo) {
            return this.promisedTransfer(chrome.usb.controlTransfer, [this.createTransferPacket(transferInfo)]);
        },
        bulkTransfer: function (transfer) {
            return this.promisedTransfer(chrome.usb.bulkTransfer, [transfer]);
        },
        guardedTransfer: function (transferFunc, guardName, tranfert) {
            var _this = this;
            var usbObservers = _this.get('usbObservers');
            if (!_this.get('currentDevice'))
                return new rsvp.Promise(function (resolve, reject) {
                    reject('no device open');
                });
            if (!usbObservers[guardName]) {
                usbObservers[guardName] = true;
                return this.promisedTransfer(transferFunc, [tranfert]).finally(function () {
                    usbObservers[guardName] = false;
                });
            }
            return new rsvp.Promise(function (resolve, reject) {
                reject('guarded');
            });
        },
        opened: function () {
            return this.get('currentDevice') != null;
        }.property('currentDevice')
    });
});