"use strict";
define(function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    Point.prototype = {
        get svgp() {
            return this.x + ', ' + this.y;
        },
        sub: function (p) {
            return new Point(this.x - p.x, this.y - p.y);
        },
        add: function (p) {
            return new Point(this.x + p.x, this.y + p.y);
        },
        sqDistance: function (p) {
            var dx = this.x - p.x;
            var dy = (this.y - p.y);
            return dx * dx + dy * dy;
        },
        distance: function (p) {
            return Math.sqrt(this.sqDistance(p));
        },
        lerp: function (p, alpha) {
            return new Point(this.x + (p.x - this.x) * alpha, this.y + (p.y - this.y) * alpha);
        }
    };
    function toggleClass(svgElement, className, toggle) {
        var classAttr = svgElement.attr('class');
        if (classAttr == null)
            classAttr = '';
        var classes = classAttr.split(' ');
        var index = classes.indexOf(className);
        if (toggle) {
            if (index == -1)
                svgElement.attr('class', classAttr + ' ' + className);
        } else if (index != -1) {
            classes.splice(index, 1);
            svgElement.attr('class', classes.join(' '));
        }
    }

    return {
        Point: Point,
        toggleClass: toggleClass,
        //variadic, just pass x,y,z ...
        length: function () {
            var squaredSum = 0;
            for (var i = 0; i < arguments.length; i++)
                squaredSum += arguments[i] * arguments[i];
            return Math.sqrt(squaredSum);
        },
        AXES: ['x', 'y', 'z'],
        formatCoord: function (num) {
            if (num == null)
                return '';
            if (num == 0)
                return '0';
            if (num % 1 === 0)
                return num.toString();
            var res = num.toFixed(4);
            for (var i = res.length - 1; i >= 0; i--) {
                if (res[i] != '0' && res[i] != '.')
                    return res.substring(0, i + 1);
                if (res[i] == '.')
                    return res.substring(0, i);
            }
            return res;
        }
    };
});