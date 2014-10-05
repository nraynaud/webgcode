"use strict";

define(['canvg', 'cnc/util'], function (canvg, util) {

    //https://github.com/simonsarris/Canvas-tutorials/blob/master/transform.js
    function Transform() {
        this.reset();
    }

    Transform.prototype = {
        reset: function () {
            this.m = [1, 0, 0, 1, 0, 0];
        },
        clone: function () {
            var t = new Transform();
            t.m = this.m.map(function (e) {
                return e;
            });
            return t;
        },
        multiply: function (matrix) {
            var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
            var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];

            var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
            var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];

            var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
            var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];

            this.m[0] = m11;
            this.m[1] = m12;
            this.m[2] = m21;
            this.m[3] = m22;
            this.m[4] = dx;
            this.m[5] = dy;
        },
        transform: function (m11, m12, m21, m22, dx, dy) {
            this.multiply({m: [m11, m12, m21, m22, dx, dy]});
        },
        invert: function () {
            var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
            var m0 = this.m[3] * d;
            var m1 = -this.m[1] * d;
            var m2 = -this.m[2] * d;
            var m3 = this.m[0] * d;
            var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
            var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
            this.m[0] = m0;
            this.m[1] = m1;
            this.m[2] = m2;
            this.m[3] = m3;
            this.m[4] = m4;
            this.m[5] = m5;
        }, rotate: function (rad) {
            var c = Math.cos(rad);
            var s = Math.sin(rad);
            var m11 = this.m[0] * c + this.m[2] * s;
            var m12 = this.m[1] * c + this.m[3] * s;
            var m21 = this.m[0] * -s + this.m[2] * c;
            var m22 = this.m[1] * -s + this.m[3] * c;
            this.m[0] = m11;
            this.m[1] = m12;
            this.m[2] = m21;
            this.m[3] = m22;
        }, translate: function (x, y) {
            this.m[4] += this.m[0] * x + this.m[2] * y;
            this.m[5] += this.m[1] * x + this.m[3] * y;
        }, scale: function (sx, sy) {
            this.m[0] *= sx;
            this.m[1] *= sx;
            this.m[2] *= sy;
            this.m[3] *= sy;
        }, transformPoint: function (px, py) {
            var x = px;
            var y = py;
            px = x * this.m[0] + y * this.m[2] + this.m[4];
            py = x * this.m[1] + y * this.m[3] + this.m[5];
            return new util.Point(px, py);
        }
    };

    function CustomContext(original) {
        this.original = original;
        this.stack = [new Transform()];
        this.currentPath = [];
        this.currentPosition = new util.Point(0, 0);
        this.pathArray = [];
        this.canvas = original.canvas;
        this.head().scale(1, -1);
    }

    CustomContext.prototype = {
        head: function () {
            return this.stack[this.stack.length - 1];
        },
        clearRect: function () {
        },
        save: function () {
            this.stack.push(this.head().clone());
        },
        restore: function () {
            this.stack.pop();
        },
        beginPath: function () {
            if (this.currentPath.length) {
                this.pathArray.push(this.currentPath.join(' '));
                this.currentPath = [];
            }
        },
        closePath: function () {
            this.currentPath.push('Z');
        },
        moveTo: function (x, y) {
            var pt = this.head().transformPoint(x, y);
            this.currentPosition = new util.Point(pt.x, pt.y);
            this.currentPath.push('M' + pt.svg());
        },
        bezierCurveTo: function (cp1x, cp1y, cp2x, cp2y, x, y) {
            var cp1 = this.head().transformPoint(cp1x, cp1y);
            var cp2 = this.head().transformPoint(cp2x, cp2y);
            var pt = this.head().transformPoint(x, y);
            this.currentPosition = new util.Point(pt.x, pt.y);
            this.currentPath.push('C' + cp1.svg() + cp2.svg() + pt.svg());
        },
        quadraticCurveTo: function (cpx, cpy, x, y) {
            var cp = this.head().transformPoint(cpx, cpy);
            var pt = this.head().transformPoint(x, y);
            this.currentPosition = new util.Point(pt.x, pt.y);
            this.currentPath.push('Q' + cp.svg() + pt.svg());
        },
        lineTo: function (x, y) {
            var pt = this.head().transformPoint(x, y);
            this.currentPosition = new util.Point(pt.x, pt.y);
            this.currentPath.push('L ' + pt.x + ',' + pt.y);
        },
        arc: function (x, y, radius, startAngle, endAngle, anticlockwise) {
            console.log('arc');
            console.log(new Error().stack);
        },
        fill: function () {

        },
        stroke: function () {
        },
        createLinearGradient: function () {
            return null;
        },
        drawImage: function () {
            console.log('drawImage');
            console.log(new Error().stack);
        }
    };

    ['translate', 'rotate', 'scale', 'transform'].forEach(function (functName) {
        CustomContext.prototype[functName] = function () {
            var head = this.head();
            head[functName].apply(head, arguments);
            this.original[functName].apply(this.original, arguments);
        }
    });
    ['font', 'canvas', 'fillStyle', 'globalAlpha', 'globalCompositeOperation', 'lineCap', 'lineDashOffset', 'lineJoin',
        'lineWidth', 'miterLimit', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'strokeStyle',
        'textAlign', 'textBaseline'
    ].forEach(function (mapping) {
            Object.defineProperty(CustomContext.prototype, mapping, {
                get: function () {
                    return this.original[mapping];
                },
                set: function (newValue) {
                    this.original[mapping] = newValue;
                }
            });
        });
    function importSVG(canvas, svgText) {
        //  var imported = mySVG.svg(e.target.result);
        // console.log(imported);
        var ctx = canvas[0].getContext('2d');
        ctx = new CustomContext(ctx);

        var transformStack = [new Transform()];
        canvg.contextvg(ctx, svgText, {ignoreMouse: true});
        return ctx.pathArray;
    }

    return importSVG;

});