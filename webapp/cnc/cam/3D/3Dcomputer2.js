"use strict";
define(['RSVP', 'THREE', 'cnc/cam/3D/modelProjector', 'cnc/cam/3D/minkowskiComputer',
        'cnc/cam/3D/toolProfile', 'cnc/cam/toolpath', 'cnc/app/task', 'cnc/util', 'require'
    ],
    function (RSVP, THREE, ModelProjector, MinkowskiComputer, toolProfile, tp, Task, util, require) {
        RSVP.on('error', function (reason) {
            console.assert(false, reason);
            if (reason.stack)
                console.assert(false, reason.stack);
        });


        function ToolPathComputer() {
        }

        ToolPathComputer.prototype = {
            computeHeightField: function (geometry, stepover, tool, leaveStock, angle, startRatio, stopRatio, renderer) {

                function work(task, resolve, reject) {
                    if (angle == null)
                        angle = 0;
                    var modelStage = new ModelProjector();
                    modelStage.setGeometry(geometry.clone());
                    modelStage.setAngle(angle);
                    if (!renderer)
                        renderer = new THREE.WebGLRenderer({
                            antialias: false,
                            alpha: false,
                            precision: 'highp',
                            autoClear: false,
                            preserveDrawingBuffer: true
                        });
                    var toolSamples = 10;
                    var sampleRate = toolSamples / (tool.diameter / 2 + leaveStock);
                    var profile = toolProfile.createTool(tool, toolSamples, modelStage.zRatio, leaveStock);
                    var bbox = modelStage.modelBbox.clone();

                    function toPow2(value) {
                        return Math.sign(value) * Math.pow(2, Math.ceil(Math.log2(Math.abs(value))));
                    }

                    var globalWidthP = toPow2(bbox.size().x * sampleRate);
                    var globalHeightP = toPow2(bbox.size().y * sampleRate);

                    var centerXP = globalWidthP / 2;
                    var centerYP = globalHeightP / 2;
                    var globalWidthMM = globalWidthP / sampleRate;
                    var globalHeightMM = globalHeightP / sampleRate;

                    var expansion = new THREE.Vector3(globalWidthMM - bbox.size().x, globalHeightMM - bbox.size().y, 0);
                    bbox.expandByVector(expansion);

                    var minXP = 0;
                    var minYP = 0;

                    var tileSideP = 512;
                    var tileXCount = Math.ceil(globalWidthP / tileSideP);
                    var tileYCount = Math.ceil(globalHeightP / tileSideP);
                    var minkowskiTileXP = tileSideP;
                    var minkowskiTileYP = tileSideP;
                    var modelTileXP = minkowskiTileXP + 2 * toolSamples;
                    var modelTileYP = minkowskiTileYP + 2 * toolSamples;
                    var tileSelector = function (i, j) {
                        return j >= tileYCount * startRatio && j <= tileYCount * stopRatio;
                    };
                    var resultBufferWidth = tileXCount * minkowskiTileXP;
                    var resultBufferHeight = tileYCount * minkowskiTileYP;


                    var minkowskiPass = new MinkowskiComputer(bbox.min.x, bbox.max.x, bbox.min.y, bbox.max.y);
                    renderer.autoClear = false;
                    var sequence = [];
                    for (var j = 0; j < tileYCount; j++)
                        for (var i = 0; i < tileXCount; i++)
                            if (tileSelector(i, j))
                                sequence.push([i, j]);
                    var rotationMatrix = new THREE.Matrix4().makeRotationZ(angle * Math.PI / 180);
                    var scaleMatrix = new THREE.Matrix4().makeScale(1 / sampleRate, 1 / sampleRate, 1);
                    var translationMatrix = new THREE.Matrix4().makeTranslation(minXP / sampleRate, minYP / sampleRate, 0);
                    var transformMatrix = new THREE.Matrix4().multiply(rotationMatrix).multiply(translationMatrix).multiply(scaleMatrix);
                    modelStage.pushZInverseProjOn(transformMatrix);
                    var resultBuffer = new Float32Array(resultBufferWidth * resultBufferHeight);
                    var resultHeightField = new HeightField(resultBuffer, bbox, resultBufferWidth, resultBufferHeight,
                        transformMatrix, startRatio, stopRatio, leaveStock + bbox.min.z);

                    var modelBuffer = modelStage.createRenderBuffer(modelTileXP, modelTileYP);
                    var worker = new Worker(require.toUrl('worker.js'));
                    var gl = renderer.getContext();
                    var minkowskiBuffer = new THREE.WebGLRenderTarget(minkowskiTileXP, minkowskiTileYP, {
                        stencilBuffer: false, generateMipmaps: false,
                        texture: new THREE.Texture(null, THREE.Texture.DEFAULT_MAPPING, THREE.ClampToEdgeWrapping,
                            THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter, THREE.RGBFormat,
                            THREE.FloatType)
                    });
                    minkowskiBuffer.texture.generateMipmaps = false;
                    renderer.setRenderTarget(minkowskiBuffer);
                    var isFloatReadPixelSupported = gl.getParameter(gl['IMPLEMENTATION_COLOR_READ_FORMAT']) == gl.RGB
                        && gl.getParameter(gl['IMPLEMENTATION_COLOR_READ_TYPE']) == gl.FLOAT;
                    renderer.setRenderTarget(null);

                    function readBuffer(x, y, renderTarget) {
                        var texture = renderTarget.texture;
                        var colorChannels = texture.format == THREE.RGBFormat ? [3, gl.RGB] : [4, gl.RGBA];
                        var type = texture.type == THREE.FloatType ? [Float32Array, gl.FLOAT, 1] : [Uint8Array, gl.UNSIGNED_BYTE, 1 / 255];
                        var resultTileBuffer = new type[0](colorChannels[0] * renderTarget.width * renderTarget.height);
                        renderer.setRenderTarget(renderTarget);
                        gl.readPixels(0, 0, renderTarget.width, renderTarget.height, colorChannels[1], type[1], resultTileBuffer);
                        renderer.setRenderTarget(null);
                        var tileShiftX = (renderTarget.width - minkowskiTileXP) / 2;
                        var tileShiftY = (renderTarget.height - minkowskiTileYP) / 2;
                        var left = tileShiftX + x * minkowskiTileXP;
                        var top = tileShiftY + y * minkowskiTileYP;
                        //by keeping this loop in the main thread, I think we are leaving some time for the GPU to breathe.
                        for (var j = 0; j < minkowskiTileYP; j++)
                            for (var i = 0; i < minkowskiTileXP; i++) {
                                if (top + j < resultBufferHeight && i + left < resultBufferWidth) {
                                    var pixIndex = ((tileShiftY + j) * renderTarget.width + i + tileShiftX) * colorChannels[0];
                                    resultBuffer[(top + j) * resultBufferWidth + i + left] = resultTileBuffer[pixIndex] * type[2];
                                }
                            }
                    }

                    var outputFloats = isFloatReadPixelSupported;
                    //compensate because the model tile has a margin of 1 tool radius around it
                    var terrainRatio = new THREE.Vector2(minkowskiTileXP / modelBuffer.width, minkowskiTileYP / modelBuffer.height);
                    var terrainTranslation = new THREE.Vector2(toolSamples / modelBuffer.width, toolSamples / modelBuffer.height);
                    minkowskiPass.setParams(profile, new THREE.Vector2(toolSamples / modelBuffer.width,
                        toolSamples / modelBuffer.height), null, outputFloats, terrainRatio, terrainTranslation, modelBuffer.depthTexture);

                    function setCameraPixCenter(x, y) {
                        var xOffset = bbox.center().x;
                        var yOffset = bbox.center().y;
                        modelStage.setCamera(xOffset + (x - modelTileXP / 2 - centerXP) / sampleRate, xOffset + (x + modelTileXP / 2 - centerXP) / sampleRate,
                            yOffset + (y - modelTileYP / 2 - centerXP) / sampleRate, yOffset + (y + modelTileYP / 2 - centerYP) / sampleRate);
                        minkowskiPass.setCamera(xOffset + (x - minkowskiTileXP / 2 - centerXP) / sampleRate, xOffset + (x + minkowskiTileXP / 2 - centerXP) / sampleRate,
                            yOffset + (y - minkowskiTileYP / 2 - centerXP) / sampleRate, yOffset + (y + minkowskiTileYP / 2 - centerYP) / sampleRate);
                    }

                    function setModelTilePos(x, y) {
                        setCameraPixCenter(minXP + (x + 0.5) * minkowskiTileXP, minYP + (y + 0.5) * minkowskiTileXP);
                    }

                    var percentage = null;

                    renderer.autoClear = false;
                    var sequenceIndex = 0;

                    function drawTile() {
                        console.log('drawTile');
                        if (task.get('isPaused'))
                            return;
                        if (sequenceIndex < sequence.length) {
                            percentage = Math.round(sequenceIndex / sequence.length * 25) * 4;
                            var x = sequence[sequenceIndex][0];
                            var y = sequence[sequenceIndex][1];
                            setModelTilePos(x, y);
                            modelStage.render(renderer, modelBuffer);
                            minkowskiPass.render(renderer, minkowskiBuffer);
                            readBuffer(x, y, minkowskiBuffer);
                            //setTimeout is not throttled in workers
                            $(worker).one('message', drawTile);
                            worker.postMessage({operation: 'ping'});
                            sequenceIndex++;
                        } else {
                            worker.terminate();
                            console.timeEnd('computation');
                            resolve(resultHeightField);
                        }
                    }

                    console.time('computation');
                    task.resumeWork = drawTile;
                    task.cancelWork = function () {
                        worker.terminate();
                    };
                    drawTile();
                }

                return Task.create({work: work});
            }
        };

        function HeightField(data, modelbbox, samplesX, samplesY, bufferToWorldMatrix, startRatio, stopRatio, noModelValue) {
            this.data = data;
            this.modelbbox = modelbbox;
            this.samplesX = samplesX;
            this.samplesY = samplesY;
            this.bufferToWorldMatrix = bufferToWorldMatrix;
            this.startRatio = startRatio;
            this.stopRatio = stopRatio;
            this.noModelValue = noModelValue + (modelbbox.max.z - modelbbox.min.z) * 0.000001;
        }

        HeightField.prototype = {
            getPoint: function (ijVector) {
                ijVector.setX(Math.min(ijVector.x, this.samplesX - 1));
                ijVector.setY(Math.min(ijVector.y, this.samplesY - 1));
                ijVector.setZ(this.data[ijVector.y * this.samplesX + ijVector.x]);
                return ijVector.applyMatrix4(this.bufferToWorldMatrix);
            }
        };

        return {
            ToolPathComputer: ToolPathComputer
        };
    });