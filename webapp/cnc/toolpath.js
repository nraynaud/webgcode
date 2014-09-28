"use strict";

define([], function () {

    function ConstantZPolygonToolpath() {
        this.path = [];
    }

    ConstantZPolygonToolpath.prototype = {
        getTypeName: function () {
            return 'constant-z-toolpath';
        },
        pushPoint: function (x, y) {
            this.path.push([x, y]);
        },
        getStartPoint: function (defaultZ) {
            var p = this.path[0];
            return {x: p[0], y: p[1], z: defaultZ};
        },
        getStopPoint: function (defaultZ) {
            var p = this.path[this.path.length - 1];
            return {x: p[0], y: p[1], z: defaultZ};
        },
        forEachPoint: function (pointHandler, defaultZ) {
            $.each(this.path, function (index, point) {
                pointHandler(point[0], point[1], defaultZ, index);
            });
        },
        pushOnPath: function (path) {
            pushOnPath(path, this);
            path.node.pathSegList.appendItem(path.node.createSVGPathSegClosePath());
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
        }
    };

    function GeneralPolylineToolpath() {
        this.path = [];
    }

    GeneralPolylineToolpath.prototype = {
        getTypeName: function () {
            return 'general-toolpath';
        },
        pushPoint: function (x, y, z) {
            this.path.push([x, y, z]);
        },
        getStartPoint: function () {
            var p = this.path[0];
            return {x: p[0], y: p[1], z: p[2]};
        },
        getStopPoint: function () {
            var p = this.path[this.path.length - 1];
            return {x: p[0], y: p[1], z: p[2]};
        },
        forEachPoint: function (pointHandler, defaultZ) {
            $.each(this.path, function (index, point) {
                pointHandler(point[0], point[1], point[2], index);
            });
            var lastPoint = this.getStopPoint(defaultZ);
            pointHandler(lastPoint.x, lastPoint.y, lastPoint.z);
        },
        pushOnPath: function (path) {
            pushOnPath(path, this);
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
                newPath.pushPoint(point[0] + dx, point[1] + dy, point[2] + dz);
            });
            return newPath;
        }
    };

    function decodeToolPath(operationData) {
        var toolPathTypes = {
            'general-toolpath': GeneralPolylineToolpath,
            'constant-z-toolpath': ConstantZPolygonToolpath
        };
        var operation = new toolPathTypes[operationData.className]();
        operation.path = operationData.path;
        return operation;
    }

    return {
        decodeToolPath: decodeToolPath,
        GeneralPolylineToolpath: GeneralPolylineToolpath,
        ConstantZPolygonToolpath: ConstantZPolygonToolpath
    };
});