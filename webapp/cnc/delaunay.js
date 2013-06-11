function circleForTriangle(a, b, c) {
    //stolen from https://github.com/ironwallaby/delaunay
    var result = {};
    var A = b.x - a.x,
        B = b.y - a.y,
        C = c.x - a.x,
        D = c.y - a.y,
        E = A * (a.x + b.x) + B * (a.y + b.y),
        F = C * (a.x + c.x) + D * (a.y + c.y),
        G = 2 * (A * (c.y - b.y) - B * (c.x - b.x)),
        minx, miny, dx, dy;

    /* If the points of the triangle are collinear, then just find the
     * extremes and use the midpoint as the center of the circumcircle. */
    if (Math.abs(G) < 0.000001) {
        minx = Math.min(a.x, b.x, c.x);
        miny = Math.min(a.y, b.y, c.y);
        dx = (Math.max(a.x, b.x, c.x) - minx) * 0.5;
        dy = (Math.max(a.y, b.y, c.y) - miny) * 0.5;
        result.x = minx + dx;
        result.y = miny + dy;
    } else {
        result.x = (D * E - B * F) / G;
        result.y = (A * F - C * E) / G;
        dx = result.x - a.x;
        dy = result.y - a.y;
    }
    result.rsqd = dx * dx + dy * dy;
    return result;
}

function createTriangle(ai, bi, ci, vertexBuffer) {
    var a = vertexBuffer[ai];
    var b = vertexBuffer[bi];
    var c = vertexBuffer[ci];
    var circle = circleForTriangle(a, b, c);
    var r = Math.sqrt(circle.rsqd);
    return {
        vertices: [a, b, c],
        verticesIndexes: [ai, bi, ci],
        fromSuper: a.fromSuper || b.fromSuper || c.fromSuper,
        circle: circle,
        x: circle.x - r,
        y: circle.y - r,
        width: r * 2,
        height: r * 2
    };
}

function createDelaunay(xmin, xmax, ymin, ymax) {
    var vertices = [];

    function triangleAroundRectangle(x1, y1, x2, y2) {
        spanX = x2 - x1;
        spanY = y2 - y1;
        longestSide = Math.max(spanX, spanY);
        midX = (x1 + x2) / 2;
        midY = (y1 + y2) / 2;
        vertices.push({x: midX - 10 * longestSide, y: midY - longestSide, fromSuper: true});
        vertices.push({x: midX, y: midY + 10 * longestSide, fromSuper: true});
        vertices.push({x: midX + 10 * longestSide, y: midY - longestSide, fromSuper: true});
        return createTriangle(0, 1, 2, vertices);
    }

    var supertriangle = triangleAroundRectangle(xmin, xmax, ymin, ymax);
    return {
        supertriangle: supertriangle,
        triangles: [supertriangle],
        vertices: vertices
    };
}

function appendVertex(x, y, state) {
    // http://paulbourke.net/papers/triangulate/
    function isPointInsidetriangle(p, triangle) {
        // http://jsfiddle.net/PerroAZUL/zdaY8/1/
        var p0 = triangle.vertices[0];
        var p1 = triangle.vertices[1];
        var p2 = triangle.vertices[2];
        var A = 1 / 2 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
        var sign = A < 0 ? -1 : 1;
        var s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
        var t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;
        return s > 0 && t > 0 && (s + t) < 2 * A * sign;
    }

    function pushEdgeOrRemoveIfDoubled(p1, p2, array) {
        var found = false;
        $.each(array, function (index, edge) {
            if (edge[0] === p1 && edge[1] === p2 || edge[1] === p1 && edge[0] === p2) {
                found = true;
                array.splice(index, 1);
                return false;
            }
            return true;
        });
        if (!found)
            array.push([p1, p2]);
    }

    function pointInTriangleCircle(point, triangle) {
        var dx = point.x - triangle.circle.x;
        var dy = point.y - triangle.circle.y;
        return dx * dx + dy * dy < triangle.circle.rsqd;
    }

    var vertex = {x: x, y: y};
    if (!isPointInsidetriangle(vertex, state.supertriangle))
        throw "supertriangle is not big enough to fit vertex";
    var vertexIndex = state.vertices.length;
    state.vertices.push(vertex);
    var vertices = [
        vertex,
        //I have to understand why Bourke does that
        //state.supertriangle.vertices[0],
        //state.supertriangle.vertices[1],
        //state.supertriangle.vertices[2]
    ];
    $.each(vertices, function (_, vertex) {
        var edges = [];
        var deletedTriangles = [];
        var selectedTriangles = state.triangles;
        $.each(selectedTriangles, function (index, triangle) {
            if (triangle && pointInTriangleCircle(vertex, triangle)) {
                pushEdgeOrRemoveIfDoubled(triangle.verticesIndexes[0], triangle.verticesIndexes[1], edges);
                pushEdgeOrRemoveIfDoubled(triangle.verticesIndexes[1], triangle.verticesIndexes[2], edges);
                pushEdgeOrRemoveIfDoubled(triangle.verticesIndexes[2], triangle.verticesIndexes[0], edges);
                deletedTriangles.push(index);
            }
        });
        //backwards so that deletions doesn't destroy indexing
        for (var i = deletedTriangles.length - 1; i >= 0; i--) {
            var deleted = state.triangles.splice(deletedTriangles[i], 1)[0];
            deleted.deleted = true;
        }
        $.each(edges, function (_, edge) {
            if (edge[0] !== vertexIndex && edge[1] !== vertexIndex) {
                var newTriangle = createTriangle(edge[0], edge[1], vertexIndex, state.vertices);
                state.triangles.push(newTriangle);
            }
        });
    });
    return vertex;
}
