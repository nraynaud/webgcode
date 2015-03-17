"use strict";
define(function () {
    function Point(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z === undefined ? 0 : z;
    }

    Point.prototype = {
        svg: function () {
            return ' ' + this.x + ', ' + this.y;
        },
        sub: function (p) {
            return new Point(this.x - p.x, this.y - p.y, this.z - p.z);
        },
        add: function (p) {
            return new Point(this.x + p.x, this.y + p.y, this.z + p.z);
        },
        scale: function (val) {
            return new Point(this.x * val, this.y * val, this.z * val);
        },
        round: function () {
            return new Point(Math.round(this.x), Math.round(this.y), Math.round(this.z));
        },
        sqDistance: function (p) {
            var dx = this.x - p.x;
            var dy = this.y - p.y;
            var dz = this.z - p.z;
            return dx * dx + dy * dy + dz * dz;
        },
        distance: function (p) {
            return Math.sqrt(this.sqDistance(p));
        },
        lerp: function (p, alpha) {
            return this.add(p.sub(this).scale(alpha));
        }
    };
    [
        ['X', 'x'],
        ['Y', 'y'],
        ['Z', 'z'],
        ['0', 'x'],
        ['1', 'y'],
        ['2', 'z']
    ].forEach(function (mapping) {
            Object.defineProperty(Point.prototype, mapping[0], {
                get: function () {
                    return this[mapping[1]];
                },
                set: function (newValue) {
                    this[mapping[1]] = newValue;
                }
            });
        });

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

    function createSimulationAccumulator(fragmentHandler) {
        var currentSpeedTag = null;
        var simulationFragments = [];
        var simulatedPath = [];

        function closeFragment() {
            if (simulatedPath.length > 3) {
                var fragment = {vertices: new Float32Array(simulatedPath).buffer, speedTag: currentSpeedTag};
                simulationFragments.push(fragment);
                //repeat the last point as ne new first point, because we're breaking the polyline
                simulatedPath = simulatedPath.slice(-3);
                fragmentHandler(fragment);
            }
        }

        function accumulatePoint(point, speedTag) {
            if (currentSpeedTag != speedTag || simulatedPath.length >= 10000) {
                closeFragment();
                currentSpeedTag = speedTag;
            }
            simulatedPath.push(point.x, point.y, point.z);
        }

        function isEmpty() {
            return simulationFragments.length == 0 && simulatedPath.length == 0;
        }

        return {accumulatePoint: accumulatePoint, closeFragment: closeFragment, isEmpty: isEmpty};
    }

    /**
     * returns something like "2h34m" or "55m12s"
     * @param seconds
     * @returns {string}
     */
    function humanizeDuration(seconds) {
        var result = [];
        var ranges = [
            {type: 'y', time: 60 * 60 * 24 * 365},
            {type: 'mo', time: 60 * 60 * 24 * 30},
            {type: 'd', time: 60 * 60 * 24},
            {type: 'h', time: 60 * 60},
            {type: 'm', time: 60},
            {type: 's', time: 1}
        ];

        ranges.forEach(function (step) {
            var interval = Math.floor(seconds / step.time);
            if (interval) {
                result.push(interval + step.type);
                seconds -= interval * step.time;
            }
        });

        return result.slice(0, 2).join('');
    }

    function Range() {
        this.min = +Infinity;
        this.max = -Infinity;
    }

    Range.prototype = {
        push: function (number) {
            this.min = Math.min(this.min, number);
            this.max = Math.max(this.max, number);
        },
        get range() {
            return this.max - this.min;
        }
    };

    function BoundingBox() {
        this.x = new Range();
        this.y = new Range();
        this.z = new Range();
    }

    BoundingBox.prototype = {
        pushPoint: function (p) {
            this.x.push(p.x);
            this.y.push(p.y);
            this.z.push(p.z);
        }
    };
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
        },
        createSimulationAccumulator: createSimulationAccumulator,
        humanizeDuration: humanizeDuration,
        BoundingBox: BoundingBox
    };
});