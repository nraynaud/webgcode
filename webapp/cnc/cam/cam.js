"use strict";

define(['cnc/maths/bezier', 'clipper', 'cnc/cam/toolpath', 'libs/simplify', 'cnc/util', 'libs/extractedRaphael'],
    function (bezier, clipper, tp, simplify, util, _) {
        var CLIPPER_SCALE = Math.pow(2, 20);

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

        function Machine() {
            this.clipperScale = CLIPPER_SCALE;
        }

        Machine.prototype = {
            contourToolpath: function (clipperPolygon, signedDistance) {

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
                var toolpath = this.offsetPolygon(clipperPolygon, signedDistance);
                return {toolpath: orderContourInside2Outside(toolpath), rawToolpath: toolpath};
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
            offsetPolygon: function (polygon, radius) {
                var result = [];
                var co = new clipper.ClipperOffset(2, 0.0001 * this.clipperScale);
                co.AddPaths(polyOp(polygon, [], clipper.ClipType.ctUnion), clipper.JoinType.jtRound, clipper.EndType.etClosedPolygon);
                co.Execute(result, radius * this.clipperScale);
                return result;
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

            polyOp: function (clipperP1, clippreP2, clipperOp, fillType) {
                return polyOp(clipperP1, clippreP2, clipperOp, false, fillType);
            },

            /**
             * what sign should the area of a slice polygon be?
             * it's positive for trigonometric direction (CCW)
             * @param inside
             * @param climbMilling
             */
            contourAreaPositive: function (inside, climbMilling) {
                return (!!climbMilling) ^ (!inside);
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
                        res.push((j == 0 ? 'M' : 'L') + new util.Point(clipperPoly[i][j].X, clipperPoly[i][j].Y)
                            .scale(1 / CLIPPER_SCALE).svg());
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

        function polyOp(op1, op2, operation, treeResult, fillType) {
            if (fillType == null)
                fillType = clipper.PolyFillType.pftNonZero;
            var cpr = new clipper.Clipper();
            var result = treeResult ? new clipper.PolyTree() : [];
            cpr.AddPaths(op1, clipper.PolyType.ptSubject, true);
            cpr.AddPaths(op2, clipper.PolyType.ptClip, true);
            cpr.Execute(operation, result, fillType, fillType);
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
                },
                changeWorkSpeed: function (newSpeed) {
                    code.push('F' + newSpeed)
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
