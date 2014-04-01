"use strict";

define(['libs/svg'], function () {
    var EmberTwoDView = Ember.Object.extend({
        init: function () {
            //for firefox reasons I added an enclosing <div class="TwoDView"> of the same size as the <svg>
            //https://bugzilla.mozilla.org/show_bug.cgi?id=479058
            //http://stackoverflow.com/questions/15629183/svg-offset-issue-in-firefox
            var element = this.get('element');
            var svg = SVG(element[0]).attr({width: null, height: null});
            this.set('svg', svg);
            var root = svg.group().attr({class: 'root', 'vector-effect': 'non-scaling-stroke'});
            this.set('root', root);
            root.node.transform.baseVal.initialize(svg.node.createSVGTransform());
            this.set('background', root.group().attr({class: 'background'}));
            this.set('paper', root.group().attr({class: 'paper'}));
            svg.defs().pattern(6, 6,function () {
                var group = this.group();
                group.rect(6, 6).x(0).y(0);
                group.line(-1, 5, 7, 13);
                group.line(-1, 2, 7, 10);
                group.line(-1, -1, 7, 7);
                group.line(-1, -4, 7, 4);
                group.line(-1, -7, 7, 1);
            }).attr({id: 'computingFill'});
            var origin = this.get('background').group().attr({class: 'origin'});
            origin.path('M0,0 L0,10 A 10,10 90 0 0 10,0 Z M0,0 L0,-10 A 10,10 90 0 0 -10,0 Z').attr({stroke: 'none', fill: 'red', transform: null});
            origin.ellipse(20, 20).cx(0).cy(0).attr({stroke: 'red', fill: 'none', transform: null});
            this.createGrid();
            var _this = this;

            element.mousewheel(function (event, delta, deltaX, deltaY) {
                var pos = _this.getModelPositionForPageXY(event.pageX, event.pageY);
                var k = svg.node.createSVGMatrix().translate(pos.x, pos.y).scale(1 + deltaY / 360).translate(-pos.x, -pos.y);
                var m = _this.getCTM().multiply(k);
                if (m.a > 0.4)
                    _this.setMatrix(m);
                event.preventDefault();
            });

            element.mousedown(function (event) {
                if (event.which != 1)
                    return;
                var m = _this.getCTM();
                var pos = _this.getModelPositionForPageXY(event.pageX, event.pageY, m);
                _this.set('mouseDownStartCondition', {x: event.pageX, y: event.pageY, matrix: m, modelPos: pos});
            });
            element.mouseup(function () {
                _this.set('mouseDownStartCondition', null);
            });
            element.mouseleave(function () {
                _this.set('mouseDownStartCondition', null);
            });
            element.mousemove(function (event) {
                if (_this.mouseDownStartCondition) {
                    var formerPosition = _this.get('mouseDownStartCondition').modelPos;
                    var newPosition = _this.getModelPositionForPageXY(event.pageX, event.pageY, _this.get('mouseDownStartCondition').matrix);
                    _this.setMatrix(_this.get('mouseDownStartCondition').matrix.translate(newPosition.x - formerPosition.x, newPosition.y - formerPosition.y));
                }
            });

            $(window).resize(resizeSVG);
            function resizeSVG() {
                _this.set('offset', element.offset());
                _this.set('insertedSize', {x: element.width(), y: element.height()});
                _this.updateVisibleBox();
            }

            _this.viewPort = _this.root.rect().attr({ stroke: 'gray', fill: 'none'});
            resizeSVG();
            this.updateGridVisibility(this.getCTM().a);
            _this.zoomExtent();
        },
        createGrid: function () {
            var grid = this.get('background').group().attr({class: 'grid'});
            var dmGrid = grid.group().attr({class: 'dmGrid'});
            var halfDmGrid = dmGrid.group().attr({class: 'halfDmGrid'});
            var cmGrid = halfDmGrid.group().attr({class: 'cmGrid'});
            var halfCmGrid = cmGrid.group().attr({class: 'halfCmGrid'});
            var mmGrid = halfCmGrid.group().attr({class: 'mmGrid'});
            this.gridStack = [
                [20, $(mmGrid.node)],
                [15, $(halfCmGrid.node)],
                [5, $(cmGrid.node)],
                [2.5, $(halfDmGrid.node)]
            ];
            var xSpan = 400;
            var ySpan = 600;
            var biggestSpan = Math.max(ySpan, xSpan);
            for (var i = -biggestSpan; i <= biggestSpan; i += 1) {
                var group = mmGrid;
                if (i % 100 == 0)
                    group = dmGrid;
                else if (i % 50 == 0)
                    group = halfDmGrid;
                else if (i % 10 == 0)
                    group = cmGrid;
                else if (i % 5 == 0)
                    group = halfCmGrid;
                if (Math.abs(i) <= ySpan)
                    group.line(xSpan, i, -xSpan, i);
                if (Math.abs(i) <= xSpan)
                    group.line(i, ySpan, i, -ySpan);
                if (i % 10 == 0) {
                    if (Math.abs(i) <= xSpan)
                        group.text('' + i).transform({scaleY: -1}).attr({class: 'gridText '}).x(i).y(0);
                    if (Math.abs(i) <= ySpan)
                        group.text('' + -i).transform({scaleY: -1}).attr({class: 'gridText '}).x(0).y(i);
                }
            }
        },
        transformPoint: function (x, y, matrix) {
            var p = this.get('svg').node.createSVGPoint();
            p.x = x;
            p.y = y;
            p = p.matrixTransform(matrix);
            return p;
        },
        getCTM: function () {
            if (this.get('ctm') == null)
                this.set('ctm', this.root.node.getCTM());
            return this.get('ctm');
        },
        updateVisibleBox: function () {
            var m = this.getCTM().inverse();
            var topRight = this.transformPoint(this.get('insertedSize').x, this.get('insertedSize').y, m);
            var bottomLeft = this.transformPoint(0, 0, m);
            var height = Math.abs(topRight.y - bottomLeft.y);
            var width = (topRight.x - bottomLeft.x);
            this.get('viewPort').attr({width: width * 0.98, height: height * 0.98,
                x: bottomLeft.x + width * 0.01, y: (bottomLeft.y - height) + height * 0.01, stroke: 'gray', fill: 'none'});
        },
        getModelPositionForPageXY: function (x, y, matrix) {
            if (matrix == null)
                matrix = this.getCTM();
            //can't use offset with SVG in FF  http://stackoverflow.com/questions/15629183/svg-offset-issue-in-firefox
            var targetOffset = this.offset;
            var p = this.transformPoint(x - targetOffset.left, y - targetOffset.top, matrix.inverse());
            return {x: p.x, y: p.y};
        },
        clear: function () {
            this.get('paper').clear();
        },
        zoomExtent: function () {
            var box = this.get('paper').bbox();
            var m = this.getCTM();
            var svg = $(this.get('svg').node);
            var width = svg.width();
            var height = svg.height();
            var newScale = Math.min(width / box.width, height / box.height) * 0.8;
            newScale = isFinite(newScale) ? newScale : 1;
            newScale = Math.abs(newScale);
            m.a = newScale;
            m.d = -newScale;
            m.e = -box.x + box.width * 0.25;
            m.f = -(-box.y + box.height * 0.5 - height);
            this.setMatrix(m);
        },
        updateGridVisibility: function (scale) {
            var gridThreshold;
            var gridStack = this.get('gridStack');
            for (var i = 0; i < gridStack.length; i++)
                if (scale < gridStack[i][0])
                    gridThreshold = gridStack[i][0];
            if (gridThreshold != this.currentGridThreshold) {
                for (i = 0; i < gridStack.length; i++)
                    gridStack[i][1].css('visibility', scale < gridStack[i][0] ? 'hidden' : 'visible');
            }
            this.currentGridThreshold = gridThreshold;
        },
        setMatrix: function (matrix) {
            this.get('root').node.transform.baseVal.getItem(0).setMatrix(matrix);
            this.ctm = matrix;
            this.updateGridVisibility(matrix.a);
            this.updateVisibleBox();
        }
    });

    return {EmberTwoDView: EmberTwoDView};
});

