XY_PLANE = {
    firstCoord: 'x',
    secondCoord: 'y',
    lastCoord: 'z'
};
YZ_PLANE = {
    firstCoord: 'y',
    secondCoord: 'z',
    lastCoord: 'x'
};

XZ_PLANE = {
    firstCoord: 'x',
    secondCoord: 'z',
    lastCoord: 'y'
};
machineState = {position: {}, distanceMode: absoluteDistance, motionMode: moveStraightLine, unitMode: mmConverter, planeMode: XY_PLANE, path: []};

REAL_NUMBER_REGEX = "[+-]?[0-9]+(?:[.][0-9]*)?";
//partial list for supported stuff only
LETTERS = ['g', 'i', 'j', 'r', 'x', 'y', 'z'];
WORD_DETECTORS = {};
$.each(LETTERS, function (_, letter) {
    WORD_DETECTORS[letter] = new RegExp(letter.toUpperCase() + '(' + REAL_NUMBER_REGEX + ')');
});
AXES = ['x', 'y', 'z'];
GOUPS_TRANSITIONS = {
    0: {motionMode: moveStraightLine},
    1: {motionMode: moveStraightLine},
    2: {motionMode: moveCWArcMode},
    3: {motionMode: moveCCWArcMode},
    4: {},//skip, doesn't influence tool path
    17: {planeMode: XY_PLANE},
    18: {planeMode: XZ_PLANE},
    19: {planeMode: YZ_PLANE},
    20: {unitMode: inchesConverter},
    21: {unitMode: mmConverter},
    40: {},//skip
    49: {},//skip
    54: {},//skip
    80: {motionMode: noMotion},
    90: {distanceMode: absoluteDistance},
    91: {distanceMode: incremantalDistance}
};


function absoluteDistance(previous, parsedMove) {
    return $.extend(cloneObject(previous), parsedMove);
}

function incremantalDistance(previous, parsedMove) {
    var result = cloneObject(previous);
    $.each(AXES, function (_, axis) {
        if (parsedMove[axis] != null)
            result[axis] += parsedMove[axis];
    });
    return result;
}

function mmConverter(length) {
    return length;
}

function inchesConverter(length) {
    return length * 25.4;
}

function moveCWArcMode(line, machineState) {
    parseArc(line, true, machineState);
}

function moveCCWArcMode(line, machineState) {
    parseArc(line, false, machineState);
}

function moveStraightLine(line, machineState) {
    var parsedMove = detectAxisMove(line, machineState.unitMode);
    if (parsedMove)
        move(parsedMove, machineState);
}

function noMotion(line, machineState) {
    //do nothing
}

function detectAxisMove(s, unitMode) {
    var result = {};
    $.each(AXES, function (_, axis) {
        var parsed = WORD_DETECTORS[axis].exec(s);
        if (parsed)
            result[axis] = unitMode(parseFloat(parsed[1]));
    });
    return result;
}

function cloneObject(old) {
    return $.extend({}, old)
}

function move(parsedMove, machineState) {
    var newPos = machineState.distanceMode(machineState.position, parsedMove);
    addPathComponent(newPos, machineState);
}

function addPathComponent(point, machineState) {
    var hadMovement = false;
    $.each(AXES, function (_, axis) {
        hadMovement = hadMovement || Math.abs(point[axis] - machineState.position[axis]) > 0.00001;
    });
    if (hadMovement) {
        machineState.path.push(cloneObject(point));
        machineState.position = point;
    }
}

// I can't do maths, code stolen there: https://github.com/grbl/grbl/blob/master/gcode.c#L430
// 'didn't steal adaptative segmentation, too lazy.
function parseArc(line, clockwise, machineState) {
    var currentPosition = machineState.position;
    var targetPos = machineState.distanceMode(machineState.position, detectAxisMove(line, machineState.unitMode));
    var radiusMatch = WORD_DETECTORS.r.exec(line);
    var plane = machineState.planeMode;
    if (radiusMatch) {
        //radius notation
        var radius = machineState.unitMode(parseFloat(radiusMatch[1]));
        var dx = targetPos[plane.firstCoord] - currentPosition[plane.firstCoord];
        var dy = targetPos[plane.secondCoord] - currentPosition[plane.secondCoord];
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
        toCenterX = iMatch ? machineState.unitMode(parseFloat(iMatch[1])) : 0;
        var jMatch = WORD_DETECTORS.j.exec(line);
        toCenterY = jMatch ? machineState.unitMode(parseFloat(jMatch[1])) : 0;
        radius = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
    }
    var centerX = currentPosition[plane.firstCoord] + toCenterX;
    var centerY = currentPosition[plane.secondCoord] + toCenterY;
    var targetCenterX = targetPos[plane.firstCoord] - centerX;
    var targetCenterY = targetPos[plane.secondCoord] - centerY;
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
        var newPoint = {};
        newPoint[plane.firstCoord] = px;
        newPoint[plane.secondCoord] = py;
        newPoint[plane.lastCoord] = ((currentPosition[plane.lastCoord] * (arcSegments - i) + targetPos[plane.lastCoord] * i) / arcSegments)
        addPathComponent(newPoint, machineState);
    }
}

function initializeMachine(machineState) {
    machineState.distanceMode = absoluteDistance;
    machineState.position = {};
    $.each(AXES, function (_, axis) {
        machineState.position[axis] = 0;
    });
    machineState.path = [machineState.position];
    machineState.motionMode = moveStraightLine;
    machineState.unitMode = mmConverter;
    machineState.planeMode = XY_PLANE;
}

function displayPath(path) {
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

function simulate(path) {
    var speed = 1000; //mm.min^-1
    var posData = [
        {label: 'x position(mm/min)', color: 'red', data: []},
        {label: 'y position(mm/min)', color: 'green', data: []},
        {label: 'z position(mm/min)', color: 'blue', data: []}
    ];
    var currentTime = 0;
    var currentDistance = 0;

    for (var i = 1; i < path.length; i++) {
        var p0 = path[i - 1];
        var p1 = path[i];

        function dist(axis) {
            return Math.abs(p1[axis] - p0[axis]);
        }

        var dx = dist('x');
        var dy = dist('y');
        var dz = dist('z');
        var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        var time = len / speed;
        posData[0].data.push([currentTime, p1['x']]);
        posData[1].data.push([currentTime, p1['y']]);
        posData[2].data.push([currentTime, p1['z']]);
        currentTime += time;
        currentDistance += len;
    }
    $.plot("#chart1", posData);
}

function evaluateCode() {
    initializeMachine(machineState);
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
        do {
            var gCode = WORD_DETECTORS.g.exec(line);
            if (gCode) {
                var codeNum = parseFloat(gCode[1]);
                var transition = GOUPS_TRANSITIONS[codeNum];
                if (transition != null)
                    $.extend(machineState, transition);
                else {
                    console.log('Did not understand G' + gCode[1] + ', skipping');
                    console.log(originalLine);
                }
                line = line.replace(WORD_DETECTORS.g, '');
            }

        } while (gCode);
        machineState.motionMode(line, machineState);
    });
    displayPath(machineState.path);
    simulate(machineState.path);
}