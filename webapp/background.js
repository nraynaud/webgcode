"use strict";
chrome.app.runtime.onLaunched.addListener(function () {
    chrome.app.window.create('test.html', {
        bounds: {
            width: 800,
            height: 800
        }
    });
});