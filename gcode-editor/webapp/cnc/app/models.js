"use strict";

define(['Ember', 'EmberData', 'cnc/cam/cam', 'cnc/util', 'libs/pako.min', 'base64', 'THREE',
        'libs/threejs/STLLoader', 'cnc/cam/text', 'cnc/app/job/jobModel', 'cnc/app/operationModel', 'cnc/app/job/jobAdapter', 'require'],
    function (Ember, DS, cam, util, pako, base64, THREE, STLLoader, Text, Job, Operation, JobAdapter, require) {
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

        var JobSerializer = DS.JSONSerializer.extend(DS.EmbeddedRecordsMixin, {
            attrs: {
                shapes: {embedded: 'always'},
                operations: {embedded: 'always'}
            }
        });

        var ShapeSerializer = DS.JSONSerializer.extend(DS.EmbeddedRecordsMixin, {
            attrs: {
                manualDefinition: {embedded: 'always'}
            }
        });

        var OperationSerializer = DS.JSONSerializer.extend(DS.EmbeddedRecordsMixin, {
            attrs: {
                outline: {serialize: 'ids', deserialize: 'ids'},
                job: {serialize: 'ids', deserialize: 'ids'}
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
            threeDmodelID: attr('string', {defaultValue: null}),
            sliceZ: attr('number', {defaultValue: 0}),
            svgRepresentation: function () {
                var x = this.get('x');
                var y = this.get('y');
                switch (this.get('type')) {
                    case 'rectangle':
                        var w = this.get('width');
                        var h = this.get('height');
                        return 'M' + x + ',' + y + 'L' + x + ',' + (y + h) + 'L' + (x + w)
                            + ',' + (y + h) + 'L' + (x + w) + ',' + y + 'Z';
                    case 'circle':
                        return cam.geom.createCircle(x, y, this.get('radius'));
                    case 'text':
                        return Text.getTextFromFile(this.get('fontFile'), this.get('text'), this.get('fontSize'), x, y);
                    case 'point':
                        return 'M' + (x - 5) + ',' + y + 'L' + (x + 5) + ',' + y
                            + 'M' + x + ',' + (y - 5) + 'L' + x + ',' + (y + 5);
                    case 'slice':
                        var model = this.get('threeDmodel.jsonModel');
                        if (model) {
                            var _this = this;
                            return new Promise(function (resolve) {
                                var worker = _this.get('svgWorker');
                                if (worker)
                                    worker.terminate();
                                worker = new Worker(require.toUrl('worker.js') + '#slice');
                                _this.set('svgWorker', worker);
                                worker.onmessage = Ember.run.bind(this, function (event) {
                                    _this.set('svgWorker', null);
                                    resolve(event.data.result);
                                    worker.terminate();
                                });
                                worker.postMessage({
                                    operation: 'extractContour',
                                    altitude: _this.get('sliceZ'),
                                    model: model
                                });
                            });
                        }
                        return '';
                }
            }.property('type', 'width', 'height', 'x', 'y', 'radius', 'text', 'fontSize', 'fontName', 'fontFile', 'threeDmodel', 'sliceZ'),
            updatethreeDmodel: function () {
                var id = this.get('threeDmodelID');
                var _this = this;
                if (id)
                    this.store.find('shape', id).then(function (model) {
                        _this.set('threeDmodel', model);
                    });

            }.observes('threeDmodelID').on('didLoad')
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
            computing: false,
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
                if (this.get('type') === 'manual') {
                    this.set('computing', true);
                    Ember.RSVP.resolve(this.get('manualDefinition.svgRepresentation'))
                        .then(function (result) {
                            if (!_this.get('isDeleted'))
                                _this.set('definition', result);
                            _this.set('computing', false);
                        });
                }
            }.observes('manualDefinition', 'manualDefinition.svgRepresentation').on('init'),
            meshGeometry: function () {
                var stlModel = this.get('stlModel');
                if (stlModel == null)
                    return null;
                var geometry = new STLLoader().parse(stlModel);
                if (geometry.type !== 'BufferGeometry')
                    geometry = new THREE.BufferGeometry().fromGeometry(geometry);
                return geometry;
            }.property('stlModel'),
            jsonModel: function () {
                var model = this.get('meshGeometry');
                if (model == null)
                    return null;
                model = model.clone();
                model.removeAttribute('normal');
                return model.toJSON();
            }.property('meshGeometry'),
            shapeType: function () {
                var isManual = this.get('type') === 'manual';
                if (isManual && this.get('manualDefinition.type') === 'point'
                    || !isManual && this.get('drillData'))
                    return 'points';
                if (!isManual && this.get('stlModel'))
                    return '3D';
                return 'polylines';
            }.property('imported', 'stlModel', 'type', 'drillData', 'manualDefinition.type')
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
            ManualShapeSerializer: ManualShapeSerializer,
            JobSerializer: JobSerializer,
            ShapeSerializer: ShapeSerializer,
            JobAdapter: JobAdapter,
            JobSummaryAdapter: JobAdapter,
            OperationSerializer: OperationSerializer
        }
    });