/*******************************************************************************
 *                                                                              *
 * Author    :  Angus Johnson                                                   *
 * Version   :  5.0.2                                                           *
 * Date      :  30 December 2012                                                *
 * Website   :  http://www.angusj.com                                           *
 * Copyright :  Angus Johnson 2010-2012                                         *
 *                                                                              *
 * License:                                                                     *
 * Use, modification & distribution is subject to Boost Software License Ver 1. *
 * http://www.boost.org/LICENSE_1_0.txt                                         *
 *                                                                              *
 * Attributions:                                                                *
 * The code in this library is an extension of Bala Vatti's clipping algorithm: *
 * "A generic solution to polygon clipping"                                     *
 * Communications of the ACM, Vol 35, Issue 7 (July 1992) pp 56-63.             *
 * http://portal.acm.org/citation.cfm?id=129906                                 *
 *                                                                              *
 * Computer graphics and geometric modeling: implementation and algorithms      *
 * By Max K. Agoston                                                            *
 * Springer; 1 edition (January 4, 2005)                                        *
 * http://books.google.com/books?q=vatti+clipping+agoston                       *
 *                                                                              *
 * See also:                                                                    *
 * "Polygon Offsetting by Computing Winding Numbers"                            *
 * Paper no. DETC2005-85513 pp. 565-575                                         *
 * ASME 2005 International Design Engineering Technical Conferences             *
 * and Computers and Information in Engineering Conference (IDETC/CIE2005)      *
 * September 24ñ28, 2005 , Long Beach, California, USA                          *
 * http://www.me.berkeley.edu/~mcmains/pubs/DAC05OffsetPolygon.pdf              *
 *                                                                              *
 *******************************************************************************/

/*******************************************************************************
 *                                                                              *
 * Author    :  Timo                                                            *
 * Version   :  5.0.2.2                                                         *
 * Date      :  11 September 2013                                               *
 *                                                                              *
 * This is a translation of the C# Clipper library to Javascript.               *
 * Int128 struct of C# is implemented using JSBN of Tom Wu.                     *
 * Because Javascript lacks support for 64-bit integers, the space              *
 * is a little more restricted than in C# version.                              *
 *                                                                              *
 * C# version has support for coordinate space:                                 *
 * +-4611686018427387903 ( sqrt(2^127 -1)/2 )                                   *
 * while Javascript version has support for space:                              *
 * +-4503599627370495 ( sqrt(2^106 -1)/2 )                                      *
 *                                                                              *
 * Tom Wu's JSBN proved to be the fastest big integer library:                  *
 * http://jsperf.com/big-integer-library-test                                   *
 *                                                                              *
 * This class can be made simpler when (if ever) 64-bit integer support comes.  *
 *                                                                              *
 *******************************************************************************/

/*******************************************************************************
 *                                                                              *
 * Basic JavaScript BN library - subset useful for RSA encryption.              *
 * http://www-cs-students.stanford.edu/~tjw/jsbn/                               *
 * Copyright (c) 2005  Tom Wu                                                   *
 * All Rights Reserved.                                                         *
 * See "LICENSE" for details:                                                   *
 * http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE                        *
 *                                                                              *
 *******************************************************************************/
