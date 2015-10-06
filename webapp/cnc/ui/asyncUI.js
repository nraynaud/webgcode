"use strict";
define(['libs/earcut.min'], function (earcut) {
    function countvertices(polylines) {
        var count = 0;
        for (var i = 0; i < polylines.length; i++)
            count += polylines[i].length;
        return count;
    }

    function preparePolylines(polylines) {
        var maxVertices = 100000;
        var vertexCount = countvertices(polylines);
        var indices = new Uint16Array(vertexCount * 2);
        var positions = new Float32Array(vertexCount * 3);
        var transferableArray = [positions.buffer, indices.buffer];
        var currentIndex = 0;
        for (var i = 0; i < polylines.length; i++) {
            var poly = polylines[i];
            if (currentIndex >= maxVertices)
                break;
            for (var j = 0; j < poly.length; j++) {
                if (currentIndex >= maxVertices)
                    break;
                positions[currentIndex * 3 + 0] = poly[j].x;
                positions[currentIndex * 3 + 1] = poly[j].y;
                positions[currentIndex * 3 + 2] = poly[j].z;
                if (j != 0) {
                    indices[(currentIndex - 1) * 2] = currentIndex - 1;
                    indices[(currentIndex - 1) * 2 + 1] = currentIndex;
                }
                currentIndex++;
            }
        }
        return {result: [{count: vertexCount, position: positions, index: indices}], transferable: transferableArray};
    }

    function preparePolygons(polygons) {
        var result = [];
        var totalCount = 0;
        for (var k = 0; k < polygons.length; k++)
            for (var i = 0; i < polygons[k].length; i++) {
                var poly = polygons[k][i];
                var rawVertices = [];
            for (var j = 0; j < poly.length; j++) {
                rawVertices[j * 3 + 0] = poly[j].x;
                rawVertices[j * 3 + 1] = poly[j].y;
                rawVertices[j * 3 + 2] = poly[j].z;
            }
            var res = earcut(rawVertices, [], 3);
            result.push({count: res.length / 3, position: rawVertices, index: res});
            totalCount += res.length / 3;
        }
        var indices = [];
        var positions = [];
        var positionsOffset = 0;
        for (i = 0; i < result.length; i++) {
            for (j = 0; j < result[i].position.length; j++)
                positions.push(result[i].position[j]);
            for (j = 0; j < result[i].index.length; j++)
                indices.push(result[i].index[j] + positionsOffset);
            positionsOffset += result[i].position.length / 3;
        }
        indices = new Uint16Array(indices);
        positions = new Float32Array(positions);
        return {
            result: [{count: indices.length / 3, position: positions, index: indices}],
            transferable: [indices.buffer, positions.buffer]
        };
    }

    return {preparePolylines: preparePolylines, preparePolygons: preparePolygons};
});