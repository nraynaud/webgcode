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

function timeForX(speed, acceleration, length, x) {
    var accelerationLength = speed * speed / (2 * acceleration); //mm
    if (length > 2 * accelerationLength) {
        var accelerationDuration = speed / acceleration;
        var constantSpeedDuration = (length - 2 * accelerationLength) / speed;
        if (x <= accelerationLength)
            return Math.sqrt(2 * x / acceleration);
        else if (x <= length - accelerationLength)
            return accelerationDuration + (x - accelerationLength) / speed;
        else
            return 2 * accelerationDuration + constantSpeedDuration - Math.sqrt(2 * (length - x) / acceleration)
    } else if (x <= length / 2)
        return Math.sqrt(2 * x / acceleration);
    else
        return 2 * Math.sqrt(length / acceleration) - Math.sqrt(2 * (length - x) / acceleration);
}

function simulate(path) {
    var simulatedPath = [];
    var acceleration = 200; //mm.s^-2

    var posData = [
        {label: 'x position(mm/s)', color: 'red', data: []},
        {label: 'y position(mm/s)', color: 'green', data: []},
        {label: 'z position(mm/s)', color: 'blue', data: []}
    ];

    var currentTime = 0;
    var currentDistance = 0;

    function pushPoint(x, y, z) {
        posData[0].data.push([currentTime, x]);
        posData[1].data.push([currentTime, y]);
        posData[2].data.push([currentTime, z]);
        simulatedPath.push({x: x, y: y, z: z});
    }

    function simulateLine(line) {
        var p0 = line.from;
        var p1 = line.to;

        var speed = p1.speed / 60; //mm.min^-1 -> mm.s^-1
        var accelerationDuration = speed / acceleration;

        function dist(axis) {
            return p1[axis] - p0[axis];
        }

        var dx = dist('x');
        var dy = dist('y');
        var dz = dist('z');
        var len = Math.sqrt(dx * dx + dy * dy + dz * dz);

        function pushPointAtRatio(ratio) {
            pushPoint(p0['x'] + ratio * dx, p0['y'] + ratio * dy, p0['z'] + ratio * dz);
        }

        var segments = 30;
        var startTime = currentTime;
        for (var j = 0; j < segments; j++) {
            var ratio = j / segments;
            currentTime = startTime + timeForX(speed, acceleration, len, ratio * len);
            pushPointAtRatio(ratio);
        }
        currentTime = startTime + timeForX(speed, acceleration, len, len);
        pushPoint(p1['x'], p1['y'], p1['z']);
        currentDistance += len;
    }

    function simulateArc(arc) {
        // 'didn't steal adaptative segmentation, too lazy.
        var arcSegments = 20;
        var currentPoint = arc.from;
        for (var i = 0; i <= arcSegments; i++) {
            var angle = arc.fromAngle + arc.angularDistance * i / arcSegments;
            var newPoint = {};
            newPoint[arc.plane.firstCoord] = arc.center.first + arc.radius * Math.cos(angle);
            newPoint[arc.plane.secondCoord] = arc.center.second + arc.radius * Math.sin(angle);
            newPoint[arc.plane.lastCoord] = ((arc.from[arc.plane.lastCoord] * (arcSegments - i) + arc.to[arc.plane.lastCoord] * i) / arcSegments)
            var line = {from: currentPoint, to: newPoint, speed: arc.speed};
            simulateLine(line);
            currentPoint = newPoint;
        }
    }

    pushPoint(path[0]['x'], path[0]['y'], path[0]['z']);
    for (var i = 1; i < path.length; i++) {
        if (path[i].type == 'line')
            simulateLine(path[i]);
        if (path[i].type == 'arc')
            simulateArc(path[i]);
    }
    $.plot("#chart1", posData);
    return simulatedPath;
}