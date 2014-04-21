"use strict";
var dremelBracket = (function () {
    var outerWidth = 100;
    var angle = 100;
    var angleRadian = angle * Math.PI / 180;
    var backsideMinWidth = 4;
    var outerHeight = 25;
    var virtualMeetingPointY = -1;
    var ratio = Math.tan(angleRadian / 2);
    var slopeDX = (outerHeight - backsideMinWidth) * ratio;
    var topDx = outerWidth / 2 - (outerHeight - virtualMeetingPointY) * ratio;
    var plankThickness = 18;

    function createOutline(machine, color) {
        return  machine.createOutline(geom.op('M', 0, 0) + geom.op('l', outerWidth, 0) + geom.op('l', 0, outerHeight)
            + geom.op('l', -topDx, 0)
            + geom.op('l', -slopeDX, -(outerHeight - backsideMinWidth))
            + geom.op('l', -(outerWidth - topDx * 2 - slopeDX * 2), 0)
            + geom.op('l', -slopeDX, outerHeight - backsideMinWidth)
            + geom.op('l', -topDx, 0) + 'Z', color);
    }

    function createBracket(machine) {
        var toolRadius = 2 / 2;
        var outline = createOutline(machine);
        machine.setParams(-17, 10, 1000);
        machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(outline, toolRadius, false, true), -0, -plankThickness, 3));
    }

    function createBracketPocket(machine) {
        var toolRadius = 3 / 2;
        var radialEngagementRatio = 1;
        var roughingMargin = 0.2;
        var minimalCornerRadius = toolRadius * 1.5;

        function displayClipper(clipperPoly, color, polyline) {
            var res1 = machine.createOutline(null, color);
            $.each(machine.fromClipper(clipperPoly), function (index, poly) {
                if (poly.path.length > 1)
                    pushOnPath(res1, poly);
                if (!polyline)
                    res1.node.pathSegList.appendItem(res1.node.createSVGPathSegClosePath());
                else {
                    var startPoint = poly.getStartPoint();
                    machine.createOutline(geom.createCircle(startPoint.x, startPoint.y, 0.5), color)
                }
            });
        }

        function polylineIntersection(line, polygon) {
            var cpr = new ClipperLib.Clipper();
            var result = new ClipperLib.PolyTree();
            cpr.AddPaths(line, ClipperLib.PolyType.ptSubject, false);
            cpr.AddPaths(polygon, ClipperLib.PolyType.ptClip, true);
            cpr.Execute(ClipperLib.ClipType.ctIntersection, result, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
            return ClipperLib.Clipper.PolyTreeToPaths(result);
        }

        var outline = createOutline(machine, 'gray');
        var cPoly = machine.toClipper(outline);
        var outlineAtToolCenter = machine.offsetPolygon(cPoly, -toolRadius - roughingMargin);
        var toolCorrectedRoughOutline = machine.offsetPolygon(outlineAtToolCenter, toolRadius);
        displayClipper(toolCorrectedRoughOutline, 'blue');

        recursivelyGoDown(outlineAtToolCenter);
        function recursivelyGoDown(shape) {
            displayClipper(shape, 'red');
            var offset = machine.offsetPolygon(shape, -toolRadius * radialEngagementRatio - minimalCornerRadius);
            for (var childIndex = 0; childIndex < offset.length; childIndex++) {
                var child = [offset[childIndex]];
                var offset1 = machine.offsetPolygon(child, minimalCornerRadius);

                var j = 1;
                do {
                    var buffered = machine.offsetPolygon(offset1, j * toolRadius * radialEngagementRatio * 1.001);
                    var cornersPicker = polylineIntersection(buffered, shape);
                    if (cornersPicker.length)
                        displayClipper(cornersPicker, 'green', true);
                    j++;
                } while (cornersPicker.length);
                recursivelyGoDown(offset1);
                shape = machine.polyOp(shape, machine.offsetPolygon(offset1, j * toolRadius * radialEngagementRatio * 1.001), ClipperLib.ClipType.ctDifference)
            }
        }

        /*
         var i = 0;
         var parent = outlineAtToolCenter;
         do {
         var offset = machine.offsetPolygon(outlineAtToolCenter, -i * toolRadius * radialEngagementRatio - minimalCornerRadius);
         console.log(offset.length);
         for (var childIndex = 0; childIndex < offset.length; childIndex++) {
         var child = [offset[childIndex]];
         var offset1 = machine.offsetPolygon(child, minimalCornerRadius);
         displayClipper(offset1, 'red');
         var j = 1;
         do {
         var buffered = machine.offsetPolygon(offset1, j * toolRadius * radialEngagementRatio * 1.001);
         var cornersPicker = polylineIntersection(buffered, parent);
         if (cornersPicker.length)
         displayClipper(cornersPicker, 'rgb(255, 0, 255)', true);
         j++;
         } while (cornersPicker.length);
         i++;
         parent = offset1;
         }
         } while (offset.length);
         */
    }

    return {createBracket: createBracket,
        createBracketPocket: createBracketPocket};
})();