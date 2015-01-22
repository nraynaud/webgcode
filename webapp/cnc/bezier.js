"use strict";
define(['cnc/util'], function (util) {

    function subdivide(a, t) {

        function avg(a, b) {
            return a + (b - a) * t;
        }

        var p1pX = avg(a[0], a[2]),
            p1pY = avg(a[1], a[3]),
            p2pX = avg(a[2], a[4]),
            p2pY = avg(a[3], a[5]),
            p3pX = avg(a[4], a[6]),
            p3pY = avg(a[5], a[7]),
            p1dX = avg(p1pX, p2pX),
            p1dY = avg(p1pY, p2pY),
            p2dX = avg(p2pX, p3pX),
            p2dY = avg(p2pY, p3pY),
            p1tX = avg(p1dX, p2dX),
            p1tY = avg(p1dY, p2dY);
        return [
            [a[0], a[1], p1pX, p1pY, p1dX, p1dY, p1tX, p1tY],
            [p1tX, p1tY, p2dX, p2dY, p3pX, p3pY, a[6], a[7]]
        ];
    }

    function cubicToPoints(curve, flatness_limit, collector) {

        recursive_bezier(curve, 0, 1);
        collector(curve[6], curve[7]);
        function recursive_bezier(curve, tstart, tend) {
            // http://hcklbrrfnn.files.wordpress.com/2012/08/bez.pdf
            // http://jeremykun.com/2013/05/11/bezier-curves-and-picasso/ (with a bug in the flatness computation)
            function isFlat(c) {
                function sq(x) {
                    return x * x;
                }

                var ax = sq(3.0 * c[2] - 2.0 * c[0] - c[6]);
                var ay = sq(3.0 * c[3] - 2.0 * c[1] - c[7]);
                var bx = sq(3.0 * c[4] - 2.0 * c[6] - c[0]);
                var by = sq(3.0 * c[5] - 2.0 * c[7] - c[1]);
                var flatness = Math.max(ax, bx) + Math.max(ay, by);
                if (isNaN(flatness))
                    throw new Error('flatness is NaN');
                return flatness <= flatness_limit;
            }

            if (isFlat(curve) || Math.abs(tstart - tend) < 1e-200) {
                collector(curve[0], curve[1]);
                return;
            }

            var halves = subdivide(curve, 0.5);
            var middle = (tend + tstart) / 2;
            recursive_bezier(halves[0], tstart, middle);
            recursive_bezier(halves[1], middle, tend);
        }
    }

    function matrixTransformSVG(coordArray, mat) {
        var result = [];
        for (var i = 0; i + 1 < coordArray.length; i += 2) {
            var x = coordArray[i];
            var y = coordArray[i + 1];
            result.push(mat.a * x + mat.c * y + mat.e);
            result.push(mat.b * x + mat.d * y + mat.f);
        }
        return result;
    }

    function pathToPolygons(parsedCurvedPath, matrix, flatness) {

        function noDuplicatePointCollector(collectionArray) {
            return function (x, y) {
                if (collectionArray.length) {
                    var previousPoint = collectionArray[collectionArray.length - 1];
                    if (previousPoint.x == x && previousPoint.y == y)
                        return;
                }
                collectionArray.push(new util.Point(x, y));
            }
        }

        var polygons = [];
        var polygon = [];
        var collector = noDuplicatePointCollector(polygon);

        // We must split path into subpaths by 'M' segment in order to convert subpaths to separate polygons,
        function flushPoly() {
            if (polygon.length)
                polygons.push(polygon);
            polygon = [];
            collector = noDuplicatePointCollector(polygon);
        }

        var currentPos = [0, 0];
        for (var i = 0; i < parsedCurvedPath.length; i++) {
            var currentSegment = parsedCurvedPath[i];
            if (currentSegment[0] == "M") {
                flushPoly();
                currentPos = matrixTransformSVG(currentSegment.slice(1, 3), matrix);
                collector(currentPos[0], currentPos[1]);
            } else if (currentSegment[0] == "C") {
                var curve = currentPos.concat(matrixTransformSVG(currentSegment.slice(1, 7), matrix));
                cubicToPoints(curve, flatness, collector);
                currentPos = curve.slice(6, 8);
            } else if (currentSegment[0] == "L") {
                currentPos = matrixTransformSVG(currentSegment.slice(1, 3), matrix);
                collector(currentPos[0], currentPos[1]);
            }
        }
        flushPoly();
        return polygons;
    }

    return {cubicToPoints: cubicToPoints, pathToPolygons: pathToPolygons};
});


