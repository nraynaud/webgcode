"use strict";

define(['libs/flatten'], function (flatten) {

    function importSVG(svgText) {
        var documentElement = new DOMParser().parseFromString(svgText, "image/svg+xml").documentElement;
        var $doc = $(documentElement);
        flatten(documentElement, false, true, false, 20);
        $doc.find('defs').remove();
        return $doc.find('path').map(function () {
            return $(this).attr('d');
        }).get();
    }

    return importSVG;
});