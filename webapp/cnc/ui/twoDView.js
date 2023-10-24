"use strict";

define(['Ember', 'libs/svg', 'libs/jquery.mousewheel', 'cnc/svg.marker'], function (Ember, SVG) {

    var BackgroundGrid = Ember.Object.extend({
        init: function () {
            var view = this.get('view');
            var background = this.get('view.background');
            var xSpan = 400;
            var ySpan = 600;

            var grid = background.group().attr({class: 'grid'});
            var dmGrid = grid.group().attr({class: 'dmGrid'});
            var halfDmGrid = dmGrid.group().attr({class: 'halfDmGrid'});
            var cmGrid = halfDmGrid.group().attr({class: 'cmGrid'});
            var halfCmGrid = cmGrid.group().attr({class: 'halfCmGrid'});
            var mmGrid = halfCmGrid.group().attr({class: 'mmGrid'});
            this.set('gridStack', [
                [20, $(mmGrid.node), false],
                [15, $(halfCmGrid.node), false],
                [5, $(cmGrid.node), false],
                [2.5, $(halfDmGrid.node), false]
            ]);
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
                        group.text('' + i).attr({class: 'gridText '}).x(i).y(0);
                    if (Math.abs(i) <= ySpan)
                        group.text('' + -i).attr({class: 'gridText '}).x(0).y(i);
                }
            }
        },
        updateGridVisibility: function () {
            var scale = this.get('view').getCTM().a;
            var gridStack = this.get('gridStack');
            for (var i = 0; i < gridStack.length; i++) {
                var hide = scale < gridStack[i][0];
                if (gridStack[i][2] != hide) {
                    gridStack[i][1].css('visibility', hide ? 'hidden' : 'visible');
                    gridStack[i][2] = hide;
                }
            }
        }.on('init'),
        observeViewPort: function () {
            Ember.run.debounce(this, this.updateGridVisibility, 50);
        }.observes('view.ctm', 'view.visibleBox')
    });

    var TwoDView = Ember.Object.extend({
        minZoom: 0.4,
        maxZoom: 80,
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
            this.set('overlay', root.group().attr({class: 'overlay'}));
            svg.defs().pattern(6, 6, function () {
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
            var _this = this;
            var redArrowMarker = svg.marker(3, 1.5, 3, 3, function () {
                var group = this.group();
                group.path('M 3,1.5 L0,3 L0,0 Z').attr('fill', '#FF0000');
            }).attr({viewBox: '-5 -5 10 10'});
            var greenArrowMarker = svg.marker(3, 1.5, 3, 3, function () {
                var group = this.group();
                group.path('M 3,1.5 L0,3 L0,0 Z').attr('fill', '#00FF00');
            }).attr({viewBox: '-5 -5 10 10'});
            var axes = this.get('overlay').group().attr({class: 'axes'});
            axes.line(0, 0, 10, 0).attr({stroke: '#FF0000', 'stroke-width': 1.5, 'marker-end': redArrowMarker});
            axes.line(0, 0, 0, 10).attr({stroke: '#00FF00', 'stroke-width': 1.5, 'marker-end': greenArrowMarker});
            element.mousewheel(Ember.run.bind(_this, function (event, delta, deltaX, deltaY) {
                var pos = _this.getModelPositionForPageXY(event.pageX, event.pageY);
                var k = svg.node.createSVGMatrix().translate(pos.x, pos.y).scale(1 + deltaY / 360).translate(-pos.x, -pos.y);
                var m = _this.getCTM().multiply(k);
                if (m.a > _this.get('minZoom') && m.a < _this.get('maxZoom'))
                    _this.setMatrix(m);
                event.preventDefault();
            }));
            element.mousedown(Ember.run.bind(_this, function (event) {
                if (event.which != 1)
                    return;
                var m = _this.getCTM();
                var pos = _this.getModelPositionForPageXY(event.pageX, event.pageY, m);
                _this.set('mouseDownStartCondition', {x: event.pageX, y: event.pageY, matrix: m, modelPos: pos});
            }));
            element.mouseup(Ember.run.bind(_this, function () {
                _this.set('mouseDownStartCondition', null);
            }));
            element.mouseleave(Ember.run.bind(_this, function () {
                _this.set('mouseDownStartCondition', null);
            }));
            element.mousemove(Ember.run.bind(_this, function (event) {
                if (!_this.get('mouseDownStartCondition'))
                    return;
                var formerPosition = _this.get('mouseDownStartCondition').modelPos;
                var newPosition = _this.getModelPositionForPageXY(event.pageX, event.pageY, _this.get('mouseDownStartCondition').matrix);
                _this.setMatrix(_this.get('mouseDownStartCondition').matrix.translate(newPosition.x - formerPosition.x, newPosition.y - formerPosition.y));
            }));
            $(window).resize(Ember.run.bind(_this, resizeSVG));
            function resizeSVG() {
                _this.set('offset', element.offset());
                _this.set('insertedSize', {x: element.width(), y: element.height()});
            }

            resizeSVG();
            _this.zoomExtent();
            this.set('grid', BackgroundGrid.create({view: this}));
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
        visibleBox: function () {
            var m = this.getCTM().inverse();
            var bottomLeft = this.transformPoint(0, this.get('insertedSize.y'), m);
            var topRight = this.transformPoint(this.get('insertedSize.x'), 0, m);
            var bottom = Math.min(bottomLeft.y, topRight.y);
            var width = (topRight.x - bottomLeft.x);
            var height = Math.abs(topRight.y - bottomLeft.y);
            return {x: bottomLeft.x, y: bottom, width: width, height: height}
        }.property('ctm', 'insertedSize'),
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
            var width = this.get('insertedSize.x');
            var height = this.get('insertedSize.y');
            var newScale = Math.min(width / box.width, height / box.height) * 0.8;
            newScale = Math.abs(newScale);
            newScale = isFinite(newScale) ? newScale : 1;
            newScale = Math.max(this.get('minZoom'), newScale);
            newScale = Math.min(this.get('maxZoom'), newScale);
            var m = this.get('svg.node').createSVGMatrix();
            m = m.scaleNonUniform(newScale, -newScale);
            m = m.translate((width / newScale - box.width) / 2 - box.x, -(height / newScale + box.height) / 2 - box.y);
            
            if (window.TwoDForceUpdate == true || window.TwoDForceUpdate == undefined){
                this.setMatrix(m);
                window.TwoDForceUpdate=false;
            }
        },
        setMatrix: function (matrix) {
            this.get('root').node.transform.baseVal.getItem(0).setMatrix(matrix);
            this.set('ctm', matrix);
        },
        zoomLevel: function () {
            return this.getCTM().a;
        }.property('ctm')
    });

    return {TwoDView: TwoDView};
});

