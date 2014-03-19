"use strict";
define({
    //variadic, just pass x,y,z ...
    length: function () {
        var squaredSum = 0;
        for (var i = 0; i < arguments.length; i++)
            squaredSum += arguments[i] * arguments[i];
        return Math.sqrt(squaredSum);
    },
    AXES: ['x', 'y', 'z']
});