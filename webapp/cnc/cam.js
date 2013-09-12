"use strict";

function pushOnPath(path, toolpath) {
    var firstPoint = toolpath.getStartPoint();
    path.node.pathSegList.appendItem(path.node.createSVGPathSegMovetoAbs(firstPoint.x, firstPoint.y));
    toolpath.forEachPoint(function (x, y, z) {
        path.node.pathSegList.appendItem(path.node.createSVGPathSegLinetoAbs(x, y));
    }, null);
}

function pushPolygonOn(path, points) {
    $.each(points, function (index, point) {
        var segment;
        if (index == 0)
            segment = path.node.createSVGPathSegMovetoAbs(point.x, point.y);
        else
            segment = path.node.createSVGPathSegLinetoAbs(point.x, point.y);
        path.node.pathSegList.appendItem(segment);
    });
    path.node.pathSegList.appendItem(path.node.createSVGPathSegClosePath());
}

function showClipperPolygon(group, polygon, stroke) {
    $.each(polygon, function (_, polygon) {
        var path = group.path('', true).attr({'vector-effect': 'non-scaling-stroke', fill: 'none', stroke: stroke == null ? 'red' : stroke});
        pushPolygonOn(path, polygon);
    });
}

var isStraightLine = function () {
    var STRAIGHT_LINES = ['PATHSEG_CLOSEPATH', 'PATHSEG_LINETO_ABS', 'PATHSEG_LINETO_REL',
        'PATHSEG_LINETO_HORIZONTAL_ABS', 'PATHSEG_LINETO_HORIZONTAL_REL', 'PATHSEG_LINETO_VERTICAL_ABS',
        'PATHSEG_LINETO_VERTICAL_REL'];
    var linePrefixes = [];
    $.each(STRAIGHT_LINES, function (_, type) {
        linePrefixes[SVGPathSeg[type]] = true;
    });
    return function isStraightLine(pathSeg) {
        return !!linePrefixes[pathSeg.pathSegType];
    };
}();

function getPathLengths(path) {
    var defs = path.parent.type == "defs" ? path.parent : path.parent.defs();
    var shadowPath = defs.path();
    var segmentsLengths = [];
    var clone = path.clone();
    shadowPath.node.pathSegList.clear();
    for (var i = 0; i < path.node.pathSegList.numberOfItems; i++) {
        //explicitly remove it because append() in chrome removes it while ff leaves it
        var item = clone.node.pathSegList.removeItem(0);
        shadowPath.node.pathSegList.appendItem(item);
        segmentsLengths[i] = shadowPath.node.getTotalLength();
    }
    shadowPath.remove();
    return segmentsLengths;
}

//don't send a compound or non-closed path to this function, it won't end well
function toClipper(shapePath, scale, pointCount, translation) {
    if (translation == null)
        translation = {x: 0, y: 0};
    var totalLength = shapePath.node.getTotalLength();
    var clipperPoints = [];
    var segmentsLengths = getPathLengths(shapePath);
    for (var l = 0; l <= totalLength;) {
        var segmentIndex = shapePath.node.getPathSegAtLength(l);
        var pathSeg = shapePath.node.pathSegList.getItem(segmentIndex);
        var p = shapePath.node.getPointAtLength(l);
        if (isStraightLine(pathSeg)) {
            //push the initial segment point
            p = shapePath.node.getPointAtLength(segmentsLengths[segmentIndex - 1]);
            //skip to slightly (one hundredth of a step) after the end of the segment
            l = segmentsLengths[segmentIndex] + totalLength / pointCount * 0.01;
        } else
            l += totalLength / pointCount;
        clipperPoints.push({X: (translation.x + p.x) * scale, Y: (translation.y + p.y) * scale});
    }
    clipperPoints = [clipperPoints];
    return ClipperLib.Clean(clipperPoints, 0.0001 * scale);
}

function fromClipper(polygons, scale, reorder, areaPositive) {
    var result = [];
    $.each(polygons, function (_, polygon) {
        if (reorder) {
            var area = ClipperLib.Clipper.Area(polygon) / (scale * scale);
            if (area >= 0 && !areaPositive || area < 0 && areaPositive)
                polygon.reverse();
        }
        var newPoly = new ConstantZPolygonToolpath();
        $.each(polygon, function (_, point) {
            newPoly.pushPoint(point.X / scale, point.Y / scale);
        });
        result.push(newPoly);
    });
    return result;
}

