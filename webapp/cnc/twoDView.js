"use strict";

define(['../libs/svg.js'], function () {
    function TwoDView(drawing) {
        //for firefox reason I added that
        //https://bugzilla.mozilla.org/show_bug.cgi?id=479058
        //http://stackoverflow.com/questions/15629183/svg-offset-issue-in-firefox
        var inserted = $('<div></div>');
        inserted.css('top', '0');
        drawing.append(inserted);
        this.svg = SVG(inserted[0]).size(drawing.width(), drawing.height());
        this.root = this.svg.group().attr({id: 'root', 'vector-effect': 'non-scaling-stroke'});
        this.background = this.root.group().attr({id: 'background', 'vector-effect': 'non-scaling-stroke'});
        this.paper = this.root.group().attr({id: 'paper', 'vector-effect': 'non-scaling-stroke'});
        var origin = this.background.group().attr({id: 'origin'});
        origin.path('M0,0 L0,10 A 10,10 90 0 0 10,0 Z M0,0 L0,-10 A 10,10 90 0 0 -10,0 Z').attr({stroke: 'none', fill: 'red', transform: null});
        origin.ellipse(20, 20).cx(0).cy(0).attr({stroke: 'red', fill: 'none', transform: null});
        var grid = this.background.group().attr({id: 'grid'});
        var dmGrid = grid.group().attr({id: 'dmGrid'});
        var halfDmGrid = dmGrid.group().attr({id: 'halfDmGrid'});
        var cmGrid = halfDmGrid.group().attr({id: 'cmGrid'});
        var halfCmGrid = cmGrid.group().attr({id: 'halfCmGrid'});
        var mmGrid = cmGrid.group().attr({id: 'mmGrid'});
        this.gridStack = [
            [20, $(mmGrid.node)],
            [15, $(halfCmGrid.node)],
            [5, $(cmGrid.node)],
            [2.5, $(halfDmGrid.node)]
        ];
        for (var i = -600; i <= 600; i += 1) {
            var group = mmGrid;
            if (i % 100 == 0)
                group = dmGrid;
            else if (i % 50 == 0)
                group = halfDmGrid;
            else if (i % 10 == 0)
                group = cmGrid;
            else if (i % 5 == 0)
                group = halfCmGrid;
            if (i % 10 == 0) {
                group.text('' + i).transform({scaleY: -1}).attr({class: 'gridText '}).x(i).y(0);
                group.text('' + i).transform({scaleY: -1}).attr({class: 'gridText '}).x(0).y(i);
            }
            group.line(600, i, -600, i);
            group.line(i, 600, i, -600);
        }
        var self = this;
        drawing.mousewheel(function (event, delta, deltaX, deltaY) {
            //can't use offset with SVG in FF  http://stackoverflow.com/questions/15629183/svg-offset-issue-in-firefox
            var targetOffset = inserted.offset();
            var px = event.pageX - targetOffset.left;
            var py = event.pageY - targetOffset.top;
            var svgRoot = self.root.node;
            var p = self.svg.node.createSVGPoint();
            p.x = px;
            p.y = py;
            p = p.matrixTransform(svgRoot.getCTM().inverse());
            var k = self.svg.node.createSVGMatrix().translate(p.x, p.y).scale(1 + deltaY / 360).translate(-p.x, -p.y);
            var m = svgRoot.getCTM().multiply(k);
            if (m.a > 0.4)
                self.setMatrix(self.root, m);
            event.preventDefault();
        });

        $(window).resize(function resizeSVG() {
            self.svg.size(drawing.width(), drawing.height());
        });
    }

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
            this.setMatrix(this.root, m);
        },
        setMatrix: function (element, matrix) {
            for (var i = 0; i < this.gridStack.length; i++)
                this.gridStack[i][1].css('visibility', matrix.a < this.gridStack[i][0] ? 'hidden' : 'visible');
            var components = $.map('abcdef'.split(''),function (c) {
                return matrix[c];
            }).join(',');
            element.attr({transform: 'matrix(' + components + ')'});
        }
    };

    return {TwoDView: TwoDView};
});

