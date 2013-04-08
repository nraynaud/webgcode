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
    function accelerationEq(x) {
        return Math.sqrt(2 * x / acceleration);
    }

    if (length > 2 * accelerationLength) {
        var accelerationDuration = speed / acceleration;
        var constantSpeedDuration = (length - 2 * accelerationLength) / speed;
        if (x <= accelerationLength)
            return accelerationEq(x);
        else if (x <= length - accelerationLength)
            return accelerationDuration + (x - accelerationLength) / speed;
        else
            return 2 * accelerationDuration + constantSpeedDuration - accelerationEq(length - x);
    } else if (x <= length / 2)
        return accelerationEq(x);
    else
        return 2 * Math.sqrt(length / acceleration) - accelerationEq(length - x);
}

function simulate(path) {
    var simulatedPath = [];
    var acceleration = 200; //mm.s^-2

    var posData = [
        {label: 'x position(s->mm)', shadowSize: 0, color: 'red', data: []},
        {label: 'y position(s->mm)', shadowSize: 0, color: 'green', data: []},
        {label: 'z position(s->mm)', shadowSize: 0, color: 'blue', data: []}
    ];

    var speedData = [
        {label: 'x speed(s->mm/s)', shadowSize: 0, color: 'red', data: [
            [0, 0]
        ]},
        {label: 'y speed(s->mm/s)', shadowSize: 0, color: 'green', data: [
            [0, 0]
        ]},
        {label: 'z speed(s->mm/s)', shadowSize: 0, color: 'blue', data: [
            [0, 0]
        ]},
        {label: '|speed|(s->mm/s)', shadowSize: 0, color: 'rgba(0, 0, 0, 0.4)', data: [
            [0, 0]
        ]},
    ];
    var accelerationData = [
        {label: 'x acc(s->mm/s^2)', shadowSize: 0, color: 'red', data: [
            [0, 0]
        ]},
        {label: 'y acc(s->mm/s^2)', shadowSize: 0, color: 'green', data: [
            [0, 0]
        ]},
        {label: 'z acc(s->mm/s^2)', shadowSize: 0, color: 'blue', data: [
            [0, 0]
        ]},
        {label: '|acceleration|(s->mm/s^2)', shadowSize: 0, color: 'rgba(0, 0, 0, 0.4)', data: [
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
            var speedDate = (currentTime + previousDate) / 2;
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
                var accelerationDate = (previousSpeedDate + speedDate) / 2;
                accelerationData[0].data.push([accelerationDate, pDSx / (speedDate - previousSpeedDate)]);
                accelerationData[1].data.push([accelerationDate, pDSy / (speedDate - previousSpeedDate)]);
                accelerationData[2].data.push([accelerationDate, pDSz / (speedDate - previousSpeedDate)]);
                accelerationData[3].data.push([accelerationDate, length(pDSx, pDSy, pDSz) / (speedDate - previousSpeedDate)]);
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

        var segments = 1000;
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
        var arcSegments = 1000;
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
            newPoint[lastCoord] = (arc.from[lastCoord] * (1 - ratio) + arc.to[lastCoord] * ratio);
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
        var radius = arc.radius;
        var len = Math.abs(arc.angularDistance) * radius;
        var maxRadialAcceleration = Math.pow(speed, 2) / radius;
        var maxTangentialAcceleration = Math.sqrt(Math.pow(acceleration, 2) - Math.pow(maxRadialAcceleration, 2));
        for (var j = 1; j <= arcSegments; j++) {
            var ratio = j / arcSegments;
            var position = Math.abs(arc.angularDistance) * ratio * radius;
            currentTime = startTime + timeForX(speed, maxTangentialAcceleration, len, position);
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
    console.log('z', posData[2].data);
    var chart1 = $.plot("#chart1", posData);
    $.plot("#chart2", speedData, {xaxis:{max: chart1.getAxes().xaxis.max}});
    $.plot("#chart3", accelerationData, {xaxis:{max: chart1.getAxes().xaxis.max}});
    return simulatedPath;
}