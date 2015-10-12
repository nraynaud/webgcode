"use strict";

define(['cnc/util'], function (util) {

    function ConstantZPolygonToolpath() {
        this.path = [];
    }

    ConstantZPolygonToolpath.prototype = {
        getTypeName: function () {
            return 'constant-z-toolpath';
        },
        pushPoint: function (point) {
            this.path.push(point);
        },
        pushPointXYZ: function (x, y) {
            this.path.push(new util.Point(x, y));
        },
        getStartPoint: function (defaultZ) {
            var p = this.path[0];
            return new util.Point(p[0], p[1], defaultZ);
        },
        getStopPoint: function (defaultZ) {
            var p = this.path[this.path.length - 1];
            return new util.Point(p[0], p[1], defaultZ);
        },
        forEachPoint: function (pointHandler, defaultZ) {
            $.each(this.path, function (index, point) {
                pointHandler(point[0], point[1], defaultZ, index);
            });
        },
        asPathDef: function () {
            var poly = this.path;
            var d = '';
            if (poly.length) {
                var firstPoint = poly[0];
                d += ' M ' + firstPoint[0] + ',' + firstPoint[1];
                for (var i = 1; i < poly.length; i++)
                    d += ' L ' + poly[i][0] + ',' + poly[i][1];
            }
            return d;
        },
        translate: function (dx, dy) {
            $.each(this.path, function (index, point) {
                point[0] += dx;
                point[1] += dy;
            });
        },
        asGeneralToolpath: function (defaultZ) {
            var gt = new GeneralPolylineToolpath();
            this.forEachPoint(gt.pushPointXYZ.bind(gt), defaultZ);
            return gt;
        }
    };

    function GeneralPolylineToolpath(path) {
        if (path == null)
            path = [];
        this.path = path;
    }

    GeneralPolylineToolpath.prototype = {
        getTypeName: function () {
            return 'general-toolpath';
        },
        pushPoint: function (point) {
            this.path.push(point);
        },
        pushPointXYZ: function (x, y, z) {
            this.path.push(new util.Point(x, y, z));
        },
        pushPointInFront: function (x, y, z) {
            this.path.unshift(new util.Point(x, y, z));
        },
        getStartPoint: function () {
            var p = this.path[0];
            return new util.Point(p[0], p[1], p[2]);
        },
        getStopPoint: function () {
            var p = this.path[this.path.length - 1];
            return new util.Point(p[0], p[1], p[2]);
        },
        forEachPoint: function (pointHandler, defaultZ) {
            $.each(this.path, function (index, point) {
                pointHandler(point[0], point[1], point[2], index);
            });
            var lastPoint = this.getStopPoint(defaultZ);
            pointHandler(lastPoint.x, lastPoint.y, lastPoint.z);
        },
        asPathDef: function () {
            var poly = this.path;
            var d = '';
            if (poly.length) {
                var firstPoint = poly[0];
                d += ' M ' + firstPoint[0] + ',' + firstPoint[1];
                for (var i = 1; i < poly.length; i++)
                    d += ' L ' + poly[i][0] + ',' + poly[i][1];
            }
            return d;
        },
        translated: function (dx, dy, dz) {
            var newPath = new GeneralPolylineToolpath();
            $.each(this.path, function (index, point) {
                newPath.pushPointXYZ(point[0] + dx, point[1] + dy, point[2] + dz);
            });
            return newPath;
        },
        asGeneralToolpath: function (defaultZ) {
            return this;
        },
        toJSON: function () {
            return {className: 'general-toolpath', path: this.path};
        },
        asCompactToolpath: function () {
            var buffer = new Float32Array(this.path.length * 3);
            for (var i = 0; i < this.path.length; i++) {
                buffer[i * 3] = this.path[i].x;
                buffer[i * 3 + 1] = this.path[i].y;
                buffer[i * 3 + 2] = this.path[i].z;
            }
            return buffer;
        },
        length: function () {
            var len = 0;
            var lastPoint = null;
            this.path.forEach(function (point) {
                if (lastPoint)
                    len += lastPoint.distance(point);
                lastPoint = point;
            });
            return len;
        }
    };

    function decodeToolPath(operationData) {
        var toolPathTypes = {
            'general-toolpath': GeneralPolylineToolpath,
            'constant-z-toolpath': ConstantZPolygonToolpath
        };
        var operation = new toolPathTypes[operationData.className]();
        var path = operationData.path;
        for (var i = 0; i < path.length; i++)
            operation.pushPointXYZ(path[i].x, path[i].y, path[i].z);
        return operation;
    }

    function travelFromTo(fromPoint, toPoint, altitude) {
        var travel = new GeneralPolylineToolpath();
        if (fromPoint) {
            travel.initialPoint = fromPoint;
            travel.pushPointXYZ(fromPoint.x, fromPoint.y, altitude);
            if (toPoint)
                travel.pushPointXYZ(toPoint.x, toPoint.y, altitude);
        }
        return travel;
    }

    return {
        decodeToolPath: decodeToolPath,
        GeneralPolylineToolpath: GeneralPolylineToolpath,
        ConstantZPolygonToolpath: ConstantZPolygonToolpath,
        travelFromTo: travelFromTo
    };
});