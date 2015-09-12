"use strict";
define(['RSVP', 'THREE', 'Piecon', 'cnc/cam/3D/modelProjector', 'cnc/cam/3D/minkowskiPass',
        'cnc/cam/3D/toolProfile', 'libs/threejs/postprocessing/ShaderPass', 'libs/threejs/postprocessing/CopyShader',
        'cnc/cam/toolpath', 'cnc/app/task', 'require'
    ],
    function (RSVP, THREE, Piecon, ModelProjector, MinkowskiPass, toolProfile, ShaderPass, CopyShader, tp,
              Task, require) {
        RSVP.on('error', function (reason) {
            console.assert(false, reason);
            if (reason.stack)
                console.assert(false, reason.stack);
        });

        function ToolPathComputer() {
        }

        ToolPathComputer.prototype = {
            computeHeightField: function (geometry, stepover, tool, leaveStock, angle, startRatio, stopRatio, renderer, displayResult) {
                var _this = this;

                function work(task, resolve, reject) {
                    console.log('preparation');
                    if (angle == null)
                        angle = 0;
                    var modelStage = new ModelProjector();
                    modelStage.setGeometry(geometry.clone());
                    modelStage.setAngle(angle);
                    if (!renderer)
                        renderer = new THREE.WebGLRenderer({
                            antialias: false,
                            alpha: true,
                            precision: 'highp',
                            autoClear: false,
                            preserveDrawingBuffer: true
                        });
                    var toolSamples = 30;
                    var sampleRate = toolSamples / (tool.diameter / 2 + leaveStock);
                    var profile = toolProfile.createTool(tool, toolSamples, modelStage.zRatio, leaveStock);
                    var bbox = modelStage.modelBbox.clone();

                    var minX = Math.floor(bbox.min.x * sampleRate);
                    var maxX = Math.ceil(bbox.max.x * sampleRate);
                    var minY = Math.floor(bbox.min.y * sampleRate);
                    var maxY = Math.ceil(bbox.max.y * sampleRate);

                    function setCameraPix(minX, maxX, minY, maxY) {
                        modelStage.setCamera(minX / sampleRate, maxX / sampleRate, minY / sampleRate, maxY / sampleRate);
                    }

                    var globalWidth = maxX - minX;
                    var globalHeight = maxY - minY;
                    var pixelsPerTile = 30000000;
                    var tilePixelsLength = pixelsPerTile / (2 * toolSamples);

                    var tileLength = tilePixelsLength / sampleRate;
                    var tileXCount = Math.floor(globalWidth / tileLength) + 1;
                    var tileYCount = Math.floor(bbox.size().y / stepover) + 1;
                    var tileX = Math.ceil(globalWidth / tileXCount);
                    var resultTileX = tileX;
                    var resultTileY = 1;
                    var modelTileX = resultTileX + 2 * toolSamples;
                    var modelTileY = 2 * toolSamples + 1;
                    var xratio = sampleRate;
                    var yratio = 1 / stepover;
                    var xPeriod = tileX;
                    var yPeriod = stepover * sampleRate;
                    var tileSelector = function (i, j) {
                        return j >= tileYCount * startRatio && j <= tileYCount * stopRatio;
                    };
                    var resultBufferWidth = tileXCount * resultTileX;
                    var resultBufferHeight = tileYCount * resultTileY;
                    var modelBuffer = new THREE.WebGLRenderTarget(modelTileX, modelTileY,
                        {minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.UnsignedByteType});

                    var minkowskiPass = new MinkowskiPass();
                    minkowskiPass.setParams(profile, new THREE.Vector2(toolSamples / modelBuffer.width, toolSamples / modelBuffer.height));
                    var minkowskiBuffer = new THREE.WebGLRenderTarget(resultTileX, resultTileY,
                        {minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.UnsignedByteType});
                    renderer.autoClear = false;

                    var sequence = [];
                    for (var j = 0; j < tileYCount; j++)
                        for (var i = 0; i < tileXCount; i++)
                            if (tileSelector(i, j))
                                sequence.push([i, j]);
                    var resultBuffer = new Float32Array(resultBufferWidth * resultBufferHeight);
                    var rotationMatrix = new THREE.Matrix4().makeRotationZ(angle * Math.PI / 180);
                    var scaleMatrix = new THREE.Matrix4().makeScale(1 / xratio, 1 / yratio, 1);
                    var translationMatrix = new THREE.Matrix4().makeTranslation(minX / sampleRate, minY / sampleRate, 0);
                    var transformMatrix = new THREE.Matrix4().multiply(rotationMatrix).multiply(translationMatrix).multiply(scaleMatrix);
                    modelStage.pushZInverseProjOn(transformMatrix);
                    var resultHeightField = new HeightField(resultBuffer, bbox, resultBufferWidth, resultBufferHeight, transformMatrix, startRatio, stopRatio, leaveStock + bbox.min.z);
                    var resultTile = new Uint8Array(resultTileX * resultTileY * 4);
                    var worker = new Worker(require.toUrl('worker.js'));
                    var factor = (Math.pow(2, 24.0) - 1.0) / Math.pow(2, 24.0);

                    function decodeHeight(r, g, b) {
                        return (r / 255 + g / 255 / 255 + b / 255 / 255 / 255 ) / factor;
                    }

                    function copyResultTileToResultBuffer(x, y) {
                        for (var j = 0; j < resultTileY; j++)
                            for (var i = 0; i < resultTileX; i++) {
                                if (y + j < resultBufferHeight && i + x < resultBufferWidth) {
                                    var pixIndex = ((j * resultTileX + i) * 4);
                                    resultBuffer[(y + j) * resultBufferWidth + i + x] =
                                        decodeHeight(resultTile[pixIndex], resultTile[pixIndex + 1], resultTile[pixIndex + 2]);
                                }
                            }
                    }

                    function setTilePos(x, y) {
                        setCameraPix(minX + x - toolSamples, minX + x + resultTileX + toolSamples, minY + y - toolSamples, minY + y + resultTileY + toolSamples);
                    }

                    //compensate because the model tile has a margin of 1 tool radius around it
                    var terrainRatio = new THREE.Vector2(resultTileX / modelBuffer.width, resultTileY / modelBuffer.height);
                    var terrainTranslation = new THREE.Vector2(toolSamples / modelBuffer.width, toolSamples / modelBuffer.height);
                    var percentage = null;
                    var copyPass = new ShaderPass(CopyShader);
                    copyPass.quad.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(1, 1, 0));
                    var matrix = new THREE.Matrix4().makeScale(0.5 * resultTileX, 0.5 * 2 * toolSamples, 1);
                    copyPass.quad.geometry.applyMatrix(matrix);
                    copyPass.camera.left = 0;
                    copyPass.camera.right = globalWidth;
                    copyPass.camera.bottom = 0;
                    copyPass.camera.top = globalHeight;
                    copyPass.camera.updateProjectionMatrix();
                    copyPass.renderToScreen = true;
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
                            setTilePos(x * xPeriod, y * yPeriod);
                            var gl = renderer.getContext();
                            modelStage.render(renderer, modelBuffer);
                            minkowskiPass.render(renderer, minkowskiBuffer, modelBuffer, terrainRatio, terrainTranslation);
                            copyPass.quad.position.x = x;
                            copyPass.quad.position.y = y;
                            if (displayResult)
                                copyPass.render(renderer, null, minkowskiBuffer);
                            renderer.setRenderTarget(minkowskiBuffer);
                            gl.readPixels(0, 0, resultTileX, resultTileY, gl.RGBA, gl.UNSIGNED_BYTE, resultTile);
                            //by keeping this loop in the main thread, I think we are leaving some time for the GPU to breathe.
                            copyResultTileToResultBuffer(x * resultTileX, y * resultTileY);
                            renderer.setRenderTarget(null);
                            //setTimeout is not throttled in workers
                            $(worker).one('message', drawTile);
                            worker.postMessage({operation: 'ping'});
                            sequenceIndex++;
                        } else {
                            worker.terminate();
                            console.timeEnd('computation');
                            resolve(resultHeightField);
                            if (window['Notification'] && document['visibilityState'] == 'hidden')
                                new Notification("Computation is done.", {icon: require.toUrl('images/icon_fraise_48.png')});
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

        function convertHeightFieldToToolPath(heightField, safetyZ, topZ, sliceZ, bottomZ) {
            var point = new THREE.Vector3(0, 0, 0);
            var path = null;
            var list = [];

            function collectPoint(x, y, z, currentMaxZ, currentMinZ) {
                if (z > currentMaxZ || z <= heightField.noModelValue) {
                    path = null;
                    return;
                }
                if (path == null) {
                    path = new tp.GeneralPolylineToolpath();
                    list.push(path);
                    path.pushPointXYZ(x, y, safetyZ);
                }
                path.pushPointXYZ(x, y, Math.max(currentMinZ, z));
            }

            var currentMaxZ = topZ;
            while (currentMaxZ > bottomZ) {
                var currentMinZ = Math.max(currentMaxZ - sliceZ, bottomZ);
                for (var j = 0; j < heightField.samplesY; j++) {
                    var ratio = j / heightField.samplesY;
                    if (ratio >= heightField.startRatio && ratio <= heightField.stopRatio) {
                        for (var i = 0; i < heightField.samplesX; i++) {
                            point.x = j % 2 == 0 ? heightField.samplesX - 1 - i : i;
                            point.y = j;
                            heightField.getPoint(point);
                            collectPoint(point.x, point.y, point.z, currentMaxZ, currentMinZ);
                        }
                    }
                }
                currentMaxZ -= sliceZ;
            }

            return list;
        }

        return {
            ToolPathComputer: ToolPathComputer,
            convertHeightFieldToToolPath: convertHeightFieldToToolPath
        };
    });