/*
 (c) 2013, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
 */

(function () {
    "use strict";

    // to suit your point format, run search/replace for '.x' and '.y';
    // for 3D version, see 3d branch

    function getX(p) {
        return p.X;
    }

    function getY(p) {
        return p.Y;
    }

    // square distance between 2 points
    function getSqDist(p1, p2) {

        var dx = getX(p1) - getX(p2),
            dy = getY(p1) - getY(p2);

        return dx * dx + dy * dy;
    }

    // square distance from a point to a segment
    function getSqSegDist(p, p1, p2) {

        var x = getX(p1),
            y = getY(p1),
            dx = getX(p2) - x,
            dy = getY(p2) - y;

        if (dx !== 0 || dy !== 0) {

            var t = ((getX(p) - x) * dx + (getY(p) - y) * dy) / (dx * dx + dy * dy);

            if (t > 1) {
                x = getX(p2);
                y = getY(p2);

            } else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }

        dx = getX(p) - x;
        dy = getY(p) - y;

        return dx * dx + dy * dy;
    }

    // rest of the code doesn't care about point format

    // basic distance-based simplification
    function simplifyRadialDist(points, sqTolerance) {

        var prevPoint = points[0],
            newPoints = [prevPoint],
            point;

        for (var i = 1, len = points.length; i < len; i++) {
            point = points[i];

            if (getSqDist(point, prevPoint) > sqTolerance) {
                newPoints.push(point);
                prevPoint = point;
            }
        }

        if (prevPoint !== point) {
            newPoints.push(point);
        }

        return newPoints;
    }

    // simplification using optimized Douglas-Peucker algorithm with recursion elimination
    function simplifyDouglasPeucker(points, sqTolerance) {

        var len = points.length,
            MarkerArray = typeof Uint8Array !== 'undefined' ? Uint8Array : Array,
            markers = new MarkerArray(len),
            first = 0,
            last = len - 1,
            stack = [],
            newPoints = [],
            i, maxSqDist, sqDist, index;

        markers[first] = markers[last] = 1;

        while (last) {

            maxSqDist = 0;

            for (i = first + 1; i < last; i++) {
                sqDist = getSqSegDist(points[i], points[first], points[last]);

                if (sqDist > maxSqDist) {
                    index = i;
                    maxSqDist = sqDist;
                }
            }

            if (maxSqDist > sqTolerance) {
                markers[index] = 1;
                stack.push(first, index, index, last);
            }

            last = stack.pop();
            first = stack.pop();
        }

        for (i = 0; i < len; i++) {
            if (markers[i]) {
                newPoints.push(points[i]);
            }
        }

        return newPoints;
    }

    // both algorithms combined for awesome performance
    function simplify(points, tolerance, highestQuality) {

        var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

        points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
        points = simplifyDouglasPeucker(points, sqTolerance);

        return points;
    }

    // export as AMD module / Node module / browser variable
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return simplify;
        });
    } else if (typeof module !== 'undefined') {
        module.exports = simplify;
    } else {
        window.simplify = simplify;
    }

})();