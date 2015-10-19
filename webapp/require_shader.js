'use strict';
define(['module', 'text', 'text!shaders/library.frag'], function (module, text, fragmentLibrary) {
    return {
        load: function (name, parentRequire, onload, config) {
            text.load('shaders/' + name, parentRequire, function (result) {
                onload(result.replace('/*INCLUDE_FRAGLIB*/', fragmentLibrary));
            }, config);
        }
    }
});