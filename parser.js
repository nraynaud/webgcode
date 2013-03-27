machinePos = {};
path = [];

REAL_NUMBER_REGEX = "[+-]?[0-9]+(?:[.][0-9]*)?";
//partial list for supported stuff only
LETTERS = ['g', 'i', 'j', 'r', 'x', 'y', 'z'];
WORD_DETECTORS = {};
$.each(LETTERS, function (_, letter) {
    WORD_DETECTORS[letter] = new RegExp(letter.toUpperCase() + '(' + REAL_NUMBER_REGEX + ')');
});
AXES = ['x', 'y', 'z'];

function detectAxisMove(s) {
    var result = {};
    $.each(AXES, function (_, axis) {
        var parsed = WORD_DETECTORS[axis].exec(s);
        if (parsed)
            result[axis] = parseFloat(parsed[1]);
    });
    return result;
}

function cloneObject(old) {
    return $.extend({}, old)
}

function move(parsedMove) {
    var newPos = $.extend(cloneObject(machinePos), parsedMove);
    var hadMovement = false;
    $.each(AXES, function (_, axis) {
        hadMovement = hadMovement || newPos[axis] != machinePos[axis];
    });
    if (hadMovement) {
        path.push(cloneObject(newPos));
        machinePos = newPos;
    }
}

// I can't do maths, code stolen there: https://github.com/grbl/grbl/blob/master/gcode.c#L430
// 'didn't steal adaptative segmentation, too lazy.
function parseArc(line, clockwise) {
    var targetPos = $.extend(cloneObject(machinePos), detectAxisMove(line));
    var radiusMatch = WORD_DETECTORS.r.exec(line);
    if (radiusMatch) {
        //radius notation
        var radius = parseFloat(radiusMatch[1]);
        var dx = targetPos.x - machinePos.x;
        var dy = targetPos.y - machinePos.y;
        var mightyFactor = 4 * radius * radius - dx * dx - dy * dy;
        mightyFactor = -Math.sqrt(mightyFactor) / Math.sqrt(dx * dx + dy * dy);
        if (!clockwise)
            mightyFactor = -mightyFactor;
        if (radius < 0) {
            mightyFactor = -mightyFactor;
            radius = -radius;
        }
        var toCenterX = 0.5 * (dx - (dy * mightyFactor));
        var toCenterY = 0.5 * (dy + (dx * mightyFactor));
    } else {
        //center notation
        var iMatch = WORD_DETECTORS.i.exec(line);
        toCenterX = iMatch ? parseFloat(iMatch[1]) : 0;
        var jMatch = WORD_DETECTORS.j.exec(line);
        toCenterY = jMatch ? parseFloat(jMatch[1]) : 0;
        radius = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
    }
    var centerX = machinePos.x + toCenterX;
    var centerY = machinePos.y + toCenterY;
    var targetCenterX = targetPos.x - centerX;
    var targetCenterY = targetPos.y - centerY;
    var angularDiff = Math.atan2(-toCenterX * targetCenterY + toCenterY * targetCenterX,
        -toCenterX * targetCenterX - toCenterY * targetCenterY);
    if (clockwise && angularDiff >= 0)
        angularDiff -= 2 * Math.PI;
    if (!clockwise && angularDiff <= 0)
        angularDiff += 2 * Math.PI;
    var angularStart = Math.atan2(-toCenterY, -toCenterX);
    var arcSegments = 20;
    for (var i = 0; i <= arcSegments; i++) {
        var angle = angularStart + angularDiff * i / arcSegments;
        var px = centerX + radius * Math.cos(angle);
        var py = centerY + radius * Math.sin(angle);
        move({x: px, y: py, z: ((machinePos.z * (arcSegments - i) + targetPos.z * i) / arcSegments)});
    }
}

function evaluateCode() {
    path = [];
    machinePos = {};
    $.each(AXES, function (_, axis) {
        machinePos[axis] = 0;
    });
    path.push(machinePos);
    var text = $('#codebox').val();
    var arrayOfLines = text.match(/[^\r\n]+/g);
    $.each(arrayOfLines, function (lineNo, originalLine) {
        //drop spaces, go uppercase
        var line = originalLine.replace(/[\t ]+/g, '').toUpperCase();
        // drop comments
        line = line.replace(/[(][^)]*[)]/g, '');
        line = line.replace(/;.*$/, '');
        //drop line number
        line = line.replace(/^N[0-9]+/, '');
        var gCode = WORD_DETECTORS.g.exec(line);
        if (gCode) {
            var codeNum = parseFloat(gCode[1]);
            if (codeNum == 0 || codeNum == 1)
                move(detectAxisMove(line));
            else if (codeNum == 2)
                parseArc(line, true);
            else if (codeNum == 3)
                parseArc(line, false);
            else {
                console.log('Did not understand the line, skipping');
                console.log(originalLine);
            }
        } else {
            var parsedMove = detectAxisMove(line);
            if (parsedMove)
                move(parsedMove);
            else {
                console.log('Did not understand the line, skipping');
                console.log(originalLine);
            }
        }
    });
    var indexes = [];
    var points = [];
    for (i = 0; i < path.length; i++) {
        indexes.push(i);
        var p = path[i];
        points.push([p.x.toFixed(2), p.y.toFixed(2), p.z.toFixed(2)].join(' '))
    }
    indexes.push(-1);
    var lineset = $('<IndexedLineSet></IndexedLineSet>');
    var coordinates = $('<Coordinate></Coordinate>');
    lineset.attr('coordIndex', indexes.join(' '));
    coordinates.attr('point', points.join(', '));
    lineset.append(coordinates);
    $('#toolpath').remove();
    $('#scene').append($('<Shape id="toolpath"></Shape>').append(lineset));
}
