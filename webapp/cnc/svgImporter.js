"use strict";

define(['libs/flatten'], function (flatten) {

    function importSVG(svgText) {
        var documentElement = new DOMParser().parseFromString(svgText, "image/svg+xml").documentElement;
        var svgTransform = documentElement.createSVGTransform();
        // inverse the Y, because SVG and milling machine use opposite direction.
        svgTransform.setScale(1, -1);
        var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.transform.baseVal.appendItem(svgTransform);
        var $doc = $(documentElement);
        $doc.children().appendTo($(group));
        $(group).appendTo($doc);
        flatten(documentElement, false, true, false, 20);
        $doc.find('defs').remove();
        return $doc.find('path').map(function () {
            return $(this).attr('d');
        }).get();
    }

    return importSVG;
});