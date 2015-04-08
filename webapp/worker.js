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
            event.data.params.outline.clipperPolyline = event.data.params.outline.clipperPolyline.map(function (polygon) {
                return polygon.map(function (point) {
                    return new util.Point(point.x, point.y, point.z);
                });
            });
            operations[event.data.params.type].
                computeToolpath(event.data.params).then(function (toolpath) {
                    self.postMessage({
                        toolpath: toolpath.map(function (p) {
                            return p.toJSON()
                        })
                    });
                }).finally(function () {
                    close();
                });
        });
    },
    acceptProgram: function (event) {
        require(['cnc/gcode/parser', 'cnc/gcode/simulation', 'cnc/util.js'], function (parser, simulation, util) {
            var MAX_QUEUED_PROGRAMS = 10;
            var TOOLPATH_CHUNK_SIZE = 100000;
            var MAX_PROGRAM_SIZE = 30000;
            var sentToRunnerProgramsCount = 0;
            var sentToUSBProgramsCount = 0;
            var programEncoder = createProgramEncoder(MAX_PROGRAM_SIZE);
            var pendingEvents = [];
            var pendingToolPathChunks = [];
            var inputPort = event.ports[0];
            var outputPort = event.ports[1];

            inputPort.onmessage = function (deferredEvent) {
                pendingEvents.push(deferredEvent);

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

                            function travelTo(point, speedTag, feedrate) {
                                if (position)
                                    travelBits.push({
                                        type: 'line',
                                        from: position,
                                        to: point,
                                        speedTag: speedTag,
                                        feedRate: speedTag == 'rapid' ? travelFeedrate : feedrate
                                    });
                                position = point;
                            }

                            for (var i = 0; i < fragments.length; i++) {
                                var fragment = fragments[i];
                                for (var j = 0; j < fragment.path.length; j += 3) {
                                    var point = new util.Point(fragment.path[j], fragment.path[j + 1], fragment.path[j + 2]);
                                    travelTo(point, fragment.speedTag, fragment.feedRate);
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
                    pushInstruction: function (dx, dy, dz, time) {
                        function bin(axis) {
                            var direction = axis >= 0 ? '1' : '0';
                            var enableStep = axis ? '1' : '0';
                            return direction + enableStep;
                        }

                        time = Math.min(65535, time);
                        this.view.setUint16(HEADER_LENGTH + this.instructionsCount * 3, time, true);
                        var word = '00' + bin(dz) + bin(dy) + bin(dx);
                        this.view.setUint8(HEADER_LENGTH + this.instructionsCount * 3 + 2, parseInt(word, 2));
                        ++this.instructionsCount;
                    },
                    popEncodedProgram: function () {
                        // We send the *size in byte* of the program, header excluded, not the instructions count
                        this.view.setUint32(0, this.instructionsCount * 3, true);
                        this.view.setUint32(4, programID, true);
                        var encodedProgram = this.buffer.slice(0, HEADER_LENGTH + this.instructionsCount * 3);
                        this.instructionsCount = 0;
                        programID++;
                        return encodedProgram;
                    }
                };
            }

            function consumePendingToolPathsChunks() {
                while (pendingToolPathChunks.length > 0 && sentToRunnerProgramsCount - sentToUSBProgramsCount < MAX_QUEUED_PROGRAMS) {
                    var toolPathChunk = pendingToolPathChunks.shift();
                    var params = toolPathChunk.parameters;
                    simulation.planProgram(toolPathChunk, params.maxAcceleration, 1 / params.stepsPerMillimeter, params.clockFrequency,
                        function stepCollector(dx, dy, dz, time) {
                            programEncoder.pushInstruction(dx, dy, dz, time);
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
                        outputPort.postMessage(null);
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
    }
};

self.onmessage = function (event) {
    tasks[event.data.operation](event);
};
