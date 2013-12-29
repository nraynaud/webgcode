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

    function createBracket(machine) {
        var toolRadius = 3 / 2;
        var shape = geom.op('M', 0, 0) + geom.op('l', outerWidth, 0) + geom.op('l', 0, outerHeight)
            + geom.op('l', -topDx, 0)
            + geom.op('l', -slopeDX, -(outerHeight - backsideMinWidth))
            + geom.op('l', -(outerWidth - topDx * 2 - slopeDX * 2), 0)
            + geom.op('l', -slopeDX, outerHeight - backsideMinWidth)
            + geom.op('l', -topDx, 0) + 'Z';
        var outline = machine.createOutline(shape);
        machine.setParams(-17, 10, 1000);
        machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(outline, toolRadius, false, true), -0, -plankThickness, 3));
    }

    return {createBracket: createBracket};
})();