"use strict";
define(['cnc/util', 'cnc/gcode/geometry'], function (util, geometry) {

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
                var dp = line.to.sub(line.from);
                return dp.scale(1 / dp.distance());
            },
            exitDirection: function (line) {
                return COMPONENT_TYPES.line.entryDirection(line);
            },
            simulationSteps: function () {
                return 40;
            },
            rasterize: geometry.rasterizeLine
        },
        arc: {
            length: function (arc) {
                var lastCoord = arc.plane.lastCoord;
                var planarArcLength = arc.angularDistance * arc.radius;
                return util.length(planarArcLength, arc.to[lastCoord] - arc.from[lastCoord]);
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
                var newPoint = new util.Point();
                newPoint[arc.plane.firstCoord] = arc.center.first + radius * Math.cos(angle);
                newPoint[arc.plane.secondCoord] = arc.center.second + radius * Math.sin(angle);
                newPoint[lastCoord] = (arc.from[lastCoord] * (1 - ratio) + arc.to[lastCoord] * ratio);
                return newPoint;
            },
            simulationSteps: function (arc) {
                return Math.round(Math.abs(arc.angularDistance) / (2 * Math.PI) * 50);
            },
            rasterize: function (arc, stepSize, stepCollector) {
                geometry.rasterizeArc(arc, stepSize, stepCollector, function (ratio) {
                    return COMPONENT_TYPES.arc.pointAtRatio(arc, ratio);
                })
            }
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
        return new util.Point(-direction * ry / len, direction * rx / len, dz / len);
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
                segment.fragments.push({
                    type: 'acceleration',
                    segment: segment,
                    fromSqSpeed: previousSquaredSpeed,
                    toSqSpeed: maxSquaredSpeed,
                    startX: 0,
                    stopX: endAccelerationPoint
                });
            var constantSpeedStart = hasAcceleration ? endAccelerationPoint : 0;
            var constantSpeedStop = hasDeceleration ? startDecelerationPoint : segment.length;
            if (constantSpeedStart != constantSpeedStop)
                segment.fragments.push({
                    type: 'constant',
                    segment: segment,
                    squaredSpeed: maxSquaredSpeed,
                    startX: constantSpeedStart,
                    stopX: constantSpeedStop
                });
            if (hasDeceleration)
                segment.fragments.push({
                    type: 'deceleration',
                    segment: segment,
                    fromSqSpeed: maxSquaredSpeed,
                    toSqSpeed: nextSquaredSpeed,
                    startX: startDecelerationPoint,
                    stopX: segment.length
                });
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
            return {
                speed: Math.sqrt(acceleration * x2),
                time: Math.sqrt(x2 / acceleration) - Math.sqrt(fragment.fromSqSpeed) / acceleration
            };
        }

        function decelerateFragment(fragment, ratio, acceleration) {
            var x2 = 2 * (fragment.segment.deceleration.length + fragment.length * (1 - ratio));
            return {
                speed: Math.sqrt(acceleration * x2),
                time: Math.sqrt(fragment.toSqSpeed) / acceleration + fragment.duration - Math.sqrt(x2 / acceleration)
            };
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
        //clamp to 1 because floats sometimes go away
        var result = FRAGMENT_EQUATIONS[fragment.type](fragment, Math.min(1, (x - xOffset) / fragment.length), acceleration);
        return {speed: result.speed, time: timeOffset + result.time};
    }

    function groupConnectedComponents(path, acceleration) {
        var groups = [];
        var currentGroup = null;
        var lastExitDirection = new util.Point(0, 0, 0);
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

    function simulate2(toolPath, pushPointXYZ) {
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
                internalPushPoint(type.pointAtRatio(segment, ratio), segment);
            }
        }

        function internalPushPoint(point, segment) {
            lastPosition = point;
            pushPointXYZ(point[0], point[1], point[2], currentTime, segment);
        }

        internalPushPoint([0, 0, 0], groups[0][0]);
        $.each(groups, function (_, group) {
            planSpeed(group);
            $.each(group, function (_, segment) {
                discretize(segment);
            });
            for (var i = 0; i < 10; i++) {
                currentTime += 0.001;
                internalPushPoint(lastPosition, group[group.length - 1]);
            }
        });
    }

    function planProgram(toolPath, acceleration, stepSize, timebase, stepCollector) {
        var speedFactors = [0, 1, Math.SQRT2, Math.sqrt(3)];
        var groups = groupConnectedComponents(toolPath, acceleration);
        $.each(groups, function (_, group) {
            planSpeed(group);
            $.each(group, function (_, segment) {
                function planningStepCollector(dx, dy, dz, ratio) {
                    //go slower if we are stepping in diagonals
                    var speedFactor = speedFactors[!!dx + !!dy + !!dz];
                    var time = Math.ceil(timebase * speedFactor * stepSize / dataForRatio(segment, ratio).speed);
                    stepCollector(dx, dy, dz, time);
                }

                COMPONENT_TYPES[segment.type].rasterize(segment, stepSize, planningStepCollector);
            });
        });
    }

    function collectToolpathInfo(toolpath) {
        var totalTime = 0;
        var bBox = new util.BoundingBox();

        function pushPointXYZ(x, y, z, t) {
            totalTime = Math.max(t, totalTime);
            bBox.pushCoordinates(x, y, z);
        }

        if (toolpath.length)
            simulate2(toolpath, pushPointXYZ);
        return {totalTime: totalTime, min: bBox.minPoint(), max: bBox.maxPoint()};
    }

    return {
        planSpeed: planSpeed,
        simulate2: simulate2,
        collectToolpathInfo: collectToolpathInfo,
        planProgram: planProgram,
        COMPONENT_TYPES: COMPONENT_TYPES
    }
});