function contouring(shapePath, toolRadius, inside, climbMilling, translation) {
    if (inside)
        toolRadius = -toolRadius;
    var polygonAreaPositive = (!!climbMilling) ^ (!inside);
    var scale = 10000;
    var pointCount = 500;
    var clipperPoints = toClipper(shapePath, scale, pointCount, translation);
    var cpr = new ClipperLib.Clipper();
    var offset = cpr.OffsetPolygons(clipperPoints, toolRadius * scale, ClipperLib.JoinType.jtRound, 0.25, true);
    return fromClipper(offset, scale, true, polygonAreaPositive);
}

function polyOp(p1, p2, op) {
    var cpr = new ClipperLib.Clipper();
    var result = new ClipperLib.Polygons()
    cpr.AddPolygons(p1, ClipperLib.PolyType.ptSubject);
    cpr.AddPolygons(p2, ClipperLib.PolyType.ptClip);
    cpr.Execute(op, result, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
    return result
}

function filletWholePolygon(shapePath, radius) {
    var scale = 10000;
    var pointCount = 500;
    var unclean = toClipper(shapePath, scale, pointCount);
    var clipperPoints = ClipperLib.Clean(unclean, 0.0001 * scale);
    var cpr = new ClipperLib.Clipper();
    var eroded = cpr.OffsetPolygons(clipperPoints, -radius * scale, ClipperLib.JoinType.jtRound, 0.25, true);
    var openedDilated = cpr.OffsetPolygons(eroded, 2 * radius * scale, ClipperLib.JoinType.jtRound, 0.25, true);
    var rounded = cpr.OffsetPolygons(openedDilated, -radius * scale, ClipperLib.JoinType.jtRound, 0.25, true);
    return fromClipper(rounded, scale);
}

function createCircle(centerX, centerY, radius) {
    function coords(x, y) {
        return x + ', ' + y;
    }

    function arc(dx, dy) {
        return 'A' + coords(radius, radius) + ' 0 0 0 ' + coords(centerX + dx * radius, centerY + dy * radius);
    }

    //avoid long arcs because webkit makes huge errors with them in getPointAtLength()
    var arcs = [arc(1, 0), arc(0, -1), arc(-1, 0), arc(0, 1)];
    return 'M' + coords(centerX, centerY + radius) + ' ' + arcs.join(' ');
}

function createDrillHole(x, y) {
    var toolPath = new ConstantZPolygonToolpath();
    toolPath.pushPoint(x, y);
    return toolPath;
}

function createRelativeRectangle(xSpan, ySpan) {
    function lineTo(x, y) {
        return  'l' + x + ',' + y;
    }

    return lineTo(xSpan, 0) + lineTo(0, ySpan) + lineTo(-xSpan, 0) + 'Z';
}

function createGCode(workZ, travelZ, ops) {
    var output = '';

    function appendLine(l) {
        output += l + '\n';
    }

    function pos(point, z) {
        return 'X' + point.x + ' Y' + point.y + ' Z' + z;
    }

    $.each(ops, function (_, operation) {
        $.each(operation, function (_, polygon) {
            appendLine('G0 ' + pos(polygon[0], travelZ));
            $.each(polygon, function (_, point) {
                appendLine('G1 ' + pos(point, workZ));
            });
            //close the loop
            appendLine('G1 ' + pos(polygon[0], workZ));
            appendLine('G1 ' + pos(polygon[0], travelZ));
        });
    });
    return output;
}

function ConstantZPolygonToolpath() {
    this.path = [];
}
ConstantZPolygonToolpath.prototype.pushPoint = function (x, y) {
    this.path.push([x, y]);
}
ConstantZPolygonToolpath.prototype.getStartPoint = function (defaultZ) {
    var p = this.path[0];
    return {x: p[0], y: p[1], z: defaultZ};
}
ConstantZPolygonToolpath.prototype.getStopPoint = function (defaultZ) {
    return this.getStartPoint(defaultZ);
}
ConstantZPolygonToolpath.prototype.forEachPoint = function (pointHandler, defaultZ) {
    $.each(this.path, function (index, point) {
        pointHandler(point[0], point[1], defaultZ, index);
    });
    var lastPoint = this.getStopPoint(defaultZ);
    pointHandler(lastPoint.x, lastPoint.y, lastPoint.z, this.path.length);
}
ConstantZPolygonToolpath.prototype.pushOnPath = function (path) {
    pushOnPath(path, this);
    path.node.pathSegList.appendItem(path.node.createSVGPathSegClosePath());
}

function GeneralPolylineToolpath() {
    this.path = [];
}

GeneralPolylineToolpath.prototype.pushPoint = function (x, y, z) {
    this.path.push([x, y, z]);
};
GeneralPolylineToolpath.prototype.getStartPoint = function (defaultZ) {
    var p = this.path[0];
    return {x: p[0], y: p[1], z: p[2]};
};
GeneralPolylineToolpath.prototype.getStopPoint = function (defaultZ) {
    var p = this.path[this.path.length - 1];
    return {x: p[0], y: p[1], z: p[2]};
};
GeneralPolylineToolpath.prototype.forEachPoint = function (pointHandler, defaultZ) {
    $.each(this.path, function (index, point) {
        pointHandler(point[0], point[1], point[2], index);
    });
    var lastPoint = this.getStopPoint(defaultZ);
    pointHandler(lastPoint.x, lastPoint.y, lastPoint.z);
}
GeneralPolylineToolpath.prototype.pushOnPath = function (path) {
    pushOnPath(path, this);
}

function Machine(paper) {
    this.paper = paper;
    this.operations = [];
}

Machine.prototype.setParams = function (workZ, travelZ, feedRate) {
    this.workZ = workZ;
    this.travelZ = travelZ;
    this.feedRate = feedRate;
};
Machine.prototype.createOutline = function (defintion) {
    return this.paper.path(defintion, true).attr({'vector-effect': 'non-scaling-stroke', fill: 'none', stroke: 'red'});
};
Machine.prototype.contouring = function (shapePath, toolRadius, inside, climbMilling, translation) {
    return contouring(shapePath, toolRadius, inside, climbMilling, translation);
};
Machine.prototype.registerToolPath = function (toolpath) {
    var path = this.paper.path('', true).attr({'vector-effect': 'non-scaling-stroke', fill: 'none', stroke: 'blue'});
    toolpath.pushOnPath(path);
    this.operations.push(toolpath);
};
Machine.prototype.registerToolPathArray = function (toolpathArray) {
    var machine = this;
    $.each(toolpathArray, function (_, toolpath) {
        machine.registerToolPath(toolpath);
    });
}
Machine.prototype.rampToolPath = function (toolpath, startZ, stopZ, turns) {
    function len(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    function dist(p1, p2) {
        return len(p1.x - p2.x, p1.y - p2.y);
    }

    var path = this.paper.defs().path('', true);
    toolpath.pushOnPath(path);
    var toolpathLength = path.node.getTotalLength();
    var segmentsLen = getPathLengths(path);
    path.remove();
    var resultPolyline = new GeneralPolylineToolpath();
    for (var i = 0; i < turns; i++) {
        toolpath.forEachPoint(function (x, y, z, index) {
            var xyLength = segmentsLen[index + 2];
            var z = startZ + (stopZ - startZ) * ((i + xyLength / toolpathLength) / turns);
            resultPolyline.pushPoint(x, y, z);
        }, null);
    }
    //push constant Z bottom loop
    toolpath.forEachPoint(function (x, y, z, index) {
        resultPolyline.pushPoint(x, y, stopZ);
    }, null);
    return resultPolyline;
};
Machine.prototype.drillCorners = function (contour) {
    var holes = [];
    $.each(getPathLengths(path), function (i, l) {
        if (path.node.pathSegList.getItem(i).pathSegType != SVGPathSeg.PATHSEG_CLOSEPATH) {
            var point = path.node.getPointAtLength(l);
            holes.push(createDrillHole(point.x, point.y));
        }
    });
    return holes;
}
Machine.prototype.filletWholePolygon = function (shapePath, radius) {
    return filletWholePolygon(shapePath, radius);
};

Machine.prototype.dumpGCode = function () {
    var machine = this;

    function pos(point, zOverride) {
        return 'X' + point.x + ' Y' + point.y + ' Z' + ((zOverride != undefined) ? zOverride : point.z);
    }

    var code = ['F' + this.feedRate];
    $.each(this.operations, function (_, op) {
        code.push('G0' + pos(op.getStartPoint(machine.travelZ), machine.travelZ));
        op.forEachPoint(function (x, y, z) {
            code.push('G1' + pos({x: x, y: y, z: z}));
        }, machine.workZ);
        code.push('G0' + pos(op.getStopPoint(machine.travelZ), machine.travelZ));
    });
    return code.join('\n');
}

Machine.prototype.dumpPath = function () {
    var points = [];
    $.each(this.operations, function (_, op) {
        var startPoint = op.getStartPoint(machine.travelZ);
        points.push({x: startPoint.x, y: startPoint.y, z: machine.travelZ});
        op.forEachPoint(function (x, y, z) {
            points.push({x: x, y: y, z: z});
        }, machine.workZ);
        var stopPoint = op.getStopPoint(machine.travelZ);
        points.push({x: stopPoint.x, y: stopPoint.y, z: machine.travelZ});
    });
    return points;
}
