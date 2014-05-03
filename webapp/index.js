"use strict";
require(['device', 'runner'], function (Device, Runner) {
    var device = Device.create({});
    var runner = new Runner(device);
    var PERMISSIONS = {permissions: [
        {'usbDevices': [device.DEVICE_INFO]}
    ]};
    var CONTROL_COMMANDS = {REQUEST_POSITION: 0, REQUEST_PARAMETERS: 1, REQUEST_STATE: 2, REQUEST_TOGGLE_MANUAL_STATE: 3,
        REQUEST_ZERO_AXIS: 4};
    var EVENTS = {PROGRAM_END: 1, PROGRAM_START: 2, MOVED: 3, ENTER_MANUAL_MODE: 4, EXIT_MANUAL_MODE: 5};
    var STATES = {READY: 0, RUNNING_PROGRAM: 1, MANUAL_CONTROL: 2};

    var coloredElement = document.getElementById("header");
    var webView = document.getElementById("webView");

    var manualControl = $('#manualControl');
    var spinner = $('#spinner');
    var connectButton = $('#connect');
    var sendButton = $('#send');
    var abortButton = $('#abort');

    var parameters = {
        stepsPerMillimeter: 640,
        maxFeedrate: 2000,
        maxAcceleration: 100,
        clockFrequency: 200000,
        position: {x: 0, y: 0, z: 0}
    };

    var positionFetcherIntervalID = null;
    var currentState = null;
    $('.inputLanguageCheckbox').click(function (event) {
        var url = $(event.target).data('url');
        $('#webView').attr('src', url);
    });

    $(runner).on('running', function () {
        abortButton.show();
        sendButton.attr('disabled', 'disabled');
    });
    $(runner).on('available', function () {
        sendButton.removeAttr('disabled');
    });

    $('#webView').bind('load', function () {
        chrome.storage.local.get('code', function (res) {
            if (res['code'])
                webView.contentWindow.postMessage({type: 'setCode', code: res['code']}, '*');
        });
    });

    chrome.app.window.onClosed.addListener(function () {
        myWorker.terminate();
        device.release().then(function () {
            return device.close();
        })
    });

    window.addEventListener("message", function (event) {
        var message = event.data;
        if (message['type'] == 'codeChange')
            chrome.storage.local.set({code: message['code']});
    }, false);

    sendButton.click(function () {
        sendButton.attr('disabled', 'disabled');
        webView.contentWindow.postMessage({type: 'gimme program', parameters: parameters}, '*', [runner.getCodeChannel()]);
    });
    refreshOpenedState();
    device.addObserver('opened', refreshOpenedState);
    function refreshOpenedState() {
        if (device.get('opened')) {
            connectButton.hide();
            sendButton.show();
            manualControl.show();
            abortButton.hide();
            coloredElement.style.backgroundColor = 'blue';
            positionFetcherIntervalID = window.setInterval(fetchState, 200);
            pollInterrupt();
        } else {
            coloredElement.style.backgroundColor = 'black';
            if (positionFetcherIntervalID) {
                window.clearInterval(positionFetcherIntervalID);
                positionFetcherIntervalID = null;
            }
            connectButton.show();
            sendButton.hide();
            spinner.css('visibility', 'hidden');
            manualControl.hide();
            abortButton.hide();
        }
    }

    function pollInterrupt() {
        device.guardedTransfer(chrome.usb.interruptTransfer, 'interrupt', {direction: 'in', endpoint: 1, length: 16})
            .then(handleInterrupt);
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

    function fetchState() {
        var stateTransfer = device.createTransferPacket({request: CONTROL_COMMANDS.REQUEST_STATE, length: 8});
        device.guardedTransfer(chrome.usb.controlTransfer, 'state', stateTransfer).then(function (data) {
            var state = new DataView(data).getUint32(0, true);
            if (state == currentState)
                return;
            if (state == STATES.READY) {
                spinner.css('visibility', 'hidden');
                manualControl.removeAttr('disabled');
                abortButton.hide();
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
        var positionTransfer = device.createTransferPacket({request: CONTROL_COMMANDS.REQUEST_POSITION, length: 16});
        device.guardedTransfer(chrome.usb.controlTransfer, 'position', positionTransfer).then(function (data) {
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

    function bindDevice() {
        device.bind()
            .then(function () {
                console.log('bound');
                return device.controlTransfer({request: CONTROL_COMMANDS.REQUEST_PARAMETERS, length: 16 });
            })
            .then(function (data) {
                console.log('received configuration');
                var params = new Int32Array(data);
                parameters.stepsPerMillimeter = params[0];
                parameters.maxFeedrate = params[1];
                parameters.maxAcceleration = params[2];
                parameters.clockFrequency = params[3];
            }).catch(function (error) {
                console.log(error, error.stack);
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
    abortButton.click(function () {
        runner.stop();
        sendButton.removeAttr('disabled');
        abortButton.hide();
    });
    chrome.permissions.contains(PERMISSIONS, function (result) {
        if (result)
            bindDevice();
        else {
            connectButton.show();
            sendButton.hide();
            abortButton.hide();
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
        device.controlTransfer({direction: 'out', request: CONTROL_COMMANDS.REQUEST_TOGGLE_MANUAL_STATE, data: new ArrayBuffer(0)});
    });
    $('.zeroButton').click(function (event) {
        var axis = $(event.target).data('axis');
        var value = parseInt({X: '001', Y: '010', Z: '100'}[axis], 2);
        device.controlTransfer({direction: 'out', request: CONTROL_COMMANDS.REQUEST_ZERO_AXIS, value: value, data: new ArrayBuffer(0)});
    });
});