(function () {
    // "use strict";
    // Browser test to speedup performance critical functions
    var nav = navigator.userAgent.toString().toLowerCase();
    var browser = {};
    if (nav.indexOf("chrome") != -1 && nav.indexOf("chromium") == -1) browser.chrome = 1; else browser.chrome = 0;
    if (nav.indexOf("chromium") != -1) browser.chromium = 1; else browser.chromium = 0;
    if (nav.indexOf("safari") != -1 && nav.indexOf("chrome") == -1 && nav.indexOf("chromium") == -1) browser.safari = 1; else browser.safari = 0;
    if (nav.indexOf("firefox") != -1) browser.firefox = 1; else browser.firefox = 0;
    if (nav.indexOf("firefox/17") != -1) browser.firefox17 = 1; else browser.firefox17 = 0;
    if (nav.indexOf("firefox/15") != -1) browser.firefox15 = 1; else browser.firefox15 = 0;
    if (nav.indexOf("firefox/3") != -1) browser.firefox3 = 1; else browser.firefox3 = 0;
    if (nav.indexOf("opera") != -1) browser.opera = 1; else browser.opera = 0;
    if (nav.indexOf("msie 10") != -1) browser.msie10 = 1; else browser.msie10 = 0;
    if (nav.indexOf("msie 9") != -1) browser.msie9 = 1; else browser.msie9 = 0;
    if (nav.indexOf("msie 8") != -1) browser.msie8 = 1; else browser.msie8 = 0;
    if (nav.indexOf("msie 7") != -1) browser.msie7 = 1; else browser.msie7 = 0;
    if (nav.indexOf("msie ") != -1) browser.msie = 1; else browser.msie = 0;

    var ClipperLib = {};
    ClipperLib.biginteger_used = null;

    // Bits per digit
    var dbits;
    // JavaScript engine analysis
    var canary = 0xdeadbeefcafe;
    var j_lm = ((canary & 0xffffff) == 0xefcafe);
    // (public) Constructor
    function Int128(a, b, c) {
        // This test variable can be removed,
        // but at least for performance tests it is useful piece of knowledge
        // This is the only ClipperLib related variable in Int128 library
        ClipperLib.biginteger_used = 1;
        if (a != null) if ("number" == typeof a) {
            this.fromString(Math.floor(a)
                .toString(), 10); //this.fromNumber(a,b,c);
        }
        else if (b == null && "string" != typeof a) this.fromString(a, 256);
        else {
            if (a.indexOf(".") != -1) a = a.substring(0, a.indexOf("."));
            this.fromString(a, b);
        }
    }

    // return new, unset Int128
    function nbi() {
        return new Int128(null);
    }

    // am: Compute w_j += (x*this_i), propagate carries,
    // c is initial carry, returns final carry.
    // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
    // We need to select the fastest one that works in this environment.
    // am1: use a single mult and divide to get the high bits,
    // max digit bits should be 26 because
    // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
    function am1(i, x, w, j, c, n) {
        while (--n >= 0) {
            var v = x * this[i++] + w[j] + c;
            c = Math.floor(v / 0x4000000);
            w[j++] = v & 0x3ffffff;
        }
        return c;
    }

    // am2 avoids a big mult-and-extract completely.
    // Max digit bits should be <= 30 because we do bitwise ops
    // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
    function am2(i, x, w, j, c, n) {
        var xl = x & 0x7fff,
            xh = x >> 15;
        while (--n >= 0) {
            var l = this[i] & 0x7fff;
            var h = this[i++] >> 15;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
            c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
            w[j++] = l & 0x3fffffff;
        }
        return c;
    }

    // Alternately, set max digit bits to 28 since some
    // browsers slow down when dealing with 32-bit numbers.
    function am3(i, x, w, j, c, n) {
        var xl = x & 0x3fff,
            xh = x >> 14;
        while (--n >= 0) {
            var l = this[i] & 0x3fff;
            var h = this[i++] >> 14;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
            c = (l >> 28) + (m >> 14) + xh * h;
            w[j++] = l & 0xfffffff;
        }
        return c;
    }

    if (j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
        Int128.prototype.am = am2;
        dbits = 30;
    }
    else if (j_lm && (navigator.appName != "Netscape")) {
        Int128.prototype.am = am1;
        dbits = 26;
    }
    else { // Mozilla/Netscape seems to prefer am3
        Int128.prototype.am = am3;
        dbits = 28;
    }
    Int128.prototype.DB = dbits;
    Int128.prototype.DM = ((1 << dbits) - 1);
    Int128.prototype.DV = (1 << dbits);
    var BI_FP = 52;
    Int128.prototype.FV = Math.pow(2, BI_FP);
    Int128.prototype.F1 = BI_FP - dbits;
    Int128.prototype.F2 = 2 * dbits - BI_FP;
    // Digit conversions
    var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
    var BI_RC = [];
    var rr, vv;
    rr = "0".charCodeAt(0);
    for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
    rr = "a".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
    rr = "A".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

    function int2char(n) {
        return BI_RM.charAt(n);
    }

    function intAt(s, i) {
        var c = BI_RC[s.charCodeAt(i)];
        return (c == null) ? -1 : c;
    }

    // (protected) copy this to r
    function bnpCopyTo(r) {
        for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
        r.t = this.t;
        r.s = this.s;
    }

    // (protected) set from integer value x, -DV <= x < DV
    function bnpFromInt(x) {
        this.t = 1;
        this.s = (x < 0) ? -1 : 0;
        if (x > 0) this[0] = x;
        else if (x < -1) this[0] = x + this.DV;
        else this.t = 0;
    }

    // return bigint initialized to value
    function nbv(i) {
        var r = nbi();
        r.fromInt(i);
        return r;
    }

    // (protected) set from string and radix
    function bnpFromString(s, b) {
        var k;
        if (b == 16) k = 4;
        else if (b == 8) k = 3;
        else if (b == 256) k = 8; // byte array
        else if (b == 2) k = 1;
        else if (b == 32) k = 5;
        else if (b == 4) k = 2;
        else {
            this.fromRadix(s, b);
            return;
        }
        this.t = 0;
        this.s = 0;
        var i = s.length,
            mi = false,
            sh = 0;
        while (--i >= 0) {
            var x = (k == 8) ? s[i] & 0xff : intAt(s, i);
            if (x < 0) {
                if (s.charAt(i) == "-") mi = true;
                continue;
            }
            mi = false;
            if (sh == 0) this[this.t++] = x;
            else if (sh + k > this.DB) {
                this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
                this[this.t++] = (x >> (this.DB - sh));
            }
            else this[this.t - 1] |= x << sh;
            sh += k;
            if (sh >= this.DB) sh -= this.DB;
        }
        if (k == 8 && (s[0] & 0x80) != 0) {
            this.s = -1;
            if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
        }
        this.clamp();
        if (mi) Int128.ZERO.subTo(this, this);
    }

    // (protected) clamp off excess high words
    function bnpClamp() {
        var c = this.s & this.DM;
        while (this.t > 0 && this[this.t - 1] == c)--this.t;
    }

    // (public) return string representation in given radix
    function bnToString(b) {
        if (this.s < 0) return "-" + this.negate()
            .toString(b);
        var k;
        if (b == 16) k = 4;
        else if (b == 8) k = 3;
        else if (b == 2) k = 1;
        else if (b == 32) k = 5;
        else if (b == 4) k = 2;
        else return this.toRadix(b);
        var km = (1 << k) - 1,
            d, m = false,
            r = "",
            i = this.t;
        var p = this.DB - (i * this.DB) % k;
        if (i-- > 0) {
            if (p < this.DB && (d = this[i] >> p) > 0) {
                m = true;
                r = int2char(d);
            }
            while (i >= 0) {
                if (p < k) {
                    d = (this[i] & ((1 << p) - 1)) << (k - p);
                    d |= this[--i] >> (p += this.DB - k);
                }
                else {
                    d = (this[i] >> (p -= k)) & km;
                    if (p <= 0) {
                        p += this.DB;
                        --i;
                    }
                }
                if (d > 0) m = true;
                if (m) r += int2char(d);
            }
        }
        return m ? r : "0";
    }

    // (public) -this
    function bnNegate() {
        var r = nbi();
        Int128.ZERO.subTo(this, r);
        return r;
    }

    // (public) |this|
    function bnAbs() {
        return (this.s < 0) ? this.negate() : this;
    }

    // (public) return + if this > a, - if this < a, 0 if equal
    function bnCompareTo(a) {
        var r = this.s - a.s;
        if (r != 0) return r;
        var i = this.t;
        r = i - a.t;
        if (r != 0) return (this.s < 0) ? -r : r;
        while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
        return 0;
    }

    // returns bit length of the integer x
    function nbits(x) {
        var r = 1,
            t;
        if ((t = x >>> 16) != 0) {
            x = t;
            r += 16;
        }
        if ((t = x >> 8) != 0) {
            x = t;
            r += 8;
        }
        if ((t = x >> 4) != 0) {
            x = t;
            r += 4;
        }
        if ((t = x >> 2) != 0) {
            x = t;
            r += 2;
        }
        if ((t = x >> 1) != 0) {
            x = t;
            r += 1;
        }
        return r;
    }

    // (public) return the number of bits in "this"
    function bnBitLength() {
        if (this.t <= 0) return 0;
        return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
    }

    // (protected) r = this << n*DB
    function bnpDLShiftTo(n, r) {
        var i;
        for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
        for (i = n - 1; i >= 0; --i) r[i] = 0;
        r.t = this.t + n;
        r.s = this.s;
    }

    // (protected) r = this >> n*DB
    function bnpDRShiftTo(n, r) {
        for (var i = n; i < this.t; ++i) r[i - n] = this[i];
        r.t = Math.max(this.t - n, 0);
        r.s = this.s;
    }

    // (protected) r = this << n
    function bnpLShiftTo(n, r) {
        var bs = n % this.DB;
        var cbs = this.DB - bs;
        var bm = (1 << cbs) - 1;
        var ds = Math.floor(n / this.DB),
            c = (this.s << bs) & this.DM,
            i;
        for (i = this.t - 1; i >= 0; --i) {
            r[i + ds + 1] = (this[i] >> cbs) | c;
            c = (this[i] & bm) << bs;
        }
        for (i = ds - 1; i >= 0; --i) r[i] = 0;
        r[ds] = c;
        r.t = this.t + ds + 1;
        r.s = this.s;
        r.clamp();
    }

    // (protected) r = this >> n
    function bnpRShiftTo(n, r) {
        r.s = this.s;
        var ds = Math.floor(n / this.DB);
        if (ds >= this.t) {
            r.t = 0;
            return;
        }
        var bs = n % this.DB;
        var cbs = this.DB - bs;
        var bm = (1 << bs) - 1;
        r[0] = this[ds] >> bs;
        for (var i = ds + 1; i < this.t; ++i) {
            r[i - ds - 1] |= (this[i] & bm) << cbs;
            r[i - ds] = this[i] >> bs;
        }
        if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
        r.t = this.t - ds;
        r.clamp();
    }

    // (protected) r = this - a
    function bnpSubTo(a, r) {
        var i = 0,
            c = 0,
            m = Math.min(a.t, this.t);
        while (i < m) {
            c += this[i] - a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        if (a.t < this.t) {
            c -= a.s;
            while (i < this.t) {
                c += this[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += this.s;
        }
        else {
            c += this.s;
            while (i < a.t) {
                c -= a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c -= a.s;
        }
        r.s = (c < 0) ? -1 : 0;
        if (c < -1) r[i++] = this.DV + c;
        else if (c > 0) r[i++] = c;
        r.t = i;
        r.clamp();
    }

    // (protected) r = this * a, r != this,a (HAC 14.12)
    // "this" should be the larger one if appropriate.
    function bnpMultiplyTo(a, r) {
        var x = this.abs(),
            y = a.abs();
        var i = x.t;
        r.t = i + y.t;
        while (--i >= 0) r[i] = 0;
        for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
        r.s = 0;
        r.clamp();
        if (this.s != a.s) Int128.ZERO.subTo(r, r);
    }

    // (protected) r = this^2, r != this (HAC 14.16)
    function bnpSquareTo(r) {
        var x = this.abs();
        var i = r.t = 2 * x.t;
        while (--i >= 0) r[i] = 0;
        for (i = 0; i < x.t - 1; ++i) {
            var c = x.am(i, x[i], r, 2 * i, 0, 1);
            if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
                r[i + x.t] -= x.DV;
                r[i + x.t + 1] = 1;
            }
        }
        if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
        r.s = 0;
        r.clamp();
    }

    // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
    // r != q, this != m.  q or r may be null.
    function bnpDivRemTo(m, q, r) {
        var pm = m.abs();
        if (pm.t <= 0) return;
        var pt = this.abs();
        if (pt.t < pm.t) {
            if (q != null) q.fromInt(0);
            if (r != null) this.copyTo(r);
            return;
        }
        if (r == null) r = nbi();
        var y = nbi(),
            ts = this.s,
            ms = m.s;
        var nsh = this.DB - nbits(pm[pm.t - 1]); // normalize modulus
        if (nsh > 0) {
            pm.lShiftTo(nsh, y);
            pt.lShiftTo(nsh, r);
        }
        else {
            pm.copyTo(y);
            pt.copyTo(r);
        }
        var ys = y.t;
        var y0 = y[ys - 1];
        if (y0 == 0) return;
        var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
        var d1 = this.FV / yt,
            d2 = (1 << this.F1) / yt,
            e = 1 << this.F2;
        var i = r.t,
            j = i - ys,
            t = (q == null) ? nbi() : q;
        y.dlShiftTo(j, t);
        if (r.compareTo(t) >= 0) {
            r[r.t++] = 1;
            r.subTo(t, r);
        }
        Int128.ONE.dlShiftTo(ys, t);
        t.subTo(y, y); // "negative" y so we can replace sub with am later
        while (y.t < ys) y[y.t++] = 0;
        while (--j >= 0) {
            // Estimate quotient digit
            var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
            if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) { // Try it out
                y.dlShiftTo(j, t);
                r.subTo(t, r);
                while (r[i] < --qd) r.subTo(t, r);
            }
        }
        if (q != null) {
            r.drShiftTo(ys, q);
            if (ts != ms) Int128.ZERO.subTo(q, q);
        }
        r.t = ys;
        r.clamp();
        if (nsh > 0) r.rShiftTo(nsh, r); // Denormalize remainder
        if (ts < 0) Int128.ZERO.subTo(r, r);
    }

    // (public) this mod a
    function bnMod(a) {
        var r = nbi();
        this.abs()
            .divRemTo(a, null, r);
        if (this.s < 0 && r.compareTo(Int128.ZERO) > 0) a.subTo(r, r);
        return r;
    }

    // Modular reduction using "classic" algorithm
    function Classic(m) {
        this.m = m;
    }

    function cConvert(x) {
        if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
        else return x;
    }

    function cRevert(x) {
        return x;
    }

    function cReduce(x) {
        x.divRemTo(this.m, null, x);
    }

    function cMulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    }

    function cSqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
    }

    Classic.prototype.convert = cConvert;
    Classic.prototype.revert = cRevert;
    Classic.prototype.reduce = cReduce;
    Classic.prototype.mulTo = cMulTo;
    Classic.prototype.sqrTo = cSqrTo;
    // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
    // justification:
    //         xy == 1 (mod m)
    //         xy =  1+km
    //   xy(2-xy) = (1+km)(1-km)
    // x[y(2-xy)] = 1-k^2m^2
    // x[y(2-xy)] == 1 (mod m^2)
    // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
    // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
    // JS multiply "overflows" differently from C/C++, so care is needed here.
    function bnpInvDigit() {
        if (this.t < 1) return 0;
        var x = this[0];
        if ((x & 1) == 0) return 0;
        var y = x & 3; // y == 1/x mod 2^2
        y = (y * (2 - (x & 0xf) * y)) & 0xf; // y == 1/x mod 2^4
        y = (y * (2 - (x & 0xff) * y)) & 0xff; // y == 1/x mod 2^8
        y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff; // y == 1/x mod 2^16
        // last step - calculate inverse mod DV directly;
        // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
        y = (y * (2 - x * y % this.DV)) % this.DV; // y == 1/x mod 2^dbits
        // we really want the negative inverse, and -DV < y < DV
        return (y > 0) ? this.DV - y : -y;
    }

    // Montgomery reduction
    function Montgomery(m) {
        this.m = m;
        this.mp = m.invDigit();
        this.mpl = this.mp & 0x7fff;
        this.mph = this.mp >> 15;
        this.um = (1 << (m.DB - 15)) - 1;
        this.mt2 = 2 * m.t;
    }

    // xR mod m
    function montConvert(x) {
        var r = nbi();
        x.abs()
            .dlShiftTo(this.m.t, r);
        r.divRemTo(this.m, null, r);
        if (x.s < 0 && r.compareTo(Int128.ZERO) > 0) this.m.subTo(r, r);
        return r;
    }

    // x/R mod m
    function montRevert(x) {
        var r = nbi();
        x.copyTo(r);
        this.reduce(r);
        return r;
    }

    // x = x/R mod m (HAC 14.32)
    function montReduce(x) {
        while (x.t <= this.mt2) // pad x so am has enough room later
            x[x.t++] = 0;
        for (var i = 0; i < this.m.t; ++i) {
            // faster way of calculating u0 = x[i]*mp mod DV
            var j = x[i] & 0x7fff;
            var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
            // use am to combine the multiply-shift-add into one call
            j = i + this.m.t;
            x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
            // propagate carry
            while (x[j] >= x.DV) {
                x[j] -= x.DV;
                x[++j]++;
            }
        }
        x.clamp();
        x.drShiftTo(this.m.t, x);
        if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
    }

    // r = "x^2/R mod m"; x != r
    function montSqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
    }

    // r = "xy/R mod m"; x,y != r
    function montMulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    }

    Montgomery.prototype.convert = montConvert;
    Montgomery.prototype.revert = montRevert;
    Montgomery.prototype.reduce = montReduce;
    Montgomery.prototype.mulTo = montMulTo;
    Montgomery.prototype.sqrTo = montSqrTo;
    // (protected) true iff this is even
    function bnpIsEven() {
        return ((this.t > 0) ? (this[0] & 1) : this.s) == 0;
    }

    // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
    function bnpExp(e, z) {
        if (e > 0xffffffff || e < 1) return Int128.ONE;
        var r = nbi(),
            r2 = nbi(),
            g = z.convert(this),
            i = nbits(e) - 1;
        g.copyTo(r);
        while (--i >= 0) {
            z.sqrTo(r, r2);
            if ((e & (1 << i)) > 0) z.mulTo(r2, g, r);
            else {
                var t = r;
                r = r2;
                r2 = t;
            }
        }
        return z.revert(r);
    }

    // (public) this^e % m, 0 <= e < 2^32
    function bnModPowInt(e, m) {
        var z;
        if (e < 256 || m.isEven()) z = new Classic(m);
        else z = new Montgomery(m);
        return this.exp(e, z);
    }

    // protected
    Int128.prototype.copyTo = bnpCopyTo;
    Int128.prototype.fromInt = bnpFromInt;
    Int128.prototype.fromString = bnpFromString;
    Int128.prototype.clamp = bnpClamp;
    Int128.prototype.dlShiftTo = bnpDLShiftTo;
    Int128.prototype.drShiftTo = bnpDRShiftTo;
    Int128.prototype.lShiftTo = bnpLShiftTo;
    Int128.prototype.rShiftTo = bnpRShiftTo;
    Int128.prototype.subTo = bnpSubTo;
    Int128.prototype.multiplyTo = bnpMultiplyTo;
    Int128.prototype.squareTo = bnpSquareTo;
    Int128.prototype.divRemTo = bnpDivRemTo;
    Int128.prototype.invDigit = bnpInvDigit;
    Int128.prototype.isEven = bnpIsEven;
    Int128.prototype.exp = bnpExp;
    // public
    Int128.prototype.toString = bnToString;
    Int128.prototype.negate = bnNegate;
    Int128.prototype.abs = bnAbs;
    Int128.prototype.compareTo = bnCompareTo;
    Int128.prototype.bitLength = bnBitLength;
    Int128.prototype.mod = bnMod;
    Int128.prototype.modPowInt = bnModPowInt;
    // "constants"
    Int128.ZERO = nbv(0);
    Int128.ONE = nbv(1);
    // Copyright (c) 2005-2009  Tom Wu
    // All Rights Reserved.
    // See "LICENSE" for details.
    // Extended JavaScript BN functions, required for RSA private ops.
    // Version 1.1: new Int128("0", 10) returns "proper" zero
    // Version 1.2: square() API, isProbablePrime fix
    // (public)
    function bnClone() {
        var r = nbi();
        this.copyTo(r);
        return r;
    }

    // (public) return value as integer
    function bnIntValue() {
        if (this.s < 0) {
            if (this.t == 1) return this[0] - this.DV;
            else if (this.t == 0) return -1;
        }
        else if (this.t == 1) return this[0];
        else if (this.t == 0) return 0;
        // assumes 16 < DB < 32
        return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
    }

    // (public) return value as byte
    function bnByteValue() {
        return (this.t == 0) ? this.s : (this[0] << 24) >> 24;
    }

    // (public) return value as short (assumes DB>=16)
    function bnShortValue() {
        return (this.t == 0) ? this.s : (this[0] << 16) >> 16;
    }

    // (protected) return x s.t. r^x < DV
    function bnpChunkSize(r) {
        return Math.floor(Math.LN2 * this.DB / Math.log(r));
    }

    // (public) 0 if this == 0, 1 if this > 0
    function bnSigNum() {
        if (this.s < 0) return -1;
        else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
        else return 1;
    }

    // (protected) convert to radix string
    function bnpToRadix(b) {
        if (b == null) b = 10;
        if (this.signum() == 0 || b < 2 || b > 36) return "0";
        var cs = this.chunkSize(b);
        var a = Math.pow(b, cs);
        var d = nbv(a),
            y = nbi(),
            z = nbi(),
            r = "";
        this.divRemTo(d, y, z);
        while (y.signum() > 0) {
            r = (a + z.intValue())
                .toString(b)
                .substr(1) + r;
            y.divRemTo(d, y, z);
        }
        return z.intValue()
            .toString(b) + r;
    }

    // (protected) convert from radix string
    function bnpFromRadix(s, b) {
        this.fromInt(0);
        if (b == null) b = 10;
        var cs = this.chunkSize(b);
        var d = Math.pow(b, cs),
            mi = false,
            j = 0,
            w = 0;
        for (var i = 0; i < s.length; ++i) {
            var x = intAt(s, i);
            if (x < 0) {
                if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
                continue;
            }
            w = b * w + x;
            if (++j >= cs) {
                this.dMultiply(d);
                this.dAddOffset(w, 0);
                j = 0;
                w = 0;
            }
        }
        if (j > 0) {
            this.dMultiply(Math.pow(b, j));
            this.dAddOffset(w, 0);
        }
        if (mi) Int128.ZERO.subTo(this, this);
    }

    // (protected) alternate constructor
    function bnpFromNumber(a, b, c) {
        if ("number" == typeof b) {
            // new Int128(int,int,RNG)
            if (a < 2) this.fromInt(1);
            else {
                this.fromNumber(a, c);
                if (!this.testBit(a - 1)) // force MSB set
                    this.bitwiseTo(Int128.ONE.shiftLeft(a - 1), op_or, this);
                if (this.isEven()) this.dAddOffset(1, 0); // force odd
                while (!this.isProbablePrime(b)) {
                    this.dAddOffset(2, 0);
                    if (this.bitLength() > a) this.subTo(Int128.ONE.shiftLeft(a - 1), this);
                }
            }
        }
        else {
            // new Int128(int,RNG)
            var x = [],
                t = a & 7;
            x.length = (a >> 3) + 1;
            b.nextBytes(x);
            if (t > 0) x[0] &= ((1 << t) - 1);
            else x[0] = 0;
            this.fromString(x, 256);
        }
    }

    // (public) convert to bigendian byte array
    function bnToByteArray() {
        var i = this.t,
            r = [];
        r[0] = this.s;
        var p = this.DB - (i * this.DB) % 8,
            d, k = 0;
        if (i-- > 0) {
            if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p) r[k++] = d | (this.s << (this.DB - p));
            while (i >= 0) {
                if (p < 8) {
                    d = (this[i] & ((1 << p) - 1)) << (8 - p);
                    d |= this[--i] >> (p += this.DB - 8);
                }
                else {
                    d = (this[i] >> (p -= 8)) & 0xff;
                    if (p <= 0) {
                        p += this.DB;
                        --i;
                    }
                }
                if ((d & 0x80) != 0) d |= -256;
                if (k == 0 && (this.s & 0x80) != (d & 0x80))++k;
                if (k > 0 || d != this.s) r[k++] = d;
            }
        }
        return r;
    }

    function bnEquals(a) {
        return (this.compareTo(a) == 0);
    }

    function bnMin(a) {
        return (this.compareTo(a) < 0) ? this : a;
    }

    function bnMax(a) {
        return (this.compareTo(a) > 0) ? this : a;
    }

    // (protected) r = this op a (bitwise)
    function bnpBitwiseTo(a, op, r) {
        var i, f, m = Math.min(a.t, this.t);
        for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
        if (a.t < this.t) {
            f = a.s & this.DM;
            for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
            r.t = this.t;
        }
        else {
            f = this.s & this.DM;
            for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
            r.t = a.t;
        }
        r.s = op(this.s, a.s);
        r.clamp();
    }

    // (public) this & a
    function op_and(x, y) {
        return x & y;
    }

    function bnAnd(a) {
        var r = nbi();
        this.bitwiseTo(a, op_and, r);
        return r;
    }

    // (public) this | a
    function op_or(x, y) {
        return x | y;
    }

    function bnOr(a) {
        var r = nbi();
        this.bitwiseTo(a, op_or, r);
        return r;
    }

    // (public) this ^ a
    function op_xor(x, y) {
        return x ^ y;
    }

    function bnXor(a) {
        var r = nbi();
        this.bitwiseTo(a, op_xor, r);
        return r;
    }

    // (public) this & ~a
    function op_andnot(x, y) {
        return x & ~y;
    }

    function bnAndNot(a) {
        var r = nbi();
        this.bitwiseTo(a, op_andnot, r);
        return r;
    }

    // (public) ~this
    function bnNot() {
        var r = nbi();
        for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
        r.t = this.t;
        r.s = ~this.s;
        return r;
    }

    // (public) this << n
    function bnShiftLeft(n) {
        var r = nbi();
        if (n < 0) this.rShiftTo(-n, r);
        else this.lShiftTo(n, r);
        return r;
    }

    // (public) this >> n
    function bnShiftRight(n) {
        var r = nbi();
        if (n < 0) this.lShiftTo(-n, r);
        else this.rShiftTo(n, r);
        return r;
    }

    // return index of lowest 1-bit in x, x < 2^31
    function lbit(x) {
        if (x == 0) return -1;
        var r = 0;
        if ((x & 0xffff) == 0) {
            x >>= 16;
            r += 16;
        }
        if ((x & 0xff) == 0) {
            x >>= 8;
            r += 8;
        }
        if ((x & 0xf) == 0) {
            x >>= 4;
            r += 4;
        }
        if ((x & 3) == 0) {
            x >>= 2;
            r += 2;
        }
        if ((x & 1) == 0)++r;
        return r;
    }

    // (public) returns index of lowest 1-bit (or -1 if none)
    function bnGetLowestSetBit() {
        for (var i = 0; i < this.t; ++i)
            if (this[i] != 0) return i * this.DB + lbit(this[i]);
        if (this.s < 0) return this.t * this.DB;
        return -1;
    }

    // return number of 1 bits in x
    function cbit(x) {
        var r = 0;
        while (x != 0) {
            x &= x - 1;
            ++r;
        }
        return r;
    }

    // (public) return number of set bits
    function bnBitCount() {
        var r = 0,
            x = this.s & this.DM;
        for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
        return r;
    }

    // (public) true iff nth bit is set
    function bnTestBit(n) {
        var j = Math.floor(n / this.DB);
        if (j >= this.t) return (this.s != 0);
        return ((this[j] & (1 << (n % this.DB))) != 0);
    }

    // (protected) this op (1<<n)
    function bnpChangeBit(n, op) {
        var r = Int128.ONE.shiftLeft(n);
        this.bitwiseTo(r, op, r);
        return r;
    }

    // (public) this | (1<<n)
    function bnSetBit(n) {
        return this.changeBit(n, op_or);
    }

    // (public) this & ~(1<<n)
    function bnClearBit(n) {
        return this.changeBit(n, op_andnot);
    }

    // (public) this ^ (1<<n)
    function bnFlipBit(n) {
        return this.changeBit(n, op_xor);
    }

    // (protected) r = this + a
    function bnpAddTo(a, r) {
        var i = 0,
            c = 0,
            m = Math.min(a.t, this.t);
        while (i < m) {
            c += this[i] + a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        if (a.t < this.t) {
            c += a.s;
            while (i < this.t) {
                c += this[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += this.s;
        }
        else {
            c += this.s;
            while (i < a.t) {
                c += a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += a.s;
        }
        r.s = (c < 0) ? -1 : 0;
        if (c > 0) r[i++] = c;
        else if (c < -1) r[i++] = this.DV + c;
        r.t = i;
        r.clamp();
    }

    // (public) this + a
    function bnAdd(a) {
        var r = nbi();
        this.addTo(a, r);
        return r;
    }

    // (public) this - a
    function bnSubtract(a) {
        var r = nbi();
        this.subTo(a, r);
        return r;
    }

    // (public) this * a
    function bnMultiply(a) {
        var r = nbi();
        this.multiplyTo(a, r);
        return r;
    }

    // (public) this^2
    function bnSquare() {
        var r = nbi();
        this.squareTo(r);
        return r;
    }

    // (public) this / a
    function bnDivide(a) {
        var r = nbi();
        this.divRemTo(a, r, null);
        return r;
    }

    // (public) this % a
    function bnRemainder(a) {
        var r = nbi();
        this.divRemTo(a, null, r);
        return r;
    }

    // (public) [this/a,this%a]
    function bnDivideAndRemainder(a) {
        var q = nbi(),
            r = nbi();
        this.divRemTo(a, q, r);
        return new Array(q, r);
    }

    // (protected) this *= n, this >= 0, 1 < n < DV
    function bnpDMultiply(n) {
        this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
        ++this.t;
        this.clamp();
    }

    // (protected) this += n << w words, this >= 0
    function bnpDAddOffset(n, w) {
        if (n == 0) return;
        while (this.t <= w) this[this.t++] = 0;
        this[w] += n;
        while (this[w] >= this.DV) {
            this[w] -= this.DV;
            if (++w >= this.t) this[this.t++] = 0;
            ++this[w];
        }
    }

    // A "null" reducer
    function NullExp() {
    }

    function nNop(x) {
        return x;
    }

    function nMulTo(x, y, r) {
        x.multiplyTo(y, r);
    }

    function nSqrTo(x, r) {
        x.squareTo(r);
    }

    NullExp.prototype.convert = nNop;
    NullExp.prototype.revert = nNop;
    NullExp.prototype.mulTo = nMulTo;
    NullExp.prototype.sqrTo = nSqrTo;
    // (public) this^e
    function bnPow(e) {
        return this.exp(e, new NullExp());
    }

    // (protected) r = lower n words of "this * a", a.t <= n
    // "this" should be the larger one if appropriate.
    function bnpMultiplyLowerTo(a, n, r) {
        var i = Math.min(this.t + a.t, n);
        r.s = 0; // assumes a,this >= 0
        r.t = i;
        while (i > 0) r[--i] = 0;
        var j;
        for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
        for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
        r.clamp();
    }

    // (protected) r = "this * a" without lower n words, n > 0
    // "this" should be the larger one if appropriate.
    function bnpMultiplyUpperTo(a, n, r) {
        --n;
        var i = r.t = this.t + a.t - n;
        r.s = 0; // assumes a,this >= 0
        while (--i >= 0) r[i] = 0;
        for (i = Math.max(n - this.t, 0); i < a.t; ++i)
            r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
        r.clamp();
        r.drShiftTo(1, r);
    }

    // Barrett modular reduction
    function Barrett(m) {
        // setup Barrett
        this.r2 = nbi();
        this.q3 = nbi();
        Int128.ONE.dlShiftTo(2 * m.t, this.r2);
        this.mu = this.r2.divide(m);
        this.m = m;
    }

    function barrettConvert(x) {
        if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
        else if (x.compareTo(this.m) < 0) return x;
        else {
            var r = nbi();
            x.copyTo(r);
            this.reduce(r);
            return r;
        }
    }

    function barrettRevert(x) {
        return x;
    }

    // x = x mod m (HAC 14.42)
    function barrettReduce(x) {
        x.drShiftTo(this.m.t - 1, this.r2);
        if (x.t > this.m.t + 1) {
            x.t = this.m.t + 1;
            x.clamp();
        }
        this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
        this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
        while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
        x.subTo(this.r2, x);
        while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
    }

    // r = x^2 mod m; x != r
    function barrettSqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
    }

    // r = x*y mod m; x,y != r
    function barrettMulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    }

    Barrett.prototype.convert = barrettConvert;
    Barrett.prototype.revert = barrettRevert;
    Barrett.prototype.reduce = barrettReduce;
    Barrett.prototype.mulTo = barrettMulTo;
    Barrett.prototype.sqrTo = barrettSqrTo;
    // (public) this^e % m (HAC 14.85)
    function bnModPow(e, m) {
        var i = e.bitLength(),
            k, r = nbv(1),
            z;
        if (i <= 0) return r;
        else if (i < 18) k = 1;
        else if (i < 48) k = 3;
        else if (i < 144) k = 4;
        else if (i < 768) k = 5;
        else k = 6;
        if (i < 8) z = new Classic(m);
        else if (m.isEven()) z = new Barrett(m);
        else z = new Montgomery(m);
        // precomputation
        var g = [],
            n = 3,
            k1 = k - 1,
            km = (1 << k) - 1;
        g[1] = z.convert(this);
        if (k > 1) {
            var g2 = nbi();
            z.sqrTo(g[1], g2);
            while (n <= km) {
                g[n] = nbi();
                z.mulTo(g2, g[n - 2], g[n]);
                n += 2;
            }
        }
        var j = e.t - 1,
            w, is1 = true,
            r2 = nbi(),
            t;
        i = nbits(e[j]) - 1;
        while (j >= 0) {
            if (i >= k1) w = (e[j] >> (i - k1)) & km;
            else {
                w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
                if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
            }
            n = k;
            while ((w & 1) == 0) {
                w >>= 1;
                --n;
            }
            if ((i -= n) < 0) {
                i += this.DB;
                --j;
            }
            if (is1) { // ret == 1, don't bother squaring or multiplying it
                g[w].copyTo(r);
                is1 = false;
            }
            else {
                while (n > 1) {
                    z.sqrTo(r, r2);
                    z.sqrTo(r2, r);
                    n -= 2;
                }
                if (n > 0) z.sqrTo(r, r2);
                else {
                    t = r;
                    r = r2;
                    r2 = t;
                }
                z.mulTo(r2, g[w], r);
            }
            while (j >= 0 && (e[j] & (1 << i)) == 0) {
                z.sqrTo(r, r2);
                t = r;
                r = r2;
                r2 = t;
                if (--i < 0) {
                    i = this.DB - 1;
                    --j;
                }
            }
        }
        return z.revert(r);
    }

    // (public) gcd(this,a) (HAC 14.54)
    function bnGCD(a) {
        var x = (this.s < 0) ? this.negate() : this.clone();
        var y = (a.s < 0) ? a.negate() : a.clone();
        if (x.compareTo(y) < 0) {
            var t = x;
            x = y;
            y = t;
        }
        var i = x.getLowestSetBit(),
            g = y.getLowestSetBit();
        if (g < 0) return x;
        if (i < g) g = i;
        if (g > 0) {
            x.rShiftTo(g, x);
            y.rShiftTo(g, y);
        }
        while (x.signum() > 0) {
            if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
            if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
            if (x.compareTo(y) >= 0) {
                x.subTo(y, x);
                x.rShiftTo(1, x);
            }
            else {
                y.subTo(x, y);
                y.rShiftTo(1, y);
            }
        }
        if (g > 0) y.lShiftTo(g, y);
        return y;
    }

    // (protected) this % n, n < 2^26
    function bnpModInt(n) {
        if (n <= 0) return 0;
        var d = this.DV % n,
            r = (this.s < 0) ? n - 1 : 0;
        if (this.t > 0) if (d == 0) r = this[0] % n;
        else for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
        return r;
    }

    // (public) 1/this % m (HAC 14.61)
    function bnModInverse(m) {
        var ac = m.isEven();
        if ((this.isEven() && ac) || m.signum() == 0) return Int128.ZERO;
        var u = m.clone(),
            v = this.clone();
        var a = nbv(1),
            b = nbv(0),
            c = nbv(0),
            d = nbv(1);
        while (u.signum() != 0) {
            while (u.isEven()) {
                u.rShiftTo(1, u);
                if (ac) {
                    if (!a.isEven() || !b.isEven()) {
                        a.addTo(this, a);
                        b.subTo(m, b);
                    }
                    a.rShiftTo(1, a);
                }
                else if (!b.isEven()) b.subTo(m, b);
                b.rShiftTo(1, b);
            }
            while (v.isEven()) {
                v.rShiftTo(1, v);
                if (ac) {
                    if (!c.isEven() || !d.isEven()) {
                        c.addTo(this, c);
                        d.subTo(m, d);
                    }
                    c.rShiftTo(1, c);
                }
                else if (!d.isEven()) d.subTo(m, d);
                d.rShiftTo(1, d);
            }
            if (u.compareTo(v) >= 0) {
                u.subTo(v, u);
                if (ac) a.subTo(c, a);
                b.subTo(d, b);
            }
            else {
                v.subTo(u, v);
                if (ac) c.subTo(a, c);
                d.subTo(b, d);
            }
        }
        if (v.compareTo(Int128.ONE) != 0) return Int128.ZERO;
        if (d.compareTo(m) >= 0) return d.subtract(m);
        if (d.signum() < 0) d.addTo(m, d);
        else return d;
        if (d.signum() < 0) return d.add(m);
        else return d;
    }

    var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
    var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];
    // (public) test primality with certainty >= 1-.5^t
    function bnIsProbablePrime(t) {
        var i, x = this.abs();
        if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
            for (i = 0; i < lowprimes.length; ++i)
                if (x[0] == lowprimes[i]) return true;
            return false;
        }
        if (x.isEven()) return false;
        i = 1;
        while (i < lowprimes.length) {
            var m = lowprimes[i],
                j = i + 1;
            while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
            m = x.modInt(m);
            while (i < j) if (m % lowprimes[i++] == 0) return false;
        }
        return x.millerRabin(t);
    }

    // (protected) true if probably prime (HAC 4.24, Miller-Rabin)
    function bnpMillerRabin(t) {
        var n1 = this.subtract(Int128.ONE);
        var k = n1.getLowestSetBit();
        if (k <= 0) return false;
        var r = n1.shiftRight(k);
        t = (t + 1) >> 1;
        if (t > lowprimes.length) t = lowprimes.length;
        var a = nbi();
        for (var i = 0; i < t; ++i) {
            //Pick bases at random, instead of starting at 2
            a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
            var y = a.modPow(r, this);
            if (y.compareTo(Int128.ONE) != 0 && y.compareTo(n1) != 0) {
                var j = 1;
                while (j++ < k && y.compareTo(n1) != 0) {
                    y = y.modPowInt(2, this);
                    if (y.compareTo(Int128.ONE) == 0) return false;
                }
                if (y.compareTo(n1) != 0) return false;
            }
        }
        return true;
    }

    // protected
    Int128.prototype.chunkSize = bnpChunkSize;
    Int128.prototype.toRadix = bnpToRadix;
    Int128.prototype.fromRadix = bnpFromRadix;
    Int128.prototype.fromNumber = bnpFromNumber;
    Int128.prototype.bitwiseTo = bnpBitwiseTo;
    Int128.prototype.changeBit = bnpChangeBit;
    Int128.prototype.addTo = bnpAddTo;
    Int128.prototype.dMultiply = bnpDMultiply;
    Int128.prototype.dAddOffset = bnpDAddOffset;
    Int128.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
    Int128.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
    Int128.prototype.modInt = bnpModInt;
    Int128.prototype.millerRabin = bnpMillerRabin;
    // public
    Int128.prototype.clone = bnClone;
    Int128.prototype.intValue = bnIntValue;
    Int128.prototype.byteValue = bnByteValue;
    Int128.prototype.shortValue = bnShortValue;
    Int128.prototype.signum = bnSigNum;
    Int128.prototype.toByteArray = bnToByteArray;
    Int128.prototype.equals = bnEquals;
    Int128.prototype.min = bnMin;
    Int128.prototype.max = bnMax;
    Int128.prototype.and = bnAnd;
    Int128.prototype.or = bnOr;
    Int128.prototype.xor = bnXor;
    Int128.prototype.andNot = bnAndNot;
    Int128.prototype.not = bnNot;
    Int128.prototype.shiftLeft = bnShiftLeft;
    Int128.prototype.shiftRight = bnShiftRight;
    Int128.prototype.getLowestSetBit = bnGetLowestSetBit;
    Int128.prototype.bitCount = bnBitCount;
    Int128.prototype.testBit = bnTestBit;
    Int128.prototype.setBit = bnSetBit;
    Int128.prototype.clearBit = bnClearBit;
    Int128.prototype.flipBit = bnFlipBit;
    Int128.prototype.add = bnAdd;
    Int128.prototype.subtract = bnSubtract;
    Int128.prototype.multiply = bnMultiply;
    Int128.prototype.divide = bnDivide;
    Int128.prototype.remainder = bnRemainder;
    Int128.prototype.divideAndRemainder = bnDivideAndRemainder;
    Int128.prototype.modPow = bnModPow;
    Int128.prototype.modInverse = bnModInverse;
    Int128.prototype.pow = bnPow;
    Int128.prototype.gcd = bnGCD;
    Int128.prototype.isProbablePrime = bnIsProbablePrime;
    // JSBN-specific extension
    Int128.prototype.square = bnSquare;

    // end of Int128 section

    /*
     // Uncomment the following two lines if you want to use Int128 outside ClipperLib
     if (typeof(document) !== "undefined") window.Int128 = Int128;
     else self.Int128 = Int128;
     */

    // Here starts the actual Clipper library:
    ClipperLib.Math_Abs_Int64 = ClipperLib.Math_Abs_Int32 = ClipperLib.Math_Abs_Double = function (a) {
        return Math.abs(a);
    };
    ClipperLib.Math_Max_Int32_Int32 = function (a, b) {
        return Math.max(a, b);
    };
    /*
     -----------------------------------
     cast_32 speedtest: http://jsperf.com/truncate-float-to-integer/2
     -----------------------------------
     */
    if (browser.msie || browser.opera || browser.safari) ClipperLib.Cast_Int32 = function (a) {
        return a | 0;
    };
    else ClipperLib.Cast_Int32 = function (a) { // eg. browser.chrome || browser.chromium || browser.firefox
        return ~~a;
    };
    /*
     --------------------------
     cast_64 speedtests: http://jsperf.com/truncate-float-to-integer
     Chrome: bitwise_not_floor
     Firefox17: toInteger (typeof test)
     IE9: bitwise_or_floor
     IE7 and IE8: to_parseint
     Chromium: to_floor_or_ceil
     Firefox3: to_floor_or_ceil
     Firefox15: to_floor_or_ceil
     Opera: to_floor_or_ceil
     Safari: to_floor_or_ceil
     --------------------------
     */
    if (browser.chrome) ClipperLib.Cast_Int64 = function (a) {
        if (a < -2147483648 || a > 2147483647)
            return a < 0 ? Math.ceil(a) : Math.floor(a);
        else return ~~a;
    };
    else if (browser.firefox && typeof(Number.toInteger) == "function") ClipperLib.Cast_Int64 = function (a) {
        return Number.toInteger(a);
    };
    else if (browser.msie7 || browser.msie8) ClipperLib.Cast_Int64 = function (a) {
        return parseInt(a, 10);
    };
    else if (browser.msie) ClipperLib.Cast_Int64 = function (a) {
        if (a < -2147483648 || a > 2147483647)
            return a < 0 ? Math.ceil(a) : Math.floor(a);
        return a | 0;
    };
    // eg. browser.chromium || browser.firefox || browser.opera || browser.safari
    else ClipperLib.Cast_Int64 = function (a) {
            return a < 0 ? Math.ceil(a) : Math.floor(a);
        };
    ClipperLib.Clear = function (a) {
        a.length = 0;
    };
    ClipperLib.MaxSteps = 222; // How many steps at maximum in arc in BuildArc() function
    ClipperLib.PI = 3.141592653589793;
    ClipperLib.PI2 = 2 * 3.141592653589793;
    ClipperLib.IntPoint = function () {
        var a = arguments;
        if (a.length == 1) {
            this.X = a[0].X;
            this.Y = a[0].Y;

        }
        if (a.length == 2) {
            this.X = a[0];
            this.Y = a[1];
        }
    };
    ClipperLib.IntRect = function () {
        var a = arguments;
        if (a.length == 4) // function (l, t, r, b)
        {
            var l = a[0],
                t = a[1],
                r = a[2],
                b = a[3];
            this.left = l;
            this.top = t;
            this.right = r;
            this.bottom = b;
        }
        else {
            this.left = 0;
            this.top = 0;
            this.right = 0;
            this.bottom = 0;
        }
    };
    ClipperLib.Polygon = function () {
        return [];
    };
    ClipperLib.Polygons = function () {
        return []; // Was previously [[]], but caused problems when pushed
    };
    ClipperLib.ExPolygons = function () {
        var a = [];
        a.exPolygons = true; // this is needed to make "overloading" possible in Execute
        return a;
    }
    ClipperLib.ExPolygon = function () {
        this.outer = null;
        this.holes = null;
    };
    ClipperLib.ClipType = {
        ctIntersection: 0,
        ctUnion: 1,
        ctDifference: 2,
        ctXor: 3
    };
    ClipperLib.PolyType = {
        ptSubject: 0,
        ptClip: 1
    };
    ClipperLib.PolyFillType = {
        pftEvenOdd: 0,
        pftNonZero: 1,
        pftPositive: 2,
        pftNegative: 3
    };
    ClipperLib.JoinType = {
        jtSquare: 0,
        jtRound: 1,
        jtMiter: 2
    };

    ClipperLib.EdgeSide = {
        esLeft: 1,
        esRight: 2
    };
    ClipperLib.Protects = {
        ipNone: 0,
        ipLeft: 1,
        ipRight: 2,
        ipBoth: 3
    };
    ClipperLib.Direction = {
        dRightToLeft: 0,
        dLeftToRight: 1
    };
    ClipperLib.TEdge = function () {
        this.xbot = 0;
        this.ybot = 0;
        this.xcurr = 0;
        this.ycurr = 0;
        this.xtop = 0;
        this.ytop = 0;
        this.dx = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.tmpX = 0;
        this.polyType = ClipperLib.PolyType.ptSubject;
        this.side = null; //= ClipperLib.EdgeSide.esNeither;
        this.windDelta = 0;
        this.windCnt = 0;
        this.windCnt2 = 0;
        this.outIdx = 0;
        this.next = null;
        this.prev = null;
        this.nextInLML = null;
        this.nextInAEL = null;
        this.prevInAEL = null;
        this.nextInSEL = null;
        this.prevInSEL = null;
    };
    ClipperLib.IntersectNode = function () {
        this.edge1 = null;
        this.edge2 = null;
        this.pt = null;
        this.next = null;
    };
    ClipperLib.LocalMinima = function () {
        this.Y = 0;
        this.leftBound = null;
        this.rightBound = null;
        this.next = null;
    };
    ClipperLib.Scanbeam = function () {
        this.Y = 0;
        this.next = null;
    };
    ClipperLib.OutRec = function () {
        this.idx = 0;
        this.isHole = false;
        this.FirstLeft = null;
        this.AppendLink = null;
        this.pts = null;
        this.bottomPt = null;
    };
    ClipperLib.OutPt = function () {
        this.idx = 0;
        this.pt = null;
        this.next = null;
        this.prev = null;
    };
    ClipperLib.JoinRec = function () {
        this.pt1a = null;
        this.pt1b = null;
        this.poly1Idx = 0;
        this.pt2a = null;
        this.pt2b = null;
        this.poly2Idx = 0;
    };
    ClipperLib.HorzJoinRec = function () {
        this.edge = null;
        this.savedIdx = 0;
    };
    ClipperLib.ClipperBase = function () {
        this.m_MinimaList = null;
        this.m_CurrentLM = null;
        this.m_edges = [
            []
        ]; // 2-dimensional array
        this.m_UseFullRange = false;
    };
    // Ranges are in original C# too high for Javascript (in current state 2012 December):
    // protected const double horizontal = -3.4E+38;
    // internal const Int64 loRange = 0x3FFFFFFF; // = 1073741823 = sqrt(2^63 -1)/2
    // internal const Int64 hiRange = 0x3FFFFFFFFFFFFFFFL; // = 4611686018427387903 = sqrt(2^127 -1)/2
    // So had to adjust them to more suitable:
    ClipperLib.ClipperBase.horizontal = -9007199254740992; //-2^53
    ClipperLib.ClipperBase.loRange = 47453132; // sqrt(2^53 -1)/2
    ClipperLib.ClipperBase.hiRange = 4503599627370495; // sqrt(2^106 -1)/2
    // If JS some day supports truly 64-bit integers, then these ranges can be as in C#
    // and biginteger library can be more simpler (as then 128bit can be represented as two 64bit numbers)
    ClipperLib.ClipperBase.PointsEqual = function (pt1, pt2) {
        return (pt1.X == pt2.X && pt1.Y == pt2.Y);
    };
    ClipperLib.ClipperBase.prototype.PointIsVertex = function (pt, pp) {
        var pp2 = pp;
        do {
            if (ClipperLib.ClipperBase.PointsEqual(pp2.pt, pt)) return true;
            pp2 = pp2.next;
        }
        while (pp2 != pp);
        return false;
    };
    ClipperLib.ClipperBase.prototype.PointInPolygon = function (pt, pp, UseFulllongRange) {
        var pp2 = pp;
        var result = false;
        if (UseFulllongRange) {
            do {
                if ((((pp2.pt.Y <= pt.Y) && (pt.Y < pp2.prev.pt.Y)) || ((pp2.prev.pt.Y <= pt.Y) && (pt.Y < pp2.pt.Y))) && new Int128(pt.X - pp2.pt.X)
                    .compareTo(
                        new Int128(pp2.prev.pt.X - pp2.pt.X)
                            .multiply(new Int128(pt.Y - pp2.pt.Y))
                            .divide(
                                new Int128(pp2.prev.pt.Y - pp2.pt.Y))) < 0) result = !result;
                pp2 = pp2.next;
            }
            while (pp2 != pp);
        }
        else {
            do {
                if ((((pp2.pt.Y <= pt.Y) && (pt.Y < pp2.prev.pt.Y)) || ((pp2.prev.pt.Y <= pt.Y) && (pt.Y < pp2.pt.Y))) && (pt.X - pp2.pt.X < (pp2.prev.pt.X - pp2.pt.X) * (pt.Y - pp2.pt.Y) / (pp2.prev.pt.Y - pp2.pt.Y))) result = !result;
                pp2 = pp2.next;
            }
            while (pp2 != pp);
        }
        return result;
    };
    ClipperLib.ClipperBase.prototype.SlopesEqual = ClipperLib.ClipperBase.SlopesEqual = function () {
        var a = arguments;
        var e1, e2, pt1, pt2, pt3, pt4, UseFullRange;
        if (a.length == 3) // function (e1, e2, UseFullRange)
        {
            e1 = a[0], e2 = a[1], UseFullRange = a[2];
            if (UseFullRange) return new Int128(e1.deltaY)
                .multiply(new Int128(e2.deltaX))
                .toString() == new Int128(e1.deltaX)
                .multiply(new Int128(e2.deltaY))
                .toString();
            else return (e1.deltaY) * (e2.deltaX) == (e1.deltaX) * (e2.deltaY);
        }
        else if (a.length == 4) // function (pt1, pt2, pt3, UseFullRange)
        {
            pt1 = a[0], pt2 = a[1], pt3 = a[2], UseFullRange = a[3];
            if (UseFullRange) return new Int128(pt1.Y - pt2.Y)
                .multiply(new Int128(pt2.X - pt3.X))
                .toString() == new Int128(pt1.X - pt2.X)
                .multiply(new Int128(pt2.Y - pt3.Y))
                .toString();
            else return (pt1.Y - pt2.Y) * (pt2.X - pt3.X) - (pt1.X - pt2.X) * (pt2.Y - pt3.Y) == 0;
        }
        else if (a.length == 5) // function (pt1, pt2, pt3, pt4, UseFullRange)
        {
            pt1 = a[0], pt2 = a[1], pt3 = a[2], pt4 = a[3], UseFullRange = a[4];
            if (UseFullRange) return new Int128(pt1.Y - pt2.Y)
                .multiply(new Int128(pt3.X - pt4.X))
                .toString() == new Int128(pt1.X - pt2.X)
                .multiply(new Int128(pt3.Y - pt4.Y))
                .toString();
            else return (pt1.Y - pt2.Y) * (pt3.X - pt4.X) - (pt1.X - pt2.X) * (pt3.Y - pt4.Y) == 0;
        }
    };
    ClipperLib.ClipperBase.prototype.Clear = function () {
        this.DisposeLocalMinimaList();
        for (var i = 0; i < this.m_edges.length; ++i) {
            for (var j = 0; j < this.m_edges[i].length; ++j)
                this.m_edges[i][j] = null;
            ClipperLib.Clear(this.m_edges[i]);
        }
        ClipperLib.Clear(this.m_edges);
        this.m_UseFullRange = false;
    };
    ClipperLib.ClipperBase.prototype.DisposeLocalMinimaList = function () {
        while (this.m_MinimaList != null) {
            var tmpLm = this.m_MinimaList.next;
            this.m_MinimaList = null;
            this.m_MinimaList = tmpLm;
        }
        this.m_CurrentLM = null;
    };
    ClipperLib.ClipperBase.prototype.AddPolygons = function (ppg, polyType) {
        var result = false;
        var res = false;
        if (!(ppg instanceof Array)) return result;
        for (var i = 0; i < ppg.length; ++i) {
            res = this.AddPolygon(ppg[i], polyType, true);
            if (res && res != "exceed") result = true;
            else if (res == "exceed") break;
        }
        if (res == "exceed") ClipperLib.Error("Coordinate exceeds range bounds in AddPolygons().");
        return result;
    };
    ClipperLib.ClipperBase.prototype.AddPolygon = function (pg, polyType, multiple) {
        if (!(pg instanceof Array)) return false;
        var len = pg.length;
        if (len < 3) return false;
        var p = new ClipperLib.Polygon();
        p.push(new ClipperLib.IntPoint(pg[0].X, pg[0].Y));
        var j = 0;
        var i;
        var exceed = false;
        for (i = 1; i < len; ++i) {
            var maxVal;
            if (this.m_UseFullRange) maxVal = ClipperLib.ClipperBase.hiRange;
            else maxVal = ClipperLib.ClipperBase.loRange;
            if (ClipperLib.Math_Abs_Int64(pg[i].X) > maxVal || ClipperLib.Math_Abs_Int64(pg[i].Y) > maxVal) {
                if (ClipperLib.Math_Abs_Int64(pg[i].X) > ClipperLib.ClipperBase.hiRange || ClipperLib.Math_Abs_Int64(pg[i].Y) > ClipperLib.ClipperBase.hiRange) {
                    if (typeof(multiple) != "undefined") return "exceed";
                    exceed = true;
                    break;
                }
                maxVal = ClipperLib.ClipperBase.hiRange;
                this.m_UseFullRange = true;
            }
            if (ClipperLib.ClipperBase.PointsEqual(p[j], pg[i])) continue;
            else if (j > 0 && this.SlopesEqual(p[j - 1], p[j], pg[i], this.m_UseFullRange)) {
                if (ClipperLib.ClipperBase.PointsEqual(p[j - 1], pg[i])) j--;
            }
            else j++;
            if (j < p.length) p[j] = pg[i];
            else p.push(new ClipperLib.IntPoint(pg[i].X, pg[i].Y));
        }
        if (exceed && typeof(multiple) == "undefined")
            ClipperLib.Error("Coordinate exceeds range bounds in AddPolygon()");

        if (j < 2) return false;
        len = j + 1;
        while (len > 2) {
            if (ClipperLib.ClipperBase.PointsEqual(p[j], p[0])) j--;
            else if (ClipperLib.ClipperBase.PointsEqual(p[0], p[1]) || this.SlopesEqual(p[j], p[0], p[1], this.m_UseFullRange)) p[0] = p[j--];
            else if (this.SlopesEqual(p[j - 1], p[j], p[0], this.m_UseFullRange)) j--;
            else if (this.SlopesEqual(p[0], p[1], p[2], this.m_UseFullRange)) {
                for (i = 2; i <= j; ++i)
                    p[i - 1] = p[i];
                j--;
            }
            else break;
            len--;
        }

        if (len < 3) return false;
        var edges = [];
        for (i = 0; i < len; i++)
            edges.push(new ClipperLib.TEdge());
        this.m_edges.push(edges);
        edges[0].xcurr = p[0].X;
        edges[0].ycurr = p[0].Y;
        this.InitEdge(edges[len - 1], edges[0], edges[len - 2], p[len - 1], polyType);
        for (i = len - 2; i > 0; --i)
            this.InitEdge(edges[i], edges[i + 1], edges[i - 1], p[i], polyType);
        this.InitEdge(edges[0], edges[1], edges[len - 1], p[0], polyType);
        var e = edges[0];
        var eHighest = e;
        do {
            e.xcurr = e.xbot;
            e.ycurr = e.ybot;
            if (e.ytop < eHighest.ytop) eHighest = e;
            e = e.next;
        }
        while (e != edges[0]);
        if (eHighest.windDelta > 0) eHighest = eHighest.next;
        if (eHighest.dx == ClipperLib.ClipperBase.horizontal) eHighest = eHighest.next;
        e = eHighest;
        do {
            e = this.AddBoundsToLML(e);
        }
        while (e != eHighest);
        return true;
    };
    ClipperLib.ClipperBase.prototype.InitEdge = function (e, eNext, ePrev, pt, polyType) {
        e.next = eNext;
        e.prev = ePrev;
        e.xcurr = pt.X;
        e.ycurr = pt.Y;
        if (e.ycurr >= e.next.ycurr) {
            e.xbot = e.xcurr;
            e.ybot = e.ycurr;
            e.xtop = e.next.xcurr;
            e.ytop = e.next.ycurr;
            e.windDelta = 1;
        }
        else {
            e.xtop = e.xcurr;
            e.ytop = e.ycurr;
            e.xbot = e.next.xcurr;
            e.ybot = e.next.ycurr;
            e.windDelta = -1;
        }
        this.SetDx(e);
        e.polyType = polyType;
        e.outIdx = -1;
    };
    ClipperLib.ClipperBase.prototype.SetDx = function (e) {
        e.deltaX = (e.xtop - e.xbot);
        e.deltaY = (e.ytop - e.ybot);
        if (e.deltaY == 0) e.dx = ClipperLib.ClipperBase.horizontal;
        else e.dx = (e.deltaX) / (e.deltaY);
    };
    ClipperLib.ClipperBase.prototype.AddBoundsToLML = function (e) {
        e.nextInLML = null;
        e = e.next;
        for (; ;) {
            if (e.dx == ClipperLib.ClipperBase.horizontal) {
                if (e.next.ytop < e.ytop && e.next.xbot > e.prev.xbot) break;
                if (e.xtop != e.prev.xbot) this.SwapX(e);
                e.nextInLML = e.prev;
            }
            else if (e.ycurr == e.prev.ycurr) break;
            else e.nextInLML = e.prev;
            e = e.next;
        }
        var newLm = new ClipperLib.LocalMinima();
        newLm.next = null;
        newLm.Y = e.prev.ybot;
        if (e.dx == ClipperLib.ClipperBase.horizontal) {
            if (e.xbot != e.prev.xbot) this.SwapX(e);
            newLm.leftBound = e.prev;
            newLm.rightBound = e;
        }
        else if (e.dx < e.prev.dx) {
            newLm.leftBound = e.prev;
            newLm.rightBound = e;
        }
        else {
            newLm.leftBound = e;
            newLm.rightBound = e.prev;
        }
        newLm.leftBound.side = ClipperLib.EdgeSide.esLeft;
        newLm.rightBound.side = ClipperLib.EdgeSide.esRight;
        this.InsertLocalMinima(newLm);
        for (; ;) {
            if (e.next.ytop == e.ytop && e.next.dx != ClipperLib.ClipperBase.horizontal) break;
            e.nextInLML = e.next;
            e = e.next;
            if (e.dx == ClipperLib.ClipperBase.horizontal && e.xbot != e.prev.xtop) this.SwapX(e);
        }
        return e.next;
    };
    ClipperLib.ClipperBase.prototype.InsertLocalMinima = function (newLm) {
        if (this.m_MinimaList == null) {
            this.m_MinimaList = newLm;
        }
        else if (newLm.Y >= this.m_MinimaList.Y) {
            newLm.next = this.m_MinimaList;
            this.m_MinimaList = newLm;
        }
        else {
            var tmpLm = this.m_MinimaList;
            while (tmpLm.next != null && (newLm.Y < tmpLm.next.Y))
                tmpLm = tmpLm.next;
            newLm.next = tmpLm.next;
            tmpLm.next = newLm;
        }
    };
    ClipperLib.ClipperBase.prototype.PopLocalMinima = function () {
        if (this.m_CurrentLM == null) return;
        this.m_CurrentLM = this.m_CurrentLM.next;
    };
    ClipperLib.ClipperBase.prototype.SwapX = function (e) {
        e.xcurr = e.xtop;
        e.xtop = e.xbot;
        e.xbot = e.xcurr;
    };
    ClipperLib.ClipperBase.prototype.Reset = function () {
        this.m_CurrentLM = this.m_MinimaList;
        var lm = this.m_MinimaList;
        while (lm != null) {
            var e = lm.leftBound;
            while (e != null) {
                e.xcurr = e.xbot;
                e.ycurr = e.ybot;
                e.side = ClipperLib.EdgeSide.esLeft;
                e.outIdx = -1;
                e = e.nextInLML;
            }
            e = lm.rightBound;
            while (e != null) {
                e.xcurr = e.xbot;
                e.ycurr = e.ybot;
                e.side = ClipperLib.EdgeSide.esRight;
                e.outIdx = -1;
                e = e.nextInLML;
            }
            lm = lm.next;
        }
        return;
    };
    ClipperLib.ClipperBase.prototype.GetBounds = function () {
        var result = new ClipperLib.IntRect();
        var lm = this.m_MinimaList;
        if (lm == null) return result;
        result.left = lm.leftBound.xbot;
        result.top = lm.leftBound.ybot;
        result.right = lm.leftBound.xbot;
        result.bottom = lm.leftBound.ybot;
        while (lm != null) {
            if (lm.leftBound.ybot > result.bottom) result.bottom = lm.leftBound.ybot;
            var e = lm.leftBound;
            for (; ;) {
                var bottomE = e;
                while (e.nextInLML != null) {
                    if (e.xbot < result.left) result.left = e.xbot;
                    if (e.xbot > result.right) result.right = e.xbot;
                    e = e.nextInLML;
                }
                if (e.xbot < result.left) result.left = e.xbot;
                if (e.xbot > result.right) result.right = e.xbot;
                if (e.xtop < result.left) result.left = e.xtop;
                if (e.xtop > result.right) result.right = e.xtop;
                if (e.ytop < result.top) result.top = e.ytop;
                if (bottomE == lm.leftBound) e = lm.rightBound;
                else break;
            }
            lm = lm.next;
        }
        return result;
    };
    ClipperLib.Clipper = function () {
        this.m_PolyOuts = null;
        this.m_ClipType = ClipperLib.ClipType.ctIntersection;
        this.m_Scanbeam = null;
        this.m_ActiveEdges = null;
        this.m_SortedEdges = null;
        this.m_IntersectNodes = null;
        this.m_ExecuteLocked = false;
        this.m_ClipFillType = ClipperLib.PolyFillType.pftEvenOdd;
        this.m_SubjFillType = ClipperLib.PolyFillType.pftEvenOdd;
        this.m_Joins = null;
        this.m_HorizJoins = null;
        this.m_ReverseOutput = false;
        this.m_UsingExPolygons = false;
        ClipperLib.ClipperBase.call(this);
        this.m_Scanbeam = null;
        this.m_ActiveEdges = null;
        this.m_SortedEdges = null;
        this.m_ExecuteLocked = false;
        this.m_PolyOuts = [];
        this.m_Joins = [];
        this.m_HorizJoins = [];
        this.m_ReverseOutput = false;
        this.m_UsingExPolygons = false;
    };
    ClipperLib.Clipper.prototype.Clear = function () {
        if (this.m_edges.length == 0) return;
        this.DisposeAllPolyPts();
        ClipperLib.ClipperBase.prototype.Clear.call(this);
    };
    ClipperLib.Clipper.prototype.DisposeScanbeamList = function () {
        while (this.m_Scanbeam != null) {
            var sb2 = this.m_Scanbeam.next;
            this.m_Scanbeam = null;
            this.m_Scanbeam = sb2;
        }
    };
    ClipperLib.Clipper.prototype.Reset = function () {
        ClipperLib.ClipperBase.prototype.Reset.call(this);
        this.m_Scanbeam = null;
        this.m_ActiveEdges = null;
        this.m_SortedEdges = null;
        this.DisposeAllPolyPts();
        var lm = this.m_MinimaList;
        while (lm != null) {
            this.InsertScanbeam(lm.Y);
            this.InsertScanbeam(lm.leftBound.ytop);
            lm = lm.next;
        }
    };
    ClipperLib.Clipper.prototype.get_ReverseSolution = function () {
        return this.m_ReverseOutput;
    };
    ClipperLib.Clipper.prototype.set_ReverseSolution = function (value) {
        this.m_ReverseOutput = value;
    };
    ClipperLib.Clipper.prototype.InsertScanbeam = function (Y) {
        var newSb;
        if (this.m_Scanbeam == null) {
            this.m_Scanbeam = new ClipperLib.Scanbeam();
            this.m_Scanbeam.next = null;
            this.m_Scanbeam.Y = Y;
        }
        else if (Y > this.m_Scanbeam.Y) {
            newSb = new ClipperLib.Scanbeam();
            newSb.Y = Y;
            newSb.next = this.m_Scanbeam;
            this.m_Scanbeam = newSb;
        }
        else {
            var sb2 = this.m_Scanbeam;
            while (sb2.next != null && (Y <= sb2.next.Y))
                sb2 = sb2.next;
            if (Y == sb2.Y) return;
            newSb = new ClipperLib.Scanbeam();
            newSb.Y = Y;
            newSb.next = sb2.next;
            sb2.next = newSb;
        }
    };
    ClipperLib.Clipper.prototype.Execute = function (clipType, solution, subjFillType, clipFillType) {
        var succeeded;
        if (arguments.length == 2) {
            subjFillType = ClipperLib.PolyFillType.pftEvenOdd;
            clipFillType = ClipperLib.PolyFillType.pftEvenOdd;
        }
        if (typeof(solution.exPolygons) == "undefined") // hacky way to test if solution is not exPolygons
        {
            if (this.m_ExecuteLocked) return false;
            this.m_ExecuteLocked = true;
            ClipperLib.Clear(solution);
            this.m_SubjFillType = subjFillType;
            this.m_ClipFillType = clipFillType;
            this.m_ClipType = clipType;
            this.m_UsingExPolygons = false;
            succeeded = this.ExecuteInternal();
            if (succeeded) {
                this.BuildResult(solution);
            }
            this.m_ExecuteLocked = false;
            return succeeded;
        }
        else {
            if (this.m_ExecuteLocked) return false;
            this.m_ExecuteLocked = true;
            ClipperLib.Clear(solution);
            this.m_SubjFillType = subjFillType;
            this.m_ClipFillType = clipFillType;
            this.m_ClipType = clipType;
            this.m_UsingExPolygons = true;
            succeeded = this.ExecuteInternal();
            if (succeeded) {
                this.BuildResultEx(solution);
            }
            this.m_ExecuteLocked = false;
            return succeeded;
        }
    };
    ClipperLib.Clipper.prototype.PolySort = function (or1, or2) {
        if (or1 == or2) return 0;
        else if (or1.pts == null || or2.pts == null) {
            if ((or1.pts == null) != (or2.pts == null)) {
                return or1.pts == null ? 1 : -1;
            }
            else return 0;
        }
        var i1, i2;
        if (or1.isHole) i1 = or1.FirstLeft.idx;
        else i1 = or1.idx;
        if (or2.isHole) i2 = or2.FirstLeft.idx;
        else i2 = or2.idx;
        var result = i1 - i2;
        if (result == 0 && (or1.isHole != or2.isHole)) {
            return or1.isHole ? 1 : -1;
        }
        return result;
    };
    ClipperLib.Clipper.prototype.FindAppendLinkEnd = function (outRec) {
        while (outRec.AppendLink != null)
            outRec = outRec.AppendLink;
        return outRec;
    };
    ClipperLib.Clipper.prototype.FixHoleLinkage = function (outRec) {
        var tmp;
        if (outRec.bottomPt != null) tmp = this.m_PolyOuts[outRec.bottomPt.idx].FirstLeft;
        else tmp = outRec.FirstLeft;
        if (outRec == tmp) ClipperLib.Error("HoleLinkage error");
        if (tmp != null) {
            if (tmp.AppendLink != null) tmp = this.FindAppendLinkEnd(tmp);
            if (tmp == outRec) tmp = null;
            else if (tmp.isHole) {
                this.FixHoleLinkage(tmp);
                tmp = tmp.FirstLeft;
            }
        }
        outRec.FirstLeft = tmp;
        if (tmp == null) outRec.isHole = false;
        outRec.AppendLink = null;
    };
    ClipperLib.Clipper.prototype.ExecuteInternal = function () {
        var succeeded;
        try {
            this.Reset();
            if (this.m_CurrentLM == null) return true;
            var botY = this.PopScanbeam();
            do {
                this.InsertLocalMinimaIntoAEL(botY);
                ClipperLib.Clear(this.m_HorizJoins);
                this.ProcessHorizontals();
                var topY = this.PopScanbeam();
                succeeded = this.ProcessIntersections(botY, topY);
                if (!succeeded) break;
                this.ProcessEdgesAtTopOfScanbeam(topY);
                botY = topY;
            }
            while (this.m_Scanbeam != null);
        }
        catch ($$e1) {
            succeeded = false;
        }
        if (succeeded) {
            var outRec;
            for (var i = 0; i < this.m_PolyOuts.length; i++) {
                outRec = this.m_PolyOuts[i];
                if (outRec.pts == null) continue;
                this.FixupOutPolygon(outRec);
                if (outRec.pts == null) continue;
                if (outRec.isHole && this.m_UsingExPolygons) this.FixHoleLinkage(outRec);

                if ((outRec.isHole ^ this.m_ReverseOutput) == (this.Area(outRec, this.m_UseFullRange) > 0))
                    this.ReversePolyPtLinks(outRec.pts);
            }
            this.JoinCommonEdges();
            if (this.m_UsingExPolygons) this.m_PolyOuts.sort(this.PolySort);
        }
        ClipperLib.Clear(this.m_Joins);
        ClipperLib.Clear(this.m_HorizJoins);
        return succeeded;
    };
    ClipperLib.Clipper.prototype.PopScanbeam = function () {
        var Y = this.m_Scanbeam.Y;
        var sb2 = this.m_Scanbeam;
        this.m_Scanbeam = this.m_Scanbeam.next;
        sb2 = null;
        return Y;
    };
    ClipperLib.Clipper.prototype.DisposeAllPolyPts = function () {
        for (var i = 0; i < this.m_PolyOuts.length; ++i)
            this.DisposeOutRec(i);
        ClipperLib.Clear(this.m_PolyOuts);
    };
    ClipperLib.Clipper.prototype.DisposeOutRec = function (index) {
        var outRec = this.m_PolyOuts[index];
        if (outRec.pts != null) this.DisposeOutPts(outRec.pts);
        outRec = null;
        this.m_PolyOuts[index] = null;
    };
    ClipperLib.Clipper.prototype.DisposeOutPts = function (pp) {
        if (pp == null) return;
        var tmpPp = null;
        pp.prev.next = null;
        while (pp != null) {
            tmpPp = pp;
            pp = pp.next;
            tmpPp = null;
        }
    };
    ClipperLib.Clipper.prototype.AddJoin = function (e1, e2, e1OutIdx, e2OutIdx) {
        var jr = new ClipperLib.JoinRec();
        if (e1OutIdx >= 0) jr.poly1Idx = e1OutIdx;
        else jr.poly1Idx = e1.outIdx;
        jr.pt1a = new ClipperLib.IntPoint(e1.xcurr, e1.ycurr);
        jr.pt1b = new ClipperLib.IntPoint(e1.xtop, e1.ytop);
        if (e2OutIdx >= 0) jr.poly2Idx = e2OutIdx;
        else jr.poly2Idx = e2.outIdx;
        jr.pt2a = new ClipperLib.IntPoint(e2.xcurr, e2.ycurr);
        jr.pt2b = new ClipperLib.IntPoint(e2.xtop, e2.ytop);
        this.m_Joins.push(jr);
    };
    ClipperLib.Clipper.prototype.AddHorzJoin = function (e, idx) {
        var hj = new ClipperLib.HorzJoinRec();
        hj.edge = e;
        hj.savedIdx = idx;
        this.m_HorizJoins.push(hj);
    };
    ClipperLib.Clipper.prototype.InsertLocalMinimaIntoAEL = function (botY) {
        var pt, pt2;
        while (this.m_CurrentLM != null && (this.m_CurrentLM.Y == botY)) {
            var lb = this.m_CurrentLM.leftBound;
            var rb = this.m_CurrentLM.rightBound;
            this.InsertEdgeIntoAEL(lb);
            this.InsertScanbeam(lb.ytop);
            this.InsertEdgeIntoAEL(rb);
            if (this.IsEvenOddFillType(lb)) {
                lb.windDelta = 1;
                rb.windDelta = 1;
            }
            else {
                rb.windDelta = -lb.windDelta;
            }
            this.SetWindingCount(lb);
            rb.windCnt = lb.windCnt;
            rb.windCnt2 = lb.windCnt2;
            if (rb.dx == ClipperLib.ClipperBase.horizontal) {
                this.AddEdgeToSEL(rb);
                this.InsertScanbeam(rb.nextInLML.ytop);
            }
            else this.InsertScanbeam(rb.ytop);
            if (this.IsContributing(lb)) this.AddLocalMinPoly(lb, rb, new ClipperLib.IntPoint(lb.xcurr, this.m_CurrentLM.Y));
            if (rb.outIdx >= 0) {
                if (rb.dx == ClipperLib.ClipperBase.horizontal) {
                    for (var i = 0; i < this.m_HorizJoins.length; i++) {
                        pt = new ClipperLib.IntPoint(), pt2 = new ClipperLib.IntPoint();
                        var hj = this.m_HorizJoins[i];
                        if ((function () {
                            pt = {
                                Value: pt
                            };
                            pt2 = {
                                Value: pt2
                            };
                            var $res = this.GetOverlapSegment(new ClipperLib.IntPoint(hj.edge.xbot, hj.edge.ybot),
                                new ClipperLib.IntPoint(hj.edge.xtop, hj.edge.ytop),
                                new ClipperLib.IntPoint(rb.xbot, rb.ybot),
                                new ClipperLib.IntPoint(rb.xtop, rb.ytop),
                                pt, pt2);
                            pt = pt.Value;
                            pt2 = pt2.Value;
                            return $res;
                        })
                            .call(this)) this.AddJoin(hj.edge, rb, hj.savedIdx, -1);
                    }
                }
            }
            if (lb.nextInAEL != rb) {
                if (rb.outIdx >= 0 && rb.prevInAEL.outIdx >= 0 && this.SlopesEqual(rb.prevInAEL, rb, this.m_UseFullRange)) this.AddJoin(rb, rb.prevInAEL, -1, -1);
                var e = lb.nextInAEL;
                pt = new ClipperLib.IntPoint(lb.xcurr, lb.ycurr);
                while (e != rb) {
                    if (e == null) ClipperLib.Error("InsertLocalMinimaIntoAEL: missing rightbound!");
                    this.IntersectEdges(rb, e, pt, ClipperLib.Protects.ipNone);
                    e = e.nextInAEL;
                }
            }
            this.PopLocalMinima();
        }
    };
    ClipperLib.Clipper.prototype.InsertEdgeIntoAEL = function (edge) {
        edge.prevInAEL = null;
        edge.nextInAEL = null;
        if (this.m_ActiveEdges == null) {
            this.m_ActiveEdges = edge;
        }
        else if (this.E2InsertsBeforeE1(this.m_ActiveEdges, edge)) {
            edge.nextInAEL = this.m_ActiveEdges;
            this.m_ActiveEdges.prevInAEL = edge;
            this.m_ActiveEdges = edge;
        }
        else {
            var e = this.m_ActiveEdges;
            while (e.nextInAEL != null && !this.E2InsertsBeforeE1(e.nextInAEL, edge))
                e = e.nextInAEL;
            edge.nextInAEL = e.nextInAEL;
            if (e.nextInAEL != null) e.nextInAEL.prevInAEL = edge;
            edge.prevInAEL = e;
            e.nextInAEL = edge;
        }
    };
    ClipperLib.Clipper.prototype.E2InsertsBeforeE1 = function (e1, e2) {
        return e2.xcurr == e1.xcurr ? e2.dx > e1.dx : e2.xcurr < e1.xcurr;
    };
    ClipperLib.Clipper.prototype.IsEvenOddFillType = function (edge) {
        if (edge.polyType == ClipperLib.PolyType.ptSubject) return this.m_SubjFillType == ClipperLib.PolyFillType.pftEvenOdd;
        else return this.m_ClipFillType == ClipperLib.PolyFillType.pftEvenOdd;
    };
    ClipperLib.Clipper.prototype.IsEvenOddAltFillType = function (edge) {
        if (edge.polyType == ClipperLib.PolyType.ptSubject) return this.m_ClipFillType == ClipperLib.PolyFillType.pftEvenOdd;
        else return this.m_SubjFillType == ClipperLib.PolyFillType.pftEvenOdd;
    };
    ClipperLib.Clipper.prototype.IsContributing = function (edge) {
        var pft, pft2;
        if (edge.polyType == ClipperLib.PolyType.ptSubject) {
            pft = this.m_SubjFillType;
            pft2 = this.m_ClipFillType;
        }
        else {
            pft = this.m_ClipFillType;
            pft2 = this.m_SubjFillType;
        }
        switch (pft) {
            case ClipperLib.PolyFillType.pftEvenOdd:
            case ClipperLib.PolyFillType.pftNonZero:
                if (ClipperLib.Math_Abs_Int32(edge.windCnt) != 1) return false;
                break;
            case ClipperLib.PolyFillType.pftPositive:
                if (edge.windCnt != 1) return false;
                break;
            default:
                if (edge.windCnt != -1) return false;
                break;
        }
        switch (this.m_ClipType) {
            case ClipperLib.ClipType.ctIntersection:
                switch (pft2) {
                    case ClipperLib.PolyFillType.pftEvenOdd:
                    case ClipperLib.PolyFillType.pftNonZero:
                        return (edge.windCnt2 != 0);
                    case ClipperLib.PolyFillType.pftPositive:
                        return (edge.windCnt2 > 0);
                    default:
                        return (edge.windCnt2 < 0);
                }
                break;
            case ClipperLib.ClipType.ctUnion:
                switch (pft2) {
                    case ClipperLib.PolyFillType.pftEvenOdd:
                    case ClipperLib.PolyFillType.pftNonZero:
                        return (edge.windCnt2 == 0);
                    case ClipperLib.PolyFillType.pftPositive:
                        return (edge.windCnt2 <= 0);
                    default:
                        return (edge.windCnt2 >= 0);
                }
                break;
            case ClipperLib.ClipType.ctDifference:
                if (edge.polyType == ClipperLib.PolyType.ptSubject) switch (pft2) {
                    case ClipperLib.PolyFillType.pftEvenOdd:
                    case ClipperLib.PolyFillType.pftNonZero:
                        return (edge.windCnt2 == 0);
                    case ClipperLib.PolyFillType.pftPositive:
                        return (edge.windCnt2 <= 0);
                    default:
                        return (edge.windCnt2 >= 0);
                }
                else switch (pft2) {
                    case ClipperLib.PolyFillType.pftEvenOdd:
                    case ClipperLib.PolyFillType.pftNonZero:
                        return (edge.windCnt2 != 0);
                    case ClipperLib.PolyFillType.pftPositive:
                        return (edge.windCnt2 > 0);
                    default:
                        return (edge.windCnt2 < 0);
                }
        }
        return true;
    };
    ClipperLib.Clipper.prototype.SetWindingCount = function (edge) {
        var e = edge.prevInAEL;
        while (e != null && e.polyType != edge.polyType)
            e = e.prevInAEL;
        if (e == null) {
            edge.windCnt = edge.windDelta;
            edge.windCnt2 = 0;
            e = this.m_ActiveEdges;
        }
        else if (this.IsEvenOddFillType(edge)) {
            edge.windCnt = 1;
            edge.windCnt2 = e.windCnt2;
            e = e.nextInAEL;
        }
        else {
            if (e.windCnt * e.windDelta < 0) {
                if (ClipperLib.Math_Abs_Int32(e.windCnt) > 1) {
                    if (e.windDelta * edge.windDelta < 0) edge.windCnt = e.windCnt;
                    else edge.windCnt = e.windCnt + edge.windDelta;
                }
                else edge.windCnt = e.windCnt + e.windDelta + edge.windDelta;
            }
            else {
                if (ClipperLib.Math_Abs_Int32(e.windCnt) > 1 && e.windDelta * edge.windDelta < 0) edge.windCnt = e.windCnt;
                else if (e.windCnt + edge.windDelta == 0) edge.windCnt = e.windCnt;
                else edge.windCnt = e.windCnt + edge.windDelta;
            }
            edge.windCnt2 = e.windCnt2;
            e = e.nextInAEL;
        }
        if (this.IsEvenOddAltFillType(edge)) {
            while (e != edge) {
                edge.windCnt2 = (edge.windCnt2 == 0) ? 1 : 0;
                e = e.nextInAEL;
            }
        }
        else {
            while (e != edge) {
                edge.windCnt2 += e.windDelta;
                e = e.nextInAEL;
            }
        }
    };
    ClipperLib.Clipper.prototype.AddEdgeToSEL = function (edge) {
        if (this.m_SortedEdges == null) {
            this.m_SortedEdges = edge;
            edge.prevInSEL = null;
            edge.nextInSEL = null;
        }
        else {
            edge.nextInSEL = this.m_SortedEdges;
            edge.prevInSEL = null;
            this.m_SortedEdges.prevInSEL = edge;
            this.m_SortedEdges = edge;
        }
    };
    ClipperLib.Clipper.prototype.CopyAELToSEL = function () {
        var e = this.m_ActiveEdges;
        this.m_SortedEdges = e;
        if (this.m_ActiveEdges == null) return;
        this.m_SortedEdges.prevInSEL = null;
        e = e.nextInAEL;
        while (e != null) {
            e.prevInSEL = e.prevInAEL;
            e.prevInSEL.nextInSEL = e;
            e.nextInSEL = null;
            e = e.nextInAEL;
        }
    };
    ClipperLib.Clipper.prototype.SwapPositionsInAEL = function (edge1, edge2) {
        var next, prev;
        if (edge1.nextInAEL == null && edge1.prevInAEL == null) return;
        if (edge2.nextInAEL == null && edge2.prevInAEL == null) return;
        if (edge1.nextInAEL == edge2) {
            next = edge2.nextInAEL;
            if (next != null) next.prevInAEL = edge1;
            prev = edge1.prevInAEL;
            if (prev != null) prev.nextInAEL = edge2;
            edge2.prevInAEL = prev;
            edge2.nextInAEL = edge1;
            edge1.prevInAEL = edge2;
            edge1.nextInAEL = next;
        }
        else if (edge2.nextInAEL == edge1) {
            next = edge1.nextInAEL;
            if (next != null) next.prevInAEL = edge2;
            prev = edge2.prevInAEL;
            if (prev != null) prev.nextInAEL = edge1;
            edge1.prevInAEL = prev;
            edge1.nextInAEL = edge2;
            edge2.prevInAEL = edge1;
            edge2.nextInAEL = next;
        }
        else {
            next = edge1.nextInAEL;
            prev = edge1.prevInAEL;
            edge1.nextInAEL = edge2.nextInAEL;
            if (edge1.nextInAEL != null) edge1.nextInAEL.prevInAEL = edge1;
            edge1.prevInAEL = edge2.prevInAEL;
            if (edge1.prevInAEL != null) edge1.prevInAEL.nextInAEL = edge1;
            edge2.nextInAEL = next;
            if (edge2.nextInAEL != null) edge2.nextInAEL.prevInAEL = edge2;
            edge2.prevInAEL = prev;
            if (edge2.prevInAEL != null) edge2.prevInAEL.nextInAEL = edge2;
        }
        if (edge1.prevInAEL == null) this.m_ActiveEdges = edge1;
        else if (edge2.prevInAEL == null) this.m_ActiveEdges = edge2;
    };
    ClipperLib.Clipper.prototype.SwapPositionsInSEL = function (edge1, edge2) {
        var next, prev;
        if (edge1.nextInSEL == null && edge1.prevInSEL == null) return;
        if (edge2.nextInSEL == null && edge2.prevInSEL == null) return;
        if (edge1.nextInSEL == edge2) {
            next = edge2.nextInSEL;
            if (next != null) next.prevInSEL = edge1;
            prev = edge1.prevInSEL;
            if (prev != null) prev.nextInSEL = edge2;
            edge2.prevInSEL = prev;
            edge2.nextInSEL = edge1;
            edge1.prevInSEL = edge2;
            edge1.nextInSEL = next;
        }
        else if (edge2.nextInSEL == edge1) {
            next = edge1.nextInSEL;
            if (next != null) next.prevInSEL = edge2;
            prev = edge2.prevInSEL;
            if (prev != null) prev.nextInSEL = edge1;
            edge1.prevInSEL = prev;
            edge1.nextInSEL = edge2;
            edge2.prevInSEL = edge1;
            edge2.nextInSEL = next;
        }
        else {
            next = edge1.nextInSEL;
            prev = edge1.prevInSEL;
            edge1.nextInSEL = edge2.nextInSEL;
            if (edge1.nextInSEL != null) edge1.nextInSEL.prevInSEL = edge1;
            edge1.prevInSEL = edge2.prevInSEL;
            if (edge1.prevInSEL != null) edge1.prevInSEL.nextInSEL = edge1;
            edge2.nextInSEL = next;
            if (edge2.nextInSEL != null) edge2.nextInSEL.prevInSEL = edge2;
            edge2.prevInSEL = prev;
            if (edge2.prevInSEL != null) edge2.prevInSEL.nextInSEL = edge2;
        }
        if (edge1.prevInSEL == null) this.m_SortedEdges = edge1;
        else if (edge2.prevInSEL == null) this.m_SortedEdges = edge2;
    };
    ClipperLib.Clipper.prototype.AddLocalMaxPoly = function (e1, e2, pt) {
        this.AddOutPt(e1, pt);
        if (e1.outIdx == e2.outIdx) {
            e1.outIdx = -1;
            e2.outIdx = -1;
        }
        else if (e1.outIdx < e2.outIdx) this.AppendPolygon(e1, e2);
        else this.AppendPolygon(e2, e1);
    };
    ClipperLib.Clipper.prototype.AddLocalMinPoly = function (e1, e2, pt) {
        var e, prevE;
        if (e2.dx == ClipperLib.ClipperBase.horizontal || (e1.dx > e2.dx)) {
            this.AddOutPt(e1, pt);
            e2.outIdx = e1.outIdx;
            e1.side = ClipperLib.EdgeSide.esLeft;
            e2.side = ClipperLib.EdgeSide.esRight;
            e = e1;
            if (e.prevInAEL == e2) prevE = e2.prevInAEL;
            else prevE = e.prevInAEL;
        }
        else {
            this.AddOutPt(e2, pt);
            e1.outIdx = e2.outIdx;
            e1.side = ClipperLib.EdgeSide.esRight;
            e2.side = ClipperLib.EdgeSide.esLeft;
            e = e2;
            if (e.prevInAEL == e1) prevE = e1.prevInAEL;
            else prevE = e.prevInAEL;
        }
        if (prevE != null && prevE.outIdx >= 0 && (ClipperLib.Clipper.TopX(prevE, pt.Y) == ClipperLib.Clipper.TopX(e, pt.Y)) && this.SlopesEqual(e, prevE, this.m_UseFullRange)) this.AddJoin(e, prevE, -1, -1);
    };
    ClipperLib.Clipper.prototype.CreateOutRec = function () {
        var result = new ClipperLib.OutRec();
        result.idx = -1;
        result.isHole = false;
        result.FirstLeft = null;
        result.AppendLink = null;
        result.pts = null;
        result.bottomPt = null;
        return result;
    };
    ClipperLib.Clipper.prototype.AddOutPt = function (e, pt) {
        var outRec, op;
        var ToFront = (e.side == ClipperLib.EdgeSide.esLeft);
        if (e.outIdx < 0) {
            outRec = this.CreateOutRec();
            this.m_PolyOuts.push(outRec);
            outRec.idx = this.m_PolyOuts.length - 1;
            e.outIdx = outRec.idx;
            op = new ClipperLib.OutPt();
            outRec.pts = op;
            outRec.bottomPt = op;
            op.pt = pt;
            op.idx = outRec.idx;
            op.next = op;
            op.prev = op;
            this.SetHoleState(e, outRec);
        }
        else {
            outRec = this.m_PolyOuts[e.outIdx];
            op = outRec.pts;
            var op2;
            if (ToFront && ClipperLib.ClipperBase.PointsEqual(pt, op.pt) || (!ToFront && ClipperLib.ClipperBase.PointsEqual(pt, op.prev.pt))) return;
            op2 = new ClipperLib.OutPt();
            op2.pt = pt;
            op2.idx = outRec.idx;
            if (op2.pt.Y == outRec.bottomPt.pt.Y && op2.pt.X < outRec.bottomPt.pt.X) outRec.bottomPt = op2;
            op2.next = op;
            op2.prev = op.prev;
            op2.prev.next = op2;
            op.prev = op2;
            if (ToFront) outRec.pts = op2;
        }
    };
    ClipperLib.Clipper.prototype.SwapPoints = function (pt1, pt2) {
        var tmp = pt1.Value;
        pt1.Value = pt2.Value;
        pt2.Value = tmp;
    };
    ClipperLib.Clipper.prototype.GetOverlapSegment = function (pt1a, pt1b, pt2a, pt2b, pt1, pt2) {
        if (ClipperLib.Math_Abs_Int64(pt1a.X - pt1b.X) > ClipperLib.Math_Abs_Int64(pt1a.Y - pt1b.Y)) {
            if (pt1a.X > pt1b.X)
                (function () {
                    pt1a = {
                        Value: pt1a
                    };
                    pt1b = {
                        Value: pt1b
                    };
                    var $res = this.SwapPoints(pt1a, pt1b);
                    pt1a = pt1a.Value;
                    pt1b = pt1b.Value;
                    return $res;
                })
                    .call(this);
            if (pt2a.X > pt2b.X)
                (function () {
                    pt2a = {
                        Value: pt2a
                    };
                    pt2b = {
                        Value: pt2b
                    };
                    var $res = this.SwapPoints(pt2a, pt2b);
                    pt2a = pt2a.Value;
                    pt2b = pt2b.Value;
                    return $res;
                })
                    .call(this);
            if (pt1a.X > pt2a.X) pt1.Value = pt1a;
            else pt1.Value = pt2a;
            if (pt1b.X < pt2b.X) pt2.Value = pt1b;
            else pt2.Value = pt2b;
            return pt1.Value.X < pt2.Value.X;
        }
        else {
            if (pt1a.Y < pt1b.Y)
                (function () {
                    pt1a = {
                        Value: pt1a
                    };
                    pt1b = {
                        Value: pt1b
                    };
                    var $res = this.SwapPoints(pt1a, pt1b);
                    pt1a = pt1a.Value;
                    pt1b = pt1b.Value;
                    return $res;
                })
                    .call(this);
            if (pt2a.Y < pt2b.Y)
                (function () {
                    pt2a = {
                        Value: pt2a
                    };
                    pt2b = {
                        Value: pt2b
                    };
                    var $res = this.SwapPoints(pt2a, pt2b);
                    pt2a = pt2a.Value;
                    pt2b = pt2b.Value;
                    return $res;
                })
                    .call(this);
            if (pt1a.Y < pt2a.Y) pt1.Value = pt1a;
            else pt1.Value = pt2a;
            if (pt1b.Y > pt2b.Y) pt2.Value = pt1b;
            else pt2.Value = pt2b;
            return pt1.Value.Y > pt2.Value.Y;
        }
    };
    ClipperLib.Clipper.prototype.FindSegment = function (pp, UseFullInt64Range, pt1, pt2) {
        if (pp.Value == null) return false;
        var pp2 = pp.Value;
        var pt1a = new ClipperLib.IntPoint(pt1.Value);
        var pt2a = new ClipperLib.IntPoint(pt2.Value);
        do {
            // Timo's comment: for some reason calling SlopesEqual() below uses big integers
            // So although coordinates are low (eg. 900), big integers are sometimes used.
            // => Fixed according to changes in original Clipper ver 5.1.2 (25 February 2013)
            if (this.SlopesEqual(pt1a, pt2a, pp.Value.pt, pp.Value.prev.pt, UseFullInt64Range) && this.SlopesEqual(pt1a, pt2a, pp.Value.pt, UseFullInt64Range) && this.GetOverlapSegment(pt1a, pt2a, pp.Value.pt, pp.Value.prev.pt, pt1, pt2)) return true;
            pp.Value = pp.Value.next;
        }
        while (pp.Value != pp2);
        return false;
    };
    ClipperLib.Clipper.prototype.Pt3IsBetweenPt1AndPt2 = function (pt1, pt2, pt3) {
        if (ClipperLib.ClipperBase.PointsEqual(pt1, pt3) || ClipperLib.ClipperBase.PointsEqual(pt2, pt3)) return true;
        else if (pt1.X != pt2.X) return (pt1.X < pt3.X) == (pt3.X < pt2.X);
        else return (pt1.Y < pt3.Y) == (pt3.Y < pt2.Y);
    };
    ClipperLib.Clipper.prototype.InsertPolyPtBetween = function (p1, p2, pt) {
        var result = new ClipperLib.OutPt();
        result.pt = pt;
        if (p2 == p1.next) {
            p1.next = result;
            p2.prev = result;
            result.next = p2;
            result.prev = p1;
        }
        else {
            p2.next = result;
            p1.prev = result;
            result.next = p1;
            result.prev = p2;
        }
        return result;
    };
    ClipperLib.Clipper.prototype.SetHoleState = function (e, outRec) {
        var isHole = false;
        var e2 = e.prevInAEL;
        while (e2 != null) {
            if (e2.outIdx >= 0) {
                isHole = !isHole;
                if (outRec.FirstLeft == null) outRec.FirstLeft = this.m_PolyOuts[e2.outIdx];
            }
            e2 = e2.prevInAEL;
        }
        if (isHole) outRec.isHole = true;
    };
    ClipperLib.Clipper.prototype.GetDx = function (pt1, pt2) {
        if (pt1.Y == pt2.Y) return ClipperLib.ClipperBase.horizontal;
        else return (pt2.X - pt1.X) / (pt2.Y - pt1.Y);
    };
    ClipperLib.Clipper.prototype.FirstIsBottomPt = function (btmPt1, btmPt2) {
        var p = btmPt1.prev;
        while (ClipperLib.ClipperBase.PointsEqual(p.pt, btmPt1.pt) && (p != btmPt1))
            p = p.prev;
        var dx1p = ClipperLib.Math_Abs_Double(this.GetDx(btmPt1.pt, p.pt));
        p = btmPt1.next;
        while (ClipperLib.ClipperBase.PointsEqual(p.pt, btmPt1.pt) && (p != btmPt1))
            p = p.next;
        var dx1n = ClipperLib.Math_Abs_Double(this.GetDx(btmPt1.pt, p.pt));
        p = btmPt2.prev;
        while (ClipperLib.ClipperBase.PointsEqual(p.pt, btmPt2.pt) && (p != btmPt2))
            p = p.prev;
        var dx2p = ClipperLib.Math_Abs_Double(this.GetDx(btmPt2.pt, p.pt));
        p = btmPt2.next;
        while (ClipperLib.ClipperBase.PointsEqual(p.pt, btmPt2.pt) && (p != btmPt2))
            p = p.next;
        var dx2n = ClipperLib.Math_Abs_Double(this.GetDx(btmPt2.pt, p.pt));
        return (dx1p >= dx2p && dx1p >= dx2n) || (dx1n >= dx2p && dx1n >= dx2n);
    };
    ClipperLib.Clipper.prototype.GetBottomPt = function (pp) {
        var dups = null;
        var p = pp.next;
        while (p != pp) {
            if (p.pt.Y > pp.pt.Y) {
                pp = p;
                dups = null;
            }
            else if (p.pt.Y == pp.pt.Y && p.pt.X <= pp.pt.X) {
                if (p.pt.X < pp.pt.X) {
                    dups = null;
                    pp = p;
                }
                else {
                    if (p.next != pp && p.prev != pp) dups = p;
                }
            }
            p = p.next;
        }
        if (dups != null) {
            while (dups != p) {
                if (!this.FirstIsBottomPt(p, dups)) pp = dups;
                dups = dups.next;
                while (!ClipperLib.ClipperBase.PointsEqual(dups.pt, pp.pt))
                    dups = dups.next;
            }
        }
        return pp;
    };
    ClipperLib.Clipper.prototype.GetLowermostRec = function (outRec1, outRec2) {
        var bPt1 = outRec1.bottomPt;
        var bPt2 = outRec2.bottomPt;
        if (bPt1.pt.Y > bPt2.pt.Y) return outRec1;
        else if (bPt1.pt.Y < bPt2.pt.Y) return outRec2;
        else if (bPt1.pt.X < bPt2.pt.X) return outRec1;
        else if (bPt1.pt.X > bPt2.pt.X) return outRec2;
        else if (bPt1.next == bPt1) return outRec2;
        else if (bPt2.next == bPt2) return outRec1;
        else if (this.FirstIsBottomPt(bPt1, bPt2)) return outRec1;
        else return outRec2;
    };
    ClipperLib.Clipper.prototype.Param1RightOfParam2 = function (outRec1, outRec2) {
        do {
            outRec1 = outRec1.FirstLeft;
            if (outRec1 == outRec2) return true;
        }
        while (outRec1 != null);
        return false;
    };
    ClipperLib.Clipper.prototype.AppendPolygon = function (e1, e2) {
        var outRec1 = this.m_PolyOuts[e1.outIdx];
        var outRec2 = this.m_PolyOuts[e2.outIdx];
        var holeStateRec;
        if (this.Param1RightOfParam2(outRec1, outRec2)) holeStateRec = outRec2;
        else if (this.Param1RightOfParam2(outRec2, outRec1)) holeStateRec = outRec1;
        else holeStateRec = this.GetLowermostRec(outRec1, outRec2);
        var p1_lft = outRec1.pts;
        var p1_rt = p1_lft.prev;
        var p2_lft = outRec2.pts;
        var p2_rt = p2_lft.prev;
        var side;
        var i;
        if (e1.side == ClipperLib.EdgeSide.esLeft) {
            if (e2.side == ClipperLib.EdgeSide.esLeft) {
                this.ReversePolyPtLinks(p2_lft);
                p2_lft.next = p1_lft;
                p1_lft.prev = p2_lft;
                p1_rt.next = p2_rt;
                p2_rt.prev = p1_rt;
                outRec1.pts = p2_rt;
            }
            else {
                p2_rt.next = p1_lft;
                p1_lft.prev = p2_rt;
                p2_lft.prev = p1_rt;
                p1_rt.next = p2_lft;
                outRec1.pts = p2_lft;
            }
            side = ClipperLib.EdgeSide.esLeft;
        }
        else {
            if (e2.side == ClipperLib.EdgeSide.esRight) {
                this.ReversePolyPtLinks(p2_lft);
                p1_rt.next = p2_rt;
                p2_rt.prev = p1_rt;
                p2_lft.next = p1_lft;
                p1_lft.prev = p2_lft;
            }
            else {
                p1_rt.next = p2_lft;
                p2_lft.prev = p1_rt;
                p1_lft.prev = p2_rt;
                p2_rt.next = p1_lft;
            }
            side = ClipperLib.EdgeSide.esRight;
        }
        if (holeStateRec == outRec2) {
            outRec1.bottomPt = outRec2.bottomPt;
            outRec1.bottomPt.idx = outRec1.idx;
            if (outRec2.FirstLeft != outRec1) outRec1.FirstLeft = outRec2.FirstLeft;
            outRec1.isHole = outRec2.isHole;
        }
        outRec2.pts = null;
        outRec2.bottomPt = null;
        outRec2.AppendLink = outRec1;
        var OKIdx = e1.outIdx;
        var ObsoleteIdx = e2.outIdx;
        e1.outIdx = -1;
        e2.outIdx = -1;
        var e = this.m_ActiveEdges;
        while (e != null) {
            if (e.outIdx == ObsoleteIdx) {
                e.outIdx = OKIdx;
                e.side = side;
                break;
            }
            e = e.nextInAEL;
        }
        for (i = 0; i < this.m_Joins.length; ++i) {
            if (this.m_Joins[i].poly1Idx == ObsoleteIdx) this.m_Joins[i].poly1Idx = OKIdx;
            if (this.m_Joins[i].poly2Idx == ObsoleteIdx) this.m_Joins[i].poly2Idx = OKIdx;
        }
        for (i = 0; i < this.m_HorizJoins.length; ++i) {
            if (this.m_HorizJoins[i].savedIdx == ObsoleteIdx) this.m_HorizJoins[i].savedIdx = OKIdx;
        }
    };
    ClipperLib.Clipper.prototype.ReversePolyPtLinks = function (pp) {
        if (pp == null) return;
        var pp1;
        var pp2;
        pp1 = pp;
        do {
            pp2 = pp1.next;
            pp1.next = pp1.prev;
            pp1.prev = pp2;
            pp1 = pp2;
        }
        while (pp1 != pp);
    };
    ClipperLib.Clipper.SwapSides = function (edge1, edge2) {
        var side = edge1.side;
        edge1.side = edge2.side;
        edge2.side = side;
    };
    ClipperLib.Clipper.SwapPolyIndexes = function (edge1, edge2) {
        var outIdx = edge1.outIdx;
        edge1.outIdx = edge2.outIdx;
        edge2.outIdx = outIdx;
    };
    ClipperLib.Clipper.prototype.DoEdge1 = function (edge1, edge2, pt) {
        this.AddOutPt(edge1, pt);
        ClipperLib.Clipper.SwapSides(edge1, edge2);
        ClipperLib.Clipper.SwapPolyIndexes(edge1, edge2);
    };
    ClipperLib.Clipper.prototype.DoEdge2 = function (edge1, edge2, pt) {
        this.AddOutPt(edge2, pt);
        ClipperLib.Clipper.SwapSides(edge1, edge2);
        ClipperLib.Clipper.SwapPolyIndexes(edge1, edge2);
    };
    ClipperLib.Clipper.prototype.DoBothEdges = function (edge1, edge2, pt) {
        this.AddOutPt(edge1, pt);
        this.AddOutPt(edge2, pt);
        ClipperLib.Clipper.SwapSides(edge1, edge2);
        ClipperLib.Clipper.SwapPolyIndexes(edge1, edge2);
    };
    ClipperLib.Clipper.prototype.IntersectEdges = function (e1, e2, pt, protects) {
        var e1stops = (ClipperLib.Protects.ipLeft & protects) == 0 && e1.nextInLML == null && e1.xtop == pt.X && e1.ytop == pt.Y;
        var e2stops = (ClipperLib.Protects.ipRight & protects) == 0 && e2.nextInLML == null && e2.xtop == pt.X && e2.ytop == pt.Y;
        var e1Contributing = (e1.outIdx >= 0);
        var e2contributing = (e2.outIdx >= 0);
        if (e1.polyType == e2.polyType) {
            if (this.IsEvenOddFillType(e1)) {
                var oldE1WindCnt = e1.windCnt;
                e1.windCnt = e2.windCnt;
                e2.windCnt = oldE1WindCnt;
            }
            else {
                if (e1.windCnt + e2.windDelta == 0) e1.windCnt = -e1.windCnt;
                else e1.windCnt += e2.windDelta;
                if (e2.windCnt - e1.windDelta == 0) e2.windCnt = -e2.windCnt;
                else e2.windCnt -= e1.windDelta;
            }
        }
        else {
            if (!this.IsEvenOddFillType(e2)) e1.windCnt2 += e2.windDelta;
            else e1.windCnt2 = (e1.windCnt2 == 0) ? 1 : 0;
            if (!this.IsEvenOddFillType(e1)) e2.windCnt2 -= e1.windDelta;
            else e2.windCnt2 = (e2.windCnt2 == 0) ? 1 : 0;
        }
        var e1FillType, e2FillType, e1FillType2, e2FillType2;
        if (e1.polyType == ClipperLib.PolyType.ptSubject) {
            e1FillType = this.m_SubjFillType;
            e1FillType2 = this.m_ClipFillType;
        }
        else {
            e1FillType = this.m_ClipFillType;
            e1FillType2 = this.m_SubjFillType;
        }
        if (e2.polyType == ClipperLib.PolyType.ptSubject) {
            e2FillType = this.m_SubjFillType;
            e2FillType2 = this.m_ClipFillType;
        }
        else {
            e2FillType = this.m_ClipFillType;
            e2FillType2 = this.m_SubjFillType;
        }
        var e1Wc, e2Wc;
        switch (e1FillType) {
            case ClipperLib.PolyFillType.pftPositive:
                e1Wc = e1.windCnt;
                break;
            case ClipperLib.PolyFillType.pftNegative:
                e1Wc = -e1.windCnt;
                break;
            default:
                e1Wc = ClipperLib.Math_Abs_Int32(e1.windCnt);
                break;
        }
        switch (e2FillType) {
            case ClipperLib.PolyFillType.pftPositive:
                e2Wc = e2.windCnt;
                break;
            case ClipperLib.PolyFillType.pftNegative:
                e2Wc = -e2.windCnt;
                break;
            default:
                e2Wc = ClipperLib.Math_Abs_Int32(e2.windCnt);
                break;
        }
        if (e1Contributing && e2contributing) {
            if (e1stops || e2stops || (e1Wc != 0 && e1Wc != 1) || (e2Wc != 0 && e2Wc != 1) || (e1.polyType != e2.polyType && this.m_ClipType != ClipperLib.ClipType.ctXor)) this.AddLocalMaxPoly(e1, e2, pt);
            else this.DoBothEdges(e1, e2, pt);
        }
        else if (e1Contributing) {
            if ((e2Wc == 0 || e2Wc == 1) && (this.m_ClipType != ClipperLib.ClipType.ctIntersection || e2.polyType == ClipperLib.PolyType.ptSubject || (e2.windCnt2 != 0))) this.DoEdge1(e1, e2, pt);
        }
        else if (e2contributing) {
            if ((e1Wc == 0 || e1Wc == 1) && (this.m_ClipType != ClipperLib.ClipType.ctIntersection || e1.polyType == ClipperLib.PolyType.ptSubject || (e1.windCnt2 != 0))) this.DoEdge2(e1, e2, pt);
        }
        else if ((e1Wc == 0 || e1Wc == 1) && (e2Wc == 0 || e2Wc == 1) && !e1stops && !e2stops) {
            var e1Wc2, e2Wc2;
            switch (e1FillType2) {
                case ClipperLib.PolyFillType.pftPositive:
                    e1Wc2 = e1.windCnt2;
                    break;
                case ClipperLib.PolyFillType.pftNegative:
                    e1Wc2 = -e1.windCnt2;
                    break;
                default:
                    e1Wc2 = ClipperLib.Math_Abs_Int32(e1.windCnt2);
                    break;
            }
            switch (e2FillType2) {
                case ClipperLib.PolyFillType.pftPositive:
                    e2Wc2 = e2.windCnt2;
                    break;
                case ClipperLib.PolyFillType.pftNegative:
                    e2Wc2 = -e2.windCnt2;
                    break;
                default:
                    e2Wc2 = ClipperLib.Math_Abs_Int32(e2.windCnt2);
                    break;
            }
            if (e1.polyType != e2.polyType) this.AddLocalMinPoly(e1, e2, pt);
            else if (e1Wc == 1 && e2Wc == 1) switch (this.m_ClipType) {
                case ClipperLib.ClipType.ctIntersection:
                    if (e1Wc2 > 0 && e2Wc2 > 0) this.AddLocalMinPoly(e1, e2, pt);
                    break;
                case ClipperLib.ClipType.ctUnion:
                    if (e1Wc2 <= 0 && e2Wc2 <= 0) this.AddLocalMinPoly(e1, e2, pt);
                    break;
                case ClipperLib.ClipType.ctDifference:
                    if (((e1.polyType == ClipperLib.PolyType.ptClip) && (e1Wc2 > 0) && (e2Wc2 > 0)) || ((e1.polyType == ClipperLib.PolyType.ptSubject) && (e1Wc2 <= 0) && (e2Wc2 <= 0))) this.AddLocalMinPoly(e1, e2, pt);
                    break;
                case ClipperLib.ClipType.ctXor:
                    this.AddLocalMinPoly(e1, e2, pt);
                    break;
            }
            else ClipperLib.Clipper.SwapSides(e1, e2);
        }
        if ((e1stops != e2stops) && ((e1stops && (e1.outIdx >= 0)) || (e2stops && (e2.outIdx >= 0)))) {
            ClipperLib.Clipper.SwapSides(e1, e2);
            ClipperLib.Clipper.SwapPolyIndexes(e1, e2);
        }
        if (e1stops) this.DeleteFromAEL(e1);
        if (e2stops) this.DeleteFromAEL(e2);
    };
    ClipperLib.Clipper.prototype.DeleteFromAEL = function (e) {
        var AelPrev = e.prevInAEL;
        var AelNext = e.nextInAEL;
        if (AelPrev == null && AelNext == null && (e != this.m_ActiveEdges)) return;
        if (AelPrev != null) AelPrev.nextInAEL = AelNext;
        else this.m_ActiveEdges = AelNext;
        if (AelNext != null) AelNext.prevInAEL = AelPrev;
        e.nextInAEL = null;
        e.prevInAEL = null;
    };
    ClipperLib.Clipper.prototype.DeleteFromSEL = function (e) {
        var SelPrev = e.prevInSEL;
        var SelNext = e.nextInSEL;
        if (SelPrev == null && SelNext == null && (e != this.m_SortedEdges)) return;
        if (SelPrev != null) SelPrev.nextInSEL = SelNext;
        else this.m_SortedEdges = SelNext;
        if (SelNext != null) SelNext.prevInSEL = SelPrev;
        e.nextInSEL = null;
        e.prevInSEL = null;
    };
    ClipperLib.Clipper.prototype.UpdateEdgeIntoAEL = function (e) {
        if (e.Value.nextInLML == null) ClipperLib.Error("UpdateEdgeIntoAEL: invalid call");
        var AelPrev = e.Value.prevInAEL;
        var AelNext = e.Value.nextInAEL;
        e.Value.nextInLML.outIdx = e.Value.outIdx;
        if (AelPrev != null) AelPrev.nextInAEL = e.Value.nextInLML;
        else this.m_ActiveEdges = e.Value.nextInLML;
        if (AelNext != null) AelNext.prevInAEL = e.Value.nextInLML;
        e.Value.nextInLML.side = e.Value.side;
        e.Value.nextInLML.windDelta = e.Value.windDelta;
        e.Value.nextInLML.windCnt = e.Value.windCnt;
        e.Value.nextInLML.windCnt2 = e.Value.windCnt2;
        e.Value = e.Value.nextInLML;
        e.Value.prevInAEL = AelPrev;
        e.Value.nextInAEL = AelNext;
        if (e.Value.dx != ClipperLib.ClipperBase.horizontal) this.InsertScanbeam(e.Value.ytop);
    };
    ClipperLib.Clipper.prototype.ProcessHorizontals = function () {
        var horzEdge = this.m_SortedEdges;
        while (horzEdge != null) {
            this.DeleteFromSEL(horzEdge);
            this.ProcessHorizontal(horzEdge);
            horzEdge = this.m_SortedEdges;
        }
    };
    ClipperLib.Clipper.prototype.ProcessHorizontal = function (horzEdge) {
        var Direction;
        var horzLeft, horzRight;
        if (horzEdge.xcurr < horzEdge.xtop) {
            horzLeft = horzEdge.xcurr;
            horzRight = horzEdge.xtop;
            Direction = ClipperLib.Direction.dLeftToRight;
        }
        else {
            horzLeft = horzEdge.xtop;
            horzRight = horzEdge.xcurr;
            Direction = ClipperLib.Direction.dRightToLeft;
        }
        var eMaxPair;
        if (horzEdge.nextInLML != null) eMaxPair = null;
        else eMaxPair = this.GetMaximaPair(horzEdge);
        var e = this.GetNextInAEL(horzEdge, Direction);
        while (e != null) {
            var eNext = this.GetNextInAEL(e, Direction);
            if (eMaxPair != null || ((Direction == ClipperLib.Direction.dLeftToRight) && (e.xcurr <= horzRight)) || ((Direction == ClipperLib.Direction.dRightToLeft) && (e.xcurr >= horzLeft))) {
                if (e.xcurr == horzEdge.xtop && eMaxPair == null) {
                    if (this.SlopesEqual(e, horzEdge.nextInLML, this.m_UseFullRange)) {
                        if (horzEdge.outIdx >= 0 && e.outIdx >= 0) this.AddJoin(horzEdge.nextInLML, e, horzEdge.outIdx, -1);
                        break;
                    }
                    else if (e.dx < horzEdge.nextInLML.dx) break;
                }
                if (e == eMaxPair) {
                    if (Direction == ClipperLib.Direction.dLeftToRight) this.IntersectEdges(horzEdge, e, new ClipperLib.IntPoint(e.xcurr, horzEdge.ycurr), 0);
                    else this.IntersectEdges(e, horzEdge, new ClipperLib.IntPoint(e.xcurr, horzEdge.ycurr), 0);
                    if (eMaxPair.outIdx >= 0) ClipperLib.Error("ProcessHorizontal error");
                    return;
                }
                else if (e.dx == ClipperLib.ClipperBase.horizontal && !this.IsMinima(e) && !(e.xcurr > e.xtop)) {
                    if (Direction == ClipperLib.Direction.dLeftToRight) this.IntersectEdges(horzEdge, e, new ClipperLib.IntPoint(e.xcurr, horzEdge.ycurr), (this.IsTopHorz(horzEdge, e.xcurr)) ? ClipperLib.Protects.ipLeft : ClipperLib.Protects.ipBoth);
                    else this.IntersectEdges(e, horzEdge, new ClipperLib.IntPoint(e.xcurr, horzEdge.ycurr), (this.IsTopHorz(horzEdge, e.xcurr)) ? ClipperLib.Protects.ipRight : ClipperLib.Protects.ipBoth);
                }
                else if (Direction == ClipperLib.Direction.dLeftToRight) {
                    this.IntersectEdges(horzEdge, e, new ClipperLib.IntPoint(e.xcurr, horzEdge.ycurr), (this.IsTopHorz(horzEdge, e.xcurr)) ? ClipperLib.Protects.ipLeft : ClipperLib.Protects.ipBoth);
                }
                else {
                    this.IntersectEdges(e, horzEdge, new ClipperLib.IntPoint(e.xcurr, horzEdge.ycurr), (this.IsTopHorz(horzEdge, e.xcurr)) ? ClipperLib.Protects.ipRight : ClipperLib.Protects.ipBoth);
                }
                this.SwapPositionsInAEL(horzEdge, e);
            }
            else if ((Direction == ClipperLib.Direction.dLeftToRight && e.xcurr > horzRight && horzEdge.nextInSEL == null) || (Direction == ClipperLib.Direction.dRightToLeft && e.xcurr < horzLeft && horzEdge.nextInSEL == null)) break;
            e = eNext;
        }
        if (horzEdge.nextInLML != null) {
            if (horzEdge.outIdx >= 0) this.AddOutPt(horzEdge, new ClipperLib.IntPoint(horzEdge.xtop, horzEdge.ytop));
            (function () {
                horzEdge = {
                    Value: horzEdge
                };
                var $res = this.UpdateEdgeIntoAEL(horzEdge);
                horzEdge = horzEdge.Value;
                return $res;
            })
                .call(this);
        }
        else {
            if (horzEdge.outIdx >= 0) this.IntersectEdges(horzEdge, eMaxPair, new ClipperLib.IntPoint(horzEdge.xtop, horzEdge.ycurr), ClipperLib.Protects.ipBoth);
            this.DeleteFromAEL(eMaxPair);
            this.DeleteFromAEL(horzEdge);
        }
    };
    ClipperLib.Clipper.prototype.IsTopHorz = function (horzEdge, XPos) {
        var e = this.m_SortedEdges;
        while (e != null) {
            if ((XPos >= Math.min(e.xcurr, e.xtop)) && (XPos <= Math.max(e.xcurr, e.xtop))) return false;
            e = e.nextInSEL;
        }
        return true;
    };
    ClipperLib.Clipper.prototype.GetNextInAEL = function (e, Direction) {
        return Direction == ClipperLib.Direction.dLeftToRight ? e.nextInAEL : e.prevInAEL;
    };
    ClipperLib.Clipper.prototype.IsMinima = function (e) {
        return e != null && (e.prev.nextInLML != e) && (e.next.nextInLML != e);
    };
    ClipperLib.Clipper.prototype.IsMaxima = function (e, Y) {
        return (e != null && e.ytop == Y && e.nextInLML == null);
    };
    ClipperLib.Clipper.prototype.IsIntermediate = function (e, Y) {
        return (e.ytop == Y && e.nextInLML != null);
    };
    ClipperLib.Clipper.prototype.GetMaximaPair = function (e) {
        if (!this.IsMaxima(e.next, e.ytop) || (e.next.xtop != e.xtop)) return e.prev;
        else return e.next;
    };
    ClipperLib.Clipper.prototype.ProcessIntersections = function (botY, topY) {
        if (this.m_ActiveEdges == null) return true;
        try {
            this.BuildIntersectList(botY, topY);
            if (this.m_IntersectNodes == null) return true;
            if (this.FixupIntersections()) this.ProcessIntersectList();
            else return false;
        }
        catch ($$e2) {
            this.m_SortedEdges = null;
            this.DisposeIntersectNodes();
            ClipperLib.Error("ProcessIntersections error");
        }
        return true;
    };
    ClipperLib.Clipper.prototype.BuildIntersectList = function (botY, topY) {
        if (this.m_ActiveEdges == null) return;
        var e = this.m_ActiveEdges;
        e.tmpX = ClipperLib.Clipper.TopX(e, topY);
        this.m_SortedEdges = e;
        this.m_SortedEdges.prevInSEL = null;
        e = e.nextInAEL;
        while (e != null) {
            e.prevInSEL = e.prevInAEL;
            e.prevInSEL.nextInSEL = e;
            e.nextInSEL = null;
            e.tmpX = ClipperLib.Clipper.TopX(e, topY);
            e = e.nextInAEL;
        }
        var isModified = true;
        var intersectArray = [];
        while (isModified && this.m_SortedEdges != null) {
            isModified = false;
            e = this.m_SortedEdges;
            while (e.nextInSEL != null) {
                var eNext = e.nextInSEL;
                var pt = new ClipperLib.IntPoint();
                if (e.tmpX > eNext.tmpX && (function () {
                    pt = {
                        Value: pt
                    };
                    var $res = this.IntersectPoint(e, eNext, pt);
                    pt = pt.Value;
                    return $res;
                })
                    .call(this)) {
                    if (pt.Y > botY) {
                        pt.Y = botY;
                        pt.X = ClipperLib.Clipper.TopX(e, pt.Y);
                    }
                    this.SwapPositionsInSEL(e, eNext);
                    intersectArray.push(this.CreateIntersectNode(e, eNext, pt));
                    isModified = true;
                }
                else e = eNext;
            }
            if (e.prevInSEL != null) e.prevInSEL.nextInSEL = null;
            else break;
        }
        this.AddBulkIntersectNodes(intersectArray);
        this.m_SortedEdges = null;
    };
    ClipperLib.Clipper.prototype.FixupIntersections = function () {
        if (this.m_IntersectNodes.next == null) return true;
        this.CopyAELToSEL();
        var int1 = this.m_IntersectNodes;
        var int2 = this.m_IntersectNodes.next;
        while (int2 != null) {
            var e1 = int1.edge1;
            var e2;
            if (e1.prevInSEL == int1.edge2) e2 = e1.prevInSEL;
            else if (e1.nextInSEL == int1.edge2) e2 = e1.nextInSEL;
            else {
                while (int2 != null && int2.edge2 != int2.edge1.nextInSEL && int2.edge2 != int2.edge1.prevInSEL) {
                    int2 = int2.next;
                }
                if (int2 == null) return false;
                this.SwapIntersectNodes(int1, int2);
                e1 = int1.edge1;
                e2 = int1.edge2;
            }
            this.SwapPositionsInSEL(e1, e2);
            int1 = int1.next;
            int2 = int1.next;
        }
        this.m_SortedEdges = null;
        return (int1.edge1.prevInSEL == int1.edge2 || int1.edge1.nextInSEL == int1.edge2);
    };
    ClipperLib.Clipper.prototype.ProcessIntersectList = function () {
        while (this.m_IntersectNodes != null) {
            var iNode = this.m_IntersectNodes.next;
            this.IntersectEdges(this.m_IntersectNodes.edge1, this.m_IntersectNodes.edge2, this.m_IntersectNodes.pt, ClipperLib.Protects.ipBoth);
            this.SwapPositionsInAEL(this.m_IntersectNodes.edge1, this.m_IntersectNodes.edge2);
            this.m_IntersectNodes = null;
            this.m_IntersectNodes = iNode;
        }
    };
    /*
     --------------------------------
     Round speedtest: http://jsperf.com/fastest-round
     --------------------------------
     */
    var R1 = function (a) {
        return a < 0 ? Math.ceil(a - 0.5) : Math.round(a)
    };
    var R2 = function (a) {
        return a < 0 ? Math.ceil(a - 0.5) : Math.floor(a + 0.5)
    };
    var R3 = function (a) {
        return a < 0 ? -Math.round(Math.abs(a)) : Math.round(a)
    };
    var R4 = function (a) {
        if (a < 0) {
            a -= 0.5;
            return a < -2147483648 ? Math.ceil(a) : a | 0;
        } else {
            a += 0.5;
            return a > 2147483647 ? Math.floor(a) : a | 0;
        }
    };
    if (browser.msie) ClipperLib.Clipper.Round = R1;
    else if (browser.chromium) ClipperLib.Clipper.Round = R3;
    else if (browser.safari) ClipperLib.Clipper.Round = R4;
    else ClipperLib.Clipper.Round = R2; // eg. browser.chrome || browser.firefox || browser.opera

    ClipperLib.Clipper.TopX = function (edge, currentY) {
        if (currentY == edge.ytop) return edge.xtop;
        return edge.xbot + ClipperLib.Clipper.Round(edge.dx * (currentY - edge.ybot));
    };
    ClipperLib.Clipper.prototype.AddBulkIntersectNodes = function (intersectArray) {
        intersectArray.sort(function (a, b) {
            return ClipperLib.Clipper.prototype.ProcessParam1BeforeParam2(a, b) ? -1 : 1;
        });
        var startNode = this.m_IntersectNodes;
        for (var i = 0; i < intersectArray.length; i++) {
            var newNode = intersectArray[i];
            if (this.m_IntersectNodes == null) this.m_IntersectNodes = newNode;
            else if (this.ProcessParam1BeforeParam2(newNode, this.m_IntersectNodes)) {
                newNode.next = this.m_IntersectNodes;
                this.m_IntersectNodes = newNode;
            }
            else {
                var iNode = startNode;
                while (iNode.next != null && this.ProcessParam1BeforeParam2(iNode.next, newNode))
                    iNode = iNode.next;
                newNode.next = iNode.next;
                iNode.next = newNode;
            }
            startNode = newNode;
        }
    }
    ClipperLib.Clipper.prototype.CreateIntersectNode = function (e1, e2, pt) {
        var newNode = new ClipperLib.IntersectNode();
        newNode.edge1 = e1;
        newNode.edge2 = e2;
        newNode.pt = pt;
        newNode.next = null;
        return newNode;
    }
    ClipperLib.Clipper.prototype.ProcessParam1BeforeParam2 = function (node1, node2) {
        var result;
        if (node1.pt.Y == node2.pt.Y) {
            if (node1.edge1 == node2.edge1 || node1.edge2 == node2.edge1) {
                result = node2.pt.X > node1.pt.X;
                return node2.edge1.dx > 0 ? !result : result;
            }
            else if (node1.edge1 == node2.edge2 || node1.edge2 == node2.edge2) {
                result = node2.pt.X > node1.pt.X;
                return node2.edge2.dx > 0 ? !result : result;
            }
            else return node2.pt.X > node1.pt.X;
        }
        else return node1.pt.Y > node2.pt.Y;
    };
    ClipperLib.Clipper.prototype.SwapIntersectNodes = function (int1, int2) {
        var e1 = int1.edge1;
        var e2 = int1.edge2;
        var p = int1.pt;
        int1.edge1 = int2.edge1;
        int1.edge2 = int2.edge2;
        int1.pt = int2.pt;
        int2.edge1 = e1;
        int2.edge2 = e2;
        int2.pt = p;
    };
    ClipperLib.Clipper.prototype.IntersectPoint = function (edge1, edge2, ip) {
        var b1, b2;
        if (this.SlopesEqual(edge1, edge2, this.m_UseFullRange)) return false;
        else if (edge1.dx == 0) {
            ip.Value.X = edge1.xbot;
            if (edge2.dx == ClipperLib.ClipperBase.horizontal) {
                ip.Value.Y = edge2.ybot;
            }
            else {
                b2 = edge2.ybot - (edge2.xbot / edge2.dx);
                ip.Value.Y = ClipperLib.Clipper.Round(ip.Value.X / edge2.dx + b2);
            }
        }
        else if (edge2.dx == 0) {
            ip.Value.X = edge2.xbot;
            if (edge1.dx == ClipperLib.ClipperBase.horizontal) {
                ip.Value.Y = edge1.ybot;
            }
            else {
                b1 = edge1.ybot - (edge1.xbot / edge1.dx);
                ip.Value.Y = ClipperLib.Clipper.Round(ip.Value.X / edge1.dx + b1);
            }
        }
        else {
            b1 = edge1.xbot - edge1.ybot * edge1.dx;
            b2 = edge2.xbot - edge2.ybot * edge2.dx;
            var q = (b2 - b1) / (edge1.dx - edge2.dx);
            ip.Value.Y = ClipperLib.Clipper.Round(q);
            if (ClipperLib.Math_Abs_Double(edge1.dx) < ClipperLib.Math_Abs_Double(edge2.dx)) ip.Value.X = ClipperLib.Clipper.Round(edge1.dx * q + b1);
            else ip.Value.X = ClipperLib.Clipper.Round(edge2.dx * q + b2);
        }
        if (ip.Value.Y < edge1.ytop || ip.Value.Y < edge2.ytop) {
            if (edge1.ytop > edge2.ytop) {
                ip.Value.X = edge1.xtop;
                ip.Value.Y = edge1.ytop;
                return ClipperLib.Clipper.TopX(edge2, edge1.ytop) < edge1.xtop;
            }
            else {
                ip.Value.X = edge2.xtop;
                ip.Value.Y = edge2.ytop;
                return ClipperLib.Clipper.TopX(edge1, edge2.ytop) > edge2.xtop;
            }
        }
        else return true;
    };
    ClipperLib.Clipper.prototype.DisposeIntersectNodes = function () {
        while (this.m_IntersectNodes != null) {
            var iNode = this.m_IntersectNodes.next;
            this.m_IntersectNodes = null;
            this.m_IntersectNodes = iNode;
        }
    };
    ClipperLib.Clipper.prototype.ProcessEdgesAtTopOfScanbeam = function (topY) {
        var e = this.m_ActiveEdges;
        var ePrev;
        while (e != null) {
            if (this.IsMaxima(e, topY) && this.GetMaximaPair(e)
                .dx != ClipperLib.ClipperBase.horizontal) {
                ePrev = e.prevInAEL;
                this.DoMaxima(e, topY);
                if (ePrev == null) e = this.m_ActiveEdges;
                else e = ePrev.nextInAEL;
            }
            else {
                if (this.IsIntermediate(e, topY) && e.nextInLML.dx == ClipperLib.ClipperBase.horizontal) {
                    if (e.outIdx >= 0) {
                        this.AddOutPt(e, new ClipperLib.IntPoint(e.xtop, e.ytop));
                        for (var i = 0; i < this.m_HorizJoins.length; ++i) {
                            var pt = new ClipperLib.IntPoint(),
                                pt2 = new ClipperLib.IntPoint();
                            var hj = this.m_HorizJoins[i];
                            if ((function () {
                                pt = {
                                    Value: pt
                                };
                                pt2 = {
                                    Value: pt2
                                };
                                var $res = this.GetOverlapSegment(new ClipperLib.IntPoint(hj.edge.xbot, hj.edge.ybot),
                                    new ClipperLib.IntPoint(hj.edge.xtop, hj.edge.ytop),
                                    new ClipperLib.IntPoint(e.nextInLML.xbot, e.nextInLML.ybot),
                                    new ClipperLib.IntPoint(e.nextInLML.xtop, e.nextInLML.ytop), pt, pt2);
                                pt = pt.Value;
                                pt2 = pt2.Value;
                                return $res;
                            })
                                .call(this)) this.AddJoin(hj.edge, e.nextInLML, hj.savedIdx, e.outIdx);
                        }
                        this.AddHorzJoin(e.nextInLML, e.outIdx);
                    }
                    (function () {
                        e = {
                            Value: e
                        };
                        var $res = this.UpdateEdgeIntoAEL(e);
                        e = e.Value;
                        return $res;
                    })
                        .call(this);
                    this.AddEdgeToSEL(e);
                }
                else {
                    e.xcurr = ClipperLib.Clipper.TopX(e, topY);
                    e.ycurr = topY;
                }
                e = e.nextInAEL;
            }
        }
        this.ProcessHorizontals();
        e = this.m_ActiveEdges;
        while (e != null) {
            if (this.IsIntermediate(e, topY)) {
                if (e.outIdx >= 0) this.AddOutPt(e, new ClipperLib.IntPoint(e.xtop, e.ytop));
                (function () {
                    e = {
                        Value: e
                    };
                    var $res = this.UpdateEdgeIntoAEL(e);
                    e = e.Value;
                    return $res;
                })
                    .call(this);
                ePrev = e.prevInAEL;
                var eNext = e.nextInAEL;
                if (ePrev != null && ePrev.xcurr == e.xbot && ePrev.ycurr == e.ybot && e.outIdx >= 0 && ePrev.outIdx >= 0 && ePrev.ycurr > ePrev.ytop && this.SlopesEqual(e, ePrev, this.m_UseFullRange)) {
                    this.AddOutPt(ePrev, new ClipperLib.IntPoint(e.xbot, e.ybot));
                    this.AddJoin(e, ePrev, -1, -1);
                }
                else if (eNext != null && eNext.xcurr == e.xbot && eNext.ycurr == e.ybot && e.outIdx >= 0 && eNext.outIdx >= 0 && eNext.ycurr > eNext.ytop && this.SlopesEqual(e, eNext, this.m_UseFullRange)) {
                    this.AddOutPt(eNext, new ClipperLib.IntPoint(e.xbot, e.ybot));
                    this.AddJoin(e, eNext, -1, -1);
                }
            }
            e = e.nextInAEL;
        }
    };
    ClipperLib.Clipper.prototype.DoMaxima = function (e, topY) {
        var eMaxPair = this.GetMaximaPair(e);
        var X = e.xtop;
        var eNext = e.nextInAEL;
        while (eNext != eMaxPair) {
            if (eNext == null) ClipperLib.Error("DoMaxima error");
            this.IntersectEdges(e, eNext, new ClipperLib.IntPoint(X, topY), ClipperLib.Protects.ipBoth);
            eNext = eNext.nextInAEL;
        }
        if (e.outIdx < 0 && eMaxPair.outIdx < 0) {
            this.DeleteFromAEL(e);
            this.DeleteFromAEL(eMaxPair);
        }
        else if (e.outIdx >= 0 && eMaxPair.outIdx >= 0) {
            this.IntersectEdges(e, eMaxPair, new ClipperLib.IntPoint(X, topY), ClipperLib.Protects.ipNone);
        }
        else ClipperLib.Error("DoMaxima error");
    };
    ClipperLib.Clipper.ReversePolygons = function (polys) {
        var len = polys.length,
            poly;
        for (var i = 0; i < len; i++) {
            if (polys[i] instanceof Array) polys[i].reverse();
        }
    };
    ClipperLib.Clipper.Orientation = function (poly) {
        return this.Area(poly) >= 0;
    };
    ClipperLib.Clipper.prototype.PointCount = function (pts) {
        if (pts == null) return 0;
        var result = 0;
        var p = pts;
        do {
            result++;
            p = p.next;
        }
        while (p != pts);
        return result;
    };
    ClipperLib.Clipper.prototype.BuildResult = function (polyg) {
        ClipperLib.Clear(polyg);
        var outRec, len = this.m_PolyOuts.length;
        for (var i = 0; i < len; i++) {
            outRec = this.m_PolyOuts[i];
            if (outRec.pts == null) continue;
            var p = outRec.pts;
            var cnt = this.PointCount(p);
            if (cnt < 3) continue;
            var pg = new ClipperLib.Polygon(cnt);
            for (var j = 0; j < cnt; j++) {
                pg.push(new ClipperLib.IntPoint(p.pt.X, p.pt.Y)); // Have to create new point, because the point can be a reference to other point
                p = p.prev;
            }
            polyg.push(pg);
        }
    };
    ClipperLib.Clipper.prototype.BuildResultEx = function (polyg) {
        ClipperLib.Clear(polyg);
        var i = 0;
        while (i < this.m_PolyOuts.length) {
            var outRec = this.m_PolyOuts[i++];
            if (outRec.pts == null) break;
            var p = outRec.pts;
            var cnt = this.PointCount(p);
            if (cnt < 3) continue;
            var epg = new ClipperLib.ExPolygon();
            epg.outer = new ClipperLib.Polygon();
            epg.holes = new ClipperLib.Polygons();
            for (var j = 0; j < cnt; j++) {
                epg.outer.push(new ClipperLib.IntPoint(p.pt.X, p.pt.Y)); // Have to create new point, because the point can be a reference to other point
                p = p.prev;
            }
            while (i < this.m_PolyOuts.length) {
                outRec = this.m_PolyOuts[i];
                if (outRec.pts == null || !outRec.isHole) break;
                var pg = new ClipperLib.Polygon();
                p = outRec.pts;
                do {
                    pg.push(new ClipperLib.IntPoint(p.pt.X, p.pt.Y)); // Have to create new point, because the point can be a reference to other point
                    p = p.prev;
                }
                while (p != outRec.pts);
                epg.holes.push(pg);
                i++;
            }
            polyg.push(epg);
        }
    };
    ClipperLib.Clipper.prototype.FixupOutPolygon = function (outRec) {
        var lastOK = null;
        outRec.pts = outRec.bottomPt;
        var pp = outRec.bottomPt;
        for (; ;) {
            if (pp.prev == pp || pp.prev == pp.next) {
                this.DisposeOutPts(pp);
                outRec.pts = null;
                outRec.bottomPt = null;
                return;
            }
            if (ClipperLib.ClipperBase.PointsEqual(pp.pt, pp.next.pt) || this.SlopesEqual(pp.prev.pt, pp.pt, pp.next.pt, this.m_UseFullRange)) {
                lastOK = null;
                var tmp = pp;
                if (pp == outRec.bottomPt) outRec.bottomPt = null;
                pp.prev.next = pp.next;
                pp.next.prev = pp.prev;
                pp = pp.prev;
                tmp = null;
            }
            else if (pp == lastOK) break;
            else {
                if (lastOK == null) lastOK = pp;
                pp = pp.next;
            }
        }
        if (outRec.bottomPt == null) {
            outRec.bottomPt = this.GetBottomPt(pp);
            outRec.bottomPt.idx = outRec.idx;
            outRec.pts = outRec.bottomPt;
        }
    };
    ClipperLib.Clipper.prototype.JoinPoints = function (j, p1, p2) {
        p1.Value = null;
        p2.Value = null;
        var outRec1 = this.m_PolyOuts[j.poly1Idx];
        var outRec2 = this.m_PolyOuts[j.poly2Idx];
        if (outRec1 == null || outRec2 == null) return false;
        var pp1a = outRec1.pts;
        var pp2a = outRec2.pts;
        var pt1 = j.pt2a,
            pt2 = j.pt2b;
        var pt3 = j.pt1a,
            pt4 = j.pt1b;
        if (!(function () {
            pp1a = {
                Value: pp1a
            };
            pt1 = {
                Value: pt1
            };
            pt2 = {
                Value: pt2
            };
            var $res = this.FindSegment(pp1a, this.m_UseFullRange, pt1, pt2);
            pp1a = pp1a.Value;
            pt1 = pt1.Value;
            pt2 = pt2.Value;
            return $res;
        })
            .call(this)) return false;
        if (outRec1 == outRec2) {
            pp2a = pp1a.next;
            if (!(function () {
                pp2a = {
                    Value: pp2a
                };
                pt3 = {
                    Value: pt3
                };
                pt4 = {
                    Value: pt4
                };
                var $res = this.FindSegment(pp2a, this.m_UseFullRange, pt3, pt4);
                pp2a = pp2a.Value;
                pt3 = pt3.Value;
                pt4 = pt4.Value;
                return $res;
            })
                .call(this) || (pp2a == pp1a)) return false;
        }
        else if (!(function () {
            pp2a = {
                Value: pp2a
            };
            pt3 = {
                Value: pt3
            };
            pt4 = {
                Value: pt4
            };
            var $res = this.FindSegment(pp2a, this.m_UseFullRange, pt3, pt4);
            pp2a = pp2a.Value;
            pt3 = pt3.Value;
            pt4 = pt4.Value;
            return $res;
        })
            .call(this)) return false;
        if (!(function () {
            pt1 = {
                Value: pt1
            };
            pt2 = {
                Value: pt2
            };
            var $res = this.GetOverlapSegment(pt1.Value, pt2.Value, pt3, pt4, pt1, pt2);
            pt1 = pt1.Value;
            pt2 = pt2.Value;
            return $res;
        })
            .call(this)) {
            return false;
        }
        var p3, p4, prev = pp1a.prev;
        if (ClipperLib.ClipperBase.PointsEqual(pp1a.pt, pt1)) p1.Value = pp1a;
        else if (ClipperLib.ClipperBase.PointsEqual(prev.pt, pt1)) p1.Value = prev;
        else p1.Value = this.InsertPolyPtBetween(pp1a, prev, pt1);
        if (ClipperLib.ClipperBase.PointsEqual(pp1a.pt, pt2)) p2.Value = pp1a;
        else if (ClipperLib.ClipperBase.PointsEqual(prev.pt, pt2)) p2.Value = prev;
        else if ((p1.Value == pp1a) || (p1.Value == prev)) p2.Value = this.InsertPolyPtBetween(pp1a, prev, pt2);
        else if (this.Pt3IsBetweenPt1AndPt2(pp1a.pt, p1.Value.pt, pt2)) p2.Value = this.InsertPolyPtBetween(pp1a, p1.Value, pt2);
        else p2.Value = this.InsertPolyPtBetween(p1.Value, prev, pt2);
        prev = pp2a.prev;
        if (ClipperLib.ClipperBase.PointsEqual(pp2a.pt, pt1)) p3 = pp2a;
        else if (ClipperLib.ClipperBase.PointsEqual(prev.pt, pt1)) p3 = prev;
        else p3 = this.InsertPolyPtBetween(pp2a, prev, pt1);
        if (ClipperLib.ClipperBase.PointsEqual(pp2a.pt, pt2)) p4 = pp2a;
        else if (ClipperLib.ClipperBase.PointsEqual(prev.pt, pt2)) p4 = prev;
        else if ((p3 == pp2a) || (p3 == prev)) p4 = this.InsertPolyPtBetween(pp2a, prev, pt2);
        else if (this.Pt3IsBetweenPt1AndPt2(pp2a.pt, p3.pt, pt2)) p4 = this.InsertPolyPtBetween(pp2a, p3, pt2);
        else p4 = this.InsertPolyPtBetween(p3, prev, pt2);
        if (p1.Value.next == p2.Value && p3.prev == p4) {
            p1.Value.next = p3;
            p3.prev = p1.Value;
            p2.Value.prev = p4;
            p4.next = p2.Value;
            return true;
        }
        else if (p1.Value.prev == p2.Value && p3.next == p4) {
            p1.Value.prev = p3;
            p3.next = p1.Value;
            p2.Value.next = p4;
            p4.prev = p2.Value;
            return true;
        }
        else return false;
    };
    ClipperLib.Clipper.prototype.FixupJoinRecs = function (j, pt, startIdx) {
        for (var k = startIdx; k < this.m_Joins.length; k++) {
            var j2 = this.m_Joins[k];
            if (j2.poly1Idx == j.poly1Idx && this.PointIsVertex(j2.pt1a, pt)) j2.poly1Idx = j.poly2Idx;
            if (j2.poly2Idx == j.poly1Idx && this.PointIsVertex(j2.pt2a, pt)) j2.poly2Idx = j.poly2Idx;
        }
    };
    ClipperLib.Clipper.prototype.JoinCommonEdges = function () {
        var k, orec;
        for (var i = 0; i < this.m_Joins.length; i++) {
            var j = this.m_Joins[i];
            var p1, p2;
            if (!(function () {
                p1 = {
                    Value: p1
                };
                p2 = {
                    Value: p2
                };
                var $res = this.JoinPoints(j, p1, p2);
                p1 = p1.Value;
                p2 = p2.Value;
                return $res;
            })
                .call(this)) continue;
            var outRec1 = this.m_PolyOuts[j.poly1Idx];
            var outRec2 = this.m_PolyOuts[j.poly2Idx];
            if (outRec1 == outRec2) {
                outRec1.pts = this.GetBottomPt(p1);
                outRec1.bottomPt = outRec1.pts;
                outRec1.bottomPt.idx = outRec1.idx;
                outRec2 = this.CreateOutRec();
                this.m_PolyOuts.push(outRec2);
                outRec2.idx = this.m_PolyOuts.length - 1;
                j.poly2Idx = outRec2.idx;
                outRec2.pts = this.GetBottomPt(p2);
                outRec2.bottomPt = outRec2.pts;
                outRec2.bottomPt.idx = outRec2.idx;
                if (this.PointInPolygon(outRec2.pts.pt, outRec1.pts, this.m_UseFullRange)) {
                    outRec2.isHole = !outRec1.isHole;
                    outRec2.FirstLeft = outRec1;
                    this.FixupJoinRecs(j, p2, i + 1);
                    this.FixupOutPolygon(outRec1);
                    this.FixupOutPolygon(outRec2);

                    if ((outRec2.isHole ^ this.m_ReverseOutput) == (this.Area(outRec2, this.m_UseFullRange) > 0))
                        this.ReversePolyPtLinks(outRec2.pts);
                }
                else if (this.PointInPolygon(outRec1.pts.pt, outRec2.pts, this.m_UseFullRange)) {
                    outRec2.isHole = outRec1.isHole;
                    outRec1.isHole = !outRec2.isHole;
                    outRec2.FirstLeft = outRec1.FirstLeft;
                    outRec1.FirstLeft = outRec2;
                    this.FixupJoinRecs(j, p2, i + 1);
                    this.FixupOutPolygon(outRec1);
                    this.FixupOutPolygon(outRec2);

                    if ((outRec1.isHole ^ this.m_ReverseOutput) == (this.Area(outRec1, this.m_UseFullRange) > 0))
                        this.ReversePolyPtLinks(outRec1.pts);

                    if (this.m_UsingExPolygons && outRec1.isHole) for (k = 0; k < this.m_PolyOuts.length; ++k) {
                        orec = this.m_PolyOuts[k];
                        if (orec.isHole && orec.bottomPt != null && orec.FirstLeft == outRec1) orec.FirstLeft = outRec2;
                    }
                }
                else {
                    outRec2.isHole = outRec1.isHole;
                    outRec2.FirstLeft = outRec1.FirstLeft;
                    this.FixupJoinRecs(j, p2, i + 1);
                    this.FixupOutPolygon(outRec1);
                    this.FixupOutPolygon(outRec2);

                    if (this.m_UsingExPolygons && outRec2.pts != null) for (k = 0; k < this.m_PolyOuts.length; ++k) {
                        orec = this.m_PolyOuts[k];
                        if (orec.isHole && orec.bottomPt != null && orec.FirstLeft == outRec1 && this.PointInPolygon(orec.bottomPt.pt, outRec2.pts, this.m_UseFullRange)) orec.FirstLeft = outRec2;
                    }
                }
            }
            else {
                if (this.m_UsingExPolygons) for (k = 0; k < this.m_PolyOuts.length; ++k)
                    if (this.m_PolyOuts[k].isHole && this.m_PolyOuts[k].bottomPt != null && this.m_PolyOuts[k].FirstLeft == outRec2) this.m_PolyOuts[k].FirstLeft = outRec1;
                this.FixupOutPolygon(outRec1);
                if (outRec1.pts != null) {
                    outRec1.isHole = this.Area(outRec1, this.m_UseFullRange) < 0;
                    if (outRec1.isHole && outRec1.FirstLeft == null) outRec1.FirstLeft = outRec2.FirstLeft;
                }
                var OKIdx = outRec1.idx;
                var ObsoleteIdx = outRec2.idx;
                outRec2.pts = null;
                outRec2.bottomPt = null;
                outRec2.AppendLink = outRec1;
                for (k = i + 1; k < this.m_Joins.length; k++) {
                    var j2 = this.m_Joins[k];
                    if (j2.poly1Idx == ObsoleteIdx) j2.poly1Idx = OKIdx;
                    if (j2.poly2Idx == ObsoleteIdx) j2.poly2Idx = OKIdx;
                }
            }
        }
    };
    ClipperLib.Clipper.FullRangeNeeded = function (pts) {
        var result = false;
        for (var i = 0; i < pts.length; i++) {
            if (ClipperLib.Math_Abs_Int64(pts[i].X) > ClipperLib.ClipperBase.hiRange || ClipperLib.Math_Abs_Int64(pts[i].Y) > ClipperLib.ClipperBase.hiRange)
                ClipperLib.Error("Coordinate exceeds range bounds in FullRangeNeeded().");
            else if (ClipperLib.Math_Abs_Int64(pts[i].X) > ClipperLib.ClipperBase.loRange || ClipperLib.Math_Abs_Int64(pts[i].Y) > ClipperLib.ClipperBase.loRange) {
                result = true;
            }
        }
        return result;
    };
    ClipperLib.Clipper.prototype.Area = ClipperLib.Clipper.Area = function () {
        var arg = arguments;
        var i, a;
        if (arg.length == 1) // function ( poly )
        {
            var poly = arg[0];
            var highI = poly.length - 1;
            if (highI < 2) return 0;
            if (ClipperLib.Clipper.FullRangeNeeded(poly)) {
                a = new Int128(poly[highI].X + poly[0].X).multiply(new Int128(poly[0].Y - poly[highI].Y));
                for (i = 1; i <= highI; ++i)
                    a = a.add(new Int128(poly[i - 1].X + poly[i].X).multiply(new Int128(poly[i].Y - poly[i - 1].Y)));
                return parseFloat(a.toString()) / 2;
            }
            else {
                var area = (poly[highI].X + poly[0].X) * (poly[0].Y - poly[highI].Y);
                for (i = 1; i <= highI; ++i)
                    area += (poly[i - 1].X + poly[i].X) * (poly[i].Y - poly[i - 1].Y);
                return area / 2;
            }
        }
        else if (arg.length == 2) //  function (outRec, UseFull64BitRange)
        {
            var outRec = arg[0];
            var UseFull64BitRange = arg[1];
            var op = outRec.pts;
            if (op == null) return 0;
            if (UseFull64BitRange) {
                a = new Int128(Int128.ZERO);
                do {
                    a = a.add(new Int128(op.pt.X + op.prev.pt.X).multiply(new Int128(op.prev.pt.Y - op.pt.Y)));
                    op = op.next;
                } while (op != outRec.pts);
                return parseFloat(a.toString()) / 2; // This could be something faster!
            }
            else {
                a = 0;
                do {
                    a = a + (op.pt.X + op.prev.pt.X) * (op.prev.pt.Y - op.pt.Y);
                    op = op.next;
                }
                while (op != outRec.pts);
                return a / 2;
            }
        }
    };
    ClipperLib.Clipper.BuildArc = function (pt, a1, a2, r) {
        var steps = Math.sqrt(ClipperLib.Math_Abs_Double(r)) * ClipperLib.Math_Abs_Double(a2 - a1);

        steps = steps / 4; // to avoid overload

        // If you want to make steps independent of scaling factor (scale have to be set),
        // the following line does the trick:
        // steps = steps / Math.sqrt(scale) * 2;

        // If you want that changing scale factor has some influence to steps, uncomment also the following line:
        // It may be desirable, that bigger precision ( = bigger scaling factor) needs more steps.
        // steps += Math.pow(scale, 0.2);

        steps = Math.max(steps, 6);
        steps = Math.min(steps, ClipperLib.MaxSteps);

        // if (steps > 1048576) steps = 1048576; // 0x100000
        // if (steps > ClipperLib.MaxSteps) steps = ClipperLib.MaxSteps; // 0x100000
        // Had to change 1048576 to lower value, because when coordinates are near or above lorange, program starts hanging
        // Adjust this value to meet your needs, maybe 10 is enough for most purposes
        var n = ClipperLib.Cast_Int32(steps);
        var result = new ClipperLib.Polygon();
        var da = (a2 - a1) / (n - 1);
        var a = a1;
        for (var i = 0; i < n; ++i) {
            result.push(new ClipperLib.IntPoint(pt.X + ClipperLib.Clipper.Round(Math.cos(a) * r), pt.Y + ClipperLib.Clipper.Round(Math.sin(a) * r)));
            a += da;
        }
        return result;
    };

    ClipperLib.Clipper.GetUnitNormal = function (pt1, pt2) {
        var dx = (pt2.X - pt1.X);
        var dy = (pt2.Y - pt1.Y);
        if ((dx == 0) && (dy == 0)) return new ClipperLib.Clipper.DoublePoint(0, 0);
        var f = 1 / Math.sqrt(dx * dx + dy * dy);
        dx *= f;
        dy *= f;
        return new ClipperLib.Clipper.DoublePoint(dy, -dx);
    };
    ClipperLib.Clipper.prototype.OffsetPolygons = function (poly, delta, jointype, MiterLimit, AutoFix) {
        var a = arguments;
        if (a.length == 4) AutoFix = true;
        else if (a.length == 3) {
            MiterLimit = 2;
            AutoFix = true;
        }
        else if (a.length == 2) {
            jointype = ClipperLib.JoinType.jtSquare;
            MiterLimit = 2;
            AutoFix = true;
        }
        if (isNaN(delta)) ClipperLib.Error("Delta is not a number");
        else if (isNaN(MiterLimit)) ClipperLib.Error("MiterLimit is not a number");
        var result = {};
        new ClipperLib.Clipper.PolyOffsetBuilder(poly, result, delta, jointype, MiterLimit, AutoFix);
        if (result.Value) result = result.Value;
        else result = [
            []
        ];
        return result;
    };
    ClipperLib.Clipper.prototype.SimplifyPolygon = function (poly, fillType) {
        var result = new ClipperLib.Polygons();
        var c = new ClipperLib.Clipper();
        if (c.AddPolygon(poly, ClipperLib.PolyType.ptSubject))
            c.Execute(ClipperLib.ClipType.ctUnion, result, fillType, fillType);
        return result;
    };
    ClipperLib.Clipper.prototype.SimplifyPolygons = function (polys, fillType) {
        var result = new ClipperLib.Polygons();
        var c = new ClipperLib.Clipper();
        if (c.AddPolygons(polys, ClipperLib.PolyType.ptSubject))
            c.Execute(ClipperLib.ClipType.ctUnion, result, fillType, fillType);
        return result;
    };
    var ce = ClipperLib.Clipper;
    var ce2 = ClipperLib.ClipperBase;
    var p;
    if (typeof (Object.getOwnPropertyNames) == 'undefined') {
        for (p in ce2.prototype)
            if (typeof (ce.prototype[p]) == 'undefined' || ce.prototype[p] == Object.prototype[p]) ce.prototype[p] = ce2.prototype[p];
        for (p in ce2)
            if (typeof (ce[p]) == 'undefined') ce[p] = ce2[p];
        ce.$baseCtor = ce2;
    }
    else {
        var props = Object.getOwnPropertyNames(ce2.prototype);
        for (var i = 0; i < props.length; i++)
            if (typeof (Object.getOwnPropertyDescriptor(ce.prototype, props[i])) == 'undefined') Object.defineProperty(ce.prototype, props[i], Object.getOwnPropertyDescriptor(ce2.prototype, props[i]));
        for (p in ce2)
            if (typeof (ce[p]) == 'undefined') ce[p] = ce2[p];
        ce.$baseCtor = ce2;
    }
    ClipperLib.Clipper.DoublePoint = function (x, y) {
        this.X = x;
        this.Y = y;
    };

    ClipperLib.Clipper.PolyOffsetBuilder = function (pts, solution, delta, jointype, MiterLimit, AutoFix) {
        this.pts = null; // Polygons
        this.currentPoly = null; // Polygon
        this.normals = null;
        this.delta = 0;
        this.m_R = 0;
        this.m_i = 0;
        this.m_j = 0;
        this.m_k = 0;
        this.botPt = null; // This is "this." because it is ref in original c# code
        if (delta == 0) {
            solution.Value = pts;
            return;
        }
        this.pts = pts;
        this.delta = delta;
        var i, j;
        //AutoFix - fixes polygon orientation if necessary and removes 
        //duplicate vertices. Can be set false when you're sure that polygon
        //orientation is correct and that there are no duplicate vertices.
        if (AutoFix) {
            var Len = this.pts.length,
                botI = 0;
            while (botI < Len && this.pts[botI].length == 0) botI++;
            if (botI == Len) {
                //solution.Value = new ClipperLib.Polygons();
                return;
            }
            //botPt: used to find the lowermost (in inverted Y-axis) & leftmost point
            //This point (on pts[botI]) must be on an outer polygon ring and if 
            //its orientation is false (counterclockwise) then assume all polygons 
            //need reversing ...
            this.botPt = this.pts[botI][0]; // This is ported with different logic than other C# refs
            // adding botPt to object's property it's accessible through object's
            // methods
            // => All other ref's are now ported using rather complex object.Value
            // technique, which seems to work.
            for (i = botI; i < Len; ++i) {
                if (this.UpdateBotPt(this.pts[i][0])) botI = i;
                for (j = this.pts[i].length - 1; j > 0; j--) {
                    if (ClipperLib.ClipperBase.PointsEqual(this.pts[i][j], this.pts[i][j - 1])) {
                        this.pts[i].splice(j, 1);
                    }
                    else if (this.UpdateBotPt(this.pts[i][j])) botI = i;
                }
            }
            if (!ClipperLib.Clipper.Orientation(this.pts[botI])) ClipperLib.Clipper.ReversePolygons(this.pts);
        }
        if (MiterLimit <= 1) MiterLimit = 1;
        var RMin = 2 / (MiterLimit * MiterLimit);
        this.normals = [];
        var deltaSq = delta * delta;
        solution.Value = new ClipperLib.Polygons();
        //ClipperLib.Clear(solution.Value);
        var len;
        for (this.m_i = 0; this.m_i < this.pts.length; this.m_i++) {
            len = this.pts[this.m_i].length;
            if (len > 1 && this.pts[this.m_i][0].X == this.pts[this.m_i][len - 1].X &&
                this.pts[this.m_i][0].Y == this.pts[this.m_i][len - 1].Y) {
                len--;
            }
            if (len == 0 || (len < 3 && delta <= 0)) {
                continue;
            }
            else if (len == 1) {
                var arc;
                arc = ClipperLib.Clipper.BuildArc(this.pts[this.m_i][len - 1], 0, ClipperLib.PI2, delta);
                solution.Value.push(arc);
                continue;
            }

            //build normals ...
            ClipperLib.Clear(this.normals);
            for (j = 0; j < len - 1; ++j)
                this.normals.push(ClipperLib.Clipper.GetUnitNormal(this.pts[this.m_i][j], this.pts[this.m_i][j + 1]));
            this.normals.push(ClipperLib.Clipper.GetUnitNormal(this.pts[this.m_i][len - 1], this.pts[this.m_i][0]));

            this.currentPoly = new ClipperLib.Polygon();
            this.m_k = len - 1;
            for (this.m_j = 0; this.m_j < len; ++this.m_j) {
                switch (jointype) {
                    case ClipperLib.JoinType.jtMiter:
                        this.m_R = 1 + (this.normals[this.m_j].X * this.normals[this.m_k].X + this.normals[this.m_j].Y * this.normals[this.m_k].Y);
                        if (this.m_R >= RMin) this.DoMiter();
                        else this.DoSquare(MiterLimit);
                        break;
                    case ClipperLib.JoinType.jtRound:
                        this.DoRound();
                        break;
                    case ClipperLib.JoinType.jtSquare:
                        this.DoSquare(1);
                        break;
                }
                this.m_k = this.m_j;
            }
            solution.Value.push(this.currentPoly);
        }

        //finally, clean up untidy corners ...
        var clpr = new ClipperLib.Clipper();
        clpr.AddPolygons(solution.Value, ClipperLib.PolyType.ptSubject);
        if (delta > 0) {
            clpr.Execute(ClipperLib.ClipType.ctUnion, solution.Value, ClipperLib.PolyFillType.pftPositive, ClipperLib.PolyFillType.pftPositive);
        }
        else {
            var r = clpr.GetBounds();
            var outer = new ClipperLib.Polygon();
            outer.push(new ClipperLib.IntPoint(r.left - 10, r.bottom + 10));
            outer.push(new ClipperLib.IntPoint(r.right + 10, r.bottom + 10));
            outer.push(new ClipperLib.IntPoint(r.right + 10, r.top - 10));
            outer.push(new ClipperLib.IntPoint(r.left - 10, r.top - 10));
            clpr.AddPolygon(outer, ClipperLib.PolyType.ptSubject);
            clpr.Execute(ClipperLib.ClipType.ctUnion, solution.Value, ClipperLib.PolyFillType.pftNegative, ClipperLib.PolyFillType.pftNegative);
            if (solution.Value.length > 0) {
                solution.Value.splice(0, 1);
                for (i = 0; i < solution.Value.length; i++)
                    solution.Value[i].reverse();
            }
        }
    };
    //ClipperLib.Clipper.PolyOffsetBuilder.buffLength = 128;
    ClipperLib.Clipper.PolyOffsetBuilder.prototype.UpdateBotPt = function (pt) {
        if (pt.Y > this.botPt.Y || (pt.Y == this.botPt.Y && pt.X < this.botPt.X)) {
            this.botPt = pt;
            return true;
        }
        else return false;
    };
    ClipperLib.Clipper.PolyOffsetBuilder.prototype.AddPoint = function (pt) {
        this.currentPoly.push(pt);
    };
    ClipperLib.Clipper.PolyOffsetBuilder.prototype.DoSquare = function (mul) {
        var pt1 = new ClipperLib.IntPoint(ClipperLib.Cast_Int64(ClipperLib.Clipper.Round(this.pts[this.m_i][this.m_j].X + this.normals[this.m_k].X * this.delta)),
            ClipperLib.Cast_Int64(ClipperLib.Clipper.Round(this.pts[this.m_i][this.m_j].Y + this.normals[this.m_k].Y * this.delta)));
        var pt2 = new ClipperLib.IntPoint(ClipperLib.Cast_Int64(ClipperLib.Clipper.Round(this.pts[this.m_i][this.m_j].X + this.normals[this.m_j].X * this.delta)),
            ClipperLib.Cast_Int64(ClipperLib.Clipper.Round(this.pts[this.m_i][this.m_j].Y + this.normals[this.m_j].Y * this.delta)));
        if ((this.normals[this.m_k].X * this.normals[this.m_j].Y - this.normals[this.m_j].X * this.normals[this.m_k].Y) * this.delta >= 0) {
            var a1 = Math.atan2(this.normals[this.m_k].Y, this.normals[this.m_k].X);
            var a2 = Math.atan2(-this.normals[this.m_j].Y, -this.normals[this.m_j].X);
            a1 = Math.abs(a2 - a1);
            if (a1 > ClipperLib.PI) a1 = ClipperLib.PI2 - a1;
            var dx = Math.tan((ClipperLib.PI - a1) / 4) * Math.abs(this.delta * mul);
            pt1 = new ClipperLib.IntPoint(ClipperLib.Cast_Int64((pt1.X - this.normals[this.m_k].Y * dx)),
                ClipperLib.Cast_Int64((pt1.Y + this.normals[this.m_k].X * dx)));
            this.AddPoint(pt1);
            pt2 = new ClipperLib.IntPoint(ClipperLib.Cast_Int64((pt2.X + this.normals[this.m_j].Y * dx)),
                ClipperLib.Cast_Int64((pt2.Y - this.normals[this.m_j].X * dx)));
            this.AddPoint(pt2);
        }
        else {
            this.AddPoint(pt1);
            this.AddPoint(this.pts[this.m_i][this.m_j]);
            this.AddPoint(pt2);
        }
    };
    ClipperLib.Clipper.PolyOffsetBuilder.prototype.DoMiter = function () {
        if ((this.normals[this.m_k].X * this.normals[this.m_j].Y - this.normals[this.m_j].X * this.normals[this.m_k].Y) * this.delta >= 0) {
            var q = this.delta / this.m_R;
            this.AddPoint(new ClipperLib.IntPoint(
                ClipperLib.Cast_Int64(
                    ClipperLib.Clipper.Round(this.pts[this.m_i][this.m_j].X + (this.normals[this.m_k].X + this.normals[this.m_j].X) * q)),
                ClipperLib.Cast_Int64(
                    ClipperLib.Clipper.Round(this.pts[this.m_i][this.m_j].Y + (this.normals[this.m_k].Y + this.normals[this.m_j].Y) * q))));
        }
        else {
            var pt1 = new ClipperLib.IntPoint(ClipperLib.Cast_Int64(ClipperLib.Clipper.Round(this.pts[this.m_i][this.m_j].X + this.normals[this.m_k].X * this.delta)),
                ClipperLib.Cast_Int64(ClipperLib.Clipper.Round(this.pts[this.m_i][this.m_j].Y + this.normals[this.m_k].Y * this.delta)));
            var pt2 = new ClipperLib.IntPoint(ClipperLib.Cast_Int64(ClipperLib.Clipper.Round(this.pts[this.m_i][this.m_j].X + this.normals[this.m_j].X * this.delta)),
                ClipperLib.Cast_Int64(ClipperLib.Clipper.Round(this.pts[this.m_i][this.m_j].Y + this.normals[this.m_j].Y * this.delta)));
            this.AddPoint(pt1);
            this.AddPoint(this.pts[this.m_i][this.m_j]);
            this.AddPoint(pt2);
        }
    };
    ClipperLib.Clipper.PolyOffsetBuilder.prototype.DoRound = function () {
        var pt1 = new ClipperLib.IntPoint(ClipperLib.Clipper.Round(this.pts[this.m_i][this.m_j].X + this.normals[this.m_k].X * this.delta),
            ClipperLib.Clipper.Round(this.pts[this.m_i][this.m_j].Y + this.normals[this.m_k].Y * this.delta));
        var pt2 = new ClipperLib.IntPoint(ClipperLib.Clipper.Round(this.pts[this.m_i][this.m_j].X + this.normals[this.m_j].X * this.delta),
            ClipperLib.Clipper.Round(this.pts[this.m_i][this.m_j].Y + this.normals[this.m_j].Y * this.delta));
        this.AddPoint(pt1);
        //round off reflex angles (ie > 180 deg) unless almost flat (ie < 10deg).
        //cross product normals < 0 . angle > 180 deg.
        //dot product normals == 1 . no angle
        if ((this.normals[this.m_k].X * this.normals[this.m_j].Y - this.normals[this.m_j].X * this.normals[this.m_k].Y) * this.delta >= 0) {
            if ((this.normals[this.m_j].X * this.normals[this.m_k].X + this.normals[this.m_j].Y * this.normals[this.m_k].Y) < 0.985) {
                var a1 = Math.atan2(this.normals[this.m_k].Y, this.normals[this.m_k].X);
                var a2 = Math.atan2(this.normals[this.m_j].Y, this.normals[this.m_j].X);
                if (this.delta > 0 && a2 < a1) a2 += ClipperLib.PI2;
                else if (this.delta < 0 && a2 > a1) a2 -= ClipperLib.PI2;
                var arc = ClipperLib.Clipper.BuildArc(this.pts[this.m_i][this.m_j], a1, a2, this.delta);
                for (var m = 0; m < arc.length; m++)
                    this.AddPoint(arc[m]);
            }
        }
        else this.AddPoint(this.pts[this.m_i][this.m_j]);
        this.AddPoint(pt2);
    };
    ClipperLib.Error = function (message) {
        try {
            throw new Error(message);
        }
        catch (err) {
            alert(err.message);
        }
    };
    // Make deep copy of Polygons or Polygon
    // so that also IntPoint objects are cloned and not only referenced
    // This should be the fastest way
    ClipperLib.Clone = function (polygon) {
        if (!(polygon instanceof Array)) return [];
        if (polygon.length == 0) return [];
        else if (polygon.length == 1 && polygon[0].length == 0) return [
            []
        ];
        var isPolygons = polygon[0] instanceof Array;
        if (!isPolygons) polygon = [polygon];
        var len = polygon.length, plen, i, j, result;
        var results = [];
        for (i = 0; i < len; i++) {
            plen = polygon[i].length;
            result = [];
            for (j = 0; j < plen; j++) {
                result.push({X: polygon[i][j].X, Y: polygon[i][j].Y});
            }
            results.push(result);
        }
        if (!isPolygons) results = results[0];
        return results;
    };

    // Clean() joins vertices that are too near each other
    // and causes distortion to offsetted polygons without cleaning
    ClipperLib.Clean = function (polygon, delta) {
        if (!(polygon instanceof Array)) return [];
        var isPolygons = polygon[0] instanceof Array;
        var polygon = ClipperLib.Clone(polygon);
        if (typeof delta != "number" || delta === null) {
            ClipperLib.Error("Delta is not a number in Clean().");
            return polygon;
        }
        if (polygon.length == 0 || (polygon.length == 1 && polygon[0].length == 0) || delta < 0) return polygon;
        if (!isPolygons) polygon = [polygon];
        var k_length = polygon.length;
        var len, poly, result, d, p, j, i;
        var results = [];
        for (var k = 0; k < k_length; k++) {
            poly = polygon[k];
            len = poly.length;
            if (len == 0) continue;
            else if (len < 3) {
                result = poly;
                results.push(result);
                continue;
            }
            result = poly;
            d = delta * delta;
            //d = Math.floor(c_delta * c_delta);
            p = poly[0];
            j = 1;
            for (i = 1; i < len; i++) {
                if ((poly[i].X - p.X) * (poly[i].X - p.X) +
                    (poly[i].Y - p.Y) * (poly[i].Y - p.Y) <= d)
                    continue;
                result[j] = poly[i];
                p = poly[i];
                j++;
            }
            p = poly[j - 1];
            if ((poly[0].X - p.X) * (poly[0].X - p.X) +
                (poly[0].Y - p.Y) * (poly[0].Y - p.Y) <= d)
                j--;
            if (j < len)
                result.splice(j, len - j);
            if (result.length) results.push(result);
        }
        if (!isPolygons && results.length) results = results[0];
        else if (!isPolygons && results.length == 0) results = [];
        else if (isPolygons && results.length == 0) results = [
            []
        ];
        return results;
    }

    // Removes points that doesn't affect much to the visual appearance.
    // If middle point is at or under certain distance (tolerance) of the line between 
    // start and end point, the middle point is removed.
    ClipperLib.Lighten = function (polygon, tolerance) {
        if (!(polygon instanceof Array)) return [];

        if (typeof tolerance != "number" || tolerance === null) {
            ClipperLib.Error("Tolerance is not a number in Lighten().")
            return ClipperLib.Clone(polygon);
        }
        if (polygon.length === 0 || (polygon.length == 1 && polygon[0].length === 0) || tolerance < 0) {
            return ClipperLib.Clone(polygon);
        }

        if (!(polygon[0] instanceof Array)) polygon = [polygon];
        var i, j, poly, k, poly2, plen, A, B, P, d, rem, addlast;
        var bxax, byay, nL;
        var len = polygon.length;
        var results = [];
        for (i = 0; i < len; i++) {
            poly = polygon[i];
            for (k = 0; k < 1000000; k++) // could be forever loop, but wiser to restrict max repeat count
            {
                poly2 = [];
                plen = poly.length;
                // the first have to added to the end, if first and last are not the same
                // this way we ensure that also the actual last point can be removed if needed
                if (poly[plen - 1].X != poly[0].X || poly[plen - 1].Y != poly[0].Y) {
                    addlast = 1;
                    poly.push({X: poly[0].X, Y: poly[0].Y});
                    plen = poly.length;
                }
                else addlast = 0;
                rem = []; // Indexes of removed points
                for (j = 0; j < plen - 2; j++) {
                    A = poly[j]; // Start point of line segment
                    P = poly[j + 1]; // Middle point. This is the one to be removed.
                    B = poly[j + 2]; // End point of line segment
                    bxax = B.X - A.X;
                    byay = B.Y - A.Y;
                    d = 0;
                    if (bxax !== 0 || byay !== 0) // To avoid Nan, when A==P && P==B. And to avoid peaks (A==B && A!=P), which have lenght, but not area.
                    {
                        nL = Math.sqrt(bxax * bxax + byay * byay);
                        // d is the perpendicular distance from P to (infinite) line AB.
                        d = Math.abs((P.X - A.X) * byay - (P.Y - A.Y) * bxax) / nL;
                    }
                    if (d <= tolerance) {
                        rem[j + 1] = 1;
                        j++; // when removed, transfer the pointer to the next one
                    }
                }
                // add all unremoved points to poly2
                poly2.push({X: poly[0].X, Y: poly[0].Y});
                for (j = 1; j < plen - 1; j++)
                    if (!rem[j]) poly2.push({X: poly[j].X, Y: poly[j].Y});
                poly2.push({X: poly[plen - 1].X, Y: poly[plen - 1].Y});
                // if the first point was added to the end, remove it
                if (addlast) poly.pop();
                // break, if there was not anymore removed points
                if (!rem.length) break;
                // else continue looping using poly2, to check if there are points to remove
                else poly = poly2;
            }
            plen = poly2.length;
            // remove duplicate from end, if needed
            if (poly2[plen - 1].X == poly2[0].X && poly2[plen - 1].Y == poly2[0].Y) {
                poly2.pop();
            }
            if (poly2.length > 2) // to avoid two-point-polygons
                results.push(poly2);
        }
        if (!polygon[0] instanceof Array) results = results[0];
        if (typeof (results) == "undefined") results = [
            []
        ];
        return results;
    }
    if (typeof(document) !== "undefined") window.ClipperLib = ClipperLib;
    else self['ClipperLib'] = ClipperLib;
})();
