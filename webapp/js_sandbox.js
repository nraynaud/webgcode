"use strict";
require(['libs/svg', 'cnc/cam/cam', 'jQuery'], function (SVG, cam, $) {

    var paper = new SVG(document.getElementById("paper"));
    window.addEventListener('message', function (event) {
        switch (event.data.command) {
            case 'eval':
                try {
                    var code = event.data.code;

                    var machine = new cam.Machine(paper);

                    var sendResponse = function () {
                        var operationsData = [];
                        for (var i = 0; i < machine.operations.length; ++i) {
                            var operation = machine.operations[i];
                            operationsData.push({
                                className: operation.getTypeName(),
                                path: operation.path
                            });
                        }
                        var copy = $(paper.node.cloneNode(true));
                        copy.find('*').removeAttr('id');
                        event.source.postMessage({
                            command: 'eval-result',
                            success: true,
                            result: {
                                operations: operationsData,
                                outlines: machine.outlines,
                                params: {workZ: machine.workZ, travelZ: machine.travelZ, feedRate: machine.feedRate}
                            },
                            requestIndex: event.data.requestIndex
                        }, event.origin);
                        paper.clear();
                    };

                    var waitForWhenDone = true;

                    var whenDone = function () {
                        if (waitForWhenDone)
                            sendResponse();
                        else
                            throw new Error("You must return true at the end of your code if you use whenDone");
                    };

                    waitForWhenDone = new Function(['cam', 'machine', 'whenDone'], code)(cam, machine, whenDone);
                } catch (error) {
                    event.source.postMessage({
                        command: 'eval-result',
                        success: false,
                        error: [error.message, error.stack],
                        requestIndex: event.data.requestIndex
                    }, event.origin);
                    paper.clear();
                    throw error;
                }
                if (!waitForWhenDone)
                    sendResponse();
                break;
        }
    });
});