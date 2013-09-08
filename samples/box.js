"use strict";
function createJoinTestSystem(paper) {
    var toolDiameter = 1.6;
    var toolRadius = toolDiameter / 2;

    function createFilletedRectangle(xSpan, ySpan, direction) {
        function op(l, x, y) {
            return  l + x + ',' + y;
        }

        var tailWidth = 6;
        var tailHeight = direction * 7;
        var tailSpread = 12;

        return op('l', (xSpan - tailWidth) / 2, 0)
            + op('l', -(tailSpread - tailWidth) / 2, -tailHeight) + op('l', tailSpread, 0) + op('l', -(tailSpread - tailWidth) / 2, tailHeight)
            + op('l', (xSpan - tailWidth) / 2, 0)
            + op('l', 0, ySpan)
            + op('l', -xSpan, 0)
            + 'z';
    }

    function createShape(joinOrientation, x, y) {
        var outline = createOutline('M' + x + ',' + y + createFilletedRectangle(30, 20, joinOrientation)).attr({id: 'outline'});
        var rectangle = filletWholePolygon(outline, 2);
        outline.node.pathSegList.clear();
        pushPolygonOn(outline, rectangle[0]);
        var rectangleToolPath = contouring(outline, toolRadius, false, false);
        showClipperPolygon(paper, rectangleToolPath, 'blue');
        return rectangleToolPath;
    }

    var ops = [createShape(1, 0, 0), createShape(-1, 35, 0)];
    var travelZ = 5;
    var workZ = -5;
    return 'F500\n' + createGCode(workZ, travelZ, ops);
}