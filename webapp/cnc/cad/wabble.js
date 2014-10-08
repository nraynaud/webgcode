"use strict";
define(['cnc/util', 'cnc/cam/cam'], function (util, cam) {
    //http://www.ric.org/app/files/public/1738/pdf-sensinger-2010.pdf

    function Wabble(lobesCount, rollerCenterRadius, rollerRadius, eccentricity) {
        this.lobesCount = lobesCount;
        this.rollerCenterRadius = rollerCenterRadius;
        this.rollerRadius = rollerRadius;
        this.eccentricity = eccentricity;
    }

    Wabble.prototype = {
        getRotorShape: function () {
            var z1 = this.lobesCount; //lobes
            var z2 = z1 + 1; //rollers
            var R = this.rollerCenterRadius; //distance rollers/center
            var Rr = this.rollerRadius; //roller radius
            var e = this.eccentricity; //eccentricity

            function p3(x) {
                return x * x * x;
            }

            var cube = p3(z1 + 2);
            var time27 = 27 * z1;
            var e2 = e * e;
            var z22 = z2 * z2;
            var R2 = R * R;
            var Rr2 = Rr * Rr;
            var Rrmax = Math.sqrt(time27 * (R2 - e2 * z22) / cube);
            console.log('Rrmax', Rrmax, Rr);
            var Rrmax2 = R * Math.sin(Math.PI / z2);
            console.log('Rrmax2', Rrmax2, Rr);
            var Rmin = Math.sqrt(Rr2 * cube / time27 + e2 * z22);
            console.log('Rmin', Rmin, R);
            var emax = Math.sqrt((time27 * R2 - Rr2 * cube) / (time27 * z22));
            console.log('emax', emax, e);

            var nPoints = 10000;
            var points = [];
            for (var i = 0; i < nPoints; i++) {
                var phi = i * 2 * Math.PI / nPoints;
                var psy = Math.atan(Math.sin(z1 * phi) / (Math.cos(z1 * phi) - R / (e * z2)));
                var x = R * Math.cos(phi) - Rr * Math.cos(phi + psy) - e * Math.cos(z2 * phi);
                var y = -R * Math.sin(phi) + Rr * Math.sin(phi + psy) + e * Math.sin(z2 * phi);
                points.push((i == 0 ? 'M' : 'L' ) + new util.Point(x, y).svg());
            }
            points.push('Z');
            return points.join(' ');
        },
        getPinsShape: function () {
            var pinCount = this.lobesCount + 1;
            var shape = [];
            for (var i = 0; i < pinCount; i++) {
                var angle = i * 2 * Math.PI / pinCount;
                var x = this.rollerCenterRadius * Math.cos(angle);
                var y = this.rollerCenterRadius * Math.sin(angle);
                shape.push(cam.geom.createCircle(x, y, this.rollerRadius));
            }
            return shape.join(' ');
        }
    };
    return Wabble;
});