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
        polygon.push.apply(polygon, polygon.splice(0, minIndex));
        return polygon;
    }

    function spiralFromData(pocket, childSpiral, currentShell) {
        var currentContour = pocket.contour[0];
        var newShell = currentShell.slice();
        newShell[0] = currentContour;
        return {shell: newShell, path: childSpiral.concat(currentContour)};
    }

    function rotateAndCloseRing(pocket) {
        var lastChild = lastItem(pocket.children);
        if (lastChild)
        //last point of the last child
            rotatePolygonSoThatStartPointIsClosestTo(lastItem(lastItem(lastChild.contour)), pocket.contour[0]);
        cam.geom.closePolygons(pocket.contour);
    }

    function chainOneStagePocketRing(pocket) {
        //the contour.length == 1 ensures that the contour doesn't have secondary "hole" toolpaths
        if (pocket.children.length == 1 && pocket.contour.length == 1) {
            var child = pocket.children[0];
            if (child.contour.length == 1 || child['spiraledToolPath']) {
                var newSpiraledToolPath;
                if (child['spiraledToolPath']) {
                    var childToolPath = child.spiraledToolPath;
                    newSpiraledToolPath = spiralFromData(pocket, childToolPath.path, childToolPath.shell);
                } else {
                    var childContour = child.contour[0];
                    var shell = [childContour];
                    if (child.children.length)
                        shell.push(childContour);
                    newSpiraledToolPath = spiralFromData(pocket, childContour.concat([childContour[0]]), shell);
                }
                //the lowest chainable child might itself have non-chainable children
                pocket.children = child.children;
                pocket.spiraledToolPath = newSpiraledToolPath;
            }
        }
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

    function computeUndercut(shapePoly, outlineAtToolCenter, scaledToolRadius, tolerance) {
        co.ArcTolerance = tolerance;
        var undercut = offsetPolygon(outlineAtToolCenter, scaledToolRadius + tolerance);
        return cam.polyOp(shapePoly, undercut, clipper.ClipType.ctDifference, false);
    }

    function doCreatePocket2(shapePoly, scaledToolRadius, radialEngagementRatio, display) {
        var step = scaledToolRadius * radialEngagementRatio;
        var tolerance = step / 1000;
        var outlineAtToolCenter = offsetPolygon(shapePoly, -scaledToolRadius, true);
        var polygon = clipper.Clipper.ClosedPathsFromPolyTree(outlineAtToolCenter);
        var polygon2 = cam.simplifyPolygons(polygon, tolerance);
        display.displayUndercutPoly(computeUndercut(shapePoly, polygon2, scaledToolRadius, tolerance));
        var co2 = new clipper.ClipperOffset(2, tolerance);
        co2.AddPaths(polygon2, clipper.JoinType.jtRound, clipper.EndType.etClosedPolygon);
        var pocket = outlineAtToolCenter;
        var stack = [];
        var i = 1;
        do {
            stack.push(cam.decomposePolytreeInTopLevelPolygons(pocket).map(function (poly) {
                return {contour: poly, children: []};
            }));
            pocket = new clipper.PolyTree();
            co2.Execute(pocket, -step * i);
            i++;
        } while (pocket.ChildCount());
        do {
            var children = stack.pop();
            for (var j = 0; j < children.length; j++) {
                var child = children[j];
                sortChildren(child);
                rotateAndCloseRing(child);
                chainOneStagePocketRing(child);
                if (stack.length)
                    plugChildIntoCorrectParent(lastItem(stack), child);
            }
        } while (stack.length > 0);
        return children;
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
        var deferred = RSVP.defer();
        return {message: {poly: polygon, scaledToolRadius: scaledToolRadius, radialEngagementRatio: radialEngagementRatio},
            messageHandler: function (data) {
                if (data['finished']) {
                    var result = data['result'];
                    Ember.run(deferred, deferred.resolve, result);
                    return true;
                } else if (data['operation'] == 'displayUndercutPoly')
                    Ember.run(function () {
                        display.displayUndercutPoly(data['polygon']);
                    });
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

    function createPocketInWorkerPool(polygons, scaledToolRadius, radialEngagementRatio, display) {
        var promises = [];
        var workArray = polygons.map(function (poly) {
            var work = createWork(poly, scaledToolRadius, radialEngagementRatio, display);
            promises.push(work.promise);
            return  work;
        });
        window.workerPool = createWorkerPool('webapp/pocket_worker.js', workArray, 6);
        return {promises: promises, abort: window.workerPool.abort};
    }

    function createPocketImmediately(polygons, scaledToolRadius, radialEngagementRatio, display) {
        return {promises: polygons.map(function (poly) {
            return new RSVP.Promise(function (resolve) {
                resolve(doCreatePocket2(poly, scaledToolRadius, radialEngagementRatio, display));
            })
        }), abort: function () {
        }};
    }

    function createPocket(clipperPoly, scaledToolRadius, radialEngagementRatio, display, immediately) {
        var polygons = cam.decomposePolytreeInTopLevelPolygons(cam.polyOp(clipperPoly, [], clipper.ClipType.ctUnion, true));
        sortPolygons(polygons);
        var func = immediately ? createPocketImmediately : createPocketInWorkerPool;
        var work = func(polygons, scaledToolRadius, radialEngagementRatio, display);
        var result = RSVP.all(work.promises);
        result.abort = work.abort;
        return result;
    }

    return {
        createPocket: createPocket,
        doCreatePocket2: doCreatePocket2
    };
});