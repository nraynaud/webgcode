"use strict";

self.onmessage = function (event) {
    if (event.data == 'ping')
        setTimeout(function () {
            postMessage('pong');
        }, 10);
};