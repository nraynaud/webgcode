"use strict";
var $ = {
    each: function (array, func) {
        for (var i = 0; i < array.length; i++)
            func(i, array[i]);
    },
    extend: function () {
        /** stolen from JQUERY **/
        var src, copy, name, options,
            target = arguments[0] || {},
            length = arguments.length;
        for (var i = 0; i < length; i++)
            if ((options = arguments[i]) != null)
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy)
                        continue;
                    if (copy !== undefined)
                        target[name] = copy;
                }
        return target;
        /** END stolen from JQUERY **/
    }
};

importScripts('libs/require.js', 'config.js');
var tasks = {
    createPocket: function (event) {
        require(['cnc/cam/pocket'], function (pocket) {
            pocket.createPocketWorkerSide(event);
        });
    },
    computeToolpath: function (event) {
        require(['cnc/cam/operations', 'cnc/util'], function (operations, util) {

            var sentMessages = 0;

            function sendMessage(message, transferable) {
                sentMessages++;
                if (sentMessages >= 3)
                    message.terminate = true;
                self.postMessage(message, transferable);
            }

            function handleMissedArea(missedArea) {
                sendMessage({missedArea: missedArea.result}, missedArea.transferable);
            }

            function handleLeftStock(leftStock) {
                sendMessage({leftStock: leftStock.result}, leftStock.transferable);
            }

            event.data.params.outline.clipperPolyline = event.data.params.outline.clipperPolyline.map(function (polygon) {
                return polygon.map(function (point) {
                    return new util.Point(point.x, point.y, point.z);
                });
            });

            operations[event.data.params.type]
                .computeToolpath(event.data.params, handleMissedArea, handleLeftStock).then(function (toolpath) {
                    sendMessage({
                        toolpath: toolpath.toolpath.map(function (p) {
                            return p.toJSON()
                        })
                    });
                }).catch(function (e) {
                    console.log('error ', e);
                    throw e;
                });
        });
    },
    acceptProgram: function (event) {
        require(['cnc/gcode/parser', 'cnc/gcode/simulation', 'cnc/util.js'], function (parser, simulation, util) {
            //see usb.c:tryToStartProgram()
            var PROGRAM_TYPES = {
                PROGRAM_STEPS: 0,
                PROGRAM_START_SPINDLE: 1,
                PROGRAM_STOP_SPINDLE: 2,
                PROGRAM_START_SOCKET: 3,
                PROGRAM_STOP_SOCKET: 4
            };

            function createSingleFlagProgram(type) {
                return {program: new Uint8Array([type, 0, 0, 0, 0, 0, 0, 0]).buffer, programID: 0, operations: []};
            }

            var MAX_QUEUED_PROGRAMS = 10;
            var TOOLPATH_CHUNK_SIZE = 100000;
            var MAX_PROGRAM_SIZE = 300;
            var sentToRunnerProgramsCount = 0;
            var sentToUSBProgramsCount = 0;
            var programEncoder = createProgramEncoder(MAX_PROGRAM_SIZE);
            var pendingEvents = [];
            var pendingToolPathChunks = [];
            var inputPort = event.ports[0];
            var outputPort = event.ports[1];
            var stopSpindleAfter = false;
            var stopSocketAfter = false;

            inputPort.onmessage = function (deferredEvent) {
                pendingEvents.push(deferredEvent);
                stopSpindleAfter |= deferredEvent.data.stopSpindleAfter;
                stopSocketAfter |= deferredEvent.data.stopSocketAfter;
                if (deferredEvent.data.startSpindleBefore)
                    outputPort.postMessage(createSingleFlagProgram(PROGRAM_TYPES.PROGRAM_START_SPINDLE));
                if (deferredEvent.data.startSocketBefore)
                    outputPort.postMessage(createSingleFlagProgram(PROGRAM_TYPES.PROGRAM_START_SOCKET));
                while (pendingEvents.length > 0 && sentToRunnerProgramsCount - sentToUSBProgramsCount < MAX_QUEUED_PROGRAMS) {
                    var event = pendingEvents.shift();
                    var typeConverter = {
                        gcode: function (data) {
                            var params = data.parameters;
                            return parser.evaluate(data.program, params.maxFeedrate, params.maxFeedrate, params.position);
                        },
                        toolPath: function (data) {
                            return data.toolPath;
                        },
                        compactToolPath: function (data) {
                            var fragments = data.toolPath;
                            var travelBits = [];
                            var position;
                            var travelFeedrate = data.parameters.maxFeedrate;

                            function travelTo(point, speedTag, feedrate, operation) {
                                if (position)
                                    travelBits.push({
                                        type: 'line',
                                        from: position,
                                        to: point,
                                        speedTag: speedTag,
                                        feedRate: speedTag == 'rapid' ? travelFeedrate : feedrate,
                                        operation: operation
                                    });
                                position = point;
                            }

                            for (var i = 0; i < fragments.length; i++) {
                                var fragment = fragments[i];
                                for (var j = 0; j < fragment.path.length; j += 3) {
                                    var point = new util.Point(fragment.path[j], fragment.path[j + 1], fragment.path[j + 2]);
                                    travelTo(point, fragment.speedTag, fragment.feedRate, fragment.operation);
                                }
                            }
                            return travelBits;
                        }
                    };
                    var toolPath = typeConverter[event.data.type](event.data);
                    for (var i = 0, j = toolPath.length; i < j; i += TOOLPATH_CHUNK_SIZE) {
                        var chunk = toolPath.slice(i, i + TOOLPATH_CHUNK_SIZE);
                        chunk.parameters = event.data.parameters;
                        pendingToolPathChunks.push(chunk);
                    }
                    if (!event.data['hasMore'])
                        pendingToolPathChunks[pendingToolPathChunks.length - 1].isLast = true;
                }

                consumePendingToolPathsChunks();
            };

            outputPort.onmessage = function (event) {
                sentToUSBProgramsCount = event.data.count;
                consumePendingToolPathsChunks();
            };


            function createProgramEncoder(maximumInstructionsCount) {
                var HEADER_LENGTH = 8;
                var programID = 1;
                var operationsForProgram = {};
                var buffer = new ArrayBuffer(maximumInstructionsCount * 3 + HEADER_LENGTH);
                return {
                    buffer: buffer,
                    view: new DataView(buffer),
                    instructionsCount: 0,
                    flushCount: 0,
                    maximumInstructionsCount: maximumInstructionsCount,
                    isFull: function () {
                        return this.instructionsCount == this.maximumInstructionsCount;
                    },
                    isNotEmpty: function () {
                        return this.instructionsCount != 0;
                    },
                    pushInstruction: function (dx, dy, dz, time, segment) {
                        function bin(axis) {
                            var direction = axis >= 0 ? '1' : '0';
                            var enableStep = axis ? '1' : '0';
                            return direction + enableStep;
                        }

                        if (segment.operation)
                            operationsForProgram[segment.operation] = 1;
                        time = Math.min(65535, time);
                        this.view.setUint16(HEADER_LENGTH + this.instructionsCount * 3, time, true);
                        var word = '00' + bin(dz) + bin(dy) + bin(dx);
                        this.view.setUint8(HEADER_LENGTH + this.instructionsCount * 3 + 2, parseInt(word, 2));
                        ++this.instructionsCount;
                    },
                    popEncodedProgram: function () {
                        // program type goes to first byte.
                        this.view.setUint8(0, PROGRAM_TYPES.PROGRAM_STEPS, true);
                        // We send the *size in bytes* of the program, header excluded on a 3 bytes numbers starting after one byte.
                        this.view.setUint32(1, this.instructionsCount * 3, true);
                        // we squish the size MSB to keep it 24 bits.
                        this.view.setUint32(4, programID, true);
                        var encodedProgram = this.buffer.slice(0, HEADER_LENGTH + this.instructionsCount * 3);
                        this.instructionsCount = 0;
                        var result = {
                            program: encodedProgram,
                            programID: programID,
                            operations: Object.keys(operationsForProgram)
                        };
                        operationsForProgram = {};
                        programID++;
                        return result;
                    }
                };
            }

            function consumePendingToolPathsChunks() {
                while (pendingToolPathChunks.length > 0 && sentToRunnerProgramsCount - sentToUSBProgramsCount < MAX_QUEUED_PROGRAMS) {
                    var toolPathChunk = pendingToolPathChunks.shift();
                    var params = toolPathChunk.parameters;
                    simulation.planProgram(toolPathChunk, params.maxAcceleration, 1 / params.stepsPerMillimeter, params.clockFrequency,
                        function stepCollector(dx, dy, dz, time, segment) {
                            programEncoder.pushInstruction(dx, dy, dz, time, segment);
                            if (programEncoder.isFull()) {
                                outputPort.postMessage(programEncoder.popEncodedProgram());
                                sentToRunnerProgramsCount++;
                            }
                        });

                    if (toolPathChunk.isLast) {
                        if (programEncoder.isNotEmpty()) {
                            outputPort.postMessage(programEncoder.popEncodedProgram());
                            sentToRunnerProgramsCount++;
                        }
                        if (stopSpindleAfter)
                            outputPort.postMessage(createSingleFlagProgram(PROGRAM_TYPES.PROGRAM_STOP_SPINDLE));
                        if (stopSocketAfter)
                            outputPort.postMessage(createSingleFlagProgram(PROGRAM_TYPES.PROGRAM_STOP_SOCKET));
                        outputPort.postMessage({program: null});
                        stopSpindleAfter = false;
                        stopSocketAfter = false;
                        outputPort.close();
                        inputPort.close();
                    }
                }
            }
        });
    },
    simulateGCode: function (event) {
        require(['cnc/gcode/gcodeSimulation'], function (gcodeSimulation) {
            gcodeSimulation.simulateWorkerSide(event);
        });
    },
    ping: function (event) {
        setTimeout(function () {
            postMessage('pong');
        }, 10);
    },
    uiPreparePolylines: function (event) {
        require(['cnc/ui/asyncUI'], function (async) {
            var res = async.preparePolylines(event.data.polylines);
            self.postMessage({id: event.data.id, result: res.result}, res.transferable);
        });
    },
    extractContour: function (event) {
        require(['THREE', 'cnc/maths/slicer'], function (THREE, slicer) {
            self.postMessage({
                result: slicer.polygonCorrectedSliceAsSvg(event.data.altitude,
                    new THREE.BufferGeometryLoader().parse(event.data.model))
            });
        });
    },
    computeDuration: function (event) {
        require(['cnc/cam/toolpath', 'cnc/util', 'cnc/gcode/simulation'], function (tp, util, simulation) {
            var totalTime = 0;
            event.data.path.forEach(function (p) {
                var path = tp.decodeToolPath(p);
                var info = simulation.collectToolpathInfo(path.asSimulablePolyline(path.feedrate, 3000, path.speedTag));
                totalTime += info.totalTime;
            });
            self.postMessage({
                duration: util.humanizeDuration(totalTime)
            });
        });
    }
};

self.onmessage = function (event) {
    tasks[event.data.operation](event);
};
