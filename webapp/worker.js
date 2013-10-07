"use strict";
var $ = {each: function (array, func) {
    for (var i = 0; i < array.length; i++)
        func(i, array[i]);
}, extend: function () {
    /** stolen from JQUERY **/
    var src, copyIsArray, copy, name, options, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && !jQuery.isFunction(target)) {
        target = {};
    }

    // extend jQuery itself if only one argument is passed
    if (length === i) {
        target = this;
        --i;
    }

    for (; i < length; i++) {
        // Only deal with non-null/undefined values
        if ((options = arguments[ i ]) != null) {
            // Extend the base object
            for (name in options) {
                src = target[ name ];
                copy = options[ name ];

                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if (deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) )) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && jQuery.isArray(src) ? src : [];

                    } else {
                        clone = src && jQuery.isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[ name ] = jQuery.extend(deep, clone, copy);

                    // Don't bring in undefined values
                } else if (copy !== undefined) {
                    target[ name ] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
    /** END stolen from JQUERY **/
}
};
importScripts('libs/jsparse.js', 'cnc/geometry.js', 'cnc/parser.js', 'cnc/simulation.js');
function handleFragment(program) {
    var programLength = program.length * 3;
    var formattedData = new ArrayBuffer(programLength + 4);
    new DataView(formattedData).setUint32(0, programLength, true);
    var view = new DataView(formattedData, 4);

    function bin(axis) {
        var xs = axis ? '1' : '0';
        var xd = axis >= 0 ? '1' : '0';
        return '' + xd + xs;
    }

    for (var i = 0; i < program.length; i++) {
        var point = program[i];
        view.setUint16(i * 3, point.time, true);
        var word = '00' + bin(point.dz) + bin(point.dy) + bin(point.dx);
        view.setUint8(i * 3 + 2, parseInt(word, 2), true);
    }
    postMessage(formattedData);
}
var onmessage = function (oEvent) {
    var code = oEvent.data.plan;
    var program = [];

    function stepCollector(point) {
        program.push(point);
        if (program.length >= 30000) {
            handleFragment(program);
            program = [];
        }
    }

    var parameters = oEvent.data.parameters;
    planProgram(code, parameters.maxAcceleration, 1 / parameters.stepsPerMillimeter, parameters.clockFrequency, parameters.position, stepCollector);
    handleFragment(program);
};