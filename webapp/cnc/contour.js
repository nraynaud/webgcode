"use strict";
function contour(altitude, geom) {
    var verticesCount = geom.vertices.length;
    var triangles = [];

    function edgeCrossesPlan(p1Index, p2Index, otherIndex) {
        var p1 = geom.vertices[p1Index];
        var p2 = geom.vertices[p2Index];
        var p1distance = altitude - p1.y;
        var p2distance = altitude - p2.y;
        if (p1distance * p2distance >= 0)
            return null;
        var t = p1distance / (p1distance - p2distance);
        return [p1Index, p2Index, p2.clone().sub(p1).multiplyScalar(t).add(p1), otherIndex];
    }

    //sparse array of edge intersection vertices.
    //each vertex index depends on the indexes of the 2 original vertices
    var contourPoints = [];
    //adjacency sparse matrix.
    var contourEdges = [];

    function pushEdge(i1, i2) {
        if (contourEdges[i1] === undefined)
            contourEdges[i1] = [];
        contourEdges[i1].push(i2);
    }

    $.each(geom.faces, function (faceIndex, face) {
        var intersection1 = edgeCrossesPlan(face.a, face.b, face.c);
        var intersection2 = edgeCrossesPlan(face.b, face.c, face.a);
        if (intersection1 || intersection2) {
            var intersection3 = edgeCrossesPlan(face.c, face.a, face.b);
            var edges = [];

            $.each([intersection1, intersection2, intersection3], function (_, edge) {
                if (edge) {
                    var i0 = Math.min(edge[0], edge[1]);
                    var i1 = Math.max(edge[0], edge[1]);
                    var contourIndex = i0 + i1 * verticesCount;
                    contourPoints[contourIndex] = edge[2];
                    edges.push(contourIndex);
                }
            });
            pushEdge(edges[0], edges[1]);
            pushEdge(edges[1], edges[0]);
            triangles.push(face);
        }
    });

    function findPath(start, originalEdges, reversed) {
        function deleteEdge(i1, i2) {
            for (var j = 0; j < contourEdges[i1].length; j++)
                if (contourEdges[i1][j] == i2) {
                    contourEdges[i1].splice(j, 1);
                    if (contourEdges[i1].length == 0)
                        delete contourEdges[i1];
                    break;
                }
        }

        //backup as we'll destroy the path as we move along to avoid going backwards.
        var contourEdges = jQuery.extend(true, [], originalEdges);
        var previous = null;
        var current = start;
        var path = [start];
        var vertexPath = [contourPoints[start]];
        do {
            var moved = false;
            for (var j = 0; contourEdges[current] !== undefined && j < contourEdges[current].length; j++) {
                if (contourEdges[current][j] != previous) {
                    previous = current;
                    path.push(contourEdges[current][j]);
                    vertexPath.push(contourPoints[contourEdges[current][j]]);
                    current = contourEdges[current][j];
                    deleteEdge(previous, current);
                    deleteEdge(current, previous);
                    moved = true;
                    break;
                }
            }
        } while (current != start && moved);
        //we got blocked by the end of the path (it was not a looping path).
        // Do it again backwards from the blocking point to get the longest path possible.
        if (!moved && !reversed)
            return findPath(path[path.length - 1], originalEdges, true);
        return {path: path, vertexPath: vertexPath, remainingGraph: contourEdges};
    }

    var contours = [];
    do {
        var start = null;
        //take a random graph vertex
        for (var index in contourEdges)
            if (String(index >>> 0) == index && index >>> 0 != 0xffffffff && contourEdges[index]) {
                start = index;
                break;
            }
        if (start !== null) {
            var res = findPath(start, contourEdges);
            contours.push(res.vertexPath);
            contourEdges = res.remainingGraph;
        }
    } while (start !== null);
    return {contours: contours, triangles: triangles};
}
