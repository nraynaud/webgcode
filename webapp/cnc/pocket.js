"use strict";

define(['cnc/clipper', 'cnc/cam', 'libs/queue'], function (clipper, cam, queue) {
    function offsetPolygon(polygon, radius) {
        var result = new clipper.PolyTree();
        var co = new clipper.ClipperOffset();
        co.AddPaths(polygon, clipper.JoinType.jtRound, clipper.EndType.etClosedPolygon);
        co.Execute(result, radius);
        return result;
    }

    function recursivelyOffset(shape, offsetDistance, depth) {
        return cam.decomposePolytreeInTopLevelPolygons(shape).map(function (child) {
            var offset = offsetPolygon(child, offsetDistance);
            return {contour: child, children: recursivelyOffset(offset, offsetDistance, depth + 1)};
        });
    }

    function sqDist(p1, p2) {
        var dx = p1.X - p2.X;
        var dy = p1.Y - p2.Y;
        return dx * dx + dy * dy;
    }

    function rotatePolygonSoThatStartPointIsClosestTo(point, polygon) {
        var minDist = Infinity;
        var minIndex = 0;
        for (var i = 0; i < polygon.length; i++) {
            var dist = sqDist(point, polygon[i]);
            if (dist < minDist) {
                minIndex = i;
                minDist = dist;
            }
        }
        return polygon.slice(minIndex).concat(polygon.slice(0, minIndex));
    }

    function spiralFromData(pocket, childClosingPoint, childSpiral, currentShell) {
        var currentContour = rotatePolygonSoThatStartPointIsClosestTo(childClosingPoint, pocket.contour[0]);
        var newShell = currentShell.slice();
        newShell[0] = currentContour;
        //push first point at the end to force polygon closing
        return {shell: newShell, path: childSpiral.concat(currentContour, [currentContour[0]])};
    }

    function chainPocketRings(pocket) {
        cam.geom.closePolygons(pocket.contour);
        for (var j = 0; j < pocket.children.length; j++)
            chainPocketRings(pocket.children[j]);
        //the contour.length == 1 ensures that the contour doesn't have secondary "hole" toolpaths
        if (pocket.children.length == 1 && pocket.contour.length == 1) {
            var child = pocket.children[0];
            if (child.contour.length == 1 || child['spiraledToolPath']) {
                var newSpiraledToolPath;
                if (child['spiraledToolPath']) {
                    var childToolPath = child.spiraledToolPath;
                    newSpiraledToolPath = spiralFromData(pocket, childToolPath.path.slice(-1)[0], childToolPath.path, childToolPath.shell);
                } else {
                    var childContour = child.contour[0];
                    var shell = [childContour];
                    if (child.children.length)
                        shell.push(childContour);
                    newSpiraledToolPath = spiralFromData(pocket, childContour[0], childContour.concat([childContour[0]]), shell);
                }
                //the lowest chainable child might itself have non-chainable children
                pocket.children = child.children;
                pocket.spiraledToolPath = newSpiraledToolPath;
            }
        }
    }

    function doCreatePocket(shapePoly, scaledToolRadius, radialEngagementRatio) {
        var outlineAtToolCenter = offsetPolygon(shapePoly, -scaledToolRadius);
        var pocketToolPaths = recursivelyOffset(outlineAtToolCenter, -scaledToolRadius * radialEngagementRatio, 0);
        for (var i = 0; i < pocketToolPaths.length; i++) {
            var pocket = pocketToolPaths[i];
            chainPocketRings(pocket);
        }
        return pocketToolPaths
    }

    function computePocketImmediately(polygon, toolRadius, radialEngagementRatio, display) {
        var handle = display.displayClipperComputingPoly(polygon);
        return function (resolve) {
            setTimeout(function () {
                var result = doCreatePocket(polygon, toolRadius, radialEngagementRatio);
                handle.remove();
                resolve(result);
            }, 0);
        }
    }

    function computePocketInWorkers(polygon, scaledToolRadius, radialEngagementRatio, display) {
        var handle = display.displayClipperComputingPoly(polygon);
        return function (resolve) {
            var worker = new Worker('webapp/pocket_worker.js');
            worker.onclose = function () {
                console.log('worker closed');
            };
            worker.onerror = function (event) {
                console.log('worker error', event);
            };
            worker.onmessage = function (event) {
                var data = event.data;
                console.log('received message');
                if (data['finished']) {
                    var result = data['result'];
                    console.log('got result');
                    handle.remove();
                    console.log('removed', handle);
                    resolve(result);
                }
            };
            worker.postMessage({poly: polygon, scaledToolRadius: scaledToolRadius, radialEngagementRatio: radialEngagementRatio});
        };
    }

    function createPocket(clipperPoly, scaledToolRadius, radialEngagementRatio, computeInWorker, display) {
        var cpr = new clipper.Clipper();
        var result = new clipper.PolyTree();
        cpr.AddPaths(clipperPoly, clipper.PolyType.ptSubject, true);
        cpr.AddPaths([], clipper.PolyType.ptClip, true);
        cpr.Execute(clipper.ClipType.ctUnion, result, clipper.PolyFillType.pftNonZero, clipper.PolyFillType.pftNonZero);
        var polygons = cam.decomposePolytreeInTopLevelPolygons(result);
        return RSVP.all(polygons.map(function (poly) {
            var resolver = computeInWorker ? computePocketInWorkers(poly, scaledToolRadius, radialEngagementRatio, display) :
                computePocketImmediately(poly, scaledToolRadius, radialEngagementRatio, display);
            return new RSVP.Promise(resolver);
        }));
    }

    return {
        createPocket: createPocket,
        doCreatePocket: doCreatePocket};
});