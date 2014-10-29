/*! @license Firebase v1.1.3 - License: https://www.firebase.com/terms/terms-of-service.html */
(function () {
    var k, ba = this;

    function l(a) {
        return void 0 !== a
    }

    function ca() {
    }

    function da(a) {
        a.ib = function () {
            return a.Ld ? a.Ld : a.Ld = new a
        }
    }

    function ea(a) {
        var b = typeof a;
        if ("object" == b)if (a) {
            if (a instanceof Array)return"array";
            if (a instanceof Object)return b;
            var c = Object.prototype.toString.call(a);
            if ("[object Window]" == c)return"object";
            if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice"))return"array";
            if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call"))return"function"
        } else return"null";
        else if ("function" == b && "undefined" == typeof a.call)return"object";
        return b
    }

    function fa(a) {
        return"array" == ea(a)
    }

    function ga(a) {
        var b = ea(a);
        return"array" == b || "object" == b && "number" == typeof a.length
    }

    function p(a) {
        return"string" == typeof a
    }

    function ha(a) {
        return"number" == typeof a
    }

    function ia(a) {
        return"function" == ea(a)
    }

    function ja(a) {
        var b = typeof a;
        return"object" == b && null != a || "function" == b
    }

    function ka(a, b, c) {
        return a.call.apply(a.bind, arguments)
    }

    function la(a, b, c) {
        if (!a)throw Error();
        if (2 < arguments.length) {
            var d = Array.prototype.slice.call(arguments, 2);
            return function () {
                var c = Array.prototype.slice.call(arguments);
                Array.prototype.unshift.apply(c, d);
                return a.apply(b, c)
            }
        }
        return function () {
            return a.apply(b, arguments)
        }
    }

    function r(a, b, c) {
        r = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? ka : la;
        return r.apply(null, arguments)
    }

    var ma = Date.now || function () {
            return+new Date
        };

    function na(a, b) {
        function c() {
        }

        c.prototype = b.prototype;
        a.cf = b.prototype;
        a.prototype = new c;
        a.$e = function (a, c, f) {
            return b.prototype[c].apply(a, Array.prototype.slice.call(arguments, 2))
        }
    };
    function oa(a) {
        a = String(a);
        if (/^\s*$/.test(a) ? 0 : /^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g, "@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g, "")))try {
            return eval("(" + a + ")")
        } catch (b) {
        }
        throw Error("Invalid JSON string: " + a);
    }

    function pa() {
        this.Ec = void 0
    }

    function qa(a, b, c) {
        switch (typeof b) {
            case "string":
                ra(b, c);
                break;
            case "number":
                c.push(isFinite(b) && !isNaN(b) ? b : "null");
                break;
            case "boolean":
                c.push(b);
                break;
            case "undefined":
                c.push("null");
                break;
            case "object":
                if (null == b) {
                    c.push("null");
                    break
                }
                if (fa(b)) {
                    var d = b.length;
                    c.push("[");
                    for (var e = "", f = 0; f < d; f++)c.push(e), e = b[f], qa(a, a.Ec ? a.Ec.call(b, String(f), e) : e, c), e = ",";
                    c.push("]");
                    break
                }
                c.push("{");
                d = "";
                for (f in b)Object.prototype.hasOwnProperty.call(b, f) && (e = b[f], "function" != typeof e && (c.push(d), ra(f, c),
                    c.push(":"), qa(a, a.Ec ? a.Ec.call(b, f, e) : e, c), d = ","));
                c.push("}");
                break;
            case "function":
                break;
            default:
                throw Error("Unknown type: " + typeof b);
        }
    }

    var sa = {'"': '\\"', "\\": "\\\\", "/": "\\/", "\b": "\\b", "\f": "\\f", "\n": "\\n", "\r": "\\r", "\t": "\\t", "\x0B": "\\u000b"}, ta = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;

    function ra(a, b) {
        b.push('"', a.replace(ta, function (a) {
            if (a in sa)return sa[a];
            var b = a.charCodeAt(0), e = "\\u";
            16 > b ? e += "000" : 256 > b ? e += "00" : 4096 > b && (e += "0");
            return sa[a] = e + b.toString(16)
        }), '"')
    };
    function ua(a) {
        return"undefined" !== typeof JSON && l(JSON.parse) ? JSON.parse(a) : oa(a)
    }

    function u(a) {
        if ("undefined" !== typeof JSON && l(JSON.stringify))a = JSON.stringify(a); else {
            var b = [];
            qa(new pa, a, b);
            a = b.join("")
        }
        return a
    };
    function va(a) {
        for (var b = [], c = 0, d = 0; d < a.length; d++) {
            var e = a.charCodeAt(d);
            55296 <= e && 56319 >= e && (e -= 55296, d++, v(d < a.length, "Surrogate pair missing trail surrogate."), e = 65536 + (e << 10) + (a.charCodeAt(d) - 56320));
            128 > e ? b[c++] = e : (2048 > e ? b[c++] = e >> 6 | 192 : (65536 > e ? b[c++] = e >> 12 | 224 : (b[c++] = e >> 18 | 240, b[c++] = e >> 12 & 63 | 128), b[c++] = e >> 6 & 63 | 128), b[c++] = e & 63 | 128)
        }
        return b
    };
    var wa = {};

    function x(a, b, c, d) {
        var e;
        d < b ? e = "at least " + b : d > c && (e = 0 === c ? "none" : "no more than " + c);
        if (e)throw Error(a + " failed: Was called with " + d + (1 === d ? " argument." : " arguments.") + " Expects " + e + ".");
    }

    function y(a, b, c) {
        var d = "";
        switch (b) {
            case 1:
                d = c ? "first" : "First";
                break;
            case 2:
                d = c ? "second" : "Second";
                break;
            case 3:
                d = c ? "third" : "Third";
                break;
            case 4:
                d = c ? "fourth" : "Fourth";
                break;
            default:
                xa.assert(!1, "errorPrefix_ called with argumentNumber > 4.  Need to update it?")
        }
        return a = a + " failed: " + (d + " argument ")
    }

    function z(a, b, c, d) {
        if ((!d || l(c)) && !ia(c))throw Error(y(a, b, d) + "must be a valid function.");
    }

    function ya(a, b, c) {
        if (l(c) && (!ja(c) || null === c))throw Error(y(a, b, !0) + "must be a valid context object.");
    };
    function A(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b)
    }

    function B(a, b) {
        if (Object.prototype.hasOwnProperty.call(a, b))return a[b]
    }

    function za(a, b) {
        for (var c in a)Object.prototype.hasOwnProperty.call(a, c) && b(c, a[c])
    }

    function Aa(a) {
        var b = {};
        za(a, function (a, d) {
            b[a] = d
        });
        return b
    };
    var xa = {}, Ba = /[\[\].#$\/\u0000-\u001F\u007F]/, Ca = /[\[\].#$\u0000-\u001F\u007F]/;

    function Da(a) {
        return p(a) && 0 !== a.length && !Ba.test(a)
    }

    function Ea(a, b, c) {
        c && !l(b) || Fa(y(a, 1, c), b)
    }

    function Fa(a, b, c, d) {
        c || (c = 0);
        d = d || [];
        if (!l(b))throw Error(a + "contains undefined" + Ga(d));
        if (ia(b))throw Error(a + "contains a function" + Ga(d) + " with contents: " + b.toString());
        if (Ha(b))throw Error(a + "contains " + b.toString() + Ga(d));
        if (1E3 < c)throw new TypeError(a + "contains a cyclic object value (" + d.slice(0, 100).join(".") + "...)");
        if (p(b) && b.length > 10485760 / 3 && 10485760 < va(b).length)throw Error(a + "contains a string greater than 10485760 utf8 bytes" + Ga(d) + " ('" + b.substring(0, 50) + "...')");
        if (ja(b))for (var e in b)if (A(b,
                e)) {
            var f = b[e];
            if (".priority" !== e && ".value" !== e && ".sv" !== e && !Da(e))throw Error(a + " contains an invalid key (" + e + ")" + Ga(d) + '.  Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');
            d.push(e);
            Fa(a, f, c + 1, d);
            d.pop()
        }
    }

    function Ga(a) {
        return 0 == a.length ? "" : " in property '" + a.join(".") + "'"
    }

    function Ia(a, b) {
        if (!ja(b) || fa(b))throw Error(y(a, 1, !1) + " must be an Object containing the children to replace.");
        Ea(a, b, !1)
    }

    function Ja(a, b, c, d) {
        if (!d || l(c)) {
            if (Ha(c))throw Error(y(a, b, d) + "is " + c.toString() + ", but must be a valid Firebase priority (a string, finite number, or null).");
            if (!(null === c || ha(c) || p(c) || ja(c) && A(c, ".sv")))throw Error(y(a, b, d) + "must be a valid Firebase priority (a string, finite number, or null).");
        }
    }

    function Ka(a, b, c) {
        if (!c || l(b))switch (b) {
            case "value":
            case "child_added":
            case "child_removed":
            case "child_changed":
            case "child_moved":
                break;
            default:
                throw Error(y(a, 1, c) + 'must be a valid event type: "value", "child_added", "child_removed", "child_changed", or "child_moved".');
        }
    }

    function La(a, b) {
        if (l(b) && !Da(b))throw Error(y(a, 2, !0) + 'was an invalid key: "' + b + '".  Firebase keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]").');
    }

    function Ma(a, b) {
        if (!p(b) || 0 === b.length || Ca.test(b))throw Error(y(a, 1, !1) + 'was an invalid path: "' + b + '". Paths must be non-empty strings and can\'t contain ".", "#", "$", "[", or "]"');
    }

    function C(a, b) {
        if (".info" === D(b))throw Error(a + " failed: Can't modify data under /.info/");
    }

    function Na(a, b) {
        if (!p(b))throw Error(y(a, 1, !1) + "must be a valid credential (a string).");
    }

    function Oa(a, b, c) {
        if (!p(c))throw Error(y(a, b, !1) + "must be a valid string.");
    }

    function E(a, b, c, d) {
        if (!d || l(c))if (!ja(c) || null === c)throw Error(y(a, b, d) + "must be a valid object.");
    }

    function Pa(a, b, c) {
        if (!ja(b) || null === b || !A(b, c))throw Error(y(a, 1, !1) + 'must contain the key "' + c + '"');
        if (!p(B(b, c)))throw Error(y(a, 1, !1) + 'must contain the key "' + c + '" with type "string"');
    };
    function F(a, b, c, d, e, f, g) {
        this.i = a;
        this.path = b;
        this.Ga = c;
        this.fa = d;
        this.za = e;
        this.Ea = f;
        this.fb = g;
        if (l(this.fa) && l(this.Ea) && l(this.Ga))throw"Query: Can't combine startAt(), endAt(), and limit().";
    }

    F.prototype.rd = function () {
        x("Query.ref", 0, 0, arguments.length);
        return new G(this.i, this.path)
    };
    F.prototype.ref = F.prototype.rd;
    F.prototype.Ua = function (a, b) {
        x("Query.on", 2, 4, arguments.length);
        Ka("Query.on", a, !1);
        z("Query.on", 2, b, !1);
        var c = Qa("Query.on", arguments[2], arguments[3]);
        this.i.ec(this, a, b, c.cancel, c.$);
        return b
    };
    F.prototype.on = F.prototype.Ua;
    F.prototype.nb = function (a, b, c) {
        x("Query.off", 0, 3, arguments.length);
        Ka("Query.off", a, !0);
        z("Query.off", 2, b, !0);
        ya("Query.off", 3, c);
        this.i.Dc(this, a, b, c)
    };
    F.prototype.off = F.prototype.nb;
    F.prototype.Ke = function (a, b) {
        function c(g) {
            f && (f = !1, e.nb(a, c), b.call(d.$, g))
        }

        x("Query.once", 2, 4, arguments.length);
        Ka("Query.once", a, !1);
        z("Query.once", 2, b, !1);
        var d = Qa("Query.once", arguments[2], arguments[3]), e = this, f = !0;
        this.Ua(a, c, function (b) {
            e.nb(a, c);
            d.cancel && d.cancel.call(d.$, b)
        })
    };
    F.prototype.once = F.prototype.Ke;
    F.prototype.ze = function (a) {
        x("Query.limit", 1, 1, arguments.length);
        if (!ha(a) || Math.floor(a) !== a || 0 >= a)throw"Query.limit: First argument must be a positive integer.";
        return new F(this.i, this.path, a, this.fa, this.za, this.Ea, this.fb)
    };
    F.prototype.limit = F.prototype.ze;
    F.prototype.ae = function (a, b) {
        x("Query.startAt", 0, 2, arguments.length);
        Ja("Query.startAt", 1, a, !0);
        La("Query.startAt", b);
        l(a) || (b = a = null);
        return new F(this.i, this.path, this.Ga, a, b, this.Ea, this.fb)
    };
    F.prototype.startAt = F.prototype.ae;
    F.prototype.Hd = function (a, b) {
        x("Query.endAt", 0, 2, arguments.length);
        Ja("Query.endAt", 1, a, !0);
        La("Query.endAt", b);
        return new F(this.i, this.path, this.Ga, this.fa, this.za, a, b)
    };
    F.prototype.endAt = F.prototype.Hd;
    F.prototype.se = function (a, b) {
        x("Query.equalTo", 1, 2, arguments.length);
        Ja("Query.equalTo", 1, a, !1);
        La("Query.equalTo", b);
        return this.ae(a, b).Hd(a, b)
    };
    F.prototype.equalTo = F.prototype.se;
    function Ra(a) {
        var b = {};
        l(a.fa) && (b.sp = a.fa);
        l(a.za) && (b.sn = a.za);
        l(a.Ea) && (b.ep = a.Ea);
        l(a.fb) && (b.en = a.fb);
        l(a.Ga) && (b.l = a.Ga);
        l(a.fa) && l(a.za) && null === a.fa && null === a.za && (b.vf = "l");
        return b
    }

    F.prototype.Wa = function () {
        var a = Sa(Ra(this));
        return"{}" === a ? "default" : a
    };
    function Qa(a, b, c) {
        var d = {};
        if (b && c)d.cancel = b, z(a, 3, d.cancel, !0), d.$ = c, ya(a, 4, d.$); else if (b)if ("object" === typeof b && null !== b)d.$ = b; else if ("function" === typeof b)d.cancel = b; else throw Error(wa.af(a, 3, !0) + "must either be a cancel callback or a context object.");
        return d
    };
    function H(a, b) {
        if (1 == arguments.length) {
            this.u = a.split("/");
            for (var c = 0, d = 0; d < this.u.length; d++)0 < this.u[d].length && (this.u[c] = this.u[d], c++);
            this.u.length = c;
            this.W = 0
        } else this.u = a, this.W = b
    }

    function D(a) {
        return a.W >= a.u.length ? null : a.u[a.W]
    }

    function Ta(a) {
        var b = a.W;
        b < a.u.length && b++;
        return new H(a.u, b)
    }

    function Ua(a) {
        return a.W < a.u.length ? a.u[a.u.length - 1] : null
    }

    k = H.prototype;
    k.toString = function () {
        for (var a = "", b = this.W; b < this.u.length; b++)"" !== this.u[b] && (a += "/" + this.u[b]);
        return a || "/"
    };
    k.parent = function () {
        if (this.W >= this.u.length)return null;
        for (var a = [], b = this.W; b < this.u.length - 1; b++)a.push(this.u[b]);
        return new H(a, 0)
    };
    k.J = function (a) {
        for (var b = [], c = this.W; c < this.u.length; c++)b.push(this.u[c]);
        if (a instanceof H)for (c = a.W; c < a.u.length; c++)b.push(a.u[c]); else for (a = a.split("/"), c = 0; c < a.length; c++)0 < a[c].length && b.push(a[c]);
        return new H(b, 0)
    };
    k.f = function () {
        return this.W >= this.u.length
    };
    k.length = function () {
        return this.u.length - this.W
    };
    function Va(a, b) {
        var c = D(a);
        if (null === c)return b;
        if (c === D(b))return Va(Ta(a), Ta(b));
        throw"INTERNAL ERROR: innerPath (" + b + ") is not within outerPath (" + a + ")";
    }

    k.contains = function (a) {
        var b = this.W, c = a.W;
        if (this.length() > a.length())return!1;
        for (; b < this.u.length;) {
            if (this.u[b] !== a.u[c])return!1;
            ++b;
            ++c
        }
        return!0
    };
    function Wa() {
        this.children = {};
        this.gc = 0;
        this.value = null
    }

    function Xa(a, b, c) {
        this.Ha = a ? a : "";
        this.Qb = b ? b : null;
        this.A = c ? c : new Wa
    }

    function I(a, b) {
        for (var c = b instanceof H ? b : new H(b), d = a, e; null !== (e = D(c));)d = new Xa(e, d, B(d.A.children, e) || new Wa), c = Ta(c);
        return d
    }

    k = Xa.prototype;
    k.k = function () {
        return this.A.value
    };
    function Ya(a, b) {
        v("undefined" !== typeof b, "Cannot set value to undefined");
        a.A.value = b;
        Za(a)
    }

    k.clear = function () {
        this.A.value = null;
        this.A.children = {};
        this.A.gc = 0;
        Za(this)
    };
    k.Fb = function () {
        return 0 < this.A.gc
    };
    k.f = function () {
        return null === this.k() && !this.Fb()
    };
    k.B = function (a) {
        for (var b in this.A.children)a(new Xa(b, this, this.A.children[b]))
    };
    function $a(a, b, c, d) {
        c && !d && b(a);
        a.B(function (a) {
            $a(a, b, !0, d)
        });
        c && d && b(a)
    }

    function ab(a, b, c) {
        for (a = c ? a : a.parent(); null !== a;) {
            if (b(a))return!0;
            a = a.parent()
        }
        return!1
    }

    k.path = function () {
        return new H(null === this.Qb ? this.Ha : this.Qb.path() + "/" + this.Ha)
    };
    k.name = function () {
        return this.Ha
    };
    k.parent = function () {
        return this.Qb
    };
    function Za(a) {
        if (null !== a.Qb) {
            var b = a.Qb, c = a.Ha, d = a.f(), e = A(b.A.children, c);
            d && e ? (delete b.A.children[c], b.A.gc--, Za(b)) : d || e || (b.A.children[c] = a.A, b.A.gc++, Za(b))
        }
    };
    function bb(a, b) {
        this.ab = a ? a : cb;
        this.ea = b ? b : db
    }

    function cb(a, b) {
        return a < b ? -1 : a > b ? 1 : 0
    }

    k = bb.prototype;
    k.ta = function (a, b) {
        return new bb(this.ab, this.ea.ta(a, b, this.ab).M(null, null, !1, null, null))
    };
    k.remove = function (a) {
        return new bb(this.ab, this.ea.remove(a, this.ab).M(null, null, !1, null, null))
    };
    k.get = function (a) {
        for (var b, c = this.ea; !c.f();) {
            b = this.ab(a, c.key);
            if (0 === b)return c.value;
            0 > b ? c = c.left : 0 < b && (c = c.right)
        }
        return null
    };
    function eb(a, b) {
        for (var c, d = a.ea, e = null; !d.f();) {
            c = a.ab(b, d.key);
            if (0 === c) {
                if (d.left.f())return e ? e.key : null;
                for (d = d.left; !d.right.f();)d = d.right;
                return d.key
            }
            0 > c ? d = d.left : 0 < c && (e = d, d = d.right)
        }
        throw Error("Attempted to find predecessor key for a nonexistent key.  What gives?");
    }

    k.f = function () {
        return this.ea.f()
    };
    k.count = function () {
        return this.ea.count()
    };
    k.Lb = function () {
        return this.ea.Lb()
    };
    k.lb = function () {
        return this.ea.lb()
    };
    k.Fa = function (a) {
        return this.ea.Fa(a)
    };
    k.Xa = function (a) {
        return this.ea.Xa(a)
    };
    k.jb = function (a) {
        return new fb(this.ea, a)
    };
    function fb(a, b) {
        this.Wd = b;
        for (this.pc = []; !a.f();)this.pc.push(a), a = a.left
    }

    function gb(a) {
        if (0 === a.pc.length)return null;
        var b = a.pc.pop(), c;
        c = a.Wd ? a.Wd(b.key, b.value) : {key: b.key, value: b.value};
        for (b = b.right; !b.f();)a.pc.push(b), b = b.left;
        return c
    }

    function hb(a, b, c, d, e) {
        this.key = a;
        this.value = b;
        this.color = null != c ? c : !0;
        this.left = null != d ? d : db;
        this.right = null != e ? e : db
    }

    k = hb.prototype;
    k.M = function (a, b, c, d, e) {
        return new hb(null != a ? a : this.key, null != b ? b : this.value, null != c ? c : this.color, null != d ? d : this.left, null != e ? e : this.right)
    };
    k.count = function () {
        return this.left.count() + 1 + this.right.count()
    };
    k.f = function () {
        return!1
    };
    k.Fa = function (a) {
        return this.left.Fa(a) || a(this.key, this.value) || this.right.Fa(a)
    };
    k.Xa = function (a) {
        return this.right.Xa(a) || a(this.key, this.value) || this.left.Xa(a)
    };
    function ib(a) {
        return a.left.f() ? a : ib(a.left)
    }

    k.Lb = function () {
        return ib(this).key
    };
    k.lb = function () {
        return this.right.f() ? this.key : this.right.lb()
    };
    k.ta = function (a, b, c) {
        var d, e;
        e = this;
        d = c(a, e.key);
        e = 0 > d ? e.M(null, null, null, e.left.ta(a, b, c), null) : 0 === d ? e.M(null, b, null, null, null) : e.M(null, null, null, null, e.right.ta(a, b, c));
        return jb(e)
    };
    function kb(a) {
        if (a.left.f())return db;
        a.left.R() || a.left.left.R() || (a = lb(a));
        a = a.M(null, null, null, kb(a.left), null);
        return jb(a)
    }

    k.remove = function (a, b) {
        var c, d;
        c = this;
        if (0 > b(a, c.key))c.left.f() || c.left.R() || c.left.left.R() || (c = lb(c)), c = c.M(null, null, null, c.left.remove(a, b), null); else {
            c.left.R() && (c = mb(c));
            c.right.f() || c.right.R() || c.right.left.R() || (c = nb(c), c.left.left.R() && (c = mb(c), c = nb(c)));
            if (0 === b(a, c.key)) {
                if (c.right.f())return db;
                d = ib(c.right);
                c = c.M(d.key, d.value, null, null, kb(c.right))
            }
            c = c.M(null, null, null, null, c.right.remove(a, b))
        }
        return jb(c)
    };
    k.R = function () {
        return this.color
    };
    function jb(a) {
        a.right.R() && !a.left.R() && (a = ob(a));
        a.left.R() && a.left.left.R() && (a = mb(a));
        a.left.R() && a.right.R() && (a = nb(a));
        return a
    }

    function lb(a) {
        a = nb(a);
        a.right.left.R() && (a = a.M(null, null, null, null, mb(a.right)), a = ob(a), a = nb(a));
        return a
    }

    function ob(a) {
        return a.right.M(null, null, a.color, a.M(null, null, !0, null, a.right.left), null)
    }

    function mb(a) {
        return a.left.M(null, null, a.color, null, a.M(null, null, !0, a.left.right, null))
    }

    function nb(a) {
        return a.M(null, null, !a.color, a.left.M(null, null, !a.left.color, null, null), a.right.M(null, null, !a.right.color, null, null))
    }

    function pb() {
    }

    k = pb.prototype;
    k.M = function () {
        return this
    };
    k.ta = function (a, b) {
        return new hb(a, b, null)
    };
    k.remove = function () {
        return this
    };
    k.count = function () {
        return 0
    };
    k.f = function () {
        return!0
    };
    k.Fa = function () {
        return!1
    };
    k.Xa = function () {
        return!1
    };
    k.Lb = function () {
        return null
    };
    k.lb = function () {
        return null
    };
    k.R = function () {
        return!1
    };
    var db = new pb;

    function qb(a) {
        this.Cb = a;
        this.zc = "firebase:"
    }

    k = qb.prototype;
    k.set = function (a, b) {
        null == b ? this.Cb.removeItem(this.zc + a) : this.Cb.setItem(this.zc + a, u(b))
    };
    k.get = function (a) {
        a = this.Cb.getItem(this.zc + a);
        return null == a ? null : ua(a)
    };
    k.remove = function (a) {
        this.Cb.removeItem(this.zc + a)
    };
    k.Nd = !1;
    k.toString = function () {
        return this.Cb.toString()
    };
    function tb() {
        this.yb = {}
    }

    tb.prototype.set = function (a, b) {
        null == b ? delete this.yb[a] : this.yb[a] = b
    };
    tb.prototype.get = function (a) {
        return A(this.yb, a) ? this.yb[a] : null
    };
    tb.prototype.remove = function (a) {
        delete this.yb[a]
    };
    tb.prototype.Nd = !0;
    function ub(a) {
        try {
            if ("undefined" !== typeof window && "undefined" !== typeof window[a]) {
                var b = window[a];
                b.setItem("firebase:sentinel", "cache");
                b.removeItem("firebase:sentinel");
                return new qb(b)
            }
        } catch (c) {
        }
        return new tb
    }

    var vb = ub("localStorage"), J = ub("sessionStorage");

    function wb(a, b, c, d, e) {
        this.host = a.toLowerCase();
        this.domain = this.host.substr(this.host.indexOf(".") + 1);
        this.Ya = b;
        this.Ta = c;
        this.Ye = d;
        this.yc = e || "";
        this.ia = vb.get("host:" + a) || this.host
    }

    function xb(a, b) {
        b !== a.ia && (a.ia = b, "s-" === a.ia.substr(0, 2) && vb.set("host:" + a.host, a.ia))
    }

    wb.prototype.toString = function () {
        var a = (this.Ya ? "https://" : "http://") + this.host;
        this.yc && (a += "<" + this.yc + ">");
        return a
    };
    function yb() {
        this.ra = -1
    };
    function zb() {
        this.ra = -1;
        this.ra = 64;
        this.F = [];
        this.Sc = [];
        this.ge = [];
        this.vc = [];
        this.vc[0] = 128;
        for (var a = 1; a < this.ra; ++a)this.vc[a] = 0;
        this.Kc = this.kb = 0;
        this.reset()
    }

    na(zb, yb);
    zb.prototype.reset = function () {
        this.F[0] = 1732584193;
        this.F[1] = 4023233417;
        this.F[2] = 2562383102;
        this.F[3] = 271733878;
        this.F[4] = 3285377520;
        this.Kc = this.kb = 0
    };
    function Ab(a, b, c) {
        c || (c = 0);
        var d = a.ge;
        if (p(b))for (var e = 0; 16 > e; e++)d[e] = b.charCodeAt(c) << 24 | b.charCodeAt(c + 1) << 16 | b.charCodeAt(c + 2) << 8 | b.charCodeAt(c + 3), c += 4; else for (e = 0; 16 > e; e++)d[e] = b[c] << 24 | b[c + 1] << 16 | b[c + 2] << 8 | b[c + 3], c += 4;
        for (e = 16; 80 > e; e++) {
            var f = d[e - 3] ^ d[e - 8] ^ d[e - 14] ^ d[e - 16];
            d[e] = (f << 1 | f >>> 31) & 4294967295
        }
        b = a.F[0];
        c = a.F[1];
        for (var g = a.F[2], h = a.F[3], m = a.F[4], n, e = 0; 80 > e; e++)40 > e ? 20 > e ? (f = h ^ c & (g ^ h), n = 1518500249) : (f = c ^ g ^ h, n = 1859775393) : 60 > e ? (f = c & g | h & (c | g), n = 2400959708) : (f = c ^ g ^ h, n = 3395469782), f = (b <<
        5 | b >>> 27) + f + m + n + d[e] & 4294967295, m = h, h = g, g = (c << 30 | c >>> 2) & 4294967295, c = b, b = f;
        a.F[0] = a.F[0] + b & 4294967295;
        a.F[1] = a.F[1] + c & 4294967295;
        a.F[2] = a.F[2] + g & 4294967295;
        a.F[3] = a.F[3] + h & 4294967295;
        a.F[4] = a.F[4] + m & 4294967295
    }

    zb.prototype.update = function (a, b) {
        l(b) || (b = a.length);
        for (var c = b - this.ra, d = 0, e = this.Sc, f = this.kb; d < b;) {
            if (0 == f)for (; d <= c;)Ab(this, a, d), d += this.ra;
            if (p(a))for (; d < b;) {
                if (e[f] = a.charCodeAt(d), ++f, ++d, f == this.ra) {
                    Ab(this, e);
                    f = 0;
                    break
                }
            } else for (; d < b;)if (e[f] = a[d], ++f, ++d, f == this.ra) {
                Ab(this, e);
                f = 0;
                break
            }
        }
        this.kb = f;
        this.Kc += b
    };
    function Bb() {
        return Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ ma()).toString(36)
    };
    var L = Array.prototype, Cb = L.indexOf ? function (a, b, c) {
        return L.indexOf.call(a, b, c)
    } : function (a, b, c) {
        c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
        if (p(a))return p(b) && 1 == b.length ? a.indexOf(b, c) : -1;
        for (; c < a.length; c++)if (c in a && a[c] === b)return c;
        return-1
    }, Db = L.forEach ? function (a, b, c) {
        L.forEach.call(a, b, c)
    } : function (a, b, c) {
        for (var d = a.length, e = p(a) ? a.split("") : a, f = 0; f < d; f++)f in e && b.call(c, e[f], f, a)
    }, Eb = L.filter ? function (a, b, c) {
        return L.filter.call(a, b, c)
    } : function (a, b, c) {
        for (var d = a.length, e = [], f = 0, g = p(a) ?
            a.split("") : a, h = 0; h < d; h++)if (h in g) {
            var m = g[h];
            b.call(c, m, h, a) && (e[f++] = m)
        }
        return e
    }, Fb = L.map ? function (a, b, c) {
        return L.map.call(a, b, c)
    } : function (a, b, c) {
        for (var d = a.length, e = Array(d), f = p(a) ? a.split("") : a, g = 0; g < d; g++)g in f && (e[g] = b.call(c, f[g], g, a));
        return e
    }, Gb = L.reduce ? function (a, b, c, d) {
        d && (b = r(b, d));
        return L.reduce.call(a, b, c)
    } : function (a, b, c, d) {
        var e = c;
        Db(a, function (c, g) {
            e = b.call(d, e, c, g, a)
        });
        return e
    }, Hb = L.every ? function (a, b, c) {
        return L.every.call(a, b, c)
    } : function (a, b, c) {
        for (var d = a.length, e =
            p(a) ? a.split("") : a, f = 0; f < d; f++)if (f in e && !b.call(c, e[f], f, a))return!1;
        return!0
    };

    function Ib(a, b) {
        var c;
        a:{
            c = a.length;
            for (var d = p(a) ? a.split("") : a, e = 0; e < c; e++)if (e in d && b.call(void 0, d[e], e, a)) {
                c = e;
                break a
            }
            c = -1
        }
        return 0 > c ? null : p(a) ? a.charAt(c) : a[c]
    }

    function Jb(a, b) {
        a.sort(b || Kb)
    }

    function Kb(a, b) {
        return a > b ? 1 : a < b ? -1 : 0
    };
    var Lb;
    a:{
        var Mb = ba.navigator;
        if (Mb) {
            var Nb = Mb.userAgent;
            if (Nb) {
                Lb = Nb;
                break a
            }
        }
        Lb = ""
    }
    function Ob(a) {
        return-1 != Lb.indexOf(a)
    };
    var Pb = Ob("Opera") || Ob("OPR"), Qb = Ob("Trident") || Ob("MSIE"), Rb = Ob("Gecko") && -1 == Lb.toLowerCase().indexOf("webkit") && !(Ob("Trident") || Ob("MSIE")), Sb = -1 != Lb.toLowerCase().indexOf("webkit");
    (function () {
        var a = "", b;
        if (Pb && ba.opera)return a = ba.opera.version, ia(a) ? a() : a;
        Rb ? b = /rv\:([^\);]+)(\)|;)/ : Qb ? b = /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/ : Sb && (b = /WebKit\/(\S+)/);
        b && (a = (a = b.exec(Lb)) ? a[1] : "");
        return Qb && (b = (b = ba.document) ? b.documentMode : void 0, b > parseFloat(a)) ? String(b) : a
    })();
    var Tb = null, Ub = null;

    function Vb(a, b) {
        if (!ga(a))throw Error("encodeByteArray takes an array as a parameter");
        if (!Tb) {
            Tb = {};
            Ub = {};
            for (var c = 0; 65 > c; c++)Tb[c] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(c), Ub[c] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(c)
        }
        for (var c = b ? Ub : Tb, d = [], e = 0; e < a.length; e += 3) {
            var f = a[e], g = e + 1 < a.length, h = g ? a[e + 1] : 0, m = e + 2 < a.length, n = m ? a[e + 2] : 0, q = f >> 2, f = (f & 3) << 4 | h >> 4, h = (h & 15) << 2 | n >> 6, n = n & 63;
            m || (n = 64, g || (h = 64));
            d.push(c[q], c[f], c[h], c[n])
        }
        return d.join("")
    }
    ;
    var Wb = function () {
        var a = 1;
        return function () {
            return a++
        }
    }();

    function v(a, b) {
        if (!a)throw Error("Firebase INTERNAL ASSERT FAILED:" + b);
    }

    function Xb(a) {
        try {
            if ("undefined" !== typeof atob)return atob(a)
        } catch (b) {
            M("base64DecodeIfNativeSupport failed: ", b)
        }
        return null
    }

    function Yb(a) {
        var b = va(a);
        a = new zb;
        a.update(b);
        var b = [], c = 8 * a.Kc;
        56 > a.kb ? a.update(a.vc, 56 - a.kb) : a.update(a.vc, a.ra - (a.kb - 56));
        for (var d = a.ra - 1; 56 <= d; d--)a.Sc[d] = c & 255, c /= 256;
        Ab(a, a.Sc);
        for (d = c = 0; 5 > d; d++)for (var e = 24; 0 <= e; e -= 8)b[c] = a.F[d] >> e & 255, ++c;
        return Vb(b)
    }

    function Zb(a) {
        for (var b = "", c = 0; c < arguments.length; c++)b = ga(arguments[c]) ? b + Zb.apply(null, arguments[c]) : "object" === typeof arguments[c] ? b + u(arguments[c]) : b + arguments[c], b += " ";
        return b
    }

    var $b = null, ac = !0;

    function M(a) {
        !0 === ac && (ac = !1, null === $b && !0 === J.get("logging_enabled") && bc(!0));
        if ($b) {
            var b = Zb.apply(null, arguments);
            $b(b)
        }
    }

    function cc(a) {
        return function () {
            M(a, arguments)
        }
    }

    function dc(a) {
        if ("undefined" !== typeof console) {
            var b = "FIREBASE INTERNAL ERROR: " + Zb.apply(null, arguments);
            "undefined" !== typeof console.error ? console.error(b) : console.log(b)
        }
    }

    function ec(a) {
        var b = Zb.apply(null, arguments);
        throw Error("FIREBASE FATAL ERROR: " + b);
    }

    function O(a) {
        if ("undefined" !== typeof console) {
            var b = "FIREBASE WARNING: " + Zb.apply(null, arguments);
            "undefined" !== typeof console.warn ? console.warn(b) : console.log(b)
        }
    }

    function fc(a) {
        var b = "", c = "", d = "", e = !0, f = "https", g = "";
        if (p(a)) {
            var h = a.indexOf("//");
            0 <= h && (f = a.substring(0, h - 1), a = a.substring(h + 2));
            h = a.indexOf("/");
            -1 === h && (h = a.length);
            b = a.substring(0, h);
            a = a.substring(h + 1);
            var m = b.split(".");
            if (3 === m.length) {
                h = m[2].indexOf(":");
                e = 0 <= h ? "https" === f || "wss" === f : !0;
                c = m[1];
                d = m[0];
                g = "";
                a = ("/" + a).split("/");
                for (h = 0; h < a.length; h++)if (0 < a[h].length) {
                    m = a[h];
                    try {
                        m = decodeURIComponent(m.replace(/\+/g, " "))
                    } catch (n) {
                    }
                    g += "/" + m
                }
                d = d.toLowerCase()
            } else 2 === m.length && (c = m[0])
        }
        return{host: b,
            domain: c, Ve: d, Ya: e, scheme: f, Rb: g}
    }

    function Ha(a) {
        return ha(a) && (a != a || a == Number.POSITIVE_INFINITY || a == Number.NEGATIVE_INFINITY)
    }

    function gc(a) {
        if ("complete" === document.readyState)a(); else {
            var b = !1, c = function () {
                document.body ? b || (b = !0, a()) : setTimeout(c, Math.floor(10))
            };
            document.addEventListener ? (document.addEventListener("DOMContentLoaded", c, !1), window.addEventListener("load", c, !1)) : document.attachEvent && (document.attachEvent("onreadystatechange", function () {
                "complete" === document.readyState && c()
            }), window.attachEvent("onload", c))
        }
    }

    function hc(a, b) {
        return a !== b ? null === a ? -1 : null === b ? 1 : typeof a !== typeof b ? "number" === typeof a ? -1 : 1 : a > b ? 1 : -1 : 0
    }

    function ic(a, b) {
        if (a === b)return 0;
        var c = jc(a), d = jc(b);
        return null !== c ? null !== d ? 0 == c - d ? a.length - b.length : c - d : -1 : null !== d ? 1 : a < b ? -1 : 1
    }

    function kc(a, b) {
        if (b && a in b)return b[a];
        throw Error("Missing required key (" + a + ") in object: " + u(b));
    }

    function Sa(a) {
        if ("object" !== typeof a || null === a)return u(a);
        var b = [], c;
        for (c in a)b.push(c);
        b.sort();
        c = "{";
        for (var d = 0; d < b.length; d++)0 !== d && (c += ","), c += u(b[d]), c += ":", c += Sa(a[b[d]]);
        return c + "}"
    }

    function lc(a, b) {
        if (a.length <= b)return[a];
        for (var c = [], d = 0; d < a.length; d += b)d + b > a ? c.push(a.substring(d, a.length)) : c.push(a.substring(d, d + b));
        return c
    }

    function mc(a, b) {
        if (fa(a))for (var c = 0; c < a.length; ++c)b(c, a[c]); else nc(a, b)
    }

    function oc(a, b) {
        return b ? r(a, b) : a
    }

    function pc(a) {
        v(!Ha(a), "Invalid JSON number");
        var b, c, d, e;
        0 === a ? (d = c = 0, b = -Infinity === 1 / a ? 1 : 0) : (b = 0 > a, a = Math.abs(a), a >= Math.pow(2, -1022) ? (d = Math.min(Math.floor(Math.log(a) / Math.LN2), 1023), c = d + 1023, d = Math.round(a * Math.pow(2, 52 - d) - Math.pow(2, 52))) : (c = 0, d = Math.round(a / Math.pow(2, -1074))));
        e = [];
        for (a = 52; a; a -= 1)e.push(d % 2 ? 1 : 0), d = Math.floor(d / 2);
        for (a = 11; a; a -= 1)e.push(c % 2 ? 1 : 0), c = Math.floor(c / 2);
        e.push(b ? 1 : 0);
        e.reverse();
        b = e.join("");
        c = "";
        for (a = 0; 64 > a; a += 8)d = parseInt(b.substr(a, 8), 2).toString(16), 1 === d.length &&
        (d = "0" + d), c += d;
        return c.toLowerCase()
    }

    function qc(a) {
        var b = "Unknown Error";
        "too_big" === a ? b = "The data requested exceeds the maximum size that can be accessed with a single request." : "permission_denied" == a ? b = "Client doesn't have permission to access the desired data." : "unavailable" == a && (b = "The service is unavailable");
        b = Error(a + ": " + b);
        b.code = a.toUpperCase();
        return b
    }

    var rc = /^-?\d{1,10}$/;

    function jc(a) {
        return rc.test(a) && (a = Number(a), -2147483648 <= a && 2147483647 >= a) ? a : null
    }

    function sc(a) {
        try {
            a()
        } catch (b) {
            setTimeout(function () {
                throw b;
            }, Math.floor(0))
        }
    }

    function P(a, b) {
        if (ia(a)) {
            var c = Array.prototype.slice.call(arguments, 1).slice();
            sc(function () {
                a.apply(null, c)
            })
        }
    };
    function tc(a, b) {
        this.H = a;
        v(null !== this.H, "LeafNode shouldn't be created with null value.");
        this.pb = "undefined" !== typeof b ? b : null
    }

    k = tc.prototype;
    k.Q = function () {
        return!0
    };
    k.m = function () {
        return this.pb
    };
    k.La = function (a) {
        return new tc(this.H, a)
    };
    k.P = function () {
        return Q
    };
    k.N = function (a) {
        return null === D(a) ? this : Q
    };
    k.ha = function () {
        return null
    };
    k.K = function (a, b) {
        return(new R).K(a, b).La(this.pb)
    };
    k.Ba = function (a, b) {
        var c = D(a);
        return null === c ? b : this.K(c, Q.Ba(Ta(a), b))
    };
    k.f = function () {
        return!1
    };
    k.qc = function () {
        return 0
    };
    k.X = function (a) {
        return a && null !== this.m() ? {".value": this.k(), ".priority": this.m()} : this.k()
    };
    k.hash = function () {
        var a = "";
        null !== this.m() && (a += "priority:" + uc(this.m()) + ":");
        var b = typeof this.H, a = a + (b + ":"), a = "number" === b ? a + pc(this.H) : a + this.H;
        return Yb(a)
    };
    k.k = function () {
        return this.H
    };
    k.toString = function () {
        return"string" === typeof this.H ? this.H : '"' + this.H + '"'
    };
    function vc(a, b) {
        return hc(a.la, b.la) || ic(a.name, b.name)
    }

    function wc(a, b) {
        return ic(a.name, b.name)
    }

    function xc(a, b) {
        return ic(a, b)
    };
    function R(a, b) {
        this.o = a || new bb(xc);
        this.pb = "undefined" !== typeof b ? b : null
    }

    k = R.prototype;
    k.Q = function () {
        return!1
    };
    k.m = function () {
        return this.pb
    };
    k.La = function (a) {
        return new R(this.o, a)
    };
    k.K = function (a, b) {
        var c = this.o.remove(a);
        b && b.f() && (b = null);
        null !== b && (c = c.ta(a, b));
        return b && null !== b.m() ? new yc(c, null, this.pb) : new R(c, this.pb)
    };
    k.Ba = function (a, b) {
        var c = D(a);
        if (null === c)return b;
        var d = this.P(c).Ba(Ta(a), b);
        return this.K(c, d)
    };
    k.f = function () {
        return this.o.f()
    };
    k.qc = function () {
        return this.o.count()
    };
    var zc = /^(0|[1-9]\d*)$/;
    k = R.prototype;
    k.X = function (a) {
        if (this.f())return null;
        var b = {}, c = 0, d = 0, e = !0;
        this.B(function (f, g) {
            b[f] = g.X(a);
            c++;
            e && zc.test(f) ? d = Math.max(d, Number(f)) : e = !1
        });
        if (!a && e && d < 2 * c) {
            var f = [], g;
            for (g in b)f[g] = b[g];
            return f
        }
        a && null !== this.m() && (b[".priority"] = this.m());
        return b
    };
    k.hash = function () {
        var a = "";
        null !== this.m() && (a += "priority:" + uc(this.m()) + ":");
        this.B(function (b, c) {
            var d = c.hash();
            "" !== d && (a += ":" + b + ":" + d)
        });
        return"" === a ? "" : Yb(a)
    };
    k.P = function (a) {
        a = this.o.get(a);
        return null === a ? Q : a
    };
    k.N = function (a) {
        var b = D(a);
        return null === b ? this : this.P(b).N(Ta(a))
    };
    k.ha = function (a) {
        return eb(this.o, a)
    };
    k.Jd = function () {
        return this.o.Lb()
    };
    k.Kd = function () {
        return this.o.lb()
    };
    k.B = function (a) {
        return this.o.Fa(a)
    };
    k.$c = function (a) {
        return this.o.Xa(a)
    };
    k.jb = function () {
        return this.o.jb()
    };
    k.toString = function () {
        var a = "{", b = !0;
        this.B(function (c, d) {
            b ? b = !1 : a += ", ";
            a += '"' + c + '" : ' + d.toString()
        });
        return a += "}"
    };
    var Q = new R;

    function yc(a, b, c) {
        R.call(this, a, c);
        null === b && (b = new bb(vc), a.Fa(function (a, c) {
            b = b.ta({name: a, la: c.m()}, c)
        }));
        this.ya = b
    }

    na(yc, R);
    k = yc.prototype;
    k.K = function (a, b) {
        var c = this.P(a), d = this.o, e = this.ya;
        null !== c && (d = d.remove(a), e = e.remove({name: a, la: c.m()}));
        b && b.f() && (b = null);
        null !== b && (d = d.ta(a, b), e = e.ta({name: a, la: b.m()}, b));
        return new yc(d, e, this.m())
    };
    k.ha = function (a, b) {
        var c = eb(this.ya, {name: a, la: b.m()});
        return c ? c.name : null
    };
    k.B = function (a) {
        return this.ya.Fa(function (b, c) {
            return a(b.name, c)
        })
    };
    k.$c = function (a) {
        return this.ya.Xa(function (b, c) {
            return a(b.name, c)
        })
    };
    k.jb = function () {
        return this.ya.jb(function (a, b) {
            return{key: a.name, value: b}
        })
    };
    k.Jd = function () {
        return this.ya.f() ? null : this.ya.Lb().name
    };
    k.Kd = function () {
        return this.ya.f() ? null : this.ya.lb().name
    };
    function S(a, b) {
        if (null === a)return Q;
        var c = null;
        "object" === typeof a && ".priority"in a ? c = a[".priority"] : "undefined" !== typeof b && (c = b);
        v(null === c || "string" === typeof c || "number" === typeof c || "object" === typeof c && ".sv"in c, "Invalid priority type found: " + typeof c);
        "object" === typeof a && ".value"in a && null !== a[".value"] && (a = a[".value"]);
        if ("object" !== typeof a || ".sv"in a)return new tc(a, c);
        if (a instanceof Array) {
            var d = Q, e = a;
            nc(e, function (a, b) {
                if (A(e, b) && "." !== b.substring(0, 1)) {
                    var c = S(a);
                    if (c.Q() || !c.f())d =
                        d.K(b, c)
                }
            });
            return d.La(c)
        }
        var f = [], g = {}, h = !1, m = a;
        mc(m, function (a, b) {
            if ("string" !== typeof b || "." !== b.substring(0, 1)) {
                var c = S(m[b]);
                c.f() || (h = h || null !== c.m(), f.push({name: b, la: c.m()}), g[b] = c)
            }
        });
        var n = Ac(f, g, !1);
        if (h) {
            var q = Ac(f, g, !0);
            return new yc(n, q, c)
        }
        return new R(n, c)
    }

    var Bc = Math.log(2);

    function Cc(a) {
        this.count = parseInt(Math.log(a + 1) / Bc, 10);
        this.Fd = this.count - 1;
        this.pe = a + 1 & parseInt(Array(this.count + 1).join("1"), 2)
    }

    function Dc(a) {
        var b = !(a.pe & 1 << a.Fd);
        a.Fd--;
        return b
    }

    function Ac(a, b, c) {
        function d(e, f) {
            var m = f - e;
            if (0 == m)return null;
            if (1 == m) {
                var m = a[e].name, n = c ? a[e] : m;
                return new hb(n, b[m], !1, null, null)
            }
            var n = parseInt(m / 2, 10) + e, q = d(e, n), s = d(n + 1, f), m = a[n].name, n = c ? a[n] : m;
            return new hb(n, b[m], !1, q, s)
        }

        var e = c ? vc : wc;
        a.sort(e);
        var f = function (e) {
                function f(e, g) {
                    var h = q - e, s = q;
                    q -= e;
                    var t = a[h].name, h = new hb(c ? a[h] : t, b[t], g, null, d(h + 1, s));
                    m ? m.left = h : n = h;
                    m = h
                }

                for (var m = null, n = null, q = a.length, s = 0; s < e.count; ++s) {
                    var t = Dc(e), w = Math.pow(2, e.count - (s + 1));
                    t ? f(w, !1) : (f(w, !1), f(w, !0))
                }
                return n
            }(new Cc(a.length)),
            e = c ? vc : xc;
        return null !== f ? new bb(e, f) : new bb(e)
    }

    function uc(a) {
        return"number" === typeof a ? "number:" + pc(a) : "string:" + a
    };
    function T(a, b) {
        this.A = a;
        this.Cc = b
    }

    T.prototype.X = function () {
        x("Firebase.DataSnapshot.val", 0, 0, arguments.length);
        return this.A.X()
    };
    T.prototype.val = T.prototype.X;
    T.prototype.te = function () {
        x("Firebase.DataSnapshot.exportVal", 0, 0, arguments.length);
        return this.A.X(!0)
    };
    T.prototype.exportVal = T.prototype.te;
    T.prototype.J = function (a) {
        x("Firebase.DataSnapshot.child", 0, 1, arguments.length);
        ha(a) && (a = String(a));
        Ma("Firebase.DataSnapshot.child", a);
        var b = new H(a), c = this.Cc.J(b);
        return new T(this.A.N(b), c)
    };
    T.prototype.child = T.prototype.J;
    T.prototype.ed = function (a) {
        x("Firebase.DataSnapshot.hasChild", 1, 1, arguments.length);
        Ma("Firebase.DataSnapshot.hasChild", a);
        var b = new H(a);
        return!this.A.N(b).f()
    };
    T.prototype.hasChild = T.prototype.ed;
    T.prototype.m = function () {
        x("Firebase.DataSnapshot.getPriority", 0, 0, arguments.length);
        return this.A.m()
    };
    T.prototype.getPriority = T.prototype.m;
    T.prototype.forEach = function (a) {
        x("Firebase.DataSnapshot.forEach", 1, 1, arguments.length);
        z("Firebase.DataSnapshot.forEach", 1, a, !1);
        if (this.A.Q())return!1;
        var b = this;
        return this.A.B(function (c, d) {
            return a(new T(d, b.Cc.J(c)))
        })
    };
    T.prototype.forEach = T.prototype.forEach;
    T.prototype.Fb = function () {
        x("Firebase.DataSnapshot.hasChildren", 0, 0, arguments.length);
        return this.A.Q() ? !1 : !this.A.f()
    };
    T.prototype.hasChildren = T.prototype.Fb;
    T.prototype.name = function () {
        x("Firebase.DataSnapshot.name", 0, 0, arguments.length);
        return this.Cc.name()
    };
    T.prototype.name = T.prototype.name;
    T.prototype.qc = function () {
        x("Firebase.DataSnapshot.numChildren", 0, 0, arguments.length);
        return this.A.qc()
    };
    T.prototype.numChildren = T.prototype.qc;
    T.prototype.rd = function () {
        x("Firebase.DataSnapshot.ref", 0, 0, arguments.length);
        return this.Cc
    };
    T.prototype.ref = T.prototype.rd;
    function Ec(a) {
        v(fa(a) && 0 < a.length, "Requires a non-empty array");
        this.he = a;
        this.Jb = {}
    }

    Ec.prototype.Mc = function (a, b) {
        for (var c = this.Jb[a] || [], d = 0; d < c.length; d++)c[d].ca.apply(c[d].$, Array.prototype.slice.call(arguments, 1))
    };
    Ec.prototype.Ua = function (a, b, c) {
        Fc(this, a);
        this.Jb[a] = this.Jb[a] || [];
        this.Jb[a].push({ca: b, $: c});
        (a = this.cd(a)) && b.apply(c, a)
    };
    Ec.prototype.nb = function (a, b, c) {
        Fc(this, a);
        a = this.Jb[a] || [];
        for (var d = 0; d < a.length; d++)if (a[d].ca === b && (!c || c === a[d].$)) {
            a.splice(d, 1);
            break
        }
    };
    function Fc(a, b) {
        v(Ib(a.he, function (a) {
            return a === b
        }), "Unknown event: " + b)
    };
    function Gc() {
        Ec.call(this, ["visible"]);
        var a, b;
        "undefined" !== typeof document && "undefined" !== typeof document.addEventListener && ("undefined" !== typeof document.hidden ? (b = "visibilitychange", a = "hidden") : "undefined" !== typeof document.mozHidden ? (b = "mozvisibilitychange", a = "mozHidden") : "undefined" !== typeof document.msHidden ? (b = "msvisibilitychange", a = "msHidden") : "undefined" !== typeof document.webkitHidden && (b = "webkitvisibilitychange", a = "webkitHidden"));
        this.xb = !0;
        if (b) {
            var c = this;
            document.addEventListener(b,
                function () {
                    var b = !document[a];
                    b !== c.xb && (c.xb = b, c.Mc("visible", b))
                }, !1)
        }
    }

    na(Gc, Ec);
    da(Gc);
    Gc.prototype.cd = function (a) {
        v("visible" === a, "Unknown event type: " + a);
        return[this.xb]
    };
    function Hc() {
        Ec.call(this, ["online"]);
        this.Ob = !0;
        if ("undefined" !== typeof window && "undefined" !== typeof window.addEventListener) {
            var a = this;
            window.addEventListener("online", function () {
                a.Ob || a.Mc("online", !0);
                a.Ob = !0
            }, !1);
            window.addEventListener("offline", function () {
                a.Ob && a.Mc("online", !1);
                a.Ob = !1
            }, !1)
        }
    }

    na(Hc, Ec);
    da(Hc);
    Hc.prototype.cd = function (a) {
        v("online" === a, "Unknown event type: " + a);
        return[this.Ob]
    };
    function nc(a, b) {
        for (var c in a)b.call(void 0, a[c], c, a)
    }

    function Ic(a) {
        var b = [], c = 0, d;
        for (d in a)b[c++] = d;
        return b
    }

    function Jc(a) {
        for (var b in a)return!1;
        return!0
    }

    function Kc(a) {
        var b = {}, c;
        for (c in a)b[c] = a[c];
        return b
    }

    var Lc = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");

    function Mc(a, b) {
        for (var c, d, e = 1; e < arguments.length; e++) {
            d = arguments[e];
            for (c in d)a[c] = d[c];
            for (var f = 0; f < Lc.length; f++)c = Lc[f], Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c])
        }
    };
    function Nc() {
        this.Bb = {}
    }

    function Oc(a, b, c) {
        l(c) || (c = 1);
        A(a.Bb, b) || (a.Bb[b] = 0);
        a.Bb[b] += c
    }

    Nc.prototype.get = function () {
        return Kc(this.Bb)
    };
    function Qc(a) {
        this.qe = a;
        this.mc = null
    }

    Qc.prototype.get = function () {
        var a = this.qe.get(), b = Kc(a);
        if (this.mc)for (var c in this.mc)b[c] -= this.mc[c];
        this.mc = a;
        return b
    };
    function Rc(a, b) {
        this.yd = {};
        this.Hc = new Qc(a);
        this.n = b;
        var c = 1E4 + 2E4 * Math.random();
        setTimeout(r(this.Ud, this), Math.floor(c))
    }

    Rc.prototype.Ud = function () {
        var a = this.Hc.get(), b = {}, c = !1, d;
        for (d in a)0 < a[d] && A(this.yd, d) && (b[d] = a[d], c = !0);
        c && (a = this.n, a.T && (b = {c: b}, a.e("reportStats", b), a.Ja("s", b)));
        setTimeout(r(this.Ud, this), Math.floor(6E5 * Math.random()))
    };
    var Sc = {}, Tc = {};

    function Uc(a) {
        a = a.toString();
        Sc[a] || (Sc[a] = new Nc);
        return Sc[a]
    }

    function Vc(a, b) {
        var c = a.toString();
        Tc[c] || (Tc[c] = b());
        return Tc[c]
    };
    var Wc = null;
    "undefined" !== typeof MozWebSocket ? Wc = MozWebSocket : "undefined" !== typeof WebSocket && (Wc = WebSocket);
    function Xc(a, b, c) {
        this.Wc = a;
        this.e = cc(this.Wc);
        this.frames = this.Hb = null;
        this.Na = this.Oa = this.Ad = 0;
        this.ga = Uc(b);
        this.Ca = (b.Ya ? "wss://" : "ws://") + b.ia + "/.ws?v=5";
        "undefined" !== typeof location && location.href && -1 !== location.href.indexOf("firebaseio.com") && (this.Ca += "&r=f");
        b.host !== b.ia && (this.Ca = this.Ca + "&ns=" + b.Ta);
        c && (this.Ca = this.Ca + "&s=" + c)
    }

    var Yc;
    Xc.prototype.open = function (a, b) {
        this.ka = b;
        this.Ge = a;
        this.e("Websocket connecting to " + this.Ca);
        this.Db = !1;
        vb.set("previous_websocket_failure", !0);
        try {
            this.Y = new Wc(this.Ca)
        } catch (c) {
            this.e("Error instantiating WebSocket.");
            var d = c.message || c.data;
            d && this.e(d);
            this.Ia();
            return
        }
        var e = this;
        this.Y.onopen = function () {
            e.e("Websocket connected.");
            e.Db = !0
        };
        this.Y.onclose = function () {
            e.e("Websocket connection was disconnected.");
            e.Y = null;
            e.Ia()
        };
        this.Y.onmessage = function (a) {
            if (null !== e.Y)if (a = a.data, e.Na += a.length,
                    Oc(e.ga, "bytes_received", a.length), Zc(e), null !== e.frames)$c(e, a); else {
                a:{
                    v(null === e.frames, "We already have a frame buffer");
                    if (6 >= a.length) {
                        var b = Number(a);
                        if (!isNaN(b)) {
                            e.Ad = b;
                            e.frames = [];
                            a = null;
                            break a
                        }
                    }
                    e.Ad = 1;
                    e.frames = []
                }
                null !== a && $c(e, a)
            }
        };
        this.Y.onerror = function (a) {
            e.e("WebSocket error.  Closing connection.");
            (a = a.message || a.data) && e.e(a);
            e.Ia()
        }
    };
    Xc.prototype.start = function () {
    };
    Xc.isAvailable = function () {
        var a = !1;
        if ("undefined" !== typeof navigator && navigator.userAgent) {
            var b = navigator.userAgent.match(/Android ([0-9]{0,}\.[0-9]{0,})/);
            b && 1 < b.length && 4.4 > parseFloat(b[1]) && (a = !0)
        }
        return!a && null !== Wc && !Yc
    };
    Xc.responsesRequiredToBeHealthy = 2;
    Xc.healthyTimeout = 3E4;
    k = Xc.prototype;
    k.nc = function () {
        vb.remove("previous_websocket_failure")
    };
    function $c(a, b) {
        a.frames.push(b);
        if (a.frames.length == a.Ad) {
            var c = a.frames.join("");
            a.frames = null;
            c = ua(c);
            a.Ge(c)
        }
    }

    k.send = function (a) {
        Zc(this);
        a = u(a);
        this.Oa += a.length;
        Oc(this.ga, "bytes_sent", a.length);
        a = lc(a, 16384);
        1 < a.length && this.Y.send(String(a.length));
        for (var b = 0; b < a.length; b++)this.Y.send(a[b])
    };
    k.ac = function () {
        this.Ra = !0;
        this.Hb && (clearInterval(this.Hb), this.Hb = null);
        this.Y && (this.Y.close(), this.Y = null)
    };
    k.Ia = function () {
        this.Ra || (this.e("WebSocket is closing itself"), this.ac(), this.ka && (this.ka(this.Db), this.ka = null))
    };
    k.close = function () {
        this.Ra || (this.e("WebSocket is being closed"), this.ac())
    };
    function Zc(a) {
        clearInterval(a.Hb);
        a.Hb = setInterval(function () {
            a.Y && a.Y.send("0");
            Zc(a)
        }, Math.floor(45E3))
    };
    function ad(a) {
        this.ob = a;
        this.xc = [];
        this.eb = 0;
        this.Vc = -1;
        this.Va = null
    }

    function bd(a, b, c) {
        a.Vc = b;
        a.Va = c;
        a.Vc < a.eb && (a.Va(), a.Va = null)
    }

    function cd(a, b, c) {
        for (a.xc[b] = c; a.xc[a.eb];) {
            var d = a.xc[a.eb];
            delete a.xc[a.eb];
            for (var e = 0; e < d.length; ++e)if (d[e]) {
                var f = a;
                sc(function () {
                    f.ob(d[e])
                })
            }
            if (a.eb === a.Vc) {
                a.Va && (clearTimeout(a.Va), a.Va(), a.Va = null);
                break
            }
            a.eb++
        }
    };
    function dd() {
        this.set = {}
    }

    k = dd.prototype;
    k.add = function (a, b) {
        this.set[a] = null !== b ? b : !0
    };
    k.contains = function (a) {
        return A(this.set, a)
    };
    k.get = function (a) {
        return this.contains(a) ? this.set[a] : void 0
    };
    k.remove = function (a) {
        delete this.set[a]
    };
    k.clear = function () {
        this.set = {}
    };
    k.f = function () {
        return Jc(this.set)
    };
    k.count = function () {
        var a = this.set, b = 0, c;
        for (c in a)b++;
        return b
    };
    function ed(a, b) {
        nc(a.set, function (a, d) {
            b(d, a)
        })
    }

    k.keys = function () {
        var a = [];
        nc(this.set, function (b, c) {
            a.push(c)
        });
        return a
    };
    function fd(a, b, c) {
        this.Wc = a;
        this.e = cc(a);
        this.Na = this.Oa = 0;
        this.ga = Uc(b);
        this.Gc = c;
        this.Db = !1;
        this.dc = function (a) {
            b.host !== b.ia && (a.ns = b.Ta);
            var c = [], f;
            for (f in a)a.hasOwnProperty(f) && c.push(f + "=" + a[f]);
            return(b.Ya ? "https://" : "http://") + b.ia + "/.lp?" + c.join("&")
        }
    }

    var gd, hd;
    fd.prototype.open = function (a, b) {
        this.Ed = 0;
        this.U = b;
        this.Od = new ad(a);
        this.Ra = !1;
        var c = this;
        this.Pa = setTimeout(function () {
            c.e("Timed out trying to connect.");
            c.Ia();
            c.Pa = null
        }, Math.floor(3E4));
        gc(function () {
            if (!c.Ra) {
                c.na = new id(function (a, b, d, h, m) {
                    jd(c, arguments);
                    if (c.na)if (c.Pa && (clearTimeout(c.Pa), c.Pa = null), c.Db = !0, "start" == a)c.id = b, c.Td = d; else if ("close" === a)b ? (c.na.Fc = !1, bd(c.Od, b, function () {
                        c.Ia()
                    })) : c.Ia(); else throw Error("Unrecognized command received: " + a);
                }, function (a, b) {
                    jd(c, arguments);
                    cd(c.Od, a, b)
                }, function () {
                    c.Ia()
                }, c.dc);
                var a = {start: "t"};
                a.ser = Math.floor(1E8 * Math.random());
                c.na.Nc && (a.cb = c.na.Nc);
                a.v = "5";
                c.Gc && (a.s = c.Gc);
                "undefined" !== typeof location && location.href && -1 !== location.href.indexOf("firebaseio.com") && (a.r = "f");
                a = c.dc(a);
                c.e("Connecting via long-poll to " + a);
                kd(c.na, a, function () {
                })
            }
        })
    };
    fd.prototype.start = function () {
        var a = this.na, b = this.Td;
        a.Be = this.id;
        a.Ce = b;
        for (a.Qc = !0; ld(a););
        a = this.id;
        b = this.Td;
        this.mb = document.createElement("iframe");
        var c = {dframe: "t"};
        c.id = a;
        c.pw = b;
        this.mb.src = this.dc(c);
        this.mb.style.display = "none";
        document.body.appendChild(this.mb)
    };
    fd.isAvailable = function () {
        return!hd && !("object" === typeof window && window.chrome && window.chrome.extension && !/^chrome/.test(window.location.href)) && !("object" === typeof Windows && "object" === typeof Windows.Ze) && (gd || !0)
    };
    k = fd.prototype;
    k.nc = function () {
    };
    k.ac = function () {
        this.Ra = !0;
        this.na && (this.na.close(), this.na = null);
        this.mb && (document.body.removeChild(this.mb), this.mb = null);
        this.Pa && (clearTimeout(this.Pa), this.Pa = null)
    };
    k.Ia = function () {
        this.Ra || (this.e("Longpoll is closing itself"), this.ac(), this.U && (this.U(this.Db), this.U = null))
    };
    k.close = function () {
        this.Ra || (this.e("Longpoll is being closed."), this.ac())
    };
    k.send = function (a) {
        a = u(a);
        this.Oa += a.length;
        Oc(this.ga, "bytes_sent", a.length);
        a = va(a);
        a = Vb(a, !0);
        a = lc(a, 1840);
        for (var b = 0; b < a.length; b++) {
            var c = this.na;
            c.Tb.push({Pe: this.Ed, We: a.length, Gd: a[b]});
            c.Qc && ld(c);
            this.Ed++
        }
    };
    function jd(a, b) {
        var c = u(b).length;
        a.Na += c;
        Oc(a.ga, "bytes_received", c)
    }

    function id(a, b, c, d) {
        this.dc = d;
        this.ka = c;
        this.od = new dd;
        this.Tb = [];
        this.Yc = Math.floor(1E8 * Math.random());
        this.Fc = !0;
        this.Nc = Wb();
        window["pLPCommand" + this.Nc] = a;
        window["pRTLPCB" + this.Nc] = b;
        a = document.createElement("iframe");
        a.style.display = "none";
        if (document.body) {
            document.body.appendChild(a);
            try {
                a.contentWindow.document || M("No IE domain setting required")
            } catch (e) {
                a.src = "javascript:void((function(){document.open();document.domain='" + document.domain + "';document.close();})())"
            }
        } else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";
        a.contentDocument ? a.Da = a.contentDocument : a.contentWindow ? a.Da = a.contentWindow.document : a.document && (a.Da = a.document);
        this.aa = a;
        a = "";
        this.aa.src && "javascript:" === this.aa.src.substr(0, 11) && (a = '<script>document.domain="' + document.domain + '";\x3c/script>');
        a = "<html><body>" + a + "</body></html>";
        try {
            this.aa.Da.open(), this.aa.Da.write(a), this.aa.Da.close()
        } catch (f) {
            M("frame writing exception"), f.stack && M(f.stack), M(f)
        }
    }

    id.prototype.close = function () {
        this.Qc = !1;
        if (this.aa) {
            this.aa.Da.body.innerHTML = "";
            var a = this;
            setTimeout(function () {
                null !== a.aa && (document.body.removeChild(a.aa), a.aa = null)
            }, Math.floor(0))
        }
        var b = this.ka;
        b && (this.ka = null, b())
    };
    function ld(a) {
        if (a.Qc && a.Fc && a.od.count() < (0 < a.Tb.length ? 2 : 1)) {
            a.Yc++;
            var b = {};
            b.id = a.Be;
            b.pw = a.Ce;
            b.ser = a.Yc;
            for (var b = a.dc(b), c = "", d = 0; 0 < a.Tb.length;)if (1870 >= a.Tb[0].Gd.length + 30 + c.length) {
                var e = a.Tb.shift(), c = c + "&seg" + d + "=" + e.Pe + "&ts" + d + "=" + e.We + "&d" + d + "=" + e.Gd;
                d++
            } else break;
            md(a, b + c, a.Yc);
            return!0
        }
        return!1
    }

    function md(a, b, c) {
        function d() {
            a.od.remove(c);
            ld(a)
        }

        a.od.add(c);
        var e = setTimeout(d, Math.floor(25E3));
        kd(a, b, function () {
            clearTimeout(e);
            d()
        })
    }

    function kd(a, b, c) {
        setTimeout(function () {
            try {
                if (a.Fc) {
                    var d = a.aa.Da.createElement("script");
                    d.type = "text/javascript";
                    d.async = !0;
                    d.src = b;
                    d.onload = d.onreadystatechange = function () {
                        var a = d.readyState;
                        a && "loaded" !== a && "complete" !== a || (d.onload = d.onreadystatechange = null, d.parentNode && d.parentNode.removeChild(d), c())
                    };
                    d.onerror = function () {
                        M("Long-poll script failed to load: " + b);
                        a.Fc = !1;
                        a.close()
                    };
                    a.aa.Da.body.appendChild(d)
                }
            } catch (e) {
            }
        }, Math.floor(1))
    };
    function nd(a) {
        od(this, a)
    }

    var pd = [fd, Xc];

    function od(a, b) {
        var c = Xc && Xc.isAvailable(), d = c && !(vb.Nd || !0 === vb.get("previous_websocket_failure"));
        b.Ye && (c || O("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."), d = !0);
        if (d)a.bc = [Xc]; else {
            var e = a.bc = [];
            mc(pd, function (a, b) {
                b && b.isAvailable() && e.push(b)
            })
        }
    }

    function qd(a) {
        if (0 < a.bc.length)return a.bc[0];
        throw Error("No transports available");
    };
    function rd(a, b, c, d, e, f) {
        this.id = a;
        this.e = cc("c:" + this.id + ":");
        this.ob = c;
        this.Nb = d;
        this.U = e;
        this.md = f;
        this.D = b;
        this.wc = [];
        this.Dd = 0;
        this.ce = new nd(b);
        this.oa = 0;
        this.e("Connection created");
        sd(this)
    }

    function sd(a) {
        var b = qd(a.ce);
        a.C = new b("c:" + a.id + ":" + a.Dd++, a.D);
        a.qd = b.responsesRequiredToBeHealthy || 0;
        var c = td(a, a.C), d = ud(a, a.C);
        a.cc = a.C;
        a.$b = a.C;
        a.w = null;
        a.Sa = !1;
        setTimeout(function () {
            a.C && a.C.open(c, d)
        }, Math.floor(0));
        b = b.healthyTimeout || 0;
        0 < b && (a.kc = setTimeout(function () {
            a.kc = null;
            a.Sa || (a.C && 102400 < a.C.Na ? (a.e("Connection exceeded healthy timeout but has received " + a.C.Na + " bytes.  Marking connection healthy."), a.Sa = !0, a.C.nc()) : a.C && 10240 < a.C.Oa ? a.e("Connection exceeded healthy timeout but has sent " +
            a.C.Oa + " bytes.  Leaving connection alive.") : (a.e("Closing unhealthy connection after timeout."), a.close()))
        }, Math.floor(b)))
    }

    function ud(a, b) {
        return function (c) {
            b === a.C ? (a.C = null, c || 0 !== a.oa ? 1 === a.oa && a.e("Realtime connection lost.") : (a.e("Realtime connection failed."), "s-" === a.D.ia.substr(0, 2) && (vb.remove("host:" + a.D.host), a.D.ia = a.D.host)), a.close()) : b === a.w ? (a.e("Secondary connection lost."), c = a.w, a.w = null, a.cc !== c && a.$b !== c || a.close()) : a.e("closing an old connection")
        }
    }

    function td(a, b) {
        return function (c) {
            if (2 != a.oa)if (b === a.$b) {
                var d = kc("t", c);
                c = kc("d", c);
                if ("c" == d) {
                    if (d = kc("t", c), "d"in c)if (c = c.d, "h" === d) {
                        var d = c.ts, e = c.v, f = c.h;
                        a.Gc = c.s;
                        xb(a.D, f);
                        0 == a.oa && (a.C.start(), vd(a, a.C, d), "5" !== e && O("Protocol version mismatch detected"), c = a.ce, (c = 1 < c.bc.length ? c.bc[1] : null) && wd(a, c))
                    } else if ("n" === d) {
                        a.e("recvd end transmission on primary");
                        a.$b = a.w;
                        for (c = 0; c < a.wc.length; ++c)a.tc(a.wc[c]);
                        a.wc = [];
                        xd(a)
                    } else"s" === d ? (a.e("Connection shutdown command received. Shutting down..."),
                    a.md && (a.md(c), a.md = null), a.U = null, a.close()) : "r" === d ? (a.e("Reset packet received.  New host: " + c), xb(a.D, c), 1 === a.oa ? a.close() : (yd(a), sd(a))) : "e" === d ? dc("Server Error: " + c) : "o" === d ? (a.e("got pong on primary."), zd(a), Ad(a)) : dc("Unknown control packet command: " + d)
                } else"d" == d && a.tc(c)
            } else if (b === a.w)if (d = kc("t", c), c = kc("d", c), "c" == d)"t"in c && (c = c.t, "a" === c ? Bd(a) : "r" === c ? (a.e("Got a reset on secondary, closing it"), a.w.close(), a.cc !== a.w && a.$b !== a.w || a.close()) : "o" === c && (a.e("got pong on secondary."),
                a.Yd--, Bd(a))); else if ("d" == d)a.wc.push(c); else throw Error("Unknown protocol layer: " + d); else a.e("message on old connection")
        }
    }

    rd.prototype.Zd = function (a) {
        Ed(this, {t: "d", d: a})
    };
    function xd(a) {
        a.cc === a.w && a.$b === a.w && (a.e("cleaning up and promoting a connection: " + a.w.Wc), a.C = a.w, a.w = null)
    }

    function Bd(a) {
        0 >= a.Yd ? (a.e("Secondary connection is healthy."), a.Sa = !0, a.w.nc(), a.w.start(), a.e("sending client ack on secondary"), a.w.send({t: "c", d: {t: "a", d: {}}}), a.e("Ending transmission on primary"), a.C.send({t: "c", d: {t: "n", d: {}}}), a.cc = a.w, xd(a)) : (a.e("sending ping on secondary."), a.w.send({t: "c", d: {t: "p", d: {}}}))
    }

    rd.prototype.tc = function (a) {
        zd(this);
        this.ob(a)
    };
    function zd(a) {
        a.Sa || (a.qd--, 0 >= a.qd && (a.e("Primary connection is healthy."), a.Sa = !0, a.C.nc()))
    }

    function wd(a, b) {
        a.w = new b("c:" + a.id + ":" + a.Dd++, a.D, a.Gc);
        a.Yd = b.responsesRequiredToBeHealthy || 0;
        a.w.open(td(a, a.w), ud(a, a.w));
        setTimeout(function () {
            a.w && (a.e("Timed out trying to upgrade."), a.w.close())
        }, Math.floor(6E4))
    }

    function vd(a, b, c) {
        a.e("Realtime connection established.");
        a.C = b;
        a.oa = 1;
        a.Nb && (a.Nb(c), a.Nb = null);
        0 === a.qd ? (a.e("Primary connection is healthy."), a.Sa = !0) : setTimeout(function () {
            Ad(a)
        }, Math.floor(5E3))
    }

    function Ad(a) {
        a.Sa || 1 !== a.oa || (a.e("sending ping on primary."), Ed(a, {t: "c", d: {t: "p", d: {}}}))
    }

    function Ed(a, b) {
        if (1 !== a.oa)throw"Connection is not connected";
        a.cc.send(b)
    }

    rd.prototype.close = function () {
        2 !== this.oa && (this.e("Closing realtime connection."), this.oa = 2, yd(this), this.U && (this.U(), this.U = null))
    };
    function yd(a) {
        a.e("Shutting down all connections");
        a.C && (a.C.close(), a.C = null);
        a.w && (a.w.close(), a.w = null);
        a.kc && (clearTimeout(a.kc), a.kc = null)
    };
    function Fd(a) {
        var b = {}, c = {}, d = {}, e = "";
        try {
            var f = a.split("."), b = ua(Xb(f[0]) || ""), c = ua(Xb(f[1]) || ""), e = f[2], d = c.d || {};
            delete c.d
        } catch (g) {
        }
        return{bf: b, Uc: c, data: d, Ue: e}
    }

    function Gd(a) {
        a = Fd(a).Uc;
        return"object" === typeof a && a.hasOwnProperty("iat") ? B(a, "iat") : null
    }

    function Hd(a) {
        a = Fd(a);
        var b = a.Uc;
        return!!a.Ue && !!b && "object" === typeof b && b.hasOwnProperty("iat")
    };
    function Id(a, b, c, d, e) {
        this.id = Jd++;
        this.e = cc("p:" + this.id + ":");
        this.Za = !0;
        this.ja = {};
        this.V = [];
        this.Pb = 0;
        this.Mb = [];
        this.T = !1;
        this.va = 1E3;
        this.oc = 3E5;
        this.uc = b || ca;
        this.sc = c || ca;
        this.nd = d || ca;
        this.dd = e || ca;
        this.D = a;
        this.ud = null;
        this.Xb = {};
        this.Oe = 0;
        this.Ib = this.hd = null;
        Kd(this, 0);
        Gc.ib().Ua("visible", this.Je, this);
        -1 === a.host.indexOf("fblocal") && Hc.ib().Ua("online", this.He, this)
    }

    var Jd = 0, Ld = 0;
    k = Id.prototype;
    k.Ja = function (a, b, c) {
        var d = ++this.Oe;
        a = {r: d, a: a, b: b};
        this.e(u(a));
        v(this.T, "sendRequest_ call when we're not connected not allowed.");
        this.ma.Zd(a);
        c && (this.Xb[d] = c)
    };
    function Md(a, b, c) {
        var d = b.toString(), e = b.path().toString();
        a.ja[e] = a.ja[e] || {};
        v(!a.ja[e][d], "listen() called twice for same path/queryId.");
        a.ja[e][d] = {qb: b.qb(), G: c};
        a.T && Nd(a, e, d, b.qb(), c)
    }

    function Nd(a, b, c, d, e) {
        a.e("Listen on " + b + " for " + c);
        var f = {p: b};
        d = Fb(d, function (a) {
            return Ra(a)
        });
        "{}" !== c && (f.q = d);
        f.h = a.dd(b);
        a.Ja("l", f, function (d) {
            a.e("listen response", d);
            d = d.s;
            "ok" !== d && Od(a, b, c);
            e && e(d)
        })
    }

    k.I = function (a, b, c) {
        this.bb = {re: a, Id: !1, ca: b, fc: c};
        this.e("Authenticating using credential: " + a);
        Pd(this);
        (b = 40 == a.length) || (a = Fd(a).Uc, b = "object" === typeof a && !0 === B(a, "admin"));
        b && (this.e("Admin auth credential detected.  Reducing max reconnect time."), this.oc = 3E4)
    };
    k.Bd = function (a) {
        delete this.bb;
        this.T && this.Ja("unauth", {}, function (b) {
            a(b.s, b.d)
        })
    };
    function Pd(a) {
        var b = a.bb;
        a.T && b && a.Ja("auth", {cred: b.re}, function (c) {
            var d = c.s;
            c = c.d || "error";
            "ok" !== d && a.bb === b && delete a.bb;
            b.Id ? "ok" !== d && b.fc && b.fc(d, c) : (b.Id = !0, b.ca && b.ca(d, c))
        })
    }

    function Qd(a, b, c, d) {
        b = b.toString();
        Od(a, b, c) && a.T && Rd(a, b, c, d)
    }

    function Rd(a, b, c, d) {
        a.e("Unlisten on " + b + " for " + c);
        b = {p: b};
        d = Fb(d, function (a) {
            return Ra(a)
        });
        "{}" !== c && (b.q = d);
        a.Ja("u", b)
    }

    function Sd(a, b, c, d) {
        a.T ? Td(a, "o", b, c, d) : a.Mb.push({Rb: b, action: "o", data: c, G: d})
    }

    function Ud(a, b, c, d) {
        a.T ? Td(a, "om", b, c, d) : a.Mb.push({Rb: b, action: "om", data: c, G: d})
    }

    k.ld = function (a, b) {
        this.T ? Td(this, "oc", a, null, b) : this.Mb.push({Rb: a, action: "oc", data: null, G: b})
    };
    function Td(a, b, c, d, e) {
        c = {p: c, d: d};
        a.e("onDisconnect " + b, c);
        a.Ja(b, c, function (a) {
            e && setTimeout(function () {
                e(a.s, a.d)
            }, Math.floor(0))
        })
    }

    k.put = function (a, b, c, d) {
        Vd(this, "p", a, b, c, d)
    };
    function Wd(a, b, c, d) {
        Vd(a, "m", b, c, d, void 0)
    }

    function Vd(a, b, c, d, e, f) {
        c = {p: c, d: d};
        l(f) && (c.h = f);
        a.V.push({action: b, Vd: c, G: e});
        a.Pb++;
        b = a.V.length - 1;
        a.T && Xd(a, b)
    }

    function Xd(a, b) {
        var c = a.V[b].action, d = a.V[b].Vd, e = a.V[b].G;
        a.V[b].Le = a.T;
        a.Ja(c, d, function (d) {
            a.e(c + " response", d);
            delete a.V[b];
            a.Pb--;
            0 === a.Pb && (a.V = []);
            e && e(d.s, d.d)
        })
    }

    k.tc = function (a) {
        if ("r"in a) {
            this.e("from server: " + u(a));
            var b = a.r, c = this.Xb[b];
            c && (delete this.Xb[b], c(a.b))
        } else {
            if ("error"in a)throw"A server-side error has occurred: " + a.error;
            "a"in a && (b = a.a, c = a.b, this.e("handleServerMessage", b, c), "d" === b ? this.uc(c.p, c.d, !1) : "m" === b ? this.uc(c.p, c.d, !0) : "c" === b ? Yd(this, c.p, c.q) : "ac" === b ? (a = c.s, b = c.d, c = this.bb, delete this.bb, c && c.fc && c.fc(a, b)) : "sd" === b ? this.ud ? this.ud(c) : "msg"in c && "undefined" !== typeof console && console.log("FIREBASE: " + c.msg.replace("\n", "\nFIREBASE: ")) :
                dc("Unrecognized action received from server: " + u(b) + "\nAre you using the latest client?"))
        }
    };
    k.Nb = function (a) {
        this.e("connection ready");
        this.T = !0;
        this.Ib = (new Date).getTime();
        this.nd({serverTimeOffset: a - (new Date).getTime()});
        Pd(this);
        for (var b in this.ja)for (var c in this.ja[b])a = this.ja[b][c], Nd(this, b, c, a.qb, a.G);
        for (b = 0; b < this.V.length; b++)this.V[b] && Xd(this, b);
        for (; this.Mb.length;)b = this.Mb.shift(), Td(this, b.action, b.Rb, b.data, b.G);
        this.sc(!0)
    };
    function Kd(a, b) {
        v(!a.ma, "Scheduling a connect when we're already connected/ing?");
        a.gb && clearTimeout(a.gb);
        a.gb = setTimeout(function () {
            a.gb = null;
            Zd(a)
        }, Math.floor(b))
    }

    k.Je = function (a) {
        a && !this.xb && this.va === this.oc && (this.e("Window became visible.  Reducing delay."), this.va = 1E3, this.ma || Kd(this, 0));
        this.xb = a
    };
    k.He = function (a) {
        a ? (this.e("Browser went online.  Reconnecting."), this.va = 1E3, this.Za = !0, this.ma || Kd(this, 0)) : (this.e("Browser went offline.  Killing connection; don't reconnect."), this.Za = !1, this.ma && this.ma.close())
    };
    k.Qd = function () {
        this.e("data client disconnected");
        this.T = !1;
        this.ma = null;
        for (var a = 0; a < this.V.length; a++) {
            var b = this.V[a];
            b && "h"in b.Vd && b.Le && (b.G && b.G("disconnect"), delete this.V[a], this.Pb--)
        }
        0 === this.Pb && (this.V = []);
        if (this.Za)this.xb ? this.Ib && (3E4 < (new Date).getTime() - this.Ib && (this.va = 1E3), this.Ib = null) : (this.e("Window isn't visible.  Delaying reconnect."), this.va = this.oc, this.hd = (new Date).getTime()), a = Math.max(0, this.va - ((new Date).getTime() - this.hd)), a *= Math.random(), this.e("Trying to reconnect in " +
        a + "ms"), Kd(this, a), this.va = Math.min(this.oc, 1.3 * this.va); else for (var c in this.Xb)delete this.Xb[c];
        this.sc(!1)
    };
    function Zd(a) {
        if (a.Za) {
            a.e("Making a connection attempt");
            a.hd = (new Date).getTime();
            a.Ib = null;
            var b = r(a.tc, a), c = r(a.Nb, a), d = r(a.Qd, a), e = a.id + ":" + Ld++;
            a.ma = new rd(e, a.D, b, c, d, function (b) {
                O(b + " (" + a.D.toString() + ")");
                a.Za = !1
            })
        }
    }

    k.Qa = function () {
        this.Za = !1;
        this.ma ? this.ma.close() : (this.gb && (clearTimeout(this.gb), this.gb = null), this.T && this.Qd())
    };
    k.tb = function () {
        this.Za = !0;
        this.va = 1E3;
        this.T || Kd(this, 0)
    };
    function Yd(a, b, c) {
        c = c ? Fb(c, function (a) {
            return Sa(a)
        }).join("$") : "{}";
        (a = Od(a, b, c)) && a.G && a.G("permission_denied")
    }

    function Od(a, b, c) {
        b = (new H(b)).toString();
        c || (c = "{}");
        var d = a.ja[b][c];
        delete a.ja[b][c];
        return d
    };
    function $d() {
        this.o = this.H = null
    }

    $d.prototype.rb = function (a, b) {
        if (a.f())this.H = b, this.o = null; else if (null !== this.H)this.H = this.H.Ba(a, b); else {
            null == this.o && (this.o = new dd);
            var c = D(a);
            this.o.contains(c) || this.o.add(c, new $d);
            c = this.o.get(c);
            a = Ta(a);
            c.rb(a, b)
        }
    };
    function ae(a, b) {
        if (b.f())return a.H = null, a.o = null, !0;
        if (null !== a.H) {
            if (a.H.Q())return!1;
            var c = a.H;
            a.H = null;
            c.B(function (b, c) {
                a.rb(new H(b), c)
            });
            return ae(a, b)
        }
        return null !== a.o ? (c = D(b), b = Ta(b), a.o.contains(c) && ae(a.o.get(c), b) && a.o.remove(c), a.o.f() ? (a.o = null, !0) : !1) : !0
    }

    function be(a, b, c) {
        null !== a.H ? c(b, a.H) : a.B(function (a, e) {
            var f = new H(b.toString() + "/" + a);
            be(e, f, c)
        })
    }

    $d.prototype.B = function (a) {
        null !== this.o && ed(this.o, function (b, c) {
            a(b, c)
        })
    };
    function ce() {
        this.ba = Q
    }

    function U(a, b) {
        return a.ba.N(b)
    }

    function V(a, b, c) {
        a.ba = a.ba.Ba(b, c)
    }

    ce.prototype.toString = function () {
        return this.ba.toString()
    };
    function de() {
        this.wa = new ce;
        this.O = new ce;
        this.qa = new ce;
        this.Sb = new Xa
    }

    function ee(a, b, c) {
        V(a.wa, b, c);
        return fe(a, b)
    }

    function fe(a, b) {
        for (var c = U(a.wa, b), d = U(a.O, b), e = I(a.Sb, b), f = !1, g = e; null !== g;) {
            if (null !== g.k()) {
                f = !0;
                break
            }
            g = g.parent()
        }
        if (f)return!1;
        c = ge(c, d, e);
        return c !== d ? (V(a.O, b, c), !0) : !1
    }

    function ge(a, b, c) {
        if (c.f())return a;
        if (null !== c.k())return b;
        a = a || Q;
        c.B(function (d) {
            d = d.name();
            var e = a.P(d), f = b.P(d), g = I(c, d), e = ge(e, f, g);
            a = a.K(d, e)
        });
        return a
    }

    de.prototype.set = function (a, b) {
        var c = this, d = [];
        Db(b, function (a) {
            var b = a.path;
            a = a.ua;
            var g = Wb();
            Ya(I(c.Sb, b), g);
            V(c.O, b, a);
            d.push({path: b, Re: g})
        });
        return d
    };
    function he(a, b) {
        Db(b, function (b) {
            var d = b.Re;
            b = I(a.Sb, b.path);
            var e = b.k();
            v(null !== e, "pendingPut should not be null.");
            e === d && Ya(b, null)
        })
    };
    function ie(a, b) {
        return a && "object" === typeof a ? (v(".sv"in a, "Unexpected leaf node or priority contents"), b[a[".sv"]]) : a
    }

    function je(a, b) {
        var c = new $d;
        be(a, new H(""), function (a, e) {
            c.rb(a, ke(e, b))
        });
        return c
    }

    function ke(a, b) {
        var c = ie(a.m(), b), d;
        if (a.Q()) {
            var e = ie(a.k(), b);
            return e !== a.k() || c !== a.m() ? new tc(e, c) : a
        }
        d = a;
        c !== a.m() && (d = d.La(c));
        a.B(function (a, c) {
            var e = ke(c, b);
            e !== c && (d = d.K(a, e))
        });
        return d
    };
    var le = "auth.firebase.com";

    function me(a, b, c) {
        this.hc = a || {};
        this.Lc = b || {};
        this.ub = c || {};
        this.hc.remember || (this.hc.remember = "default")
    }

    var ne = ["remember", "redirectTo"];

    function oe(a) {
        var b = {}, c = {};
        za(a || {}, function (a, e) {
            0 <= Cb(ne, a) ? b[a] = e : c[a] = e
        });
        return new me(b, {}, c)
    };
    var pe = {NETWORK_ERROR: "Unable to contact the Firebase server.", SERVER_ERROR: "An unknown server error occurred.", TRANSPORT_UNAVAILABLE: "There are no login transports available for the requested method.", REQUEST_INTERRUPTED: "The browser redirected the page before the login request could complete.", USER_CANCELLED: "The user cancelled authentication."};

    function W(a) {
        var b = Error(B(pe, a), a);
        b.code = a;
        return b
    };
    function qe() {
        var a = window.opener.frames, b;
        for (b = a.length - 1; 0 <= b; b--)try {
            if (a[b].location.protocol === window.location.protocol && a[b].location.host === window.location.host && "__winchan_relay_frame" === a[b].name)return a[b]
        } catch (c) {
        }
        return null
    }

    function re(a, b, c) {
        a.attachEvent ? a.attachEvent("on" + b, c) : a.addEventListener && a.addEventListener(b, c, !1)
    }

    function se(a, b, c) {
        a.detachEvent ? a.detachEvent("on" + b, c) : a.removeEventListener && a.removeEventListener(b, c, !1)
    }

    function te(a) {
        /^https?:\/\//.test(a) || (a = window.location.href);
        var b = /^(https?:\/\/[\-_a-zA-Z\.0-9:]+)/.exec(a);
        return b ? b[1] : a
    }

    function ue(a) {
        var b = "";
        try {
            a = a.replace("#", "");
            var c = {}, d = a.replace(/^\?/, "").split("&");
            for (a = 0; a < d.length; a++)if (d[a]) {
                var e = d[a].split("=");
                c[e[0]] = e[1]
            }
            c && A(c, "__firebase_request_key") && (b = B(c, "__firebase_request_key"))
        } catch (f) {
        }
        return b
    }

    function ve(a) {
        var b = [], c;
        for (c in a)if (A(a, c)) {
            var d = B(a, c);
            if (fa(d))for (var e = 0; e < d.length; e++)b.push(encodeURIComponent(c) + "=" + encodeURIComponent(d[e])); else b.push(encodeURIComponent(c) + "=" + encodeURIComponent(B(a, c)))
        }
        return b.join("&")
    }

    function we() {
        var a = fc(le);
        return a.scheme + "://" + a.host + "/v2"
    };
    function xe() {
        return!!(window.cordova || window.phonegap || window.PhoneGap) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(navigator.userAgent)
    }

    function ye() {
        var a = navigator.userAgent;
        if ("Microsoft Internet Explorer" === navigator.appName) {
            if ((a = a.match(/MSIE ([0-9]{1,}[\.0-9]{0,})/)) && 1 < a.length)return 8 <= parseFloat(a[1])
        } else if (-1 < a.indexOf("Trident") && (a = a.match(/rv:([0-9]{2,2}[\.0-9]{0,})/)) && 1 < a.length)return 8 <= parseFloat(a[1]);
        return!1
    };
    function ze(a) {
        a = a || {};
        a.method || (a.method = "GET");
        a.headers || (a.headers = {});
        a.headers.content_type || (a.headers.content_type = "application/json");
        a.headers.content_type = a.headers.content_type.toLowerCase();
        this.options = a
    }

    ze.prototype.open = function (a, b, c) {
        function d() {
            c && (c(W("REQUEST_INTERRUPTED")), c = null)
        }

        var e = new XMLHttpRequest, f = this.options.method.toUpperCase(), g;
        re(window, "beforeunload", d);
        e.onreadystatechange = function () {
            if (c && 4 === e.readyState) {
                var a;
                if (200 <= e.status && 300 > e.status) {
                    try {
                        a = ua(e.responseText)
                    } catch (b) {
                    }
                    c(null, a)
                } else 500 <= e.status && 600 > e.status ? c(W("SERVER_ERROR")) : c(W("NETWORK_ERROR"));
                c = null;
                se(window, "beforeunload", d)
            }
        };
        if ("GET" === f)a += (/\?/.test(a) ? "" : "?") + ve(b), g = null; else {
            var h = this.options.headers.content_type;
            "application/json" === h && (g = u(b));
            "application/x-www-form-urlencoded" === h && (g = ve(b))
        }
        e.open(f, a, !0);
        a = {"X-Requested-With": "XMLHttpRequest", Accept: "application/json;text/plain"};
        Mc(a, this.options.headers);
        for (var m in a)e.setRequestHeader(m, a[m]);
        e.send(g)
    };
    ze.isAvailable = function () {
        return!!window.XMLHttpRequest && "string" === typeof(new XMLHttpRequest).responseType && (!(navigator.userAgent.match(/MSIE/) || navigator.userAgent.match(/Trident/)) || ye())
    };
    ze.prototype.Ab = function () {
        return"json"
    };
    function Ae(a) {
        a = a || {};
        this.Yb = Bb() + Bb() + Bb();
        this.Rd = a || {}
    }

    Ae.prototype.open = function (a, b, c) {
        function d() {
            c && (c(W("USER_CANCELLED")), c = null)
        }

        var e = this, f = fc(le), g;
        b.requestId = this.Yb;
        b.redirectTo = f.scheme + "://" + f.host + "/blank/page.html";
        a += /\?/.test(a) ? "" : "?";
        a += ve(b);
        (g = window.open(a, "_blank", "location=no")) && ia(g.addEventListener) ? (g.addEventListener("loadstart", function (a) {
            var b;
            if (b = a && a.url)a:{
                var f = a.url;
                try {
                    var q = document.createElement("a");
                    q.href = f;
                    b = q.host === fc(le).host && "/blank/page.html" === q.pathname;
                    break a
                } catch (s) {
                }
                b = !1
            }
            b && (a = ue(a.url), g.removeEventListener("exit",
                d), g.close(), a = new me(null, null, {requestId: e.Yb, requestKey: a}), e.Rd.requestWithCredential("/auth/session", a, c), c = null)
        }), g.addEventListener("exit", d)) : c(W("TRANSPORT_UNAVAILABLE"))
    };
    Ae.isAvailable = function () {
        return xe()
    };
    Ae.prototype.Ab = function () {
        return"redirect"
    };
    function Be(a) {
        a = a || {};
        if (!a.window_features || -1 !== navigator.userAgent.indexOf("Fennec/") || -1 !== navigator.userAgent.indexOf("Firefox/") && -1 !== navigator.userAgent.indexOf("Android"))a.window_features = void 0;
        a.window_name || (a.window_name = "_blank");
        a.relay_url || (a.relay_url = we() + "/auth/channel");
        this.options = a
    }

    Be.prototype.open = function (a, b, c) {
        function d(a) {
            g && (document.body.removeChild(g), g = void 0);
            q && (q = clearInterval(q));
            se(window, "message", e);
            se(window, "unload", d);
            if (n && !a)try {
                n.close()
            } catch (b) {
                h.postMessage("die", m)
            }
            n = h = void 0
        }

        function e(a) {
            if (a.origin === m)try {
                var b = ua(a.data);
                "ready" === b.a ? h.postMessage(s, m) : "error" === b.a ? (d(!1), c && (c(b.d), c = null)) : "response" === b.a && (d(b.forceKeepWindowOpen), c && (c(null, b.d), c = null))
            } catch (e) {
            }
        }

        var f = ye(), g, h, m = te(a);
        if (m !== te(this.options.relay_url))c && setTimeout(function () {
                c(Error("invalid arguments: origin of url and relay_url must match"))
            },
            0); else {
            f && (g = document.createElement("iframe"), g.setAttribute("src", this.options.relay_url), g.style.display = "none", g.setAttribute("name", "__winchan_relay_frame"), document.body.appendChild(g), h = g.contentWindow);
            a += (/\?/.test(a) ? "" : "?") + ve(b);
            var n = window.open(a, this.options.window_name, this.options.window_features);
            h || (h = n);
            var q = setInterval(function () {
                n && n.closed && (d(!1), c && (c(W("USER_CANCELLED")), c = null))
            }, 500), s = u({a: "request", d: b});
            re(window, "unload", d);
            re(window, "message", e)
        }
    };
    Be.isAvailable = function () {
        return"postMessage"in window && !/^file:\//.test(location.href) && !(xe() || navigator.userAgent.match(/Windows Phone/) || window.Windows && /^ms-appx:/.test(location.href) || navigator.userAgent.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i) || navigator.userAgent.match(/CriOS/) || navigator.userAgent.match(/Twitter for iPhone/) || navigator.userAgent.match(/FBAN\/FBIOS/) || window.navigator.standalone) && !navigator.userAgent.match(/PhantomJS/)
    };
    Be.prototype.Ab = function () {
        return"popup"
    };
    function Ce(a) {
        a = a || {};
        a.callback_parameter || (a.callback_parameter = "callback");
        this.options = a;
        window.__firebase_auth_jsonp = window.__firebase_auth_jsonp || {}
    }

    Ce.prototype.open = function (a, b, c) {
        function d() {
            c && (c(W("REQUEST_INTERRUPTED")), c = null)
        }

        function e() {
            setTimeout(function () {
                delete window.__firebase_auth_jsonp[f];
                Jc(window.__firebase_auth_jsonp) && delete window.__firebase_auth_jsonp;
                try {
                    var a = document.getElementById(f);
                    a && a.parentNode.removeChild(a)
                } catch (b) {
                }
            }, 1);
            se(window, "beforeunload", d)
        }

        var f = "fn" + (new Date).getTime() + Math.floor(99999 * Math.random());
        b[this.options.callback_parameter] = "__firebase_auth_jsonp." + f;
        a += (/\?/.test(a) ? "" : "?") + ve(b);
        re(window,
            "beforeunload", d);
        window.__firebase_auth_jsonp[f] = function (a) {
            c && (c(null, a), c = null);
            e()
        };
        De(f, a, c)
    };
    function De(a, b, c) {
        setTimeout(function () {
            try {
                var d = document.createElement("script");
                d.type = "text/javascript";
                d.id = a;
                d.async = !0;
                d.src = b;
                d.onerror = function () {
                    var b = document.getElementById(a);
                    null !== b && b.parentNode.removeChild(b);
                    c && c(W("NETWORK_ERROR"))
                };
                var e = document.getElementsByTagName("head");
                (e && 0 != e.length ? e[0] : document.documentElement).appendChild(d)
            } catch (f) {
                c && c(W("NETWORK_ERROR"))
            }
        }, 0)
    }

    Ce.isAvailable = function () {
        return!xe()
    };
    Ce.prototype.Ab = function () {
        return"json"
    };
    function Ee(a, b) {
        this.pd = ["session", a.yc, a.Ta].join(":");
        this.Ic = b
    }

    Ee.prototype.set = function (a, b) {
        if (!b)if (this.Ic.length)b = this.Ic[0]; else throw Error("fb.login.SessionManager : No storage options available!");
        b.set(this.pd, a)
    };
    Ee.prototype.get = function () {
        var a = Fb(this.Ic, r(this.we, this)), a = Eb(a, function (a) {
            return null !== a
        });
        Jb(a, function (a, c) {
            return Gd(c.token) - Gd(a.token)
        });
        return 0 < a.length ? a.shift() : null
    };
    Ee.prototype.we = function (a) {
        try {
            var b = a.get(this.pd);
            if (b && b.token)return b
        } catch (c) {
        }
        return null
    };
    Ee.prototype.clear = function () {
        var a = this;
        Db(this.Ic, function (b) {
            b.remove(a.pd)
        })
    };
    function Fe(a) {
        a = a || {};
        this.Yb = Bb() + Bb() + Bb();
        this.Rd = a || {}
    }

    Fe.prototype.open = function (a, b) {
        J.set("redirect_request_id", this.Yb);
        b.requestId = this.Yb;
        b.redirectTo = b.redirectTo || window.location.href;
        a += (/\?/.test(a) ? "" : "?") + ve(b);
        window.location = a
    };
    Fe.isAvailable = function () {
        return!/^file:\//.test(location.href) && !xe()
    };
    Fe.prototype.Ab = function () {
        return"redirect"
    };
    function Ge(a, b, c, d) {
        Ec.call(this, ["auth_status"]);
        this.D = a;
        this.Cd = b;
        this.Xe = c;
        this.jd = d;
        this.vb = new Ee(a, [vb, J]);
        this.Ma = null;
        He(this)
    }

    na(Ge, Ec);
    k = Ge.prototype;
    k.bd = function () {
        return this.Ma || null
    };
    function He(a) {
        J.get("redirect_request_id") && Ie(a);
        var b = a.vb.get();
        b && b.token ? (Je(a, b), a.Cd(b.token, function (c, d) {
            Ke(a, c, d, !1, b.token, b)
        }, function (b, d) {
            Le(a, "resumeSession()", b, d)
        })) : Je(a, null)
    }

    function Me(a, b, c, d, e, f) {
        "firebaseio-demo.com" === a.D.domain && O("FirebaseRef.auth() not supported on demo Firebases (*.firebaseio-demo.com). Please use on production Firebases only (*.firebaseio.com).");
        a.Cd(b, function (f, h) {
            Ke(a, f, h, !0, b, c, d || {}, e)
        }, function (b, c) {
            Le(a, "auth()", b, c, f)
        })
    }

    function Ne(a, b) {
        a.vb.clear();
        Je(a, null);
        a.Xe(function (a, d) {
            if ("ok" === a)P(b); else {
                var e = (a || "error").toUpperCase(), f = e;
                d && (f += ": " + d);
                f = Error(f);
                f.code = e;
                P(b, f)
            }
        })
    }

    function Ke(a, b, c, d, e, f, g, h) {
        "ok" === b ? (d && (b = c.auth, f.auth = b, f.expires = c.expires, f.token = Hd(e) ? e : "", c = null, b && A(b, "uid") ? c = B(b, "uid") : A(f, "uid") && (c = B(f, "uid")), f.uid = c, c = "custom", b && A(b, "provider") ? c = B(b, "provider") : A(f, "provider") && (c = B(f, "provider")), f.provider = c, a.vb.clear(), Hd(e) && (g = g || {}, c = vb, "sessionOnly" === g.remember && (c = J), "none" !== g.remember && a.vb.set(f, c)), Je(a, f)), P(h, null, f)) : (a.vb.clear(), Je(a, null), f = a = (b || "error").toUpperCase(), c && (f += ": " + c), f = Error(f), f.code = a, P(h, f))
    }

    function Le(a, b, c, d, e) {
        O(b + " was canceled: " + d);
        a.vb.clear();
        Je(a, null);
        a = Error(d);
        a.code = c.toUpperCase();
        P(e, a)
    }

    function Oe(a, b, c, d, e) {
        Pe(a);
        var f = [ze, Ce];
        c = new me(d, {}, c);
        Qe(a, f, "/auth/" + b, c, e)
    }

    function Re(a, b, c, d) {
        Pe(a);
        var e = [Be, Ae];
        c = oe(c);
        "anonymous" === b || "password" === b ? setTimeout(function () {
            P(d, W("TRANSPORT_UNAVAILABLE"))
        }, 0) : (c.Lc.window_features = "menubar=yes,modal=yes,alwaysRaised=yeslocation=yes,resizable=yes,scrollbars=yes,status=yes,height=625,width=625,top=" + ("object" === typeof screen ? .5 * (screen.height - 625) : 0) + ",left=" + ("object" === typeof screen ? .5 * (screen.width - 625) : 0), c.Lc.relay_url = we() + "/" + a.D.Ta + "/auth/channel", c.Lc.requestWithCredential = r(a.Zb, a), Qe(a, e, "/auth/" + b, c, d))
    }

    function Ie(a) {
        var b = J.get("redirect_request_id");
        if (b) {
            var c = J.get("redirect_client_options");
            J.remove("redirect_request_id");
            J.remove("redirect_client_options");
            var d = [ze, Ce], b = {requestId: b, requestKey: ue(document.location.hash)}, c = new me(c, {}, b);
            try {
                document.location.hash = document.location.hash.replace(/&__firebase_request_key=([a-zA-z0-9]*)/, "")
            } catch (e) {
            }
            Qe(a, d, "/auth/session", c)
        }
    }

    k.Xc = function (a, b) {
        Pe(this);
        var c = oe(a);
        c.ub._method = "POST";
        this.Zb("/users", c, function (a) {
            P(b, a)
        })
    };
    k.sd = function (a, b) {
        var c = this;
        Pe(this);
        var d = "/users/" + encodeURIComponent(a.email), e = oe(a);
        e.ub._method = "DELETE";
        this.Zb(d, e, function (a, d) {
            !a && d && d.uid && c.Ma && c.Ma.uid && c.Ma.uid === d.uid && Ne(c);
            P(b, a)
        })
    };
    k.Tc = function (a, b) {
        Pe(this);
        var c = "/users/" + encodeURIComponent(a.email) + "/password", d = oe(a);
        d.ub._method = "PUT";
        d.ub.password = a.newPassword;
        this.Zb(c, d, function (a) {
            P(b, a)
        })
    };
    k.td = function (a, b) {
        Pe(this);
        var c = "/users/" + encodeURIComponent(a.email) + "/password", d = oe(a);
        d.ub._method = "POST";
        this.Zb(c, d, function (a) {
            P(b, a)
        })
    };
    k.Zb = function (a, b, c) {
        Se(this, [ze, Ce], a, b, c)
    };
    function Qe(a, b, c, d, e) {
        Se(a, b, c, d, function (b, c) {
            !b && c && c.token && c.uid ? Me(a, c.token, c, d.hc, function (a, b) {
                a ? P(e, a) : P(e, null, b)
            }) : P(e, b || W("UNKNOWN_ERROR"))
        })
    }

    function Se(a, b, c, d, e) {
        b = Eb(b, function (a) {
            return"function" === typeof a.isAvailable && a.isAvailable()
        });
        0 === b.length ? setTimeout(function () {
            P(e, W("TRANSPORT_UNAVAILABLE"))
        }, 0) : (b = new (b.shift())(d.Lc), d = Aa(d.ub), d.v = "js-1.1.3", d.transport = b.Ab(), d.suppress_status_codes = !0, a = we() + "/" + a.D.Ta + c, b.open(a, d, function (a, b) {
            if (a)P(e, a); else if (b && b.error) {
                var c = Error(b.error.message);
                c.code = b.error.code;
                c.details = b.error.details;
                P(e, c)
            } else P(e, null, b)
        }))
    }

    function Je(a, b) {
        var c = null !== a.Ma || null !== b;
        a.Ma = b;
        c && a.Mc("auth_status", b);
        a.jd(null !== b)
    }

    k.cd = function (a) {
        v("auth_status" === a, 'initial event must be of type "auth_status"');
        return[this.Ma]
    };
    function Pe(a) {
        var b = a.D;
        if ("firebaseio.com" !== b.domain && "firebaseio-demo.com" !== b.domain && "auth.firebase.com" === le)throw Error("This custom Firebase server ('" + a.D.domain + "') does not support delegated login.");
    };
    function Te() {
        this.hb = []
    }

    function Ue(a, b) {
        if (0 !== b.length)for (var c = 0; c < b.length; c++)a.hb.push(b[c])
    }

    Te.prototype.Vb = function () {
        for (var a = 0; a < this.hb.length; a++)if (this.hb[a]) {
            var b = this.hb[a];
            this.hb[a] = null;
            Ve(b)
        }
        this.hb = []
    };
    function Ve(a) {
        var b = a.ca, c = a.$d, d = a.Ub;
        sc(function () {
            b(c, d)
        })
    };
    function X(a, b, c, d) {
        this.type = a;
        this.xa = b;
        this.da = c;
        this.Ub = d
    };
    function We(a) {
        this.S = a;
        this.sa = [];
        this.Zc = new Te
    }

    function Xe(a, b, c, d, e) {
        a.sa.push({type: b, ca: c, cancel: d, $: e});
        d = [];
        var f = Ye(a.j);
        a.Gb && f.push(new X("value", a.j));
        for (var g = 0; g < f.length; g++)if (f[g].type === b) {
            var h = new G(a.S.i, a.S.path);
            f[g].da && (h = h.J(f[g].da));
            d.push({ca: oc(c, e), $d: new T(f[g].xa, h), Ub: f[g].Ub})
        }
        Ue(a.Zc, d)
    }

    We.prototype.Ac = function (a, b) {
        b = this.Bc(a, b);
        null != b && Ze(this, b)
    };
    function Ze(a, b) {
        for (var c = [], d = 0; d < b.length; d++) {
            var e = b[d], f = e.type, g = new G(a.S.i, a.S.path);
            b[d].da && (g = g.J(b[d].da));
            g = new T(b[d].xa, g);
            "value" !== e.type || g.Fb() ? "value" !== e.type && (f += " " + g.name()) : f += "(" + g.X() + ")";
            M(a.S.i.n.id + ": event:" + a.S.path + ":" + a.S.Wa() + ":" + f);
            for (f = 0; f < a.sa.length; f++) {
                var h = a.sa[f];
                b[d].type === h.type && c.push({ca: oc(h.ca, h.$), $d: g, Ub: e.Ub})
            }
        }
        Ue(a.Zc, c)
    }

    We.prototype.Vb = function () {
        this.Zc.Vb()
    };
    function Ye(a) {
        var b = [];
        if (!a.Q()) {
            var c = null;
            a.B(function (a, e) {
                b.push(new X("child_added", e, a, c));
                c = a
            })
        }
        return b
    }

    function $e(a) {
        a.Gb || (a.Gb = !0, Ze(a, [new X("value", a.j)]))
    };
    function af(a, b) {
        We.call(this, a);
        this.j = b
    }

    na(af, We);
    af.prototype.Bc = function (a, b) {
        this.j = a;
        this.Gb && null != b && b.push(new X("value", this.j));
        return b
    };
    af.prototype.Eb = function () {
        return{}
    };
    function bf(a, b) {
        this.jc = a;
        this.kd = b
    }

    function cf(a, b, c, d, e) {
        var f = a.N(c), g = b.N(c);
        d = new bf(d, e);
        e = df(d, c, f, g);
        g = !f.f() && !g.f() && f.m() !== g.m();
        if (e || g)for (f = c, c = e; null !== f.parent();) {
            var h = a.N(f);
            e = b.N(f);
            var m = f.parent();
            if (!d.jc || I(d.jc, m).k()) {
                var n = b.N(m), q = [], f = Ua(f);
                h.f() ? (h = n.ha(f, e), q.push(new X("child_added", e, f, h))) : e.f() ? q.push(new X("child_removed", h, f)) : (h = n.ha(f, e), g && q.push(new X("child_moved", e, f, h)), c && q.push(new X("child_changed", e, f, h)));
                d.kd(m, n, q)
            }
            g && (g = !1, c = !0);
            f = m
        }
    }

    function df(a, b, c, d) {
        var e, f = [];
        c === d ? e = !1 : c.Q() && d.Q() ? e = c.k() !== d.k() : c.Q() ? (ef(a, b, Q, d, f), e = !0) : d.Q() ? (ef(a, b, c, Q, f), e = !0) : e = ef(a, b, c, d, f);
        e ? a.kd(b, d, f) : c.m() !== d.m() && a.kd(b, d, null);
        return e
    }

    function ef(a, b, c, d, e) {
        var f = !1, g = !a.jc || !I(a.jc, b).f(), h = [], m = [], n = [], q = [], s = {}, t = {}, w, aa, K, N;
        w = c.jb();
        K = gb(w);
        aa = d.jb();
        for (N = gb(aa); null !== K || null !== N;) {
            c = N;
            c = null === K ? 1 : null === c ? -1 : K.key === c.key ? 0 : vc({name: K.key, la: K.value.m()}, {name: c.key, la: c.value.m()});
            if (0 > c)f = B(s, K.key), l(f) ? (n.push({ad: K, zd: h[f]}), h[f] = null) : (t[K.key] = m.length, m.push(K)), f = !0, K = gb(w); else {
                if (0 < c)f = B(t, N.key), l(f) ? (n.push({ad: m[f], zd: N}), m[f] = null) : (s[N.key] = h.length, h.push(N)), f = !0; else {
                    c = b.J(N.key);
                    if (c = df(a, c, K.value,
                            N.value))q.push(N), f = !0;
                    K.value.m() !== N.value.m() && (n.push({ad: K, zd: N}), f = !0);
                    K = gb(w)
                }
                N = gb(aa)
            }
            if (!g && f)return!0
        }
        for (g = 0; g < m.length; g++)if (s = m[g])c = b.J(s.key), df(a, c, s.value, Q), e.push(new X("child_removed", s.value, s.key));
        for (g = 0; g < h.length; g++)if (s = h[g])c = b.J(s.key), m = d.ha(s.key, s.value), df(a, c, Q, s.value), e.push(new X("child_added", s.value, s.key, m));
        for (g = 0; g < n.length; g++)s = n[g].ad, h = n[g].zd, c = b.J(h.key), m = d.ha(h.key, h.value), e.push(new X("child_moved", h.value, h.key, m)), (c = df(a, c, s.value, h.value)) &&
        q.push(h);
        for (g = 0; g < q.length; g++)a = q[g], m = d.ha(a.key, a.value), e.push(new X("child_changed", a.value, a.key, m));
        return f
    };
    function ff() {
        this.Z = this.Aa = null;
        this.set = {}
    }

    na(ff, dd);
    k = ff.prototype;
    k.setActive = function (a) {
        this.Aa = a
    };
    function gf(a, b, c) {
        a.add(b, c);
        a.Z || (a.Z = c.S.path)
    }

    function hf(a) {
        var b = a.Aa;
        a.Aa = null;
        return b
    }

    function jf(a) {
        return a.contains("default")
    }

    function kf(a) {
        return null != a.Aa && jf(a)
    }

    k.defaultView = function () {
        return jf(this) ? this.get("default") : null
    };
    k.path = function () {
        return this.Z
    };
    k.toString = function () {
        return Fb(this.keys(), function (a) {
            return"default" === a ? "{}" : a
        }).join("$")
    };
    k.qb = function () {
        var a = [];
        ed(this, function (b, c) {
            a.push(c.S)
        });
        return a
    };
    function lf(a, b) {
        We.call(this, a);
        this.j = Q;
        this.Bc(b, Ye(b))
    }

    na(lf, We);
    lf.prototype.Bc = function (a, b) {
        if (null === b)return b;
        var c = [], d = this.S;
        l(d.fa) && (l(d.za) && null != d.za ? c.push(function (a, b) {
            var c = hc(b, d.fa);
            return 0 < c || 0 === c && 0 <= ic(a, d.za)
        }) : c.push(function (a, b) {
            return 0 <= hc(b, d.fa)
        }));
        l(d.Ea) && (l(d.fb) ? c.push(function (a, b) {
            var c = hc(b, d.Ea);
            return 0 > c || 0 === c && 0 >= ic(a, d.fb)
        }) : c.push(function (a, b) {
            return 0 >= hc(b, d.Ea)
        }));
        var e = null, f = null;
        if (l(this.S.Ga))if (l(this.S.fa)) {
            if (e = mf(a, c, this.S.Ga, !1)) {
                var g = a.P(e).m();
                c.push(function (a, b) {
                    var c = hc(b, g);
                    return 0 > c || 0 === c &&
                    0 >= ic(a, e)
                })
            }
        } else if (f = mf(a, c, this.S.Ga, !0)) {
            var h = a.P(f).m();
            c.push(function (a, b) {
                var c = hc(b, h);
                return 0 < c || 0 === c && 0 <= ic(a, f)
            })
        }
        for (var m = [], n = [], q = [], s = [], t = 0; t < b.length; t++) {
            var w = b[t].da, aa = b[t].xa;
            switch (b[t].type) {
                case "child_added":
                    nf(c, w, aa) && (this.j = this.j.K(w, aa), n.push(b[t]));
                    break;
                case "child_removed":
                    this.j.P(w).f() || (this.j = this.j.K(w, null), m.push(b[t]));
                    break;
                case "child_changed":
                    !this.j.P(w).f() && nf(c, w, aa) && (this.j = this.j.K(w, aa), s.push(b[t]));
                    break;
                case "child_moved":
                    var K = !this.j.P(w).f(),
                        N = nf(c, w, aa);
                    K ? N ? (this.j = this.j.K(w, aa), q.push(b[t])) : (m.push(new X("child_removed", this.j.P(w), w)), this.j = this.j.K(w, null)) : N && (this.j = this.j.K(w, aa), n.push(b[t]))
            }
        }
        var Cd = e || f;
        if (Cd) {
            var Dd = (t = null !== f) ? this.j.Jd() : this.j.Kd(), Pc = !1, rb = !1, sb = this;
            (t ? a.$c : a.B).call(a, function (a, b) {
                rb || null !== Dd || (rb = !0);
                if (rb && Pc)return!0;
                Pc ? (m.push(new X("child_removed", sb.j.P(a), a)), sb.j = sb.j.K(a, null)) : rb && (n.push(new X("child_added", b, a)), sb.j = sb.j.K(a, b));
                Dd === a && (rb = !0);
                a === Cd && (Pc = !0)
            })
        }
        for (t = 0; t < n.length; t++)c =
            n[t], w = this.j.ha(c.da, c.xa), m.push(new X("child_added", c.xa, c.da, w));
        for (t = 0; t < q.length; t++)c = q[t], w = this.j.ha(c.da, c.xa), m.push(new X("child_moved", c.xa, c.da, w));
        for (t = 0; t < s.length; t++)c = s[t], w = this.j.ha(c.da, c.xa), m.push(new X("child_changed", c.xa, c.da, w));
        this.Gb && 0 < m.length && m.push(new X("value", this.j));
        return m
    };
    function mf(a, b, c, d) {
        if (a.Q())return null;
        var e = null;
        (d ? a.$c : a.B).call(a, function (a, d) {
            if (nf(b, a, d) && (e = a, c--, 0 === c))return!0
        });
        return e
    }

    function nf(a, b, c) {
        for (var d = 0; d < a.length; d++)if (!a[d](b, c.m()))return!1;
        return!0
    }

    lf.prototype.ed = function (a) {
        return this.j.P(a) !== Q
    };
    lf.prototype.Eb = function (a, b, c) {
        var d = {};
        this.j.Q() || this.j.B(function (a) {
            d[a] = 3
        });
        var e = this.j;
        c = U(c, new H(""));
        var f = new Xa;
        Ya(I(f, this.S.path), !0);
        b = Q.Ba(a, b);
        var g = this;
        cf(c, b, a, f, function (a, b, c) {
            null !== c && a.toString() === g.S.path.toString() && g.Bc(b, c)
        });
        this.j.Q() ? nc(d, function (a, b) {
            d[b] = 2
        }) : (this.j.B(function (a) {
            A(d, a) || (d[a] = 1)
        }), nc(d, function (a, b) {
            g.j.P(b).f() && (d[b] = 2)
        }));
        this.j = e;
        return d
    };
    function of(a, b) {
        this.n = a;
        this.g = b;
        this.rc = b.ba;
        this.pa = new Xa
    }

    of.prototype.ec = function (a, b, c, d, e) {
        var f = a.path, g = I(this.pa, f), h = g.k();
        null === h ? (h = new ff, Ya(g, h)) : v(!h.f(), "We shouldn't be storing empty QueryMaps");
        var m = a.Wa();
        if (h.contains(m))a = h.get(m), Xe(a, b, c, d, e); else {
            var n = this.g.ba.N(f);
            a = pf(a, n);
            qf(this, g, h, m, a);
            Xe(a, b, c, d, e);
            (b = (b = ab(I(this.pa, f), function (a) {
                var b;
                if (b = a.k() && a.k().defaultView())b = a.k().defaultView().Gb;
                if (b)return!0
            }, !0)) || null === this.n && !U(this.g, f).f()) && $e(a)
        }
        a.Vb()
    };
    function rf(a, b, c, d, e) {
        var f = a.get(b), g;
        if (g = f) {
            g = !1;
            for (var h = f.sa.length - 1; 0 <= h; h--) {
                var m = f.sa[h];
                if (!(c && m.type !== c || d && m.ca !== d || e && m.$ !== e) && (f.sa.splice(h, 1), g = !0, c && d))break
            }
        }
        (c = g && !(0 < f.sa.length)) && a.remove(b);
        return c
    }

    function sf(a, b, c, d, e) {
        b = b ? b.Wa() : null;
        var f = [];
        b && "default" !== b ? rf(a, b, c, d, e) && f.push(b) : Db(a.keys(), function (b) {
            rf(a, b, c, d, e) && f.push(b)
        });
        return f
    }

    of.prototype.Dc = function (a, b, c, d) {
        var e = I(this.pa, a.path).k();
        return null === e ? null : tf(this, e, a, b, c, d)
    };
    function tf(a, b, c, d, e, f) {
        var g = b.path(), g = I(a.pa, g);
        c = sf(b, c, d, e, f);
        b.f() && Ya(g, null);
        d = uf(g);
        if (0 < c.length && !d) {
            d = g;
            e = g.parent();
            for (c = !1; !c && e;) {
                if (f = e.k()) {
                    v(!kf(f));
                    var h = d.name(), m = !1;
                    ed(f, function (a, b) {
                        m = b.ed(h) || m
                    });
                    m && (c = !0)
                }
                d = e;
                e = e.parent()
            }
            d = null;
            kf(b) || (b = hf(b), d = vf(a, g), b && b());
            return c ? null : d
        }
        return null
    }

    function wf(a, b, c) {
        $a(I(a.pa, b), function (a) {
            (a = a.k()) && ed(a, function (a, b) {
                $e(b)
            })
        }, c, !0)
    }

    function xf(a, b, c) {
        function d(a) {
            do {
                if (g[a.toString()])return!0;
                a = a.parent()
            } while (null !== a);
            return!1
        }

        var e = a.rc, f = a.g.ba;
        a.rc = f;
        for (var g = {}, h = 0; h < c.length; h++)g[c[h].toString()] = !0;
        cf(e, f, b, a.pa, function (c, e, f) {
            if (b.contains(c)) {
                var g = d(c);
                g && wf(a, c, !1);
                a.Ac(c, e, f);
                g && wf(a, c, !0)
            } else a.Ac(c, e, f)
        });
        d(b) && wf(a, b, !0);
        yf(a, b)
    }

    function yf(a, b) {
        var c = I(a.pa, b);
        $a(c, function (a) {
            (a = a.k()) && ed(a, function (a, b) {
                b.Vb()
            })
        }, !0, !0);
        ab(c, function (a) {
            (a = a.k()) && ed(a, function (a, b) {
                b.Vb()
            })
        }, !1)
    }

    of.prototype.Ac = function (a, b, c) {
        a = I(this.pa, a).k();
        null !== a && ed(a, function (a, e) {
            e.Ac(b, c)
        })
    };
    function uf(a) {
        return ab(a, function (a) {
            return a.k() && kf(a.k())
        })
    }

    function qf(a, b, c, d, e) {
        if (kf(c) || uf(b))gf(c, d, e); else {
            var f, g;
            c.f() || (f = c.toString(), g = c.qb());
            gf(c, d, e);
            c.setActive(zf(a, c));
            f && g && Qd(a.n, c.path(), f, g)
        }
        kf(c) && $a(b, function (a) {
            if (a = a.k())a.Aa && a.Aa(), a.Aa = null
        })
    }

    function vf(a, b) {
        function c(b) {
            var f = b.k();
            if (f && jf(f))d.push(f.path()), null == f.Aa && f.setActive(zf(a, f)); else {
                if (f) {
                    null != f.Aa || f.setActive(zf(a, f));
                    var g = {};
                    ed(f, function (a, b) {
                        b.j.B(function (a) {
                            A(g, a) || (g[a] = !0, a = f.path().J(a), d.push(a))
                        })
                    })
                }
                b.B(c)
            }
        }

        var d = [];
        c(b);
        return d
    }

    function zf(a, b) {
        if (a.n) {
            var c = a.n, d = b.path(), e = b.toString(), f = b.qb(), g, h = b.keys(), m = jf(b);
            Md(a.n, b, function (c) {
                "ok" !== c ? (c = qc(c), O("on() or once() for " + b.path().toString() + " failed: " + c.toString()), Af(a, b, c)) : g || (m ? wf(a, b.path(), !0) : Db(h, function (a) {
                    (a = b.get(a)) && $e(a)
                }), yf(a, b.path()))
            });
            return function () {
                g = !0;
                Qd(c, d, e, f)
            }
        }
        return ca
    }

    function Af(a, b, c) {
        b && (ed(b, function (a, b) {
            for (var f = 0; f < b.sa.length; f++) {
                var g = b.sa[f];
                g.cancel && oc(g.cancel, g.$)(c)
            }
        }), tf(a, b))
    }

    function pf(a, b) {
        return"default" === a.Wa() ? new af(a, b) : new lf(a, b)
    }

    of.prototype.Eb = function (a, b, c, d) {
        function e(a) {
            nc(a, function (a, b) {
                f[b] = 3 === a ? 3 : (B(f, b) || a) === a ? a : 3
            })
        }

        var f = {};
        ed(b, function (b, f) {
            e(f.Eb(a, c, d))
        });
        c.Q() || c.B(function (a) {
            A(f, a) || (f[a] = 4)
        });
        return f
    };
    function Bf(a, b, c, d, e) {
        var f = b.path();
        b = a.Eb(f, b, d, e);
        var g = Q, h = [];
        nc(b, function (b, n) {
            var q = new H(n);
            3 === b || 1 === b ? g = g.K(n, d.N(q)) : (2 === b && h.push({path: f.J(n), ua: Q}), h = h.concat(Cf(a, d.N(q), I(c, q), e)))
        });
        return[
            {path: f, ua: g}
        ].concat(h)
    }

    function Df(a, b, c, d) {
        var e;
        a:{
            var f = I(a.pa, b);
            e = f.parent();
            for (var g = []; null !== e;) {
                var h = e.k();
                if (null !== h) {
                    if (jf(h)) {
                        e = [
                            {path: b, ua: c}
                        ];
                        break a
                    }
                    h = a.Eb(b, h, c, d);
                    f = B(h, f.name());
                    if (3 === f || 1 === f) {
                        e = [
                            {path: b, ua: c}
                        ];
                        break a
                    }
                    2 === f && g.push({path: b, ua: Q})
                }
                f = e;
                e = e.parent()
            }
            e = g
        }
        if (1 == e.length && (!e[0].ua.f() || c.f()))return e;
        g = I(a.pa, b);
        f = g.k();
        null !== f ? jf(f) ? e.push({path: b, ua: c}) : e = e.concat(Bf(a, f, g, c, d)) : e = e.concat(Cf(a, c, g, d));
        return e
    }

    function Cf(a, b, c, d) {
        var e = c.k();
        if (null !== e)return jf(e) ? [
            {path: c.path(), ua: b}
        ] : Bf(a, e, c, b, d);
        var f = [];
        c.B(function (c) {
            var e = b.Q() ? Q : b.P(c.name());
            c = Cf(a, e, c, d);
            f = f.concat(c)
        });
        return f
    };
    function Ef(a) {
        this.D = a;
        this.ga = Uc(a);
        this.n = new Id(this.D, r(this.uc, this), r(this.sc, this), r(this.nd, this), r(this.dd, this));
        this.be = Vc(a, r(function () {
            return new Rc(this.ga, this.n)
        }, this));
        this.$a = new Xa;
        this.Ka = new ce;
        this.g = new de;
        this.L = new of(this.n, this.g.qa);
        this.fd = new ce;
        this.gd = new of(null, this.fd);
        Ff(this, "connected", !1);
        this.U = new $d;
        this.I = new Ge(a, r(this.n.I, this.n), r(this.n.Bd, this.n), r(this.jd, this));
        this.ic = 0
    }

    k = Ef.prototype;
    k.toString = function () {
        return(this.D.Ya ? "https://" : "http://") + this.D.host
    };
    k.name = function () {
        return this.D.Ta
    };
    function Gf(a) {
        a = U(a.fd, new H(".info/serverTimeOffset")).X() || 0;
        return(new Date).getTime() + a
    }

    function Hf(a) {
        a = a = {timestamp: Gf(a)};
        a.timestamp = a.timestamp || (new Date).getTime();
        return a
    }

    k.uc = function (a, b, c) {
        this.ic++;
        this.Md && (b = this.Md(a, b));
        var d, e, f = [];
        9 <= a.length && a.lastIndexOf(".priority") === a.length - 9 ? (d = new H(a.substring(0, a.length - 9)), e = U(this.g.wa, d).La(b), f.push(d)) : c ? (d = new H(a), e = U(this.g.wa, d), nc(b, function (a, b) {
            var c = new H(b);
            ".priority" === b ? e = e.La(a) : (e = e.Ba(c, S(a)), f.push(d.J(b)))
        })) : (d = new H(a), e = S(b), f.push(d));
        a = Df(this.L, d, e, this.g.O);
        b = !1;
        for (c = 0; c < a.length; ++c) {
            var g = a[c];
            b = ee(this.g, g.path, g.ua) || b
        }
        b && (d = If(this, d));
        xf(this.L, d, f)
    };
    k.sc = function (a) {
        Ff(this, "connected", a);
        !1 === a && Jf(this)
    };
    k.nd = function (a) {
        var b = this;
        mc(a, function (a, d) {
            Ff(b, d, a)
        })
    };
    k.dd = function (a) {
        a = new H(a);
        return U(this.g.wa, a).hash()
    };
    k.jd = function (a) {
        Ff(this, "authenticated", a)
    };
    function Ff(a, b, c) {
        b = new H("/.info/" + b);
        V(a.fd, b, S(c));
        xf(a.gd, b, [b])
    }

    k.wb = function (a, b, c, d) {
        this.e("set", {path: a.toString(), value: b, la: c});
        var e = Hf(this);
        b = S(b, c);
        var e = ke(b, e), e = Df(this.L, a, e, this.g.O), f = this.g.set(a, e), g = this;
        this.n.put(a.toString(), b.X(!0), function (b, c) {
            "ok" !== b && O("set at " + a + " failed: " + b);
            he(g.g, f);
            fe(g.g, a);
            var e = If(g, a);
            xf(g.L, e, []);
            Kf(d, b, c)
        });
        e = Lf(this, a);
        If(this, e);
        xf(this.L, e, [a])
    };
    k.update = function (a, b, c) {
        this.e("update", {path: a.toString(), value: b});
        var d = U(this.g.qa, a), e = !0, f = [], g = Hf(this), h = [], m;
        for (m in b) {
            var e = !1, n = S(b[m]), n = ke(n, g), d = d.K(m, n), q = a.J(m);
            f.push(q);
            n = Df(this.L, q, n, this.g.O);
            h = h.concat(this.g.set(a, n))
        }
        if (e)M("update() called with empty data.  Don't do anything."), Kf(c, "ok"); else {
            var s = this;
            Wd(this.n, a.toString(), b, function (b, d) {
                "ok" !== b && O("update at " + a + " failed: " + b);
                he(s.g, h);
                fe(s.g, a);
                var e = If(s, a);
                xf(s.L, e, []);
                Kf(c, b, d)
            });
            b = Lf(this, a);
            If(this, b);
            xf(s.L,
                b, f)
        }
    };
    k.vd = function (a, b, c) {
        this.e("setPriority", {path: a.toString(), la: b});
        var d = Hf(this), d = ie(b, d), d = U(this.g.O, a).La(d), d = Df(this.L, a, d, this.g.O), e = this.g.set(a, d), f = this;
        this.n.put(a.toString() + "/.priority", b, function (b, d) {
            "permission_denied" === b && O("setPriority at " + a + " failed: " + b);
            he(f.g, e);
            fe(f.g, a);
            var m = If(f, a);
            xf(f.L, m, []);
            Kf(c, b, d)
        });
        b = If(this, a);
        xf(f.L, b, [])
    };
    function Jf(a) {
        a.e("onDisconnectEvents");
        var b = [], c = Hf(a);
        be(je(a.U, c), new H(""), function (c, e) {
            var f = Df(a.L, c, e, a.g.O);
            b.push.apply(b, a.g.set(c, f));
            f = Lf(a, c);
            If(a, f);
            xf(a.L, f, [c])
        });
        he(a.g, b);
        a.U = new $d
    }

    k.ld = function (a, b) {
        var c = this;
        this.n.ld(a.toString(), function (d, e) {
            "ok" === d && ae(c.U, a);
            Kf(b, d, e)
        })
    };
    function Mf(a, b, c, d) {
        var e = S(c);
        Sd(a.n, b.toString(), e.X(!0), function (c, g) {
            "ok" === c && a.U.rb(b, e);
            Kf(d, c, g)
        })
    }

    function Nf(a, b, c, d, e) {
        var f = S(c, d);
        Sd(a.n, b.toString(), f.X(!0), function (c, d) {
            "ok" === c && a.U.rb(b, f);
            Kf(e, c, d)
        })
    }

    function Of(a, b, c, d) {
        var e = !0, f;
        for (f in c)e = !1;
        e ? (M("onDisconnect().update() called with empty data.  Don't do anything."), Kf(d, "ok")) : Ud(a.n, b.toString(), c, function (e, f) {
            if ("ok" === e)for (var m in c) {
                var n = S(c[m]);
                a.U.rb(b.J(m), n)
            }
            Kf(d, e, f)
        })
    }

    function Pf(a) {
        Oc(a.ga, "deprecated_on_disconnect");
        a.be.yd.deprecated_on_disconnect = !0
    }

    k.ec = function (a, b, c, d, e) {
        ".info" === D(a.path) ? this.gd.ec(a, b, c, d, e) : this.L.ec(a, b, c, d, e)
    };
    k.Dc = function (a, b, c, d) {
        if (".info" === D(a.path))this.gd.Dc(a, b, c, d); else {
            b = this.L.Dc(a, b, c, d);
            if (c = null !== b) {
                c = this.g;
                d = a.path;
                for (var e = [], f = 0; f < b.length; ++f)e[f] = U(c.wa, b[f]);
                V(c.wa, d, Q);
                for (f = 0; f < b.length; ++f)V(c.wa, b[f], e[f]);
                c = fe(c, d)
            }
            c && (v(this.g.qa.ba === this.L.rc, "We should have raised any outstanding events by now.  Else, we'll blow them away."), V(this.g.qa, a.path, U(this.g.O, a.path)), this.L.rc = this.g.qa.ba)
        }
    };
    k.Qa = function () {
        this.n.Qa()
    };
    k.tb = function () {
        this.n.tb()
    };
    k.wd = function (a) {
        if ("undefined" !== typeof console) {
            a ? (this.Hc || (this.Hc = new Qc(this.ga)), a = this.Hc.get()) : a = this.ga.get();
            var b = Gb(Ic(a), function (a, b) {
                return Math.max(b.length, a)
            }, 0), c;
            for (c in a) {
                for (var d = a[c], e = c.length; e < b + 2; e++)c += " ";
                console.log(c + d)
            }
        }
    };
    k.xd = function (a) {
        Oc(this.ga, a);
        this.be.yd[a] = !0
    };
    k.e = function () {
        M("r:" + this.n.id + ":", arguments)
    };
    function Kf(a, b, c) {
        a && sc(function () {
            if ("ok" == b)a(null, c); else {
                var d = (b || "error").toUpperCase(), e = d;
                c && (e += ": " + c);
                e = Error(e);
                e.code = d;
                a(e)
            }
        })
    };
    function Qf(a, b, c, d, e) {
        function f() {
        }

        a.e("transaction on " + b);
        var g = new G(a, b);
        g.Ua("value", f);
        c = {path: b, update: c, G: d, status: null, Sd: Wb(), Rc: e, Xd: 0, Oc: function () {
            g.nb("value", f)
        }, Pc: null};
        a.Ka.ba = Rf(a, a.Ka.ba, a.g.O.ba, a.$a);
        d = c.update(U(a.Ka, b).X());
        if (l(d)) {
            Fa("transaction failed: Data returned ", d);
            c.status = 1;
            e = I(a.$a, b);
            var h = e.k() || [];
            h.push(c);
            Ya(e, h);
            h = "object" === typeof d && null !== d && A(d, ".priority") ? d[".priority"] : U(a.g.O, b).m();
            e = Hf(a);
            d = S(d, h);
            d = ke(d, e);
            V(a.Ka, b, d);
            c.Rc && (V(a.g.qa, b, d), xf(a.L,
                b, [b]));
            Sf(a)
        } else c.Oc(), c.G && (a = Tf(a, b), c.G(null, !1, a))
    }

    function Sf(a, b) {
        var c = b || a.$a;
        b || Uf(a, c);
        if (null !== c.k()) {
            var d = Vf(a, c);
            v(0 < d.length);
            Hb(d, function (a) {
                return 1 === a.status
            }) && Wf(a, c.path(), d)
        } else c.Fb() && c.B(function (b) {
            Sf(a, b)
        })
    }

    function Wf(a, b, c) {
        for (var d = 0; d < c.length; d++)v(1 === c[d].status, "tryToSendTransactionQueue_: items in queue should all be run."), c[d].status = 2, c[d].Xd++;
        var e = U(a.g.O, b).hash();
        V(a.g.O, b, U(a.g.qa, b));
        for (var f = U(a.Ka, b).X(!0), g = Wb(), h = Xf(c), d = 0; d < h.length; d++)Ya(I(a.g.Sb, h[d]), g);
        a.n.put(b.toString(), f, function (e) {
            a.e("transaction put response", {path: b.toString(), status: e});
            for (d = 0; d < h.length; d++) {
                var f = I(a.g.Sb, h[d]), q = f.k();
                v(null !== q, "sendTransactionQueue_: pendingPut should not be null.");
                q ===
                g && (Ya(f, null), V(a.g.O, h[d], U(a.g.wa, h[d])))
            }
            if ("ok" === e) {
                e = [];
                for (d = 0; d < c.length; d++)c[d].status = 3, c[d].G && (f = Tf(a, c[d].path), e.push(r(c[d].G, null, null, !0, f))), c[d].Oc();
                Uf(a, I(a.$a, b));
                Sf(a);
                for (d = 0; d < e.length; d++)sc(e[d])
            } else {
                if ("datastale" === e)for (d = 0; d < c.length; d++)c[d].status = 4 === c[d].status ? 5 : 1; else for (O("transaction at " + b + " failed: " + e), d = 0; d < c.length; d++)c[d].status = 5, c[d].Pc = e;
                e = If(a, b);
                xf(a.L, e, [b])
            }
        }, e)
    }

    function Xf(a) {
        for (var b = {}, c = 0; c < a.length; c++)a[c].Rc && (b[a[c].path.toString()] = a[c].path);
        a = [];
        for (var d in b)a.push(b[d]);
        return a
    }

    function If(a, b) {
        var c = Yf(a, b), d = c.path(), c = Vf(a, c);
        V(a.g.qa, d, U(a.g.O, d));
        V(a.Ka, d, U(a.g.O, d));
        if (0 !== c.length) {
            for (var e = U(a.g.qa, d), f = e, g = [], h = 0; h < c.length; h++) {
                var m = Va(d, c[h].path), n = !1, q;
                v(null !== m, "rerunTransactionsUnderNode_: relativePath should not be null.");
                if (5 === c[h].status)n = !0, q = c[h].Pc; else if (1 === c[h].status)if (25 <= c[h].Xd)n = !0, q = "maxretry"; else {
                    var s = e.N(m), t = c[h].update(s.X());
                    if (l(t)) {
                        Fa("transaction failed: Data returned ", t);
                        var w = S(t);
                        "object" === typeof t && null != t && A(t, ".priority") ||
                        (w = w.La(s.m()));
                        e = e.Ba(m, w);
                        c[h].Rc && (f = f.Ba(m, w))
                    } else n = !0, q = "nodata"
                }
                n && (c[h].status = 3, setTimeout(c[h].Oc, Math.floor(0)), c[h].G && (n = new G(a, c[h].path), m = new T(e.N(m), n), "nodata" === q ? g.push(r(c[h].G, null, null, !1, m)) : g.push(r(c[h].G, null, Error(q), !1, m))))
            }
            V(a.Ka, d, e);
            V(a.g.qa, d, f);
            Uf(a, a.$a);
            for (h = 0; h < g.length; h++)sc(g[h]);
            Sf(a)
        }
        return d
    }

    function Yf(a, b) {
        for (var c, d = a.$a; null !== (c = D(b)) && null === d.k();)d = I(d, c), b = Ta(b);
        return d
    }

    function Vf(a, b) {
        var c = [];
        Zf(a, b, c);
        c.sort(function (a, b) {
            return a.Sd - b.Sd
        });
        return c
    }

    function Zf(a, b, c) {
        var d = b.k();
        if (null !== d)for (var e = 0; e < d.length; e++)c.push(d[e]);
        b.B(function (b) {
            Zf(a, b, c)
        })
    }

    function Uf(a, b) {
        var c = b.k();
        if (c) {
            for (var d = 0, e = 0; e < c.length; e++)3 !== c[e].status && (c[d] = c[e], d++);
            c.length = d;
            Ya(b, 0 < c.length ? c : null)
        }
        b.B(function (b) {
            Uf(a, b)
        })
    }

    function Lf(a, b) {
        var c = Yf(a, b).path(), d = I(a.$a, b);
        ab(d, function (a) {
            $f(a)
        });
        $f(d);
        $a(d, function (a) {
            $f(a)
        });
        return c
    }

    function $f(a) {
        var b = a.k();
        if (null !== b) {
            for (var c = [], d = -1, e = 0; e < b.length; e++)4 !== b[e].status && (2 === b[e].status ? (v(d === e - 1, "All SENT items should be at beginning of queue."), d = e, b[e].status = 4, b[e].Pc = "set") : (v(1 === b[e].status), b[e].Oc(), b[e].G && c.push(r(b[e].G, null, Error("set"), !1, null))));
            -1 === d ? Ya(a, null) : b.length = d + 1;
            for (e = 0; e < c.length; e++)sc(c[e])
        }
    }

    function Tf(a, b) {
        var c = new G(a, b);
        return new T(U(a.Ka, b), c)
    }

    function Rf(a, b, c, d) {
        if (d.f())return c;
        if (null != d.k())return b;
        var e = c;
        d.B(function (d) {
            var g = d.name(), h = new H(g);
            d = Rf(a, b.N(h), c.N(h), d);
            e = e.K(g, d)
        });
        return e
    };
    function Y() {
        this.sb = {}
    }

    da(Y);
    Y.prototype.Qa = function () {
        for (var a in this.sb)this.sb[a].Qa()
    };
    Y.prototype.interrupt = Y.prototype.Qa;
    Y.prototype.tb = function () {
        for (var a in this.sb)this.sb[a].tb()
    };
    Y.prototype.resume = Y.prototype.tb;
    function ag(a) {
        var b = this;
        this.zb = a;
        this.Jc = "*";
        ye() ? this.Kb = this.lc = qe() : (this.Kb = window.opener, this.lc = window);
        if (!b.Kb)throw"Unable to find relay frame";
        re(this.lc, "message", r(this.ob, this));
        re(this.lc, "message", r(this.Pd, this));
        try {
            bg(this, {a: "ready"})
        } catch (c) {
            re(this.Kb, "load", function () {
                bg(b, {a: "ready"})
            })
        }
        re(window, "unload", r(this.Ie, this))
    }

    function bg(a, b) {
        b = u(b);
        ye() ? a.Kb.doPost(b, a.Jc) : a.Kb.postMessage(b, a.Jc)
    }

    ag.prototype.ob = function (a) {
        var b = this, c;
        try {
            c = ua(a.data)
        } catch (d) {
        }
        c && "request" === c.a && (se(window, "message", this.ob), this.Jc = a.origin, this.zb && setTimeout(function () {
            b.zb(b.Jc, c.d, function (a, c) {
                b.oe = !c;
                b.zb = void 0;
                bg(b, {a: "response", d: a, forceKeepWindowOpen: c})
            })
        }, 0))
    };
    ag.prototype.Ie = function () {
        try {
            se(this.lc, "message", this.Pd)
        } catch (a) {
        }
        this.zb && (bg(this, {a: "error", d: "unknown closed window"}), this.zb = void 0);
        try {
            window.close()
        } catch (b) {
        }
    };
    ag.prototype.Pd = function (a) {
        if (this.oe && "die" === a.data)try {
            window.close()
        } catch (b) {
        }
    };
    var Z = {xe: function (a) {
        var b = R.prototype.hash;
        R.prototype.hash = a;
        var c = tc.prototype.hash;
        tc.prototype.hash = a;
        return function () {
            R.prototype.hash = b;
            tc.prototype.hash = c
        }
    }};
    Z.hijackHash = Z.xe;
    Z.Wa = function (a) {
        return a.Wa()
    };
    Z.queryIdentifier = Z.Wa;
    Z.Ae = function (a) {
        return a.i.n.ja
    };
    Z.listens = Z.Ae;
    Z.Me = function (a) {
        return a.i.n.ma
    };
    Z.refConnection = Z.Me;
    Z.ee = Id;
    Z.DataConnection = Z.ee;
    Id.prototype.sendRequest = Id.prototype.Ja;
    Id.prototype.interrupt = Id.prototype.Qa;
    Z.fe = rd;
    Z.RealTimeConnection = Z.fe;
    rd.prototype.sendRequest = rd.prototype.Zd;
    rd.prototype.close = rd.prototype.close;
    Z.de = wb;
    Z.ConnectionTarget = Z.de;
    Z.ue = function () {
        gd = Yc = !0
    };
    Z.forceLongPolling = Z.ue;
    Z.ve = function () {
        hd = !0
    };
    Z.forceWebSockets = Z.ve;
    Z.Te = function (a, b) {
        a.i.n.ud = b
    };
    Z.setSecurityDebugCallback = Z.Te;
    Z.wd = function (a, b) {
        a.i.wd(b)
    };
    Z.stats = Z.wd;
    Z.xd = function (a, b) {
        a.i.xd(b)
    };
    Z.statsIncrementCounter = Z.xd;
    Z.ic = function (a) {
        return a.i.ic
    };
    Z.dataUpdateCount = Z.ic;
    Z.ye = function (a, b) {
        a.i.Md = b
    };
    Z.interceptServerData = Z.ye;
    Z.Fe = function (a) {
        new ag(a)
    };
    Z.onPopupOpen = Z.Fe;
    Z.Qe = function (a) {
        le = a
    };
    Z.setAuthenticationServer = Z.Qe;
    function $(a, b, c) {
        this.Wb = a;
        this.Z = b;
        this.Ha = c
    }

    $.prototype.cancel = function (a) {
        x("Firebase.onDisconnect().cancel", 0, 1, arguments.length);
        z("Firebase.onDisconnect().cancel", 1, a, !0);
        this.Wb.ld(this.Z, a)
    };
    $.prototype.cancel = $.prototype.cancel;
    $.prototype.remove = function (a) {
        x("Firebase.onDisconnect().remove", 0, 1, arguments.length);
        C("Firebase.onDisconnect().remove", this.Z);
        z("Firebase.onDisconnect().remove", 1, a, !0);
        Mf(this.Wb, this.Z, null, a)
    };
    $.prototype.remove = $.prototype.remove;
    $.prototype.set = function (a, b) {
        x("Firebase.onDisconnect().set", 1, 2, arguments.length);
        C("Firebase.onDisconnect().set", this.Z);
        Ea("Firebase.onDisconnect().set", a, !1);
        z("Firebase.onDisconnect().set", 2, b, !0);
        Mf(this.Wb, this.Z, a, b)
    };
    $.prototype.set = $.prototype.set;
    $.prototype.wb = function (a, b, c) {
        x("Firebase.onDisconnect().setWithPriority", 2, 3, arguments.length);
        C("Firebase.onDisconnect().setWithPriority", this.Z);
        Ea("Firebase.onDisconnect().setWithPriority", a, !1);
        Ja("Firebase.onDisconnect().setWithPriority", 2, b, !1);
        z("Firebase.onDisconnect().setWithPriority", 3, c, !0);
        if (".length" === this.Ha || ".keys" === this.Ha)throw"Firebase.onDisconnect().setWithPriority failed: " + this.Ha + " is a read-only object.";
        Nf(this.Wb, this.Z, a, b, c)
    };
    $.prototype.setWithPriority = $.prototype.wb;
    $.prototype.update = function (a, b) {
        x("Firebase.onDisconnect().update", 1, 2, arguments.length);
        C("Firebase.onDisconnect().update", this.Z);
        if (fa(a)) {
            for (var c = {}, d = 0; d < a.length; ++d)c["" + d] = a[d];
            a = c;
            O("Passing an Array to Firebase.onDisconnect().update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.")
        }
        Ia("Firebase.onDisconnect().update", a);
        z("Firebase.onDisconnect().update", 2, b, !0);
        Of(this.Wb,
            this.Z, a, b)
    };
    $.prototype.update = $.prototype.update;
    var cg = function () {
        var a = 0, b = [];
        return function (c) {
            var d = c === a;
            a = c;
            for (var e = Array(8), f = 7; 0 <= f; f--)e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64), c = Math.floor(c / 64);
            v(0 === c, "Cannot push at time == 0");
            c = e.join("");
            if (d) {
                for (f = 11; 0 <= f && 63 === b[f]; f--)b[f] = 0;
                b[f]++
            } else for (f = 0; 12 > f; f++)b[f] = Math.floor(64 * Math.random());
            for (f = 0; 12 > f; f++)c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
            v(20 === c.length, "NextPushId: Length should be 20.");
            return c
        }
    }();

    function G(a, b) {
        var c, d, e;
        if (a instanceof Ef)c = a, d = b; else {
            x("new Firebase", 1, 2, arguments.length);
            d = fc(arguments[0]);
            c = d.Ve;
            "firebase" === d.domain && ec(d.host + " is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead");
            c || ec("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com");
            d.Ya || "undefined" !== typeof window && window.location && window.location.protocol && -1 !== window.location.protocol.indexOf("https:") && O("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().");
            c = new wb(d.host, d.Ya, c, "ws" === d.scheme || "wss" === d.scheme);
            d = new H(d.Rb);
            e = d.toString();
            var f;
            !(f = !p(c.host) || 0 === c.host.length || !Da(c.Ta)) && (f = 0 !== e.length) && (e && (e = e.replace(/^\/*\.info(\/|$)/, "/")), f = !(p(e) && 0 !== e.length && !Ca.test(e)));
            if (f)throw Error(y("new Firebase", 1, !1) + 'must be a valid firebase URL and the path can\'t contain ".", "#", "$", "[", or "]".');
            if (b)if (b instanceof Y)e = b; else if (p(b))e = Y.ib(), c.yc = b; else throw Error("Expected a valid Firebase.Context for second argument to new Firebase()");
            else e = Y.ib();
            f = c.toString();
            var g = B(e.sb, f);
            g || (g = new Ef(c), e.sb[f] = g);
            c = g
        }
        F.call(this, c, d)
    }

    na(G, F);
    var dg = G, eg = ["Firebase"], fg = ba;
    eg[0]in fg || !fg.execScript || fg.execScript("var " + eg[0]);
    for (var gg; eg.length && (gg = eg.shift());)!eg.length && l(dg) ? fg[gg] = dg : fg = fg[gg] ? fg[gg] : fg[gg] = {};
    G.prototype.name = function () {
        x("Firebase.name", 0, 0, arguments.length);
        return this.path.f() ? null : Ua(this.path)
    };
    G.prototype.name = G.prototype.name;
    G.prototype.J = function (a) {
        x("Firebase.child", 1, 1, arguments.length);
        if (ha(a))a = String(a); else if (!(a instanceof H))if (null === D(this.path)) {
            var b = a;
            b && (b = b.replace(/^\/*\.info(\/|$)/, "/"));
            Ma("Firebase.child", b)
        } else Ma("Firebase.child", a);
        return new G(this.i, this.path.J(a))
    };
    G.prototype.child = G.prototype.J;
    G.prototype.parent = function () {
        x("Firebase.parent", 0, 0, arguments.length);
        var a = this.path.parent();
        return null === a ? null : new G(this.i, a)
    };
    G.prototype.parent = G.prototype.parent;
    G.prototype.root = function () {
        x("Firebase.ref", 0, 0, arguments.length);
        for (var a = this; null !== a.parent();)a = a.parent();
        return a
    };
    G.prototype.root = G.prototype.root;
    G.prototype.toString = function () {
        x("Firebase.toString", 0, 0, arguments.length);
        var a;
        if (null === this.parent())a = this.i.toString(); else {
            a = this.parent().toString() + "/";
            var b = this.name();
            a += encodeURIComponent(String(b))
        }
        return a
    };
    G.prototype.toString = G.prototype.toString;
    G.prototype.set = function (a, b) {
        x("Firebase.set", 1, 2, arguments.length);
        C("Firebase.set", this.path);
        Ea("Firebase.set", a, !1);
        z("Firebase.set", 2, b, !0);
        this.i.wb(this.path, a, null, b)
    };
    G.prototype.set = G.prototype.set;
    G.prototype.update = function (a, b) {
        x("Firebase.update", 1, 2, arguments.length);
        C("Firebase.update", this.path);
        if (fa(a)) {
            for (var c = {}, d = 0; d < a.length; ++d)c["" + d] = a[d];
            a = c;
            O("Passing an Array to Firebase.update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.")
        }
        Ia("Firebase.update", a);
        z("Firebase.update", 2, b, !0);
        if (A(a, ".priority"))throw Error("update() does not currently support updating .priority.");
        this.i.update(this.path, a, b)
    };
    G.prototype.update = G.prototype.update;
    G.prototype.wb = function (a, b, c) {
        x("Firebase.setWithPriority", 2, 3, arguments.length);
        C("Firebase.setWithPriority", this.path);
        Ea("Firebase.setWithPriority", a, !1);
        Ja("Firebase.setWithPriority", 2, b, !1);
        z("Firebase.setWithPriority", 3, c, !0);
        if (".length" === this.name() || ".keys" === this.name())throw"Firebase.setWithPriority failed: " + this.name() + " is a read-only object.";
        this.i.wb(this.path, a, b, c)
    };
    G.prototype.setWithPriority = G.prototype.wb;
    G.prototype.remove = function (a) {
        x("Firebase.remove", 0, 1, arguments.length);
        C("Firebase.remove", this.path);
        z("Firebase.remove", 1, a, !0);
        this.set(null, a)
    };
    G.prototype.remove = G.prototype.remove;
    G.prototype.transaction = function (a, b, c) {
        x("Firebase.transaction", 1, 3, arguments.length);
        C("Firebase.transaction", this.path);
        z("Firebase.transaction", 1, a, !1);
        z("Firebase.transaction", 2, b, !0);
        if (l(c) && "boolean" != typeof c)throw Error(y("Firebase.transaction", 3, !0) + "must be a boolean.");
        if (".length" === this.name() || ".keys" === this.name())throw"Firebase.transaction failed: " + this.name() + " is a read-only object.";
        "undefined" === typeof c && (c = !0);
        Qf(this.i, this.path, a, b, c)
    };
    G.prototype.transaction = G.prototype.transaction;
    G.prototype.vd = function (a, b) {
        x("Firebase.setPriority", 1, 2, arguments.length);
        C("Firebase.setPriority", this.path);
        Ja("Firebase.setPriority", 1, a, !1);
        z("Firebase.setPriority", 2, b, !0);
        this.i.vd(this.path, a, b)
    };
    G.prototype.setPriority = G.prototype.vd;
    G.prototype.push = function (a, b) {
        x("Firebase.push", 0, 2, arguments.length);
        C("Firebase.push", this.path);
        Ea("Firebase.push", a, !0);
        z("Firebase.push", 2, b, !0);
        var c = Gf(this.i), c = cg(c), c = this.J(c);
        "undefined" !== typeof a && null !== a && c.set(a, b);
        return c
    };
    G.prototype.push = G.prototype.push;
    G.prototype.ka = function () {
        return new $(this.i, this.path, this.name())
    };
    G.prototype.onDisconnect = G.prototype.ka;
    G.prototype.Ne = function () {
        O("FirebaseRef.removeOnDisconnect() being deprecated. Please use FirebaseRef.onDisconnect().remove() instead.");
        this.ka().remove();
        Pf(this.i)
    };
    G.prototype.removeOnDisconnect = G.prototype.Ne;
    G.prototype.Se = function (a) {
        O("FirebaseRef.setOnDisconnect(value) being deprecated. Please use FirebaseRef.onDisconnect().set(value) instead.");
        this.ka().set(a);
        Pf(this.i)
    };
    G.prototype.setOnDisconnect = G.prototype.Se;
    G.prototype.I = function (a, b, c) {
        O("FirebaseRef.auth() being deprecated. Please use FirebaseRef.authWithCustomToken() instead.");
        x("Firebase.auth", 1, 3, arguments.length);
        Na("Firebase.auth", a);
        z("Firebase.auth", 2, b, !0);
        z("Firebase.auth", 3, b, !0);
        Me(this.i.I, a, {}, {remember: "none"}, b, c)
    };
    G.prototype.auth = G.prototype.I;
    G.prototype.Bd = function (a) {
        x("Firebase.unauth", 0, 1, arguments.length);
        z("Firebase.unauth", 1, a, !0);
        Ne(this.i.I, a)
    };
    G.prototype.unauth = G.prototype.Bd;
    G.prototype.bd = function () {
        x("Firebase.getAuth", 0, 0, arguments.length);
        return this.i.I.bd()
    };
    G.prototype.getAuth = G.prototype.bd;
    G.prototype.Ee = function (a, b) {
        x("Firebase.onAuth", 1, 2, arguments.length);
        z("Firebase.onAuth", 1, a, !1);
        ya("Firebase.onAuth", 2, b);
        this.i.I.Ua("auth_status", a, b)
    };
    G.prototype.onAuth = G.prototype.Ee;
    G.prototype.De = function (a, b) {
        x("Firebase.offAuth", 1, 2, arguments.length);
        z("Firebase.offAuth", 1, a, !1);
        ya("Firebase.offAuth", 2, b);
        this.i.I.nb("auth_status", a, b)
    };
    G.prototype.offAuth = G.prototype.De;
    G.prototype.je = function (a, b, c) {
        x("Firebase.authWithCustomToken", 2, 3, arguments.length);
        Na("Firebase.authWithCustomToken", a);
        z("Firebase.authWithCustomToken", 2, b, !1);
        E("Firebase.authWithCustomToken", 3, c, !0);
        Me(this.i.I, a, {}, c || {}, b)
    };
    G.prototype.authWithCustomToken = G.prototype.je;
    G.prototype.ke = function (a, b, c) {
        x("Firebase.authWithOAuthPopup", 2, 3, arguments.length);
        Oa("Firebase.authWithOAuthPopup", 1, a);
        z("Firebase.authWithOAuthPopup", 2, b, !1);
        E("Firebase.authWithOAuthPopup", 3, c, !0);
        Re(this.i.I, a, c, b)
    };
    G.prototype.authWithOAuthPopup = G.prototype.ke;
    G.prototype.le = function (a, b, c) {
        x("Firebase.authWithOAuthRedirect", 2, 3, arguments.length);
        Oa("Firebase.authWithOAuthRedirect", 1, a);
        z("Firebase.authWithOAuthRedirect", 2, b, !1);
        E("Firebase.authWithOAuthRedirect", 3, c, !0);
        var d = this.i.I;
        Pe(d);
        var e = [Fe], f = oe(c);
        "anonymous" === a || "firebase" === a ? P(b, W("TRANSPORT_UNAVAILABLE")) : (J.set("redirect_client_options", f.hc), Qe(d, e, "/auth/" + a, f, b))
    };
    G.prototype.authWithOAuthRedirect = G.prototype.le;
    G.prototype.me = function (a, b, c, d) {
        x("Firebase.authWithOAuthToken", 3, 4, arguments.length);
        Oa("Firebase.authWithOAuthToken", 1, a);
        z("Firebase.authWithOAuthToken", 3, c, !1);
        E("Firebase.authWithOAuthToken", 4, d, !0);
        p(b) ? (Oa("Firebase.authWithOAuthToken", 2, b), Oe(this.i.I, a + "/token", {access_token: b}, d, c)) : (E("Firebase.authWithOAuthToken", 2, b, !1), Oe(this.i.I, a + "/token", b, d, c))
    };
    G.prototype.authWithOAuthToken = G.prototype.me;
    G.prototype.ie = function (a, b) {
        x("Firebase.authAnonymously", 1, 2, arguments.length);
        z("Firebase.authAnonymously", 1, a, !1);
        E("Firebase.authAnonymously", 2, b, !0);
        Oe(this.i.I, "anonymous", {}, b, a)
    };
    G.prototype.authAnonymously = G.prototype.ie;
    G.prototype.ne = function (a, b, c) {
        x("Firebase.authWithPassword", 2, 3, arguments.length);
        E("Firebase.authWithPassword", 1, a, !1);
        Pa("Firebase.authWithPassword", a, "email");
        Pa("Firebase.authWithPassword", a, "password");
        z("Firebase.authAnonymously", 2, b, !1);
        E("Firebase.authAnonymously", 3, c, !0);
        Oe(this.i.I, "password", a, c, b)
    };
    G.prototype.authWithPassword = G.prototype.ne;
    G.prototype.Xc = function (a, b) {
        x("Firebase.createUser", 2, 2, arguments.length);
        E("Firebase.createUser", 1, a, !1);
        Pa("Firebase.createUser", a, "email");
        Pa("Firebase.createUser", a, "password");
        z("Firebase.createUser", 2, b, !1);
        this.i.I.Xc(a, b)
    };
    G.prototype.createUser = G.prototype.Xc;
    G.prototype.sd = function (a, b) {
        x("Firebase.removeUser", 2, 2, arguments.length);
        E("Firebase.removeUser", 1, a, !1);
        Pa("Firebase.removeUser", a, "email");
        Pa("Firebase.removeUser", a, "password");
        z("Firebase.removeUser", 2, b, !1);
        this.i.I.sd(a, b)
    };
    G.prototype.removeUser = G.prototype.sd;
    G.prototype.Tc = function (a, b) {
        x("Firebase.changePassword", 2, 2, arguments.length);
        E("Firebase.changePassword", 1, a, !1);
        Pa("Firebase.changePassword", a, "email");
        Pa("Firebase.changePassword", a, "oldPassword");
        Pa("Firebase.changePassword", a, "newPassword");
        z("Firebase.changePassword", 2, b, !1);
        this.i.I.Tc(a, b)
    };
    G.prototype.changePassword = G.prototype.Tc;
    G.prototype.td = function (a, b) {
        x("Firebase.resetPassword", 2, 2, arguments.length);
        E("Firebase.resetPassword", 1, a, !1);
        Pa("Firebase.resetPassword", a, "email");
        z("Firebase.resetPassword", 2, b, !1);
        this.i.I.td(a, b)
    };
    G.prototype.resetPassword = G.prototype.td;
    G.goOffline = function () {
        x("Firebase.goOffline", 0, 0, arguments.length);
        Y.ib().Qa()
    };
    G.goOnline = function () {
        x("Firebase.goOnline", 0, 0, arguments.length);
        Y.ib().tb()
    };
    function bc(a, b) {
        v(!b || !0 === a || !1 === a, "Can't turn on custom loggers persistently.");
        !0 === a ? ("undefined" !== typeof console && ("function" === typeof console.log ? $b = r(console.log, console) : "object" === typeof console.log && ($b = function (a) {
            console.log(a)
        })), b && J.set("logging_enabled", !0)) : a ? $b = a : ($b = null, J.remove("logging_enabled"))
    }

    G.enableLogging = bc;
    G.ServerValue = {TIMESTAMP: {".sv": "timestamp"}};
    G.SDK_VERSION = "1.1.3";
    G.INTERNAL = Z;
    G.Context = Y;
})();
