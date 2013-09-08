"use strict";
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
    var shadowPath = paper.defs().path();
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
            //skip to slightly (on hundredth of a step) after the end of the segment
            l = segmentsLengths[segmentIndex] + totalLength / pointCount * 0.01;
        } else
            l += totalLength / pointCount;
        clipperPoints.push({X: (translation.x + p.x) * scale, Y: (translation.y + p.y) * scale});
    }
    clipperPoints = [clipperPoints];
    return ClipperLib.Clean(clipperPoints, 0.0001 * scale);
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
    var result = [];
    $.each(offset, function (_, polygon) {
        var area = ClipperLib.Clipper.Area(polygon) / (scale * scale);
        if (area >= 0 && !polygonAreaPositive || area < 0 && polygonAreaPositive) {
            polygon.reverse();
        }
        var newPoly = [];
        $.each(polygon, function (_, point) {
            newPoly.push({x: point.X / scale, y: point.Y / scale});
        });
        result.push(newPoly);
    });
    return result;
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
    return [
        [
            {x: x, y: y}
        ]
    ];
}

function drillCorners(path) {
    var holes = [];
    $.each(getPathLengths(path), function (i, l) {
        if (path.node.pathSegList.getItem(i).pathSegType != SVGPathSeg.PATHSEG_CLOSEPATH) {
            var point = path.node.getPointAtLength(l);
            holes.push(createDrillHole(point.x, point.y));
        }
    });
    return holes;
}

function createOutline(d) {
    return paper.path(d, true).attr({'vector-effect': 'non-scaling-stroke', fill: 'none', stroke: 'red'});
}

function createRelativeRectangle(xSpan, ySpan) {
    function lineTo(x, y) {
        return  'l' + x + ',' + y;
    }

    return lineTo(xSpan, 0) + lineTo(0, ySpan) + lineTo(-xSpan, 0) + 'Z';
}
function rampToolPath(toolpath, startZ, stopZ, turns, travelZ) {
    toolpath = toolpath[0];
    function len(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    function dist(p1, p2) {
        return len(p1.x - p2.x, p1.y - p2.y);
    }

    var path = paper.defs().path('', true);
    pushPolygonOn(path, toolpath);
    var toolpathLength = path.node.getTotalLength();
    var segmentsLen = getPathLengths(path);
    path.remove();
    var codeLines = [];

    function pushLine(code, point, z) {
        codeLines.push(code + ' X' + point.x + ' Y' + point.y + ' Z' + z);
    }

    pushLine('G0', toolpath[0], travelZ);
    for (var i = 0; i < turns; i++) {
        var xyLength = 0;
        $.each(toolpath, function (index, point) {
            xyLength = segmentsLen[index + 1];
            var z = startZ + (stopZ - startZ) * ((i + xyLength / toolpathLength) / turns);
            pushLine('G1', point, z);
        });
    }
    $.each(toolpath, function (index, point) {
        pushLine('G1', point, stopZ);
    });
    pushLine('G1', toolpath[0], stopZ);
    pushLine('G0', toolpath[0], travelZ);
    console.log(codeLines.join('\n'));
    return codeLines.join('\n');
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