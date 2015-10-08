"use strict";

define(['cnc/bezier', 'clipper', 'cnc/cam/toolpath', 'libs/simplify', 'cnc/util', 'libs/extractedRaphael'], function (bezier, clipper, tp, simplify, util, _) {
    var CLIPPER_SCALE = Math.pow(2, 20);

    function positionEquals(p1, p2) {
        return p1.x == p2.x && p1.y == p2.y && p1.z == p2.z;
    }

    function pushOnPath(path, toolpath) {
        var firstPoint = toolpath.getStartPoint();
        path.node.pathSegList.appendItem(path.node.createSVGPathSegMovetoAbs(firstPoint.x, firstPoint.y));
        toolpath.forEachPoint(function (x, y) {
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
            var path = group.path('', true).attr({
                'vector-effect': 'non-scaling-stroke',
                fill: 'none',
                stroke: stroke == null ? 'yellow' : stroke
            });
            pushPolygonOn(path, polygon);
        });
    }

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


    function fromClipper(polygons, scale, reorder, areaPositive) {
        var result = [];
        $.each(polygons, function (_, polygon) {
            if (reorder) {
                var area = clipper.Clipper.Area(polygon) / (scale * scale);
                if (area >= 0 && !areaPositive || area < 0 && areaPositive)
                    polygon.reverse();
            }
            var newPoly = new tp.ConstantZPolygonToolpath();
            $.each(polygon, function (_, point) {
                newPoly.pushPointXYZ(point.X / scale, point.Y / scale);
            });
            result.push(newPoly);
        });
        return result;
    }

    var geom = (function () {
        function op(l, x, y) {
            return l + x + ',' + y;
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
            return 'M' + coords(centerX, centerY + radius) + ' ' + arcs.join(' ') + 'Z';
        }

        function createRelativeRectangle(xSpan, ySpan) {
            function lineTo(x, y) {
                return 'l' + x + ',' + y;
            }

            return lineTo(xSpan, 0) + lineTo(0, ySpan) + lineTo(-xSpan, 0) + 'Z';
        }

        function closePolygons(polygon) {
            for (var i = 0; i < polygon.length; i++) {
                var poly = polygon[i];
                if (poly.length != 0) {
                    var lastPoint = poly[poly.length - 1];
                    if (!(lastPoint.X == poly[0].X && lastPoint.Y == poly[0].Y))
                        poly.push(poly[0]);
                }
            }
            return polygon;
        }

        return {
            createCircle: createCircle,
            createRelativeRectangle: createRelativeRectangle,
            op: op,
            closePolygons: closePolygons
        };
    })();

    function createDrillHole(x, y) {
        var toolPath = new tp.ConstantZPolygonToolpath();
        toolPath.pushPointXYZ(x, y);
        return toolPath;
    }


    function Machine(paper) {
        this.paper = paper;
        this.outlines = [];
        this.operations = [];
        this.clipperScale = CLIPPER_SCALE;
    }

    Machine.prototype = {
        setParams: function (workZ, travelZ, feedRate) {
            this.workZ = workZ;
            this.travelZ = travelZ;
            this.feedRate = feedRate;
        },
        createOutline: function (definition, color) {
            this.outlines.push({definition: definition, color: color});
            return this.paper.path(definition, true).attr({
                'vector-effect': 'non-scaling-stroke',
                fill: 'none',
                stroke: color == null ? 'yellow' : color
            });
        },
        contouring: function (shapePath, toolRadius, inside, climbMilling) {
            var clipperPolygon = this.toClipper(shapePath);
            var contourClipper = this.contourClipper(clipperPolygon, toolRadius, inside);
            return this.fromClipper(contourClipper, true, this.contourAreaPositive(inside, climbMilling));
        },
        contourClipper: function (clipperPolygon, toolRadius, inside) {
            if (inside)
                toolRadius = -toolRadius;
            return this.offsetPolygon(clipperPolygon, toolRadius);
        },

        contourAndMissedArea: function (clipperPolygon, toolRadius, leaveStock, inside) {

            function sortedChildren(polygon) {
                return polygon.Childs().slice().sort(function polygonDifference(p1, p2) {
                    return util.mortonClipper(p1.Contour()[0], p2.Contour()[0]);
                });
            }

            function reorderPolytreeForContour(polytree) {
                var result = [];
                var outerStack = sortedChildren(polytree);
                for (var j = 0; j < outerStack.length; j++) {
                    var outerNode = outerStack[j];
                    var holes = sortedChildren(outerNode);
                    for (var i = 0; i < holes.length; i++) {
                        result = result.concat(reorderPolytreeForContour(holes[i]));
                        result.push(holes[i].Contour());
                    }
                    result.push(outerNode.Contour());
                }
                return result;
            }

            function orderContourInside2Outside(clipperContour) {
                return reorderPolytreeForContour(polyOp(clipperContour, [], clipper.ClipType.ctUnion, true));
            }

            clipperPolygon = this.polyOp(clipperPolygon, [], clipper.ClipType.ctUnion);
            var toolpath = this.offsetPolygon(clipperPolygon, (inside ? -1 : 1) * (leaveStock + toolRadius));
            return {toolpath: orderContourInside2Outside(toolpath), rawToolpath: toolpath};
        },
        registerToolPath: function (toolpath) {
            this.operations.push(toolpath);
        },
        registerToolPathArray: function (toolpathArray) {
            var machine = this;
            $.each(toolpathArray, function (_, toolpath) {
                machine.registerToolPath(toolpath);
            });
        },
        rampToolPath: function (toolpath, startZ, stopZ, turns) {
            var distances = [0];
            var toolpathLength = 0;
            for (var i = 0; i < toolpath.path.length; i++) {
                var p1 = toolpath.path[i];
                var p2 = toolpath.path[(i + 1) % toolpath.path.length];
                toolpathLength += new util.Point(p1[0], p1[1]).distance(new util.Point(p2[0], p2[1]));
                distances.push(toolpathLength);
            }
            var resultPolyline = new tp.GeneralPolylineToolpath();
            for (i = 0; i < turns; i++) {
                toolpath.forEachPoint(function (x, y, z, index) {
                    var xyLength = distances[index];
                    z = startZ + (stopZ - startZ) * ((i + xyLength / toolpathLength) / turns);
                    resultPolyline.pushPointXYZ(x, y, z);
                }, null);
            }
            //push constant Z bottom loop
            toolpath.forEachPoint(function (x, y) {
                resultPolyline.pushPointXYZ(x, y, stopZ);
            }, null);
            var startPoint = toolpath.getStartPoint(stopZ);
            resultPolyline.pushPointXYZ(startPoint.x, startPoint.y, startPoint.z);
            return resultPolyline;
        },
        rampToolPathArray: function (toolpath, startZ, stopZ, turns) {
            var machine = this;
            return toolpath.map(function (path) {
                return machine.rampToolPath(path, startZ, stopZ, turns);
            });
        },
        drillCorners: function (contour) {
            var holes = [];
            $.each(getPathLengths(contour), function (i, l) {
                if (contour.node.pathSegList.getItem(i).pathSegType != SVGPathSeg.PATHSEG_CLOSEPATH) {
                    var point = contour.node.getPointAtLength(l);
                    holes.push(createDrillHole(point.x, point.y));
                }
            });
            return holes;
        },
        offsetPolygon: function (polygon, radius) {
            var result = [];
            var co = new clipper.ClipperOffset(2, 0.0001 * this.clipperScale);
            co.AddPaths(polyOp(polygon, [], clipper.ClipType.ctUnion), clipper.JoinType.jtRound, clipper.EndType.etClosedPolygon);
            co.Execute(result, radius * this.clipperScale);
            return result;
        },
        filletWholePolygon: function (shapePath, radius) {
            var clipperPoints = this.toClipper(shapePath);
            var eroded = this.offsetPolygon(clipperPoints, -radius);
            var openedDilated = this.offsetPolygon(eroded, 2 * radius);
            var rounded = this.offsetPolygon(openedDilated, -radius);
            shapePath.node.pathSegList.clear();
            $.each(this.fromClipper(rounded), function (index, poly) {
                poly.pushOnPath(shapePath);
            });
            return shapePath;
        },
        dumpOnCollector: function (pathCollector) {
            var machine = this;

            function pos(point, zOverride) {
                return new util.Point(point.x, point.y, (zOverride != undefined) ? zOverride : point.z);
            }

            //avoid traveling to start point at unknown Z (yes, I did hit a screw)
            pathCollector.goToTravelSpeed({z: machine.travelZ});
            $.each(this.operations, function (_, op) {
                pathCollector.goToTravelSpeed(pos(op.getStartPoint(machine.travelZ), machine.travelZ));
                op.forEachPoint(function (x, y, z) {
                    pathCollector.goToWorkSpeed(pos(new util.Point(x, y, z)));
                }, machine.workZ);
                pathCollector.goToTravelSpeed(pos(op.getStopPoint(machine.travelZ), machine.travelZ));
            });
        },
        dumpGCode: function () {
            return dumpGCode(this.feedRate, this.dumpOnCollector.bind(this));
        },
        dumpSimulation: function (initialPosition, fragmentHandler) {
            var _this = this;
            var toolpath = [];
            var accumulator = util.createSimulationAccumulator(fragmentHandler);
            var position = initialPosition;

            function updatedPosition(point) {
                var newPos = {x: point.x, y: point.y, z: point.z};
                if (newPos.x == undefined)
                    newPos.x = position.x;
                if (newPos.y == undefined)
                    newPos.y = position.y;
                if (newPos.z == undefined)
                    newPos.z = position.z;
                return new util.Point(newPos.x, newPos.y, newPos.z);
            }

            accumulator.accumulatePoint(position, 'rapid');
            function createTravelerFunction(speedTag, overrideFeedRate) {
                return function (point) {
                    var np = updatedPosition(point);
                    if (!positionEquals(np, position))
                        toolpath.push({
                            type: 'line',
                            from: position,
                            to: np,
                            speedTag: speedTag,
                            feedRate: overrideFeedRate ? overrideFeedRate : _this.feedRate
                        });
                    accumulator.accumulatePoint(np, speedTag);
                    accumulator.closeFragment();
                    position = np;
                };
            }

            this.dumpOnCollector({
                goToTravelSpeed: createTravelerFunction('rapid', 3000),
                goToWorkSpeed: createTravelerFunction('normal', null)
            });
            return toolpath;
        },
        getToolPath: function (parameters) {
            var path = [];
            var position = parameters.position;

            function createSpeedHandler(speed) {
                return function (point) {
                    var newPos = $.extend({}, position, point);
                    if (positionEquals(newPos, position))
                        return;
                    path.push({type: 'line', from: position, to: newPos, feedRate: speed});
                    position = newPos;
                }
            }

            this.dumpOnCollector({
                goToTravelSpeed: createSpeedHandler(parameters.maxFeedrate),
                goToWorkSpeed: createSpeedHandler(this.feedRate)
            });
            return path;
        },
        dumpPath: function () {
            var machine = this;
            var points = [];
            $.each(this.operations, function (_, op) {
                var startPoint = op.getStartPoint(machine.travelZ);
                points.push(new util.Point(startPoint.x, startPoint.y, machine.travelZ));
                op.forEachPoint(function (x, y, z) {
                    points.push(new util.Point(x, y, z));
                }, machine.workZ);
                var stopPoint = op.getStopPoint(machine.travelZ);
                points.push(new util.Point(stopPoint.x, stopPoint.y, machine.travelZ));
            });
            return points;
        },
        /**
         *
         * @param shapePath a SVG path
         * @returns a Clipper polygon array
         */
        toClipper: function (shapePath) {
            return pathDefToClipper(shapePath.node.getAttribute('d'));
        },

        /**
         *
         * @param polygon
         * @param {boolean} [reorder]
         * @param {boolean} [areaPositive]
         * @returns {*}
         */
        fromClipper: function (polygon, reorder, areaPositive) {
            if (polygon[0] instanceof tp.ConstantZPolygonToolpath)
                throw 'oops';
            return fromClipper(polygon, this.clipperScale, reorder, areaPositive);
        },

        polyOp: function (clipperP1, clippreP2, clipperOp) {
            var cpr = new clipper.Clipper();
            var result = [];
            cpr.AddPaths(clipperP1, clipper.PolyType.ptSubject, true);
            cpr.AddPaths(clippreP2, clipper.PolyType.ptClip, true);
            cpr.Execute(clipperOp, result, clipper.PolyFillType.pftNonZero, clipper.PolyFillType.pftNonZero);
            return result;
        },

        /**
         * what sign should the area of a contour polygon be?
         * it's positive for trigonometric direction (CCW)
         * @param inside
         * @param climbMilling
         */
        contourAreaPositive: function (inside, climbMilling) {
            return (!!climbMilling) ^ (!inside);
        },

        peckDrill: function (x, y, z, topZ, steps) {
            var polyline = new tp.GeneralPolylineToolpath();
            for (var i = 1; i <= steps; i++) {
                polyline.pushPointXYZ(x, y, topZ);
                polyline.pushPointXYZ(x, y, topZ - (topZ - z) * i / steps);
            }
            return polyline;
        }
    };

    function pathDefToPolygons(pathDef) {
        return bezier.pathToPolygons(R.path2curve(pathDef), {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0}, 0.0001);
    }

    function polygonsToClipper(polygons) {
        return polygons.map(function (poly) {
            return poly.map(function (point) {
                return new util.Point(Math.round(CLIPPER_SCALE * point.x), Math.round(CLIPPER_SCALE * point.y));
            });
        });
    }

    /**
     *
     * @param pathDef a SVG path
     * @returns a Clipper polygon array
     */
    function pathDefToClipper(pathDef) {
        return polygonsToClipper(pathDefToPolygons(pathDef));
    }

    function clipperToPathDef(clipperPoly) {
        var res = [];
        for (var i = 0; i < clipperPoly.length; i++)
            if (clipperPoly[i].length) {
                for (var j = 0; j < clipperPoly[i].length; j++)
                    res.push((j == 0 ? 'M' : 'L') + new util.Point(clipperPoly[i][j].X, clipperPoly[i][j].Y).scale(1 / CLIPPER_SCALE).svg());
                res.push('Z');
            }
        return res.join(' ');
    }

    function decomposePolytreeInTopLevelPolygons(polytree) {
        var result = [];
        var outerStack = polytree.Childs().slice();
        while (outerStack.length) {
            var outerNode = outerStack.pop();
            var polygon = [outerNode.Contour()];
            var holes = outerNode.Childs();
            for (var i = 0; i < holes.length; i++) {
                polygon.push(holes[i].Contour());
                var subOuter = holes[i].Childs();
                for (var j = 0; j < subOuter.length; j++)
                    outerStack.push(subOuter[j]);
            }
            result.push(polygon);
        }
        return result;
    }

    function polyOp(op1, op2, operation, treeResult) {
        var cpr = new clipper.Clipper();
        var result = treeResult ? new clipper.PolyTree() : [];
        cpr.AddPaths(op1, clipper.PolyType.ptSubject, true);
        cpr.AddPaths(op2, clipper.PolyType.ptClip, true);
        cpr.Execute(operation, result, clipper.PolyFillType.pftNonZero, clipper.PolyFillType.pftNonZero);
        return result;
    }

    function simplifyPolygons(polys, tolerance) {
        return polys.map(function (poly) {
            return simplify(poly, tolerance, true);
        });
    }

    function dumpGCode(feedRate, codeGenerator) {

        function pos(point) {
            var res = '';
            if (point['x'] != null)
                res += ' X' + util.formatCoord(point.x);
            if (point['y'] != null)
                res += ' Y' + util.formatCoord(point.y);
            if (point['z'] != null)
                res += ' Z' + util.formatCoord(point.z);
            return res;
        }

        var code = ['F' + feedRate];
        codeGenerator({
            goToTravelSpeed: function (point) {
                code.push('G0 ' + pos(point));
            },
            goToWorkSpeed: function (point) {
                code.push('G1 ' + pos(point));
            }
        });
        return code.join('\n');
    }

    function simplifyScaleAndCreatePathDef(polygons, scale, tolerance, closed) {
        polygons = simplifyPolygons(polygons, tolerance * scale);
        var d = '';
        polygons.forEach(function (poly) {
            if (poly.length) {
                var firstPoint = poly[0];
                d += ' M ' + firstPoint.X / scale + ',' + firstPoint.Y / scale;
                for (var i = 1; i < poly.length; i++)
                    d += ' L ' + poly[i].X / scale + ',' + poly[i].Y / scale;
                if (closed)
                    d += 'Z';
            }
        });
        return d;
    }

    return {
        CLIPPER_SCALE: CLIPPER_SCALE,
        geom: geom,
        pushOnPath: pushOnPath,
        Machine: Machine,
        decomposePolytreeInTopLevelPolygons: decomposePolytreeInTopLevelPolygons,
        polyOp: polyOp,
        simplifyPolygons: simplifyPolygons,
        polygonsToClipper: polygonsToClipper,
        pathDefToPolygons: pathDefToPolygons,
        pathDefToClipper: pathDefToClipper,
        clipperToPathDef: clipperToPathDef,
        dumpGCode: dumpGCode,
        simplifyScaleAndCreatePathDef: simplifyScaleAndCreatePathDef
    };
});
