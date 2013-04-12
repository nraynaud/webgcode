"use strict";

function displayPath(path, color, id) {
    var indexes = [];
    var points = [];
    for (var i = 0; i < path.length; i++) {
        indexes.push(i);
        var p = path[i];
        points.push([p.x.toFixed(2), p.y.toFixed(2), p.z.toFixed(2)].join(' '));
    }
    indexes.push(-1);
    var lineset = $('<IndexedLineSet></IndexedLineSet>');
    var coordinates = $('<Coordinate></Coordinate>');
    lineset.attr('coordIndex', indexes.join(' '));
    coordinates.attr('point', points.join(', '));
    lineset.append(coordinates);
    $('#toolpath').remove();
    $('#scene').append($('<Shape id="' + id + '"></Shape>')
        .append("<Appearance><Material emissiveColor='" + color + "'/></Appearance>")
        .append(lineset));
}

function displayVector(origin, vector, color, id) {
    displayPath([origin, {x: origin.x + vector.x, y: origin.y + vector.y, z: origin.z + vector.z}], color, id);
}

function accelerationLength(initialSpeed, finalSpeed, acceleration) {
    if (initialSpeed == 0)
        return finalSpeed * finalSpeed / (2 * acceleration);
    return Math.abs(accelerationLength(0, finalSpeed, acceleration) - accelerationLength(0, initialSpeed, acceleration));
}

function timeForXTrapezoidal(speed, acceleration, length, x, entrySpeed, exitSpeed, initialAccelerationLength, finalAccelerationLength, initialAccelerationDuration, finalAccelerationDuration, constantSpeedDuration) {
    function accelerationEq(x) {
        return Math.sqrt(2 * x / acceleration);
    }

    if (x <= initialAccelerationLength) {
        var nx1 = accelerationLength(0, entrySpeed, acceleration) + x;
        return accelerationEq(nx1) - (entrySpeed / acceleration);
    } else if (x <= length - finalAccelerationLength)
        return initialAccelerationDuration + (x - initialAccelerationLength) / speed;
    else {
        if (x === length)
            return initialAccelerationDuration + constantSpeedDuration + finalAccelerationDuration;
        var nx = x - (length - finalAccelerationLength);
        var x2 = accelerationLength(0, speed, acceleration);
        return initialAccelerationDuration + constantSpeedDuration + accelerationEq(x2) - accelerationEq(x2 - nx);
    }
}

function arcClampedSpeed(radius, speed, acceleration) {
    var maxRadialAcceleration = Math.pow(speed, 2) / radius;
    var reductionFactor = 0.8;
    if (maxRadialAcceleration > acceleration * reductionFactor) {
        //constant speed would already create a too big radial acceleration, reducing speed.
        speed = Math.sqrt(acceleration * reductionFactor * radius);
        maxRadialAcceleration = Math.pow(speed, 2) / radius;
    }
    var maxTangentialAcceleration = Math.sqrt(Math.pow(acceleration, 2) - Math.pow(maxRadialAcceleration, 2));
    return {speed: speed, acceleration: maxTangentialAcceleration};
}

function areEqualVectors(v1, v2) {
    return length(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z) < 0.000001;
}

function getArcSpeedDirection(arc, angle) {
    var p = arc.plane;
    var rx = Math.cos(arc.fromAngle + angle);
    var ry = Math.sin(arc.fromAngle + angle);
    var dz = (arc.to[p.lastCoord] - arc.from[p.lastCoord]) / Math.abs(arc.angularDistance) / arc.radius;
    var len = length(rx, ry, dz);
    var direction = arc.angularDistance >= 0 ? 1 : -1;
    return {x: -direction * ry / len, y: direction * rx / len, z: dz / len};
}

