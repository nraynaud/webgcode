"use strict";

var COMPONENT_TYPES = {
    line: {
        length: function (line) {
            function dist(axis) {
                return line.to[axis] - line.from[axis];
            }

            return length(dist('x'), dist('y'), dist('z'));
        },
        speed: function (line, acceleration) {
            return {speed: line.feedRate / 60, acceleration: acceleration};
        },
        entryDirection: function (line) {
            var dx = line.to.x - line.from.x;
            var dy = line.to.y - line.from.y;
            var dz = line.to.z - line.from.z;
            var len = length(dx, dy, dz);
            return {x: dx / len, y: dy / len, z: dz / len};
        },
        exitDirection: function (line) {
            return COMPONENT_TYPES.line.entryDirection(line);
        },
        pointAtRatio: function (line, ratio) {
            function scaled(axis) {
                return line.from[axis] + ratio * (line.to[axis] - line.from[axis]);
            }

            return [scaled('x'), scaled('y'), scaled('z')];
        }
    },
    arc: {
        length: function (arc) {
            var lastCoord = arc.plane.lastCoord;
            var lastCoordDistance = arc.to[lastCoord] - arc.from[lastCoord];
            var radius = arc.radius;
            var planarArcLength = arc.angularDistance * radius;
            return length(planarArcLength, lastCoordDistance);
        },
        speed: function (arc, acceleration) {
            return arcClampedSpeed(arc.radius, arc.feedRate / 60, acceleration);
        },
        entryDirection: function (arc) {
            return getArcSpeedDirection(arc, 0);
        },
        exitDirection: function (arc) {
            return getArcSpeedDirection(arc, arc.angularDistance);
        },
        pointAtRatio: function (arc, ratio) {
            var lastCoord = arc.plane.lastCoord;
            var radius = arc.radius;
            var angle = arc.fromAngle + arc.angularDistance * ratio;
            var newPoint = {};
            newPoint[arc.plane.firstCoord] = arc.center.first + radius * Math.cos(angle);
            newPoint[arc.plane.secondCoord] = arc.center.second + radius * Math.sin(angle);
            newPoint[lastCoord] = (arc.from[lastCoord] * (1 - ratio) + arc.to[lastCoord] * ratio);
            return [newPoint.x, newPoint.y, newPoint.z];
        }
    }
};

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

function limitSpeed(speedSegments, direction) {
    for (var i = 0; i < speedSegments.length; i++) {
        var segment = speedSegments[i];
        var acceleration = segment.maxAcceleration;
        var previousSquaredSpeed = 0;
        if (i > 0)
            previousSquaredSpeed = speedSegments[i - 1].squaredSpeed;
        var accelerationLength = previousSquaredSpeed / (2 * acceleration);
        var maxSquaredSpeed = 2 * acceleration * (accelerationLength + segment.length);
        segment.squaredSpeed = Math.min(segment.squaredSpeed, maxSquaredSpeed);
        segment[direction] = {length: previousSquaredSpeed / (2 * acceleration)};
    }
}

