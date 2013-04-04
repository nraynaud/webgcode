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

TRAVERSE_RATE = 3000;

REAL_NUMBER_REGEX = "[+-]?[0-9]+(?:[.][0-9]*)?";
//partial list for supported stuff only
LETTERS = ['f', 'g', 'i', 'j', 'r', 'x', 'y', 'z'];
WORD_DETECTORS = {};
$.each(LETTERS, function (_, letter) {
    WORD_DETECTORS[letter] = new RegExp(letter.toUpperCase() + '(' + REAL_NUMBER_REGEX + ')');
});
AXES = ['x', 'y', 'z'];
GOUPS_TRANSITIONS = {
    0: {motionMode: moveTraverseRate},
    1: {motionMode: moveFeedrate},
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
    61: {pathControl: 61},
    61.1: {pathControl: 61.1},
    64: {pathControl: 64},
    80: {motionMode: noMotion},
    90: {distanceMode: absoluteDistance},
    91: {distanceMode: incrementalDistance}
};


function absoluteDistance(previous, parsedMove) {
    return $.extend(cloneObject(previous), parsedMove);
}

function incrementalDistance(previous, parsedMove) {
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

function moveFeedrate(line, machineState) {
    moveStraightLine(line, machineState, machineState.feedRate);
}

function moveTraverseRate(line, machineState) {
    moveStraightLine(line, machineState, TRAVERSE_RATE);
}

function moveStraightLine(line, machineState, speed) {
    var parsedMove = detectAxisMove(line, machineState.unitMode);
    if (parsedMove)
        move(parsedMove, machineState, speed);
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
    return Object.keys(result).length ? result : null;
}

function cloneObject(old) {
    return $.extend({}, old)
}

function move(parsedMove, machineState, speed) {
    var newPos = machineState.distanceMode(machineState.position, parsedMove);
    addPathComponent(newPos, machineState, speed);
}

function addPathComponent(point, machineState, speed) {
    var hadMovement = false;
    $.each(AXES, function (_, axis) {
        hadMovement = hadMovement || Math.abs(point[axis] - machineState.position[axis]) > 0.00001;
    });
    if (hadMovement) {
        machineState.path.push({type: 'line', from: cloneObject(machineState.position), to: cloneObject(point), speed: speed});
        machineState.position = point;
    }
}

function findCircle(line, unitMode, targetPos, plane, currentPosition, clockwise) {
    var radius, toCenterX, toCenterY;
    var radiusMatch = WORD_DETECTORS.r.exec(line);
    if (radiusMatch) {
        //radius notation
        radius = unitMode(parseFloat(radiusMatch[1]));
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
        toCenterX = 0.5 * (dx - (dy * mightyFactor));
        toCenterY = 0.5 * (dy + (dx * mightyFactor));
    } else {
        //center notation
        var iMatch = WORD_DETECTORS.i.exec(line);
        var jMatch = WORD_DETECTORS.j.exec(line);
        toCenterX = iMatch ? unitMode(parseFloat(iMatch[1])) : 0;
        toCenterY = jMatch ? unitMode(parseFloat(jMatch[1])) : 0;
        radius = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
    }
    return {radius: radius, toCenterX: toCenterX, toCenterY: toCenterY};
}

// I can't do maths, code stolen there: https://github.com/grbl/grbl/blob/master/gcode.c#L430
// to keep sanity, think firstCoord is X and secondCoord is Y and the plane transposer will do the changes
function parseArc(line, clockwise, machineState) {
    var parsedMove = detectAxisMove(line, machineState.unitMode);
    if (!parsedMove)
        return;
    var currentPosition = machineState.position;
    var unitMode = machineState.unitMode;
    var targetPos = machineState.distanceMode(machineState.position, detectAxisMove(line, unitMode));
    var plane = machineState.planeMode;
    var xCoord = plane.firstCoord;
    var yCoord = plane.secondCoord;
    var zCoord = plane.lastCoord;
    var circle = findCircle(line, unitMode, targetPos, plane, currentPosition, clockwise);
    var radius = circle.radius;
    var toCenterX = circle.toCenterX;
    var toCenterY = circle.toCenterY;
    var centerX = currentPosition[xCoord] + toCenterX;
    var centerY = currentPosition[yCoord] + toCenterY;
    var targetCenterX = targetPos[xCoord] - centerX;
    var targetCenterY = targetPos[yCoord] - centerY;
    var angularDiff = Math.atan2(-toCenterX * targetCenterY + toCenterY * targetCenterX,
        -toCenterX * targetCenterX - toCenterY * targetCenterY);
    if (clockwise && angularDiff >= 0)
        angularDiff -= 2 * Math.PI;
    if (!clockwise && angularDiff <= 0)
        angularDiff += 2 * Math.PI;
    var angularStart = Math.atan2(-toCenterY, -toCenterX);
    machineState.path.push({
        type: 'arc',
        from: currentPosition,
        to: targetPos,
        plane: plane,
        center: {first: centerX, second: centerY},
        fromAngle: angularStart,
        angularDistance: angularDiff,
        radius: radius,
        speed: machineState.feedRate});
    machineState.position = targetPos;
}

function createMachine() {
    var machineState = {position: {},
        distanceMode: absoluteDistance,
        motionMode: moveTraverseRate,
        unitMode: mmConverter,
        planeMode: XY_PLANE,
        feedRate: 200,
        pathControl: 61,
        path: []};
    $.each(AXES, function (_, axis) {
        machineState.position[axis] = 0;
    });
    machineState.path.push(machineState.position);
    return machineState;
}

function evaluateCode() {
    var machineState = createMachine();
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
        var fCode = WORD_DETECTORS.f.exec(line);
        if (fCode)
            machineState.feedRate = machineState.unitMode(parseFloat(fCode[1]));
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
    var simulatedPath = simulate(machineState.path);
    displayPath(simulatedPath);
}