"use strict";

define(['cnc/util', 'cnc/gcode/simulation'], function (util, simulation) {

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
        this.className = 'general-toolpath';
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
        asSimulablePolyline: function (feedRate, travelFeedrate, speedTag) {
            if (!this.path || this.path.length == 0)
                return 0;
            var newPath = [];
            var lastPoint = this.initialPoint != null ? this.initialPoint : this.getStartPoint();
            feedRate = feedRate ? feedRate : this.feedRate;
            this.path.forEach(function (point) {
                if (point.sqDistance(lastPoint)) {
                    newPath.push({
                        type: 'line',
                        from: lastPoint,
                        to: point,
                        speedTag: speedTag,
                        feedRate: speedTag == 'rapid' ? travelFeedrate : feedRate
                    });
                }
                lastPoint = point;
            });
            return newPath;
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
        for (var key in operationData)
            if (key != 'path' && operationData.hasOwnProperty(key))
                operation[key] = key == 'initialPoint' ? new util.Point(operationData[key].x, operationData[key].y, operationData[key].z) : operationData[key];
        return operation;
    }

    function travelFromTo(fromPoint, toPoint, altitude) {
        var travel = new GeneralPolylineToolpath();
        travel.speedTag = 'rapid';
        if (fromPoint) {
            travel.initialPoint = fromPoint;
            travel.pushPointXYZ(fromPoint.x, fromPoint.y, altitude);
            if (toPoint)
                travel.pushPointXYZ(toPoint.x, toPoint.y, altitude);
        }
        return travel;
    }

    function OperationToolpathAssembly(workToolpath, completePath, travelBits) {
        this.completePath = completePath;
        this.travelBits = travelBits;
        this.isEmpty = completePath.length == 0;
        this.path = completePath;
        this.stopPoint = workToolpath && workToolpath.length ? workToolpath[workToolpath.length - 1].getStopPoint() : null;
        this.startPoint = workToolpath && workToolpath.length ? workToolpath[0].getStartPoint() : null;
    }

    OperationToolpathAssembly.prototype = {
        getStartPoint: function () {
            return this.startPoint;
        },
        getStopPoint: function () {
            return this.stopPoint;
        },
        getTravelBits: function () {
            return this.travelBits;
        },
        getDuration: function () {
            var totalTime = 0;
            this.completePath.forEach(function (path) {
                var info = simulation.collectToolpathInfo(path.asSimulablePolyline(path.feedrate, 3000, path.speedTag));
                totalTime += info.totalTime;
            });
            return totalTime;
        }
    };

    function assembleToolPathFromOperation(feedrateAccessor, travelAltitude, workToolpath, operationId) {
        function travelAfter(index, pathFragments, travelAltitude) {
            var from = pathFragments[index].getStopPoint();
            var to = index + 1 < pathFragments.length ? pathFragments[index + 1].getStartPoint() : null;
            return travelFromTo(from, to, travelAltitude);
        }

        var completePath = [];
        var travelBits = [];
        if (workToolpath != null)
            for (var i = 0; i < workToolpath.length; i++) {
                if (workToolpath[i]['feedrate'] === undefined)
                    Object.defineProperty(workToolpath[i], 'feedrate', {
                        enumerable: true,
                        get: feedrateAccessor
                    });
                workToolpath[i].operation = operationId;
                completePath.push(workToolpath[i]);
                var travel = travelAfter(i, workToolpath, travelAltitude);
                travel.operation = operationId;
                travelBits.push(travel);
                completePath.push(travel);
            }
        return new OperationToolpathAssembly(workToolpath, completePath, travelBits);
    }

    function WholeProgram(completePath, travelBits) {
        this.completePath = completePath;
        this.travelBits = travelBits;
        this.path = completePath;
    }

    WholeProgram.prototype = {
        getTravelBits: function () {
            return this.travelBits;
        },
        computeCompactToolPath: function () {

        },
        getDuration: function () {
            var totalTime = 0;
            this.completePath.forEach(function (path) {
                totalTime += simulation.collectToolpathInfo(path.asSimulablePolyline(path.feedrate, 3000, path.speedTag)).totalTime;
            });
            return totalTime;
        }
    };
    function assembleWholeProgram(prefix, suffix, safetyZ, operationAssemblies) {
        var travelBits = [];
        var completePath = [];
        if (operationAssemblies.length) {
            completePath.push(prefix);
            travelBits.push(prefix);
            for (var i = 0; i < operationAssemblies.length; i++) {
                var assembly = operationAssemblies[i];
                if (assembly.isEmpty)
                    continue;
                completePath.pushObjects(assembly.path);
                travelBits.pushObjects(assembly.getTravelBits());
                var stopPoint = assembly.getStopPoint();
                if (stopPoint && i + 1 < operationAssemblies.length && !operationAssemblies[i + 1].isEmpty) {
                    var connection = travelFromTo(stopPoint, operationAssemblies[i + 1].getStartPoint(), safetyZ);
                    travelBits.push(connection);
                    completePath.push(connection);
                }
            }
            completePath.push(suffix);
            travelBits.push(suffix);
        }
        return new WholeProgram(completePath, travelBits);
    }

    return {
        decodeToolPath: decodeToolPath,
        GeneralPolylineToolpath: GeneralPolylineToolpath,
        ConstantZPolygonToolpath: ConstantZPolygonToolpath,
        travelFromTo: travelFromTo,
        assembleToolPathFromOperation: assembleToolPathFromOperation,
        assembleWholeProgram: assembleWholeProgram,
        OperationToolpathAssembly: OperationToolpathAssembly
    };
});