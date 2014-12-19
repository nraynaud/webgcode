"use strict";
define(['RSVP', 'THREE', 'Piecon', 'libs/threejs/STLLoader', 'cnc/cam/3D/modelProjector', 'cnc/cam/3D/minkowskiPass',
        'cnc/cam/3D/toolProfile', 'libs/threejs/postprocessing/ShaderPass', 'libs/threejs/postprocessing/CopyShader',
        'cnc/cam/toolpath'
    ],
    function (RSVP, THREE, Piecon, STLLoader, ModelProjector, MinkowskiPass, toolProfile, ShaderPass, CopyShader, tp) {
        RSVP.on('error', function (reason) {
            console.assert(false, reason);
        });

        function HeightField(data, samplesX, samplesY, bufferToWorldMatrix, orientation, startRatio, stopRatio) {
            this.data = data;
            this.samplesX = samplesX;
            this.samplesY = samplesY;
            this.bufferToWorldMatrix = bufferToWorldMatrix;
            this.worldToBufferMatrix = bufferToWorldMatrix.clone().getInverse(bufferToWorldMatrix);
            this.orientation = orientation;
            this.startRatio = startRatio;
            this.stopRatio = stopRatio;
        }

        HeightField.prototype = {
            getPoint: function (ijVector) {
                ijVector.setX(Math.min(ijVector.x, this.samplesX - 1));
                ijVector.setY(Math.min(ijVector.y, this.samplesY - 1));
                ijVector.setZ(this.data[ijVector.y * this.samplesX + ijVector.x]);
                return ijVector.applyMatrix4(this.bufferToWorldMatrix);
            }
        };

        function convertHeightFieldToToolPath(heightField, safetyZ, minZ, zigzag) {
            var point = new THREE.Vector3(0, 0, 0);
            var list = [];
            var majorSampleCount;
            var minorSampleCount;
            var majorAxis;
            if (heightField.orientation == 'x') {
                majorSampleCount = 'samplesY';
                minorSampleCount = 'samplesX';
                majorAxis = 'y';
            } else {
                majorSampleCount = 'samplesX';
                minorSampleCount = 'samplesY';
                majorAxis = 'x';
            }
            var path = new tp.GeneralPolylineToolpath();
            for (var j = 0; j < heightField[majorSampleCount]; j++) {
                var ratio = j / heightField[majorSampleCount];
                if (ratio >= heightField.startRatio && ratio <= heightField.stopRatio) {
                    if (!zigzag)
                        path = new tp.GeneralPolylineToolpath();
                    for (var i = 0; i < heightField[minorSampleCount]; i++) {
                        point[heightField.orientation] = zigzag && j % 2 == 0 ? heightField[minorSampleCount] - 1 - i : i;
                        point[majorAxis] = j;
                        heightField.getPoint(point);
                        if (path.path.length == 0)
                            path.pushPointXYZ(point.x, point.y, safetyZ);
                        path.pushPointXYZ(point.x, point.y, Math.max(minZ, point.z));
                    }
                    if (!zigzag)
                        list.push(path);
                }
            }
            return zigzag ? [path] : list;
        }

        function computeHeightField(stlData, stepover, toolType, toolRadius, leaveStock, orientation, startRatio, stopRatio) {
            return new RSVP.Promise(function (resolve, reject) {
                var geometry = new STLLoader().parse(stlData);
                var modelStage = new ModelProjector();
                modelStage.setGeometry(geometry);
                var renderer = new THREE.WebGLRenderer({
                    antialias: false,
                    alpha: true,
                    precision: 'highp',
                    autoClear: false,
                    preserveDrawingBuffer: true
                });
                var toolSamples = 10;
                var sampleRate = toolSamples / (toolRadius + leaveStock);
                var types = {
                    cylinder: toolProfile.createCylindricalTool,
                    ball: toolProfile.createSphericalTool,
                    v: toolProfile.createVTool
                };
                var profile = types[toolType](toolSamples, modelStage.zRatio, toolRadius, leaveStock);
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
                console.log(tilePixelsLength, tileLength);
                console.log('global', globalWidth, globalHeight);
                var tileX;
                var tileY;
                var resultTileX;
                var resultTileY;
                var modelTileX;
                var modelTileY;
                var tileXCount;
                var tileYCount;
                var xratio;
                var yratio;
                var xPeriod;
                var yPeriod;
                var tileSelector;
                if (orientation == 'x') {
                    tileXCount = Math.floor(globalWidth / tileLength) + 1;
                    tileYCount = Math.floor(bbox.size().y / stepover) + 1;
                    tileX = Math.ceil(globalWidth / tileXCount);
                    tileY = toolRadius * 2;
                    resultTileX = tileX;
                    resultTileY = 1;
                    modelTileX = resultTileX + 2 * toolSamples;
                    modelTileY = 2 * toolSamples + 1;
                    xratio = sampleRate;
                    yratio = 1 / stepover;
                    xPeriod = tileX;
                    yPeriod = stepover * sampleRate;
                    tileSelector = function (i, j) {
                        return j >= tileYCount * startRatio && j <= tileYCount * stopRatio;
                    }
                } else {
                    tileXCount = Math.floor(bbox.size().x / stepover) + 1;
                    tileYCount = Math.floor(globalHeight / tileLength) + 1;
                    console.log('tileYCount', tileYCount, tileXCount);
                    tileX = toolRadius * 2;
                    tileY = Math.ceil(globalHeight / tileYCount);
                    resultTileX = 1;
                    resultTileY = tileY;
                    modelTileX = resultTileX * ( toolSamples + 1) + toolSamples;
                    modelTileY = resultTileY + 2 * toolSamples;
                    xratio = 1 / stepover;
                    yratio = sampleRate;
                    xPeriod = stepover * sampleRate;
                    yPeriod = tileY;
                    tileSelector = function (i, j) {
                        return i >= tileXCount * startRatio && i <= tileXCount * stopRatio;
                    }
                }
                var resultBufferWidth = tileXCount * resultTileX;
                var resultBufferHeight = tileYCount * resultTileY;
                console.log('modelBuffer', modelTileX, modelTileY);
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
                var transformMatrix = new THREE.Matrix4()
                    .makeScale(1 / xratio, 1 / yratio, 1)
                    .setPosition(new THREE.Vector3(minX / sampleRate, minY / sampleRate, 0));
                modelStage.pushZInverseProjOn(transformMatrix);
                var resultHeightField = new HeightField(resultBuffer, resultBufferWidth, resultBufferHeight, transformMatrix, orientation, startRatio, stopRatio);
                var resultTile = new Uint8Array(resultTileX * resultTileY * 4);
                var worker = new Worker('worker.js');
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
                function drawTile(sequenceIndex) {
                    if (sequenceIndex < sequence.length) {
                        var newPercentage = Math.round(sequenceIndex / sequence.length * 25) * 4;
                        if (newPercentage != percentage)
                            Piecon.setProgress(newPercentage);
                        percentage = newPercentage;
                        var x = sequence[sequenceIndex][0];
                        var y = sequence[sequenceIndex][1];
                        setTilePos(x * xPeriod, y * yPeriod);
                        var gl = renderer.getContext();
                        modelStage.render(renderer, modelBuffer);
                        minkowskiPass.render(renderer, minkowskiBuffer, modelBuffer, terrainRatio, terrainTranslation);
                        copyPass.quad.position.x = x;
                        copyPass.quad.position.y = y;
                        //copyPass.render(renderer, null, minkowskiBuffer);
                        renderer.setRenderTarget(minkowskiBuffer);
                        gl.readPixels(0, 0, resultTileX, resultTileY, gl.RGBA, gl.UNSIGNED_BYTE, resultTile);
                        //by keeping this loop in the main thread, I think we are leaving some time for the GPU to breathe.
                        copyResultTileToResultBuffer(x * resultTileX, y * resultTileY);
                        renderer.setRenderTarget(null);
                        //setTimeout is not throttled in workers
                        $(worker).one('message', function () {
                            drawTile(sequenceIndex + 1);
                        });
                        worker.postMessage({operation: 'ping'});
                    } else {
                        console.timeEnd('computation');
                        Piecon.reset();
                        resolve(resultHeightField);
                        if (window['Notification'] && document['visibilityState'] == 'hidden')
                            new Notification("Computation is done.", {icon: 'images/icon_fraise_48.png'});
                    }
                }

                Piecon.setOptions({
                    color: '#752D2D', // Pie chart color
                    background: '#A9BBD1', // Empty pie chart color
                    shadow: '#849DBD'
                });
                console.time('computation');
                drawTile(0);

            });
        }

        return {
            computeHeightField: computeHeightField,
            convertHeightFieldToToolPath: convertHeightFieldToToolPath
        };
    });