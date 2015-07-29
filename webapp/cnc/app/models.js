"use strict";

define(['Ember', 'EmberData', 'cnc/cam/cam', 'cnc/util', 'cnc/cam/operations', 'cnc/cam/toolpath', 'cnc/cam/3D/3Dcomputer',
        'require', 'libs/pako.min', 'base64', 'THREE', 'libs/threejs/STLLoader', 'cnc/cam/text'],
    function (Ember, DS, cam, util, Operations, tp, Computer, require, pako, base64, THREE, STLLoader, Text) {
        var attr = DS.attr;

        var PointTransform = DS.Transform.extend({
            deserialize: function (serialized) {
                return new util.Point(serialized.x, serialized.y, serialized.z);
            },
            serialize: function (deserialized) {
                return deserialized;
            }
        });
        var ManualShapeSerializer = DS.JSONSerializer.extend({
            serialize: function (snapshot, options) {
                var json = this._super.apply(this, arguments);
                json.id = snapshot.id;
                return json;
            }
        });
        var ManualShape = DS.Model.extend({
            type: attr('string', {defaultValue: 'rectangle'}),
            width: attr('number', {defaultValue: 10}),
            height: attr('number', {defaultValue: 15}),
            x: attr('number', {defaultValue: 0}),
            y: attr('number', {defaultValue: 0}),
            radius: attr('number', {defaultValue: 0}),
            text: attr('string', {defaultValue: 'text'}),
            fontSize: attr('number', {defaultValue: 30}),
            fontName: attr('string', {defaultValue: 'Seymour One'}),
            fontFile: attr('string', {defaultValue: 'http://fonts.gstatic.com/s/seymourone/v4/HrdG2AEG_870Xb7xBVv6C6CWcynf_cDxXwCLxiixG1c.ttf'}),
            svgRepresentation: function () {
                var x = this.get('x');
                var y = this.get('y');
                if (this.get('type') == 'rectangle') {
                    var w = this.get('width');
                    var h = this.get('height');
                    return 'M' + x + ',' + y + 'L' + x + ',' + (y + h) + 'L' + (x + w)
                        + ',' + (y + h) + 'L' + (x + w) + ',' + y + 'Z';
                } else if (this.get('type') == 'circle')
                    return cam.geom.createCircle(x, y, this.get('radius'));
                else if (this.get('type') == 'text')
                    return Text.getTextFromFile(this.get('fontFile'), this.get('text'), this.get('fontSize'), x, y);
                else if (this.get('type') == 'point') {
                    return 'M' + (x - 5) + ',' + y + 'L' + (x + 5) + ',' + y
                        + 'M' + x + ',' + (y - 5) + 'L' + x + ',' + (y + 5);
                }
            }.property('type', 'width', 'height', 'x', 'y', 'radius', 'text', 'fontSize', 'fontName', 'fontFile')
        });

        var Shape = DS.Model.extend({
            name: attr('string', {defaultValue: 'New Shape'}),
            type: attr('string', {defaultValue: 'imported'}),
            manualDefinition: DS.belongsTo('manualShape', {embedded: true}),
            job: DS.belongsTo('job'),
            visible: attr('boolean', {defaultValue: true}),
            definition: attr('string'),
            encodedStlModel: attr('string'),
            drillData: attr('string'),
            flipped: attr('boolean', {defaultValue: false}),
            repetitionX: attr('number', {defaultValue: 1}),
            repetitionY: attr('number', {defaultValue: 1}),
            repetitionSpacingX: attr('number', {defaultValue: 1}),
            repetitionSpacingY: attr('number', {defaultValue: 1}),
            rawPolyline: function () {
                return cam.pathDefToPolygons(this.get('definition'));
            }.property('definition'),
            polyline: function () {
                var ox = this.get('job.offsetX');
                var oy = this.get('job.offsetY');
                var polygons = this.get('rawPolyline');
                if (!polygons)
                    return polygons;
                var scaleX = this.get('flipped') ? -1 : 1;
                var beforeRepetition = polygons.map(function (poly) {
                    return poly.map(function (point) {
                        return new util.Point(scaleX * (point.x - ox), point.y - oy, point.z);
                    });
                });
                var result = [];
                var spacingX = this.get('repetitionSpacingX');
                var spacingY = this.get('repetitionSpacingY');
                var repetitionX = this.get('repetitionX');
                var repetitionY = this.get('repetitionY');
                for (var i = 0; i < repetitionX; i++) {
                    for (var j = 0; j < repetitionY; j++) {
                        for (var p = 0; p < polygons.length; p++) {
                            result.push(beforeRepetition[p].map(function (point) {
                                return point.add(new util.Point(i * spacingX, j * spacingY));
                            }));
                        }
                    }
                }
                return result;
            }.property('rawPolyline', 'flipped', 'repetitionSpacingX', 'repetitionSpacingY', 'repetitionX', 'repetitionY', 'job.offsetX', 'job.offsetY'),
            clipperPolyline: function () {
                var polygons = this.get('polyline');
                return polygons.map(function (poly) {
                    return poly.map(function (point) {
                        return point.scale(cam.CLIPPER_SCALE).round();
                    });
                });
            }.property('polyline'),
            boundingBox: function () {
                var box = new util.BoundingBox();
                var mesh = this.get('meshGeometry');
                if (mesh) {
                    mesh.computeBoundingBox();
                    box.pushPoint(mesh.boundingBox.min);
                    box.pushPoint(mesh.boundingBox.max);
                    return box
                }
                var polygons = this.get('polyline');
                if (polygons) {
                    box.pushPolylines(polygons);
                    return box;
                }
            }.property('polyline', 'meshGeometry'),
            stlModel: function (key, value) {
                if (arguments.length > 1) {
                    this.set('encodedStlModel', base64.toBase64(pako.deflate(value, {to: 'string', level: 6})));
                    return value;
                } else {
                    var encoded = this.get('encodedStlModel');
                    return encoded ? pako.inflate(base64.fromBase64(encoded), {to: 'string'}) : null;
                }
            }.property('encodedStlModel'),
            manualDefinitionChanged: function () {
                var _this = this;
                if (this.get('type') == 'manual')
                    Ember.RSVP.resolve(this.get('manualDefinition.svgRepresentation'))
                        .then(function (result) {
                            _this.set('definition', result);
                        });
            }.observes('manualDefinition', 'manualDefinition.svgRepresentation').on('init'),
            meshGeometry: function () {
                var stlModel = this.get('stlModel');
                if (stlModel == null)
                    return null;
                var geometry = new STLLoader().parse(stlModel);
                if (geometry.type != 'BufferGeometry')
                    geometry = new THREE.BufferGeometry().fromGeometry(geometry);
                return geometry;
            }.property('stlModel'),
            shapeType: function () {
                var isManual = this.get('type') == 'manual';
                if (isManual && this.get('manualDefinition.type') == 'point'
                    || !isManual && this.get('drillData'))
                    return 'points';
                if (!isManual && this.get('stlModel'))
                    return '3D';
                return 'polylines';
            }.property('imported', 'stlModel', 'type', 'drillData', 'manualDefinition.type')
        });

        var operationDefinition = {
            init: function () {
                this._super.apply(this, arguments);
            },
            name: attr('string', {defaultValue: 'New Operation'}),
            type: attr('string', {defaultValue: 'SimpleEngravingOperation'}),
            enabled: attr('boolean', {defaultValue: true}),
            outline: DS.belongsTo('shape'),
            job: DS.belongsTo('job'),
            task: null,
            installObservers: function () {
                var properties = Operations[this.get('type')].properties;
                var _this = this;
                Object.keys(properties).forEach(function (key) {
                    _this.addObserver(key, _this, _this.computeToolpathObeserved)
                });
            }.observes('type').on('didLoad'),
            uninstallObservers: function () {
                var properties = Operations[this.get('type')].properties;
                var _this = this;
                Object.keys(properties).forEach(function (key) {
                    _this.removeObserver(key, _this, _this.computeToolpathObeserved)
                });
            }.observesBefore('type'),
            computeToolpathObeserved: function () {
                if (this.get('outline.definition') && this.get('type') != '3DlinearOperation')
                    Ember.run.debounce(this, this.computeToolpath, 100);
            }.observes('type', 'outline.polyline', 'job.toolDiameter', 'job.safetyZ', 'outline.manualDefinition.x', 'outline.manualDefinition.y').on('init'),
            computeToolpath: function () {
                var _this = this;
                if (this.get('type')) {
                    var operation = Operations[this.get('type')];
                    var params = {
                        job: {
                            safetyZ: this.get('job.safetyZ'),
                            toolDiameter: this.get('job.toolDiameter'),
                            offsetX: this.get('job.offsetX'),
                            offsetY: this.get('job.offsetY')
                        },
                        outline: {
                            clipperPolyline: this.get('outline.clipperPolyline'),
                            point: {
                                x: this.get('outline.manualDefinition.x'),
                                y: this.get('outline.manualDefinition.y')
                            },
                            drillData: this.get('outline.drillData')
                        },
                        type: this.get('type')
                    };
                    Object.keys(operation.properties).forEach(function (key) {
                        params[key] = _this.get(key);
                    });
                    var previousWorker = _this.get('toolpathWorker');
                    if (previousWorker)
                        previousWorker.terminate();
                    _this.set('toolpath', null);
                    _this.set('missedArea', null);
                    var worker = new Worker(require.toUrl('worker.js'));
                    worker.onmessage = Ember.run.bind(this, function (event) {
                        _this.get('toolpathWorker').terminate();
                        _this.set('toolpathWorker', null);
                        _this.set('toolpath', event.data.toolpath.map(function (p) {
                            return tp.decodeToolPath(p)
                        }));
                        _this.set('missedArea', event.data.missedArea.map(function (polys) {
                            return polys.map(function (poly) {
                                return poly.map(function (point) {
                                    return new util.Point(point.x, point.y, 0);
                                });
                            });
                        }));
                    });
                    worker.onerror = Ember.run.bind(this, function (error) {
                        _this.set('toolpathWorker', null);
                        console.log(error);
                    });
                    worker.postMessage({
                        operation: 'computeToolpath',
                        params: params
                    });
                    this.set('toolpathWorker', worker);
                }
            },
            compute3D: function (safetyZ, toolDiameter) {
                var _this = this;
                var model = this.get('outline.meshGeometry');
                var leaveStock = this.get('3d_leaveStock');
                var minZ = this.get('3d_minZ');
                var tool = this.get('tool');
                var orientation = this.get('3d_pathOrientation');
                var stepover = this.get('3d_diametralEngagement') * toolDiameter / 100;
                var startRatio = this.get('3d_startPercent') / 100;
                var stopRatio = this.get('3d_stopPercent') / 100;
                var zigzag = this.get('3d_zigZag');
                var computer = new Computer.ToolPathComputer();
                var task = computer.computeHeightField(model, stepover, tool, leaveStock, orientation,
                    startRatio, stopRatio);
                this.set('task', task);
                task.addObserver('isDone', function () {
                    _this.set('task', null);
                });
                task.get('promise')
                    .then(function (heightField) {
                        return Computer.convertHeightFieldToToolPath(heightField, safetyZ, minZ, zigzag);
                    })
                    .then(Ember.run.bind(this, function (result) {
                        _this.set('toolpath', result);
                    }));
                task.start();
            },
            computing: function () {
                return (this.get('task') && !this.get('task.isDone')) || this.get('toolpathWorker');
            }.property('task', 'task.isDone', 'toolpathWorker'),
            paused: function () {
                console.log('computing', this.get('task') && !this.get('task.isDone'));
                return this.get('task.isPaused');
            }.property('task', 'task.isPaused'),
            tool: function () {
                return {
                    type: this.get('3d_toolType'),
                    diameter: this.get('job.toolDiameter'),
                    angle: this.get('3d_vToolAngle'),
                    tipDiameter: this.get('3d_vToolTipDiameter')
                };
            }.property('3d_toolType', 'job.toolDiameter', '3d_vToolAngle', '3d_vToolTipDiameter')
        };

//add all the attributes from all the operations types
        for (var opName in Operations) {
            var op = Operations[opName];
            for (var attrName in op.properties) {
                var definition = op.properties[attrName];
                operationDefinition[attrName] = attr(definition.type, definition.options);
            }
        }

        /**
         * Here is the deal: the Operation grabs the tool at startPoint for X and Y and on the safety plane,
         * at zero speed, zero inertia.
         * Operation releases the tool at stopPoint, at the Z it wants at zero speed and zero inertia, but the document will
         * pull the tool along Z+ to the safety plane, so dovetail tools or slotting tools better be out at the end of the operation.
         * The Job does the travel before, in between and after the operations.
         * When this works we can try to be smarter and not stop uselessly.
         */

        var Operation = DS.Model.extend(operationDefinition);

        var Job = DS.Model.extend({
            name: attr('string', {defaultValue: 'Unnamed Job'}),
            safetyZ: attr('number', {defaultValue: 5}),
            toolDiameter: attr('number', {defaultValue: 3}),
            toolFlutes: attr('number', {defaultValue: 2}),
            surfaceSpeed: attr('number', {defaultValue: 200}),
            chipLoad: attr('number', {defaultValue: 0.01}),
            computeSpeedFeed: attr('boolean', {defaultValue: true}),
            userFeedrate: attr('number', {defaultValue: 100}),
            speed: attr('number', {defaultValue: 24000}),
            startPoint: attr('point', {defaultValue: new util.Point(0, 0, 10)}),
            jobSummary: DS.belongsTo('jobSummary', {inverse: 'job', async: true}),
            shapes: DS.hasMany('shape', {inverse: 'job', embedded: true}),
            operations: DS.hasMany('operation', {inverse: 'job', embedded: true}),
            offsetX: attr('number', {defaultValue: 0}),
            offsetY: attr('number', {defaultValue: 0}),
            startSpindle: attr('boolean', {defaultValue: true}),
            transitionTravels: [],
            deleteOperation: function (operation) {
                this.get('operations').removeObject(operation);
                operation.destroyRecord();
                this.save();
            },
            deleteShape: function (shape) {
                this.get('shapes').removeObject(shape);
                shape.destroyRecord();
                this.save();
            },
            enabledOperations: Ember.computed.filterBy('operations', 'enabled', true),
            transitionTravelsObeserved: function () {
                Ember.run.debounce(this, this.computeTransitionTravels, 100);
            }.observes('enabledOperations.@each.toolpath.@each'),
            computeTransitionTravels: function () {
                var operations = this.get('enabledOperations');
                var travelBits = [];
                var pathFragments = [];
                var endPoint = null;
                operations.forEach(function (operation) {
                    if (operation.get('toolpath'))
                        pathFragments.pushObjects(operation.get('toolpath'));
                });
                if (pathFragments.length) {
                    var prefix = new tp.GeneralPolylineToolpath();
                    prefix.pushPoint(this.get('startPoint'));
                    prefix.pushPoint(pathFragments[0].getStartPoint());
                    travelBits.push(prefix);
                    for (var i = 0; i < pathFragments.length; i++) {
                        endPoint = pathFragments[i].getStopPoint();
                        var travel = new tp.GeneralPolylineToolpath();
                        travel.pushPointXYZ(endPoint.x, endPoint.y, endPoint.z);
                        travel.pushPointXYZ(endPoint.x, endPoint.y, this.get('safetyZ'));
                        if (i + 1 < pathFragments.length) {
                            var destinationPoint = pathFragments[i + 1].getStartPoint();
                            travel.pushPointXYZ(destinationPoint.x, destinationPoint.y, this.get('safetyZ'));
                        }
                        travelBits.push(travel);
                    }
                    var suffix = new tp.GeneralPolylineToolpath();
                    suffix.pushPoint(travelBits[travelBits.length - 1].getStopPoint());
                    suffix.pushPoint(this.get('startPoint'));
                    travelBits.push(suffix);
                }
                var len = 0;
                for (i = 0; i < travelBits.length; i++)
                    len += travelBits[i].length();
                console.log('travel dist', len);
                this.set('transitionTravels', travelBits);
            }.on('init'),
            createOperation: function (params) {
                if (params == null) {
                    var lastOp = this.get('operations.lastObject');
                    if (lastOp) {
                        params = lastOp.toJSON();
                        params.job = this;
                        params.outline = lastOp.get('outline');
                    }
                }
                var operation = this.store.createRecord('operation', params);
                operation.set('job', this);
                this.get('operations').pushObject(operation);
                return operation;
            },
            createShape: function (def, name, params) {
                var shape = this.store.createRecord('shape', $.extend({definition: def, name: name}, params));
                this.get('shapes').pushObject(shape);
                return shape;
            },
            saveAll: function () {
                var summaryPromise = this.get('jobSummary');
                var _this = this;
                summaryPromise.then(function (summary) {
                    if (summary == null) {
                        summary = _this.store.createRecord('jobSummary', {job: _this, name: _this.get('name')});
                        _this.set('jobSummary', summary);
                    } else
                        summary.set('name', _this.get('name'));
                    return Ember.RSVP.all([summary.save(), _this.save()]);
                });
            },
            updateSpeed: function () {
                var toolDiameter = this.get('toolDiameter');
                var surfaceSpeed = this.get('surfaceSpeed');
                this.set('speed', Math.round(surfaceSpeed * 1000 / Math.PI / toolDiameter));
            }.observes('surfaceSpeed', 'toolDiameter').on('didCreate'),
            computedFeedrate: function () {
                var speed = this.get('speed');
                var chipLoad = this.get('chipLoad');
                var toolFlutes = this.get('toolFlutes');
                return Math.round(speed * chipLoad * toolFlutes);
            }.property('toolFlutes', 'chipLoad', 'speed'),
            feedrate: function () {
                return this.get('computeSpeedFeed') ? this.get('computedFeedrate') : this.get('userFeedrate');
            }.property('computedFeedrate', 'userFeedrate', 'computeSpeedFeed'),
            computeCompactToolPath: function () {
                var operations = this.get('enabledOperations');
                var feedrate = this.get('feedrate');
                console.log('using feed rate', feedrate);
                var safetyZ = this.get('safetyZ');
                var travelBits = [];
                var pathFragments = [];
                var endPoint = null;
                operations.forEach(function (operation) {
                    var toolpath = operation.get('toolpath');
                    toolpath.forEach(function (fragment) {
                        fragment.operation = operation.get('id');
                    });
                    pathFragments.pushObjects(toolpath);
                });
                var startPoint = this.get('startPoint');
                console.timeEnd('preparation');
                var position = startPoint;
                var safeStartPoint = new util.Point(startPoint.x, startPoint.y, Math.max(startPoint.z, safetyZ));

                function segment(p1, p2) {
                    return new Float32Array([p1.x, p1.y, p1.z, p2.x, p2.y, p2.z]);
                }

                travelBits.push({speedTag: 'rapid', path: segment(startPoint, safeStartPoint)});
                if (pathFragments.length) {
                    position = pathFragments[0].getStartPoint();
                    travelBits.push({speedTag: 'rapid', path: segment(safeStartPoint, position)});
                    for (var i = 0; i < pathFragments.length; i++) {
                        var fragment = pathFragments[i];
                        travelBits.push({
                            operation: fragment.operation,
                            speedTag: 'normal',
                            feedRate: feedrate,
                            path: fragment.asCompactToolpath()
                        });
                        endPoint = fragment.getStopPoint();
                        position = new util.Point(endPoint.x, endPoint.y, safetyZ);
                        travelBits.push({speedTag: 'rapid', path: segment(endPoint, position)});
                        if (i + 1 < pathFragments.length) {
                            var destinationPoint = pathFragments[i + 1].getStartPoint();
                            var newPos = new util.Point(destinationPoint.x, destinationPoint.y, safetyZ);
                            travelBits.push({speedTag: 'rapid', path: segment(position, newPos)});
                            position = newPos;
                        }
                    }
                    travelBits.push({speedTag: 'rapid', path: segment(position, safeStartPoint)});
                }
                return travelBits;
            }
        });

        var JobSummary = DS.Model.extend({
            name: attr('string', {defaultValue: 'Unnamed Job'}),
            job: DS.belongsTo('job', {inverse: 'jobSummary', async: true})
        });

        return {
            Job: Job,
            JobSummary: JobSummary,
            Operation: Operation,
            Shape: Shape,
            ManualShape: ManualShape,
            PointTransform: PointTransform,
            ManualShapeSerializer: ManualShapeSerializer
        }
    });