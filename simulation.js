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

function timeForAngle(speed, radius, acceleration, length, angle) {
    var angularSpeed = speed / radius;
    var maxRadialAcceleration = Math.pow(speed, 2) / radius;
    var maxTangentialAcceleration = Math.sqrt(Math.pow(acceleration, 2) - Math.pow(maxRadialAcceleration, 2));
    var accelerationAngularLength = speed * speed / (2 * radius * maxTangentialAcceleration);
    var accelerationDuration = speed / maxTangentialAcceleration;
    var constantSpeedDuration = (length - 2 * accelerationAngularLength) / angularSpeed;

    function accelerationEq(angle) {
        return Math.sqrt(2 * angle * radius / maxTangentialAcceleration);
    }

    if (length > 2 * accelerationAngularLength) {
        if (angle < accelerationAngularLength) {
            return accelerationEq(angle);
        }
        else if (angle < length - accelerationAngularLength) {
            return accelerationDuration + (angle - accelerationAngularLength) / angularSpeed;
        } else {
            return 2 * accelerationDuration + constantSpeedDuration - accelerationEq(length - angle);
        }
    } else if (angle <= length / 2)
        return accelerationEq(angle);
    else
        return 2 * Math.sqrt(length / maxTangentialAcceleration / radius) - accelerationEq(length - angle);
}