function simulate2(path, pushPoint) {
    var acceleration = 200; //mm.s^-2
    for (var i = 0; i < path.length; i++) {
        var component = path[i];
        if (component.type == 'line') {
            var dx = component.to.x - component.from.x;
            var dy = component.to.y - component.from.y;
            var dz = component.to.z - component.from.z;
            var len = length(dx, dy, dz);
            var direction = {x: dx / len, y: dy / len, z: dz / len};
            component.entryDirection = direction;
            component.exitDirection = direction;
            component.idealEntrySpeed = component.feedRate / 60;
        } else if (component.type == 'arc') {
            var entry = getArcSpeedDirection(component, 0);
            var exit = getArcSpeedDirection(component, component.angularDistance);
            component.entryDirection = entry;
            component.exitDirection = exit;
            component.idealEntrySpeed = arcClampedSpeed(component.radius, component.feedRate / 60, acceleration).speed;
        } else
            console.log('unknown', component);
    }

    var currentTime = 0;

    function discretize(pushPointFunction, targetSpeed, acceleration, len, entrySpeed, nextSegmentSpeed) {
        if (nextSegmentSpeed > targetSpeed)
            nextSegmentSpeed = targetSpeed;


        var maxSpeedChange = Math.sqrt(2 * acceleration * len);
        if (Math.abs(nextSegmentSpeed - entrySpeed) > maxSpeedChange)
            nextSegmentSpeed = entrySpeed + maxSpeedChange * (entrySpeed > nextSegmentSpeed ? -1 : 1);

        // if we where to accelerate as much as possible and brake, where should we start braking ?
        var accelerateDecelerateLength = (len * acceleration - Math.abs(entrySpeed - nextSegmentSpeed)) / (2 * acceleration);
        var accelerateDecelerateMaxSpeed = Math.sqrt(2 * acceleration * accelerateDecelerateLength);
        if (accelerateDecelerateMaxSpeed < targetSpeed) {
            console.log('max speed', targetSpeed, '->', accelerateDecelerateMaxSpeed);
            targetSpeed = accelerateDecelerateMaxSpeed;
        }
        if (nextSegmentSpeed > targetSpeed)
            nextSegmentSpeed = targetSpeed;
        var segments = 1000;
        var startTime = currentTime;
        var deltaSpeed = targetSpeed - entrySpeed;
        var initialAccelerationLength = accelerationLength(entrySpeed, targetSpeed, acceleration);
        var initialAccelerationDuration = Math.abs(deltaSpeed / acceleration);
        var finalAccelerationLength = accelerationLength(targetSpeed, nextSegmentSpeed, acceleration);
        var finalAccelerationDuration = (targetSpeed - nextSegmentSpeed) / acceleration;
        var constantSpeedDuration = (len - initialAccelerationLength - finalAccelerationLength) / targetSpeed;
        for (var j = 1; j <= segments; j++) {
            var ratio = j / segments;
            var time = timeForXTrapezoidal(targetSpeed, acceleration, len, ratio * len, entrySpeed, nextSegmentSpeed,
                initialAccelerationLength, finalAccelerationLength, initialAccelerationDuration, finalAccelerationDuration, constantSpeedDuration);
            currentTime = startTime + time;
            pushPointFunction(ratio);
        }
        return nextSegmentSpeed;
    }

    function simulateLine(line, entrySpeed, nextSegmentSpeed) {
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
            pushPoint(p0['x'] + ratio * dx, p0['y'] + ratio * dy, p0['z'] + ratio * dz, currentTime);
        }

        if (nextSegmentSpeed > speed)
            nextSegmentSpeed = speed;
        return discretize(pushPointAtRatio, speed, acceleration, len, entrySpeed, nextSegmentSpeed);
    }

    function simulateArc(arc, entrySpeed, nextSegmentSpeed) {
        var speed = arc.feedRate / 60;
        var lastCoord = arc.plane.lastCoord;
        var lastCoordDistance = arc.to[lastCoord] - arc.from[lastCoord];
        var radius = arc.radius;
        var planarArcLength = arc.angularDistance * radius;
        var arcLength = length(planarArcLength, lastCoordDistance);

        function pushPointAtRatio(ratio) {
            var angle = arc.fromAngle + arc.angularDistance * ratio;
            var newPoint = {};
            newPoint[arc.plane.firstCoord] = arc.center.first + radius * Math.cos(angle);
            newPoint[arc.plane.secondCoord] = arc.center.second + radius * Math.sin(angle);
            newPoint[lastCoord] = (arc.from[lastCoord] * (1 - ratio) + arc.to[lastCoord] * ratio);
            pushPoint(newPoint['x'], newPoint['y'], newPoint['z'], currentTime);
        }

        var clamped = arcClampedSpeed(radius, speed, acceleration);
        if (clamped.speed != speed)
            console.log("reducing speed in arc", speed, '->', clamped.speed);
        if (nextSegmentSpeed > clamped.speed)
            nextSegmentSpeed = clamped.speed;
        return discretize(pushPointAtRatio, clamped.speed, clamped.acceleration, arcLength, entrySpeed, nextSegmentSpeed);
    }

    pushPoint(0, 0, 0, 0);
    var previousSegmentSpeed = 0;
    for (var i = 0; i < path.length; i++) {
        var nextSegmentSpeed = 0;
        if (i < path.length - 1)
            if (areEqualVectors(path[i].exitDirection, path[i + 1].entryDirection))
                nextSegmentSpeed = path[i + 1].idealEntrySpeed;

        if (path[i].type == 'line')
            previousSegmentSpeed = simulateLine(path[i], previousSegmentSpeed, nextSegmentSpeed);
        if (path[i].type == 'arc')
            previousSegmentSpeed = simulateArc(path[i], previousSegmentSpeed, nextSegmentSpeed);
    }
}

function simulate(path) {

    var simulatedPath = [];
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
        ]}
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

    function pushPoint(x, y, z, t) {
        posData[0].data.push([t, x]);
        posData[1].data.push([t, y]);
        posData[2].data.push([t, z]);
        simulatedPath.push({x: x, y: y, z: z});
        var previous = posData[0].data.length - 2;
        if (previous >= 0) {
            var previousDate = posData[0].data[previous][0];
            var dt = t - previousDate;
            var speedDate = (t + previousDate) / 2;
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

    simulate2(path, pushPoint);

    console.log("path", path);
    var chart1 = $.plot("#chart1", posData);
    $.plot("#chart2", speedData, {xaxis: {max: chart1.getAxes().xaxis.max}});
    $.plot("#chart3", accelerationData, {xaxis: {max: chart1.getAxes().xaxis.max}});
    return simulatedPath;
}