"use strict";
define([], function () {
    function createSphericalTool(tool, sampleCount, zRatio, roundDistance) {
        var radiusMM = tool.diameter / 2;
        var samples = [];
        var newRadius = radiusMM + roundDistance;
        for (var i = 0; i < sampleCount; i++) {
            var r = newRadius * i / (sampleCount - 1);
            samples.push((radiusMM - Math.sqrt(newRadius * newRadius - r * r)) * zRatio);
        }
        return samples;
    }

    function createVTool(tool, sampleCount, zRatio, roundDistance) {
        var radiusMM = tool.diameter / 2;
        var angle = 90 - tool.angle / 2;
        var tan = Math.tan(angle / 180 * Math.PI);
        var tipRadius = tool.tipDiameter / 2;
        var samples = [];
        var profileRadius = radiusMM + roundDistance;
        var sampleWidth = profileRadius / (sampleCount - 1);
        for (var i = 0; i <= radiusMM; i += sampleWidth) {
            if (i < tipRadius)
                samples.push(0);
            else
                samples.push((i - tipRadius) * tan * zRatio);
        }
        return roundProfile(samples, sampleCount, roundDistance, radiusMM, zRatio);
    }

    function createCylindricalTool(tool, sampleCount, zRatio, roundDistance) {
        var radiusMM = tool.diameter / 2;
        var samples = [];
        var profileRadius = radiusMM + roundDistance;
        var sampleWidth = profileRadius / (sampleCount - 1);
        for (var i = 0; i <= radiusMM; i += sampleWidth)
            samples.push(0);
        return roundProfile(samples, sampleCount, roundDistance, radiusMM, zRatio);
    }

    function roundProfile(profile, sampleCount, roundDistance, radiusMM, zRatio) {
        var samples = [];
        var sphere = [];
        var profileRadius = (radiusMM + roundDistance);
        var sampleWidth = profileRadius / (sampleCount - 1);
        for (var i = 0; i * sampleWidth <= roundDistance; i++)
            sphere.push(Math.sqrt(roundDistance * roundDistance - i * sampleWidth * i * sampleWidth));
        for (i = 0; i < sampleCount; i++) {
            var sample = +Infinity;
            // don't try strange tool shapes, it *has* to be monotonic, we're using only one quadrant
            for (var j = 0; j < sphere.length; j++) {
                var index = i - j;
                if (index < profile.length && index >= 0)
                    sample = Math.min(sample, profile[index] - sphere[j]);
            }
            samples.push(sample * zRatio);
        }
        return samples;
    }

    var types = {
        cylinder: createCylindricalTool,
        ball: createSphericalTool,
        v: createVTool
    };

    function createTool(tool, sampleCount, zRatio, roundDistance) {
        return types[tool.type](tool, sampleCount, zRatio, roundDistance);
    }

    return {
        createCylindricalTool: createCylindricalTool,
        createSphericalTool: createSphericalTool,
        createVTool: createVTool,
        createTool: createTool
    }
});