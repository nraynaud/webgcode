"use strict";
function createJoinTestSystem(paper) {
    var toolDiameter = 1.5;
    var toolRadius = toolDiameter / 2;

    function createFilletedRectangle(xSpan, ySpan, direction) {
        function op(l, x, y) {
            return  l + x + ',' + y;
        }

        var tailWidth = 4;
        var tailHeight = direction * 7;
        var tailSpread = 8;

        function sideWithJoin(len, dx, dy) {
            var tailOverHang = (tailSpread - tailWidth) / 2;
            var rotMat = [
                [dx, -dy],
                [dy, dx]
            ];

            function rotate(x, y) {
                return [rotMat[0][0] * x + rotMat[0][1] * y, rotMat[1][0] * x + rotMat[1][1] * y];
            }

            var tail = [
                rotate(-tailOverHang, -tailHeight),
                rotate(tailSpread, 0),
                rotate(-tailOverHang, tailHeight)
            ];
            var tailText = '';
            $.each(tail, function (_, line) {
                tailText += op('l', line[0], line[1]);
            });
            var straightSpan = (len - tailWidth) / 2;
            return op('l', straightSpan * dx, straightSpan * dy)
                + tailText
                + op('l', straightSpan * dx, straightSpan * dy);
        }

        return sideWithJoin(xSpan / 2, 1, 0) + sideWithJoin(xSpan / 2, 1, 0)
            + sideWithJoin(ySpan, 0, 1)
            + sideWithJoin(xSpan, -1, 0)
            + sideWithJoin(ySpan, 0, -1)
            + 'z';
    }

    function createShape(joinOrientation, x, y) {
        var outline = createOutline('M' + x + ',' + y + createFilletedRectangle(40, 20, joinOrientation)).attr({id: 'outline'});
        var rectangle = filletWholePolygon(outline, 2);
        outline.node.pathSegList.clear();
        pushPolygonOn(outline, rectangle[0]);
        var rectangleToolPath = contouring(outline, toolRadius, false, false);
        showClipperPolygon(paper, rectangleToolPath, 'blue');
        return rectangleToolPath;
    }

    var ops = [createShape(1, 0, 0), createShape(-1, 50, 0)];
    var travelZ = 5;
    var workZ = -5;
    return 'F600\n' + createGCode(workZ, travelZ, ops);
}