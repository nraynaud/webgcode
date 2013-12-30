"use strict";

var simulation = (function () {

    function scaledLine(axis, line, ratio) {
        return line.from[axis] + ratio * (line.to[axis] - line.from[axis]);
    }

    var COMPONENT_TYPES = {
        line: {
            length: function (line) {
                function dist(axis) {
                    return line.to[axis] - line.from[axis];
                }

                return util.length(dist('x'), dist('y'), dist('z'));
            },
            speed: function (line, acceleration) {
                return {speed: line.feedRate / 60, acceleration: acceleration};
            },
            entryDirection: function (line) {
                var dx = line.to.x - line.from.x;
                var dy = line.to.y - line.from.y;
                var dz = line.to.z - line.from.z;
                var len = util.length(dx, dy, dz);
                return {x: dx / len, y: dy / len, z: dz / len};
            },
            exitDirection: function (line) {
                return COMPONENT_TYPES.line.entryDirection(line);
            },
            pointAtRatio: function (line, ratio, asObject) {
                var x = scaledLine('x', line, ratio);
                var y = scaledLine('y', line, ratio);
                var z = scaledLine('z', line, ratio);
                return asObject ? {x: x, y: y, z: z} : [x, y, z];
            },
            simulationSteps: function () {
                return 40;
            },
            rasterize: rasterizeLine
        },
        arc: {
            length: function (arc) {
                var lastCoord = arc.plane.lastCoord;
                var lastCoordDistance = arc.to[lastCoord] - arc.from[lastCoord];
                var radius = arc.radius;
                var planarArcLength = arc.angularDistance * radius;
                return util.length(planarArcLength, lastCoordDistance);
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
            pointAtRatio: function (arc, ratio, asObject) {
                var lastCoord = arc.plane.lastCoord;
                var radius = arc.radius;
                var angle = arc.fromAngle + arc.angularDistance * ratio;
                var newPoint = {};
                newPoint[arc.plane.firstCoord] = arc.center.first + radius * Math.cos(angle);
                newPoint[arc.plane.secondCoord] = arc.center.second + radius * Math.sin(angle);
                newPoint[lastCoord] = (arc.from[lastCoord] * (1 - ratio) + arc.to[lastCoord] * ratio);
                return asObject ? newPoint : [newPoint.x, newPoint.y, newPoint.z];
            },
            simulationSteps: function (arc) {
                return Math.round(Math.abs(arc.angularDistance) / (2 * Math.PI) * 50);
            },
            rasterize: rasterizeArc
        }
    };

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

    function areMostlyContinuous(v1, v2) {
        return util.length(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z) >= 1.95;
    }

    function getArcSpeedDirection(arc, angle) {
        var p = arc.plane;
        var rx = Math.cos(arc.fromAngle + angle);
        var ry = Math.sin(arc.fromAngle + angle);
        var dz = (arc.to[p.lastCoord] - arc.from[p.lastCoord]) / Math.abs(arc.angularDistance) / arc.radius;
        var len = util.length(rx, ry, dz);
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

    var FRAGMENT_EQUATIONS = (function () {
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

        function runFragment(fragment, ratio) {
            return {speed: Math.sqrt(fragment.squaredSpeed), time: fragment.duration * ratio};
        }

        return {acceleration: accelerateFragment, deceleration: decelerateFragment, constant: runFragment};
    })();

    function dataForRatio(segment, ratio) {
        var acceleration = segment.maxAcceleration;
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
        var result = FRAGMENT_EQUATIONS[fragment.type](fragment, (x - xOffset) / fragment.length, acceleration);
        return {speed: result.speed, time: timeOffset + result.time};
    }

    function groupConnectedComponents(path, acceleration) {
        var groups = [];
        var currentGroup = null;
        var lastExitDirection = {x: 0, y: 0, z: 0};
        for (var i = 0; i < path.length; i++) {
            var component = path[i];
            var trait = COMPONENT_TYPES[component.type];
            if (areMostlyContinuous(lastExitDirection, trait.entryDirection(component))) {
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

    function simulate2(toolPath, pushPoint) {
        var acceleration = 200; //mm.s^-2
        var groups = groupConnectedComponents(toolPath, acceleration);
        var currentTime = 0;
        var lastPosition;

        function discretize(segment) {
            var type = COMPONENT_TYPES[segment.type];
            var steps = type.simulationSteps(segment);
            var startTime = currentTime;
            for (var j = 1; j <= steps; j++) {
                var ratio = j / steps;
                var data = dataForRatio(segment, ratio);
                currentTime = startTime + data.time;
                internalPushPoint.apply(null, type.pointAtRatio(segment, ratio));
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
            for (var i = 0; i < 10; i++) {
                currentTime += 0.001;
                internalPushPoint.apply(null, lastPosition);
            }
        });
    }

    function planProgram(toolPath, acceleration, stepSize, timebase, stepCollector) {
        var speedFactors = [0, 1, Math.SQRT2, Math.sqrt(3)];
        var groups = groupConnectedComponents(toolPath, acceleration);
        $.each(groups, function (_, group) {
            planSpeed(group);
            $.each(group, function (_, segment) {

                function planningStepCollector(point) {
                    //go slower if we are stepping in diagonals
                    var speedFactor = speedFactors[!!point.dx + !!point.dy + !!point.dz];
                    point.time = Math.ceil(Math.min(0.1, speedFactor * stepSize / dataForRatio(segment, point.l).speed) * timebase);
                    stepCollector(point);
                }

                COMPONENT_TYPES[segment.type].rasterize(segment, stepSize, planningStepCollector);
            });
        });
    }

    return {
        planSpeed: planSpeed,
        simulate2: simulate2,
        planProgram: planProgram
    }
})();