function simulate(path) {
    var simulatedPath = [];
    var acceleration = 200; //mm.s^-2

    var posData = [
        {label: 'x position(s->mm)', color: 'red', data: []},
        {label: 'y position(s->mm)', color: 'green', data: []},
        {label: 'z position(s->mm)', color: 'blue', data: []}
    ];

    var speedData = [
        {label: 'x speed(s->mm/s)', color: 'red', data: [
            [0, 0]
        ]},
        {label: 'y speed(s->mm/s)', color: 'green', data: [
            [0, 0]
        ]},
        {label: 'z speed(s->mm/s)', color: 'blue', data: [
            [0, 0]
        ]},
        {label: 'speed(s->mm/s)', color: 'black', data: [
            [0, 0]
        ]},
    ];
    var accelerationData = [
        {label: 'x acc(s->mm/s^2)', color: 'red', data: [
            [0, 0]
        ]},
        {label: 'y acc(s->mm/s^2)', color: 'green', data: [
            [0, 0]
        ]},
        {label: 'z acc(s->mm/s^2)', color: 'blue', data: [
            [0, 0]
        ]},
        {label: 'acceleration(s->mm/s^2)', color: 'black', data: [
            [0, 0]
        ]}
    ];

    var currentTime = 0;
    var currentDistance = 0;

    function pushPoint(x, y, z) {
        posData[0].data.push([currentTime, x]);
        posData[1].data.push([currentTime, y]);
        posData[2].data.push([currentTime, z]);
        simulatedPath.push({x: x, y: y, z: z});
        var previous = posData[0].data.length - 2;
        if (previous >= 0) {
            var previousDate = posData[0].data[previous][0];
            var dt = currentTime - previousDate;
            var speedDate = previousDate + dt / 2;
            var dx = x - posData[0].data[previous][1];
            var dy = y - posData[1].data[previous][1];
            var dz = z - posData[2].data[previous][1];
            var sx = dx / dt;
            var sy = dy / dt;
            var sz = dz / dt;
            speedData[0].data.push([speedDate, sx]);
            speedData[1].data.push([speedDate, sy]);
            speedData[2].data.push([speedDate, sz]);
            speedData[3].data.push([speedDate, length(dx, dy, dz) / dt]);
            if (previous >= 1) {
                var previousSpeedDate = speedData[0].data[previous - 1][0];
                var previousSpeed = speedData[3].data[previous - 1][1];
                var pDSx = sx - speedData[0].data[previous - 1][1];
                var pDSy = sy - speedData[1].data[previous - 1][1];
                var pDSz = sz - speedData[2].data[previous - 1][1];
                accelerationData[0].data.push([previousDate, pDSx / (speedDate - previousSpeedDate)]);
                accelerationData[1].data.push([previousDate, pDSy / (speedDate - previousSpeedDate)]);
                accelerationData[2].data.push([previousDate, pDSz / (speedDate - previousSpeedDate)]);
                accelerationData[3].data.push([previousDate, length(pDSx, pDSy, pDSz) / (speedDate - previousSpeedDate)]);
            }
        }
    }

    function simulateLine(line) {
        var p0 = line.from;
        var p1 = line.to;

        var speed = line.feedRate / 60; //mm.min^-1 -> mm.s^-1

        function dist(axis) {
            return p1[axis] - p0[axis];
        }

        var dx = dist('x');
        var dy = dist('y');
        var dz = dist('z');
        var len = length(dx, dy, dz);

        function pushPointAtRatio(ratio) {
            pushPoint(p0['x'] + ratio * dx, p0['y'] + ratio * dy, p0['z'] + ratio * dz);
        }

        var segments = 100;
        var startTime = currentTime;
        for (var j = 1; j < segments; j++) {
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
        var arcSegments = 100;
        var speed = arc.feedRate / 60;
        var currentPoint = arc.from;
        var lastCoord = arc.plane.lastCoord;
        var lastCoordDistance = arc.to[lastCoord] - arc.from[lastCoord];
        var planarArcLength = arc.angularDistance * arc.radius;
        var arcLength = length(planarArcLength, lastCoordDistance);
        //max speed allowed without radial acceleration being > to max acceleration
        var maxSpeed = Math.sqrt(arc.radius * acceleration - lastCoordDistance * lastCoordDistance);
        var maxTangentialAcceleration = Math.sqrt(acceleration * acceleration - Math.pow(speed * speed / arc.radius, 2));
        var accelerationAngularLength = speed * speed / (2 * arc.radius * maxTangentialAcceleration);

        function pushPointAtRatio(ratio) {
            var angle = arc.fromAngle + arc.angularDistance * ratio;
            var newPoint = {};
            newPoint[arc.plane.firstCoord] = arc.center.first + arc.radius * Math.cos(angle);
            newPoint[arc.plane.secondCoord] = arc.center.second + arc.radius * Math.sin(angle);
            newPoint[lastCoord] = ((arc.from[lastCoord] * (arcSegments - i) + arc.to[lastCoord] * i) / arcSegments)
            pushPoint(newPoint['x'], newPoint['y'], newPoint['z']);
        }

        var startTime = currentTime;
        var maxRadialAcceleration = Math.pow(speed, 2) / arc.radius;
        if (maxRadialAcceleration > acceleration) {
            //constant speed would already create a too big radial acceleration, reducing speed.
            var dampingFactor = 0.8;
            var oldSpeed = speed;
            speed = Math.sqrt(acceleration * dampingFactor * arc.radius);
            maxRadialAcceleration = Math.pow(speed, 2) / arc.radius;
            console.log("damping speed", oldSpeed, '->', speed, maxRadialAcceleration);
        }
        for (var j = 1; j <= arcSegments; j++) {
            var ratio = j / arcSegments;
            var angle = Math.abs(arc.angularDistance) * ratio;
            var timeForAngle2 = timeForAngle(speed, arc.radius, acceleration, Math.abs(arc.angularDistance), angle);
            currentTime = startTime + timeForAngle2;
            pushPointAtRatio(ratio);
        }
    }

    pushPoint(path[0]['x'], path[0]['y'], path[0]['z']);
    for (var i = 1; i < path.length; i++) {
        if (path[i].type == 'line')
            simulateLine(path[i]);
        if (path[i].type == 'arc')
            simulateArc(path[i]);
    }
    speedData[0].data.unshift([0, 0]);
    speedData[1].data.unshift([0, 0]);
    speedData[2].data.unshift([0, 0]);
    speedData[3].data.unshift([0, 0]);
    accelerationData[0].data.unshift([0, 0]);
    accelerationData[1].data.unshift([0, 0]);
    accelerationData[2].data.unshift([0, 0]);
    accelerationData[3].data.unshift([0, 0]);
    $.plot("#chart1", posData);
    $.plot("#chart2", speedData);
    $.plot("#chart3", accelerationData);
    return simulatedPath;
}