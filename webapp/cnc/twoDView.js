"use strict";

define(['../libs/svg.js'], function () {
    function TwoDView(drawing) {
        this.svg = SVG(drawing[0]).size(drawing.width(), drawing.height());
        this.root = this.svg.group().attr({id: 'root', 'vector-effect': 'non-scaling-stroke'});
        this.background = this.root.group().attr({id: 'background', 'vector-effect': 'non-scaling-stroke'});
        this.paper = this.root.group().attr({id: 'paper', 'vector-effect': 'non-scaling-stroke'});
        var origin = this.background.group().attr({id: 'origin'});
        origin.path('M0,0 L0,10 A 10,10 90 0 0 10,0 Z M0,0 L0,-10 A 10,10 90 0 0 -10,0 Z').attr({stroke: 'none', fill: 'red', transform: null});
        origin.ellipse(20, 20).cx(0).cy(0).attr({stroke: 'red', fill: 'none', transform: null});
        var grid = this.background.group().attr({id: 'grid'});
        for (var i = -600; i <= 600; i += 1) {
            var className = 'mmGrid';
            if (i % 100 == 0) {
                className = 'dmGrid';
            } else if (i % 50 == 0)
                className = 'halfDmGrid';
            else if (i % 10 == 0)
                className = 'cmGrid';
            else if (i % 5 == 0)
                className = 'halfCmGrid';

            if (i % 10 == 0) {
                grid.text('' + i).transform({scaleY: -1}).attr({class: 'gridText ' + className}).x(i).y(0);
                grid.text('' + i).transform({scaleY: -1}).attr({class: 'gridText ' + className}).x(0).y(i);
            }
            grid.line(600, i, -600, i).attr({class: className});
            grid.line(i, 600, i, -600).attr({class: className});
        }
        var self = this;
        drawing.mousewheel(function (event, delta) {
            if (typeof event.offsetX === "undefined" || typeof event.offsetY === "undefined") {
                var targetOffset = $(event.target).offset();
                event.offsetX = event.pageX - targetOffset.left;
                event.offsetY = event.pageY - targetOffset.top;
            }
            var svgRoot = self.root.node;
            var p = self.svg.node.createSVGPoint();
            p.x = event.offsetX;
            p.y = event.offsetY;
            p = p.matrixTransform(svgRoot.getCTM().inverse());
            var k = self.svg.node.createSVGMatrix().translate(p.x, p.y).scale(1 + delta / 360).translate(-p.x, -p.y);
            var m = svgRoot.getCTM().multiply(k);
            if (m.a > 0.4)
                TwoDView.setMatrix(self.root, m);
            event.preventDefault();
        });

        $(window).resize(function resizeSVG() {
            self.svg.size(drawing.width(), drawing.height());
        });
    }

    TwoDView.setMatrix = function (element, matrix) {
        if (matrix.a < 20)
            $('.mmGrid').hide();
        else
            $('.mmGrid').show();

        if (matrix.a < 15)
            $('.halfCmGrid').hide();
        else
            $('.halfCmGrid').show();
        if (matrix.a < 5)
            $('.cmGrid').hide();
        else
            $('.cmGrid').show();
        if (matrix.a < 2.5)
            $('.halfDmGrid').hide();
        else
            $('.halfDmGrid').show();
        var components = $.map('abcdef'.split(''),function (c) {
            return matrix[c];
        }).join(',');
        element.attr({transform: 'matrix(' + components + ')'});
    };

    TwoDView.prototype = {
        clear: function () {
            this.paper.clear();
        },
        zoomExtent: function () {
            var paper = this.paper;
            var box = paper.bbox();
            var m = this.root.node.getCTM();
            var svg = this.svg.node;
            var newScale = Math.min(svg.width.baseVal.value / box.width, svg.height.baseVal.value / box.height) * 0.9;
            newScale = isFinite(newScale) ? newScale : 1;
            newScale = Math.abs(newScale);
            m.a = newScale;
            m.d = -newScale;
            m.e = -box.x + box.width * 0.25;
            m.f = -(-box.y + box.height * 0.5 - svg.height.baseVal.value);
            TwoDView.setMatrix(this.root, m);
        }
    };

    return {TwoDView: TwoDView};
});

