"use strict";

define(['cnc/clipper', 'cnc/cam'], function (clipper, cam) {

    function lastItem(array) {
        return array[array.length - 1];
    }

    var co = new clipper.ClipperOffset();

    function offsetPolygon(polygon, radius, useTree) {
        var result = useTree ? new clipper.PolyTree() : [];
        co.Clear();
        co.AddPaths(polygon, clipper.JoinType.jtRound, clipper.EndType.etClosedPolygon);
        co.Execute(result, radius);
        return result;
    }

    function recursivelyOffset(shape, offsetDistance, depth) {
        return cam.decomposePolytreeInTopLevelPolygons(shape).map(function (child) {
            var offset = offsetPolygon(child, offsetDistance, true);
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
        var currentContour = cam.geom.closePolygons([rotatePolygonSoThatStartPointIsClosestTo(childClosingPoint, pocket.contour[0])])[0];
        var newShell = currentShell.slice();
        newShell[0] = currentContour;
        //push first point at the end to force polygon closing
        return {shell: newShell, path: childSpiral.concat(currentContour)};
    }

    function chainOneStagePocketRing(pocket) {
        //the contour.length == 1 ensures that the contour doesn't have secondary "hole" toolpaths
        if (pocket.children.length == 1 && pocket.contour.length == 1) {
            var child = pocket.children[0];
            if (child.contour.length == 1 || child['spiraledToolPath']) {
                var newSpiraledToolPath;
                if (child['spiraledToolPath']) {
                    var childToolPath = child.spiraledToolPath;
                    newSpiraledToolPath = spiralFromData(pocket, lastItem(childToolPath.path), childToolPath.path, childToolPath.shell);
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
                return;
            }
        }
        if (pocket.children.length) {
            //find a first point that limits a bit the tool travel
            var lastChild = lastItem(pocket.children);
            var lastPoint = lastItem(lastChild['spiraledToolPath'] ? lastChild['spiraledToolPath'].path : lastChild.contour[0]);
            for (var i = 0; i < pocket.contour.length; i++) {
                //do it for the contour and all its holes.
                pocket.contour[i] = rotatePolygonSoThatStartPointIsClosestTo(lastPoint, pocket.contour[i]);
                lastPoint = lastItem(pocket.contour[i]);
            }
        }
        cam.geom.closePolygons(pocket.contour);
    }

    function chainPocketRings(pocket) {
        cam.geom.closePolygons(pocket.contour);
        for (var j = 0; j < pocket.children.length; j++)
            chainPocketRings(pocket.children[j]);
        chainOneStagePocketRing(pocket);
    }

    function doCreatePocket(shapePoly, scaledToolRadius, radialEngagementRatio, display) {
        var outlineAtToolCenter = offsetPolygon(shapePoly, -scaledToolRadius, true);
        var pocketToolPaths = recursivelyOffset(outlineAtToolCenter, -scaledToolRadius * radialEngagementRatio, 0);
        for (var i = 0; i < pocketToolPaths.length; i++) {
            var pocket = pocketToolPaths[i];
            chainPocketRings(pocket);
        }
        return pocketToolPaths
    }

//https://github.com/substack/point-in-polygon/blob/master/index.js
// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
//to be replaced by a vertex radius filter when there is a kd map.
    function pointInPolygon(point, polygon) {
        var x = point.X, y = point.Y;
        var inside = false;
        for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            var xi = polygon[i].X, yi = polygon[i].Y;
            var xj = polygon[j].X, yj = polygon[j].Y;

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    /**
     *
     * @param parentList is a list of polygons with holes, type is: [{contour:[[point]]}] they should have been decomposed in top level,
     *          that is the first polygon is an outer contour all the others are inner holes (and will be ignored)
     * @param point any point of the inner polygon
     * @returns {number} index of the parent
     */
    function findParent(parentList, point) {
        if (parentList.length == 1)
            return 0;
        for (var i = 0; i < parentList.length; i++) {
            var parent = parentList[i];
            if (pointInPolygon(point, parent.contour[0]))
                return i;
        }
        throw new Error('no parent found for point');
    }

    function plugChildIntoCorrectParent(parentList, child) {
        parentList[findParent(parentList, child.contour[0][0])].children.push(child);
    }

    function sortChildren(pocket) {
        pocket.children.sort(function (p1, p2) {
            return pointOrder(p1.contour[0][0], p2.contour[0][0]);
        });
    }

    function doCreatePocket2(shapePoly, scaledToolRadius, radialEngagementRatio, display) {
        var outlineAtToolCenter = offsetPolygon(shapePoly, -scaledToolRadius, true);
        var pocket = outlineAtToolCenter;
        co.ArcTolerance = scaledToolRadius / 1000;
        var polygon = clipper.Clipper.ClosedPathsFromPolyTree(outlineAtToolCenter);
        var undercut = offsetPolygon(clipper.Clipper.CleanPolygons(polygon, scaledToolRadius / 10000), scaledToolRadius * 1.001);
        var co2 = new clipper.ClipperOffset();
        display.displayUndercutPoly(cam.polyOp(shapePoly, undercut, clipper.ClipType.ctDifference, false));
        co2.AddPaths(polygon, clipper.JoinType.jtRound, clipper.EndType.etClosedPolygon);
        var stack = [];
        var i = 1;
        do {
            stack.push(cam.decomposePolytreeInTopLevelPolygons(pocket).map(function (poly) {
                return {contour: poly, children: []};
            }));
            pocket = new clipper.PolyTree();
            co2.Execute(pocket, -scaledToolRadius * radialEngagementRatio * i);
            i++;
        } while (pocket.ChildCount());
        do {
            var children = stack.pop();
            for (var j = 0; j < children.length; j++) {
                var child = children[j];
                sortChildren(child);
                chainOneStagePocketRing(child);
                if (stack.length)
                    plugChildIntoCorrectParent(lastItem(stack), child);
            }
        } while (stack.length > 0);
        return children;
    }

    function computePocketImmediately(polygon, toolRadius, radialEngagementRatio, display) {
        var handle = display.displayClipperComputingPoly(polygon);
        return function (resolve) {
            setTimeout(function () {
                var result = doCreatePocket(polygon, toolRadius, radialEngagementRatio, display);
                handle.remove();
                Ember.run(null, resolve, result);
            }, 0);
        }
    }

    function createWorkerPool(workerUrl, workArray, maxWorkers) {
        var workersCount = Math.min(maxWorkers, workArray.length);
        var workers = [];
        var workIndex = 0;

        function createWorkerListener(workStructure) {
            return function (event) {
                if (workStructure.abort) {
                    console.log('got message from an aborted worker');
                    workStructure.worker.terminate();
                    workStructure.worker = null;
                    return;
                }
                var result = workStructure.work.messageHandler(event.data);
                if (result) {
                    workStructure.work = null;
                    if (workIndex < workArray.length) {
                        workStructure.work = workArray[workIndex];
                        workStructure.worker.postMessage(workStructure.work.message);
                        workIndex++;
                    } else {
                        workStructure.worker.terminate();
                        workStructure.worker = null;
                    }
                }
            }
        }

        for (workIndex = 0; workIndex < workersCount; workIndex++) {
            var worker = new Worker(workerUrl);
            workers[workIndex] = {worker: worker, work: workArray[workIndex]};
            worker.onmessage = createWorkerListener(workers[workIndex]);
            worker.postMessage(workArray[workIndex].message);
        }

        return {
            workers: workers,
            abort: function () {
                for (var i = 0; i < workers.length; i++) {
                    var work = workers[i];
                    work.abort = true;
                    if (work.worker !== null) {
                        work.worker.terminate();
                        work.worker = null;
                    }
                }
            }};
    }

    function createWork(polygon, scaledToolRadius, radialEngagementRatio, display) {
        var handle = display.displayClipperComputingPoly(polygon);
        var deferred = RSVP.defer();
        return {message: {poly: polygon, scaledToolRadius: scaledToolRadius, radialEngagementRatio: radialEngagementRatio},
            messageHandler: function (data) {
                if (data['finished']) {
                    var result = data['result'];
                    handle.remove();
                    Ember.run(deferred, deferred.resolve, result);
                    return true;
                } else if (data['operation'] == 'displayUndercutPoly')
                    display.displayUndercutPoly(data['polygon']);
                return false;
            },
            promise: deferred.promise};
    }

    function pointOrder(p1, p2) {
        var dX = p1.X - p2.X;
        if (dX == 0)
            return p1.Y - p2.Y;
        return dX;
    }

    function sortPolygons(polygons) {
        polygons.sort(function (p1, p2) {
            return pointOrder(p1[0][0], p2[0][0]);
        });
    }

    function createPocket(clipperPoly, scaledToolRadius, radialEngagementRatio, display) {
        var polygons = cam.decomposePolytreeInTopLevelPolygons(cam.polyOp(clipperPoly, [], clipper.ClipType.ctUnion, true));
        sortPolygons(polygons);
        var promises = [];
        var workArray = polygons.map(function (poly) {
            var work = createWork(poly, scaledToolRadius, radialEngagementRatio, display);
            promises.push(work.promise);
            return  work;
        });
        window.workerPool = createWorkerPool('webapp/pocket_worker.js', workArray, 6);
        var result = RSVP.all(promises);
        result.abort = window.workerPool.abort;
        return result;
    }

    return {
        createPocket: createPocket,
        doCreatePocket: doCreatePocket,
        doCreatePocket2: doCreatePocket2
    };
});