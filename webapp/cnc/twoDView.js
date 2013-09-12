"use strict";

function TwoDView(drawing) {
    this.svg = SVG(drawing[0]).size(drawing.width(), drawing.height());
    this.paper = this.svg.group().attr({id: 'root', 'vector-effect': 'non-scaling-stroke'});

    var self = this;
    drawing.mousewheel(function (event, delta) {
        if (typeof event.offsetX === "undefined" || typeof event.offsetY === "undefined") {
            var targetOffset = $(event.target).offset();
            event.offsetX = event.pageX - targetOffset.left;
            event.offsetY = event.pageY - targetOffset.top;
        }
        var svgRoot = self.paper.node;
        var p = self.svg.node.createSVGPoint();
        p.x = event.offsetX;
        p.y = event.offsetY;
        p = p.matrixTransform(svgRoot.getCTM().inverse());
        var k = self.svg.node.createSVGMatrix().translate(p.x, p.y).scale(1 + delta / 360).translate(-p.x, -p.y);
        var m = svgRoot.getCTM().multiply(k);
        TwoDView.setMatrix(self.paper, m);
        event.preventDefault();
    });

    $(window).resize(function resizeSVG() {
        self.svg.size(drawing.width(), drawing.height());
    });
}

TwoDView.setMatrix = function (element, matrix) {
    var components = $.map('abcdef'.split(''),function (c) {
        return matrix[c];
    }).join(',');
    element.attr({transform: 'matrix(' + components + ')'});
};

TwoDView.prototype.clear = function () {
    this.paper.clear();
};

TwoDView.prototype.zoomExtent = function () {
    var paper = this.paper;
    var box = paper.bbox();
    var m = paper.node.getCTM();
    var svg = this.svg.node;
    var newScale = Math.min(svg.width.baseVal.value / box.width, svg.height.baseVal.value / box.height) * 0.9;
    m.a = newScale;
    m.d = -newScale;
    m.e = -box.x + box.width * 0.25;
    m.f = -(-box.y + box.height * 0.5 - svg.height.baseVal.value);
    TwoDView.setMatrix(paper, m);
};