function planSpeed(data) {
    limitSpeed(data, 'acceleration');
    data.reverse();
    limitSpeed(data, 'deceleration');
    data.reverse();
    for (var i = 0; i < data.length; i++) {
        var nextSquaredSpeed = (i < data.length - 1 ? data[i + 1].squaredSpeed : 0);
        var previousSquaredSpeed = (i >= 1 ? data[i - 1].squaredSpeed : 0);
        var segment = data[i];
        segment.fragments = [];
        var acceleration = segment.maxAcceleration;
        var accelerationLength = segment.acceleration.length;
        var decelerationLength = segment.deceleration.length;
        var meetingPoint = (decelerationLength + segment.length - accelerationLength) / 2;
        var meetingSquaredSpeed = 2 * acceleration * (accelerationLength + meetingPoint);
        var endAccelerationPoint = (segment.squaredSpeed - 2 * acceleration * accelerationLength) / (2 * acceleration);
        var startDecelerationPoint = (2 * acceleration * (decelerationLength + segment.length) - segment.squaredSpeed) / (2 * acceleration);
        var maxSquaredSpeed = segment.squaredSpeed;
        if (meetingPoint >= 0 && meetingPoint <= segment.length && meetingSquaredSpeed <= segment.squaredSpeed) {
            maxSquaredSpeed = meetingSquaredSpeed;
            endAccelerationPoint = meetingPoint;
            startDecelerationPoint = meetingPoint;
            segment.squaredSpeed = meetingSquaredSpeed;
        }
        var hasAcceleration = endAccelerationPoint > 0 && endAccelerationPoint <= segment.length;
        var hasDeceleration = startDecelerationPoint >= 0 && startDecelerationPoint < segment.length;
        if (hasAcceleration)
            segment.fragments.push({type: 'acceleration', segment: segment, fromSqSpeed: previousSquaredSpeed, toSqSpeed: maxSquaredSpeed, startX: 0, stopX: endAccelerationPoint});
        var constantSpeedStart = hasAcceleration ? endAccelerationPoint : 0;
        var constantSpeedStop = hasDeceleration ? startDecelerationPoint : segment.length;
        if (constantSpeedStart != constantSpeedStop)
            segment.fragments.push({type: 'constant', segment: segment, squaredSpeed: maxSquaredSpeed, startX: constantSpeedStart, stopX: constantSpeedStop});
        if (hasDeceleration)
            segment.fragments.push({type: 'deceleration', segment: segment, fromSqSpeed: maxSquaredSpeed, toSqSpeed: nextSquaredSpeed, startX: startDecelerationPoint, stopX: segment.length});
        segment.duration = 0;
        $.each(segment.fragments, function (_, fragment) {
            fragment.length = fragment.stopX - fragment.startX;
            fragment.duration = fragment.type == 'constant' ? fragment.length / Math.sqrt(fragment.squaredSpeed) : Math.abs(Math.sqrt(fragment.fromSqSpeed) - Math.sqrt(fragment.toSqSpeed)) / acceleration;
            segment.duration += fragment.duration;
        });
    }
}
function dataForRatio(segment, ratio) {
    var acceleration = segment.maxAcceleration;

    function accelerateFragment(fragment, ratio, acceleration) {
        var x2 = 2 * (fragment.segment.acceleration.length + fragment.length * ratio);
        return {speed: Math.sqrt(acceleration * x2),
            time: Math.sqrt(x2 / acceleration) - Math.sqrt(fragment.fromSqSpeed) / acceleration};
    }

    function decelerateFragment(fragment, ratio, acceleration) {
        var x2 = 2 * (fragment.segment.deceleration.length + fragment.length * (1 - ratio));
        return {speed: Math.sqrt(acceleration * x2),
            time: Math.sqrt(fragment.toSqSpeed) / acceleration + fragment.duration - Math.sqrt(x2 / acceleration)};
    }

    function runFragment(fragment, ratio, acceleration) {
        return {speed: Math.sqrt(fragment.squaredSpeed), time: fragment.duration * ratio};
    }

    var equations = {acceleration: accelerateFragment, deceleration: decelerateFragment, constant: runFragment};
    var x = segment.length * ratio;
    var timeOffset = 0;
    var xOffset = 0;
    var fragmentIndex = 0;
    var fragment = segment.fragments[fragmentIndex];
    while (fragment.stopX < x) {
        timeOffset += fragment.duration;
        xOffset += fragment.length;
        fragmentIndex++;
        fragment = segment.fragments[fragmentIndex];
    }
    var result = equations[fragment.type](fragment, (x - xOffset) / fragment.length, acceleration);
    return {speed: result.speed, time: timeOffset + result.time};
}
function groupConnectedComponents(path, acceleration) {
    var groups = [];
    var currentGroup = null;
    var lastExitDirection = {x: 0, y: 0, z: 0};
    for (var i = 0; i < path.length; i++) {
        var component = path[i];
        var trait = COMPONENT_TYPES[component.type];
        if (areEqualVectors(lastExitDirection, trait.entryDirection(component))) {
            currentGroup.push(component);
        } else {
            currentGroup = [component];
            groups.push(currentGroup);
        }
        lastExitDirection = trait.exitDirection(component);
        component.length = trait.length(component);
        var speedData = trait.speed(component, acceleration);
        component.squaredSpeed = Math.pow(speedData.speed, 2);
        component.maxAcceleration = speedData.acceleration;
    }
    return groups;
}

function simulate2(path, pushPoint) {
    var acceleration = 200; //mm.s^-2
    var i;
    var groups = groupConnectedComponents(path, acceleration);

    var currentTime = 0;
    var lastPosition;

    function discretize(segment) {
        var steps = 300;
        var startTime = currentTime;
        for (var j = 1; j <= steps; j++) {
            var ratio = j / steps;
            var data = dataForRatio(segment, ratio);
            currentTime = startTime + data.time;
            internalPushPoint.apply(null, COMPONENT_TYPES[segment.type].pointAtRatio(segment, ratio));
        }
    }

    function internalPushPoint(x, y, z) {
        lastPosition = [x, y, z];
        pushPoint(x, y, z, currentTime);
    }

    internalPushPoint(0, 0, 0);
    $.each(groups, function (_, group) {
        planSpeed(group);
        $.each(group, function (_, segment) {
            discretize(segment);
        });
        for (i = 0; i < 10; i++) {
            currentTime += 0.001;
            internalPushPoint.apply(null, lastPosition);
        }
    });
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