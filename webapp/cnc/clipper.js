"use strict";
// just re-wrap clipper in a local way
define(['libs/clipper_unminified'], function () {
    var localClipper = ClipperLib;
    ClipperLib = undefined;
    return localClipper;
});