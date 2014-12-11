"use strict";
define(['RSVP', 'THREE', 'Piecon', 'libs/threejs/STLLoader', 'cnc/cam/3D/modelProjector', 'cnc/cam/3D/minkowskiPass',
        'cnc/cam/3D/toolProfile', 'libs/threejs/postprocessing/ShaderPass', 'libs/threejs/postprocessing/CopyShader',
        'cnc/cam/toolpath'
    ],
    function (RSVP, THREE, Piecon, STLLoader, ModelProjector, MinkowskiPass, toolProfile, ShaderPass, CopyShader, tp) {
        RSVP.on('error', function (reason) {
            console.assert(false, reason);
        });

        function HeightField(data, samplesX, samplesY, bufferToWorldMatrix) {
            this.data = data;
            this.samplesX = samplesX;
            this.samplesY = samplesY;
            this.bufferToWorldMatrix = bufferToWorldMatrix;
            this.worldToBufferMatrix = bufferToWorldMatrix.clone().getInverse(bufferToWorldMatrix);
        }

        HeightField.prototype = {
            getPoint: function (ijVector) {
                ijVector.setX(Math.min(ijVector.x, this.samplesX - 1));
                ijVector.setY(Math.min(ijVector.y, this.samplesY - 1));
                ijVector.setZ(this.data[ijVector.y * this.samplesX + ijVector.x]);
                return ijVector.applyMatrix4(this.bufferToWorldMatrix);
            }
        };

        function convertGridToToolPath(heightField, stepover, safetyZ, minZ, orientation, startRatio, stopRatio) {
            var point = new THREE.Vector3(0, 0, 0);
            var list = [];
            var majorSampleCount;
            var minorSampleCount;
            var majorAxis;
            if (orientation == 'x') {
                majorSampleCount = 'samplesY';
                minorSampleCount = 'samplesX';
                majorAxis = 'y';
            } else {
                majorSampleCount = 'samplesX';
                minorSampleCount = 'samplesY';
                majorAxis = 'x';
            }
            point.set(0, 0, 0).applyMatrix4(heightField.bufferToWorldMatrix);
            var start = point[majorAxis];
            var currentStep = 0;
            for (var j = 0; j < heightField[majorSampleCount]; currentStep++) {
                // add the stepover in the the world space
                point.set(0, 0, 0);
                point[majorAxis] = start + currentStep * stepover;
                point.applyMatrix4(heightField.worldToBufferMatrix);
                // find the closest pixel
                j = Math.round(point[majorAxis]);
                var ratio = j / heightField[majorSampleCount];
                if (ratio >= startRatio && ratio <= stopRatio) {
                    var path = new tp.GeneralPolylineToolpath();
                    for (var i = 0; i < heightField[minorSampleCount]; i++) {
                        point[orientation] = i;
                        point[majorAxis] = j;
                        heightField.getPoint(point);
                        if (i == 0)
                            path.pushPointXYZ(point.x, point.y, safetyZ);
                        path.pushPointXYZ(point.x, point.y, Math.max(minZ, point.z));
                    }
                    list.push(path);
                }
            }
            return list;
        }

        function computeGrid(stlData, stepover, toolType, toolRadius, leaveStock, safetyZ, minZ, orientation, startRatio, stopRatio) {
            return new RSVP.Promise(function (resolve, reject) {
                var geometry = new STLLoader().parse(stlData);
                var modelStage = new ModelProjector();
                modelStage.setGeometry(geometry);
                var renderer = new THREE.WebGLRenderer({antialias: false, alpha: true, precision: 'highp', autoClear: false, preserveDrawingBuffer: true});
                var toolSamples = 30;
                var sampleRate = toolSamples / (toolRadius + leaveStock);
                var types = {cylinder: toolProfile.createCylindricalTool, ball: toolProfile.createSphericalTool, v: toolProfile.createVTool};
                var profile = types[toolType](toolSamples, modelStage.zRatio, toolRadius, leaveStock);
                var minX = Math.floor(modelStage.modelBbox.min.x * sampleRate);
                var maxX = Math.ceil(modelStage.modelBbox.max.x * sampleRate);
                var minY = Math.floor(modelStage.modelBbox.min.y * sampleRate);
                var maxY = Math.ceil(modelStage.modelBbox.max.y * sampleRate);

                function setCameraPix(minX, maxX, minY, maxY) {
                    modelStage.setCamera(minX / sampleRate, maxX / sampleRate, minY / sampleRate, maxY / sampleRate);
                }

                function setTilePos(x, y) {
                    setCameraPix(minX + x - toolSamples, minX + x + tileSizeX + toolSamples, minY + y - toolSamples, minY + y + tileSizeY + toolSamples);
                }

                var globalWidth = maxX - minX;
                var globalHeight = maxY - minY;
                var pixelsPerTile = 30000000;
                var tileArea = pixelsPerTile / (4 * toolSamples * toolSamples);
                var tileSizeX = Math.ceil(Math.sqrt(tileArea));
                var tileSizeY = Math.ceil(Math.sqrt(tileArea));
                var modelBuffer = new THREE.WebGLRenderTarget(tileSizeX + 2 * toolSamples, tileSizeY + 2 * toolSamples,
                    {minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.UnsignedByteType});

                var minkowskiPass = new MinkowskiPass();
                minkowskiPass.setParams(profile, new THREE.Vector2(toolSamples / modelBuffer.width, toolSamples / modelBuffer.height));
                var minkowskiBuffer = new THREE.WebGLRenderTarget(tileSizeX, tileSizeY,
                    {minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.UnsignedByteType});

                var copyPass = new ShaderPass(CopyShader);
                copyPass.quad.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(1, 1, 0));
                var matrix = new THREE.Matrix4().makeScale(0.5 * tileSizeX, 0.5 * tileSizeY, 1);
                copyPass.quad.geometry.applyMatrix(matrix);
                copyPass.camera.left = 0;
                copyPass.camera.right = globalWidth;
                copyPass.camera.bottom = 0;
                copyPass.camera.top = globalHeight;
                copyPass.camera.updateProjectionMatrix();
                copyPass.renderToScreen = true;
                renderer.autoClear = false;

                var sequence = [];
                for (var j = 0; j < globalHeight; j += tileSizeY)
                    for (var i = 0; i < globalWidth; i += tileSizeX)
                        sequence.push([i, j]);
                var resultBuffer = new Float32Array(globalHeight * globalWidth);
                var transformMatrix = new THREE.Matrix4()
                    .makeScale(1 / sampleRate, 1 / sampleRate, 1)
                    .setPosition(new THREE.Vector3(minX / sampleRate, minY / sampleRate, 0));
                modelStage.pushZInverseProjOn(transformMatrix);
                var resultHeightField = new HeightField(resultBuffer, globalWidth, globalHeight, transformMatrix);
                var resultTile = new Uint8Array(tileSizeX * tileSizeY * 4);
                var worker = new Worker('worker.js');
                var factor = (Math.pow(2, 24.0) - 1.0) / Math.pow(2, 24.0);

                function decodeFloatRgb(r, g, b) {
                    return  (r / 255 + g / 255 / 255 + b / 255 / 255 / 255 ) / factor;
                }

                function copyResultTileToResultBuffer(x, y) {
                    for (var j = 0; j < tileSizeY; j++)
                        for (var i = 0; i < tileSizeX; i++) {
                            if (y + j < globalHeight && i + x < globalWidth) {
                                var pixIndex = ((j * tileSizeX + i) * 4);
                                resultBuffer[(y + j) * globalWidth + i + x] = decodeFloatRgb(resultTile[pixIndex], resultTile[pixIndex + 1], resultTile[pixIndex + 2]);
                            }
                        }
                }

                //compensate because the model tile has a margin of 1 tool radius around it
                var terrainRatio = new THREE.Vector2(tileSizeX / modelBuffer.width, tileSizeY / modelBuffer.height);
                var terrainTranslation = new THREE.Vector2(toolSamples / modelBuffer.width, toolSamples / modelBuffer.height);
                var percentage = null;

                function drawTile(sequenceIndex) {
                    if (sequenceIndex < sequence.length) {
                        var newPercentage = Math.round(sequenceIndex / sequence.length * 25) * 4;
                        if (newPercentage != percentage)
                            Piecon.setProgress(newPercentage);
                        percentage = newPercentage;
                        var x = sequence[sequenceIndex][0];
                        var y = sequence[sequenceIndex][1];
                        setTilePos(x, y);
                        var gl = renderer.getContext();
                        modelStage.render(renderer, modelBuffer);
                        minkowskiPass.render(renderer, minkowskiBuffer, modelBuffer, terrainRatio, terrainTranslation);
                        copyPass.quad.position.x = x;
                        copyPass.quad.position.y = y;
                        copyPass.render(renderer, null, minkowskiBuffer);
                        renderer.setRenderTarget(minkowskiBuffer);
                        gl.readPixels(0, 0, tileSizeX, tileSizeY, gl.RGBA, gl.UNSIGNED_BYTE, resultTile);
                        //by keeping this loop in the main thread, I think we are leaving some time for the GPU to breathe.
                        copyResultTileToResultBuffer(x, y);
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

            }).then(function (heightField) {
                    return convertGridToToolPath(heightField, stepover, safetyZ, minZ, orientation, startRatio, stopRatio);
                });
        }

        return {computeGrid: computeGrid};
    });