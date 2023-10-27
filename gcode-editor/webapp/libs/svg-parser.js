// svg.parser.js 0.1.0 - Copyright (c) 2014 Wout Fierens - Licensed under the MIT license
;(function() {

    SVG.parse = {
        // Convert attributes to an object
        attr: function(child) {
            var i
                , attrs = child.attributes || []
                , attr  = {}

            /* gather attributes */
            for (i = attrs.length - 1; i >= 0; i--)
                attr[attrs[i].nodeName] = attrs[i].nodeValue

            /* ensure stroke width where needed */
            if (typeof attr.stroke != 'undefined' && typeof attr['stroke-width'] == 'undefined')
                attr['stroke-width'] = 1

            return attr
        }

        // Convert transformations to an object
        , transform: function(transform) {
            var i, t, v
                , trans = {}
                , list  = (transform || '').match(/[A-Za-z]+\([^\)]+\)/g) || []
                , def   = SVG.defaults.trans()

            /* gather transformations */
            for (i = list.length - 1; i >= 0; i--) {
                /* parse transformation */
                t = list[i].match(/([A-Za-z]+)\(([^\)]+)\)/)
                v = (t[2] || '').replace(/^\s+/,'').replace(/,/g, ' ').replace(/\s+/g, ' ').split(' ')

                /* objectify transformation */
                switch(t[1]) {
                    case 'matrix':
                        trans.a         = SVG.regex.isNumber.test(v[0]) ? parseFloat(v[0]) : def.a
                        trans.b         = parseFloat(v[1]) || def.b
                        trans.c         = parseFloat(v[2]) || def.c
                        trans.d         = SVG.regex.isNumber.test(v[3]) ? parseFloat(v[3]) : def.d
                        trans.e         = parseFloat(v[4]) || def.e
                        trans.f         = parseFloat(v[5]) || def.f
                        break
                    case 'rotate':
                        trans.rotation  = parseFloat(v[0]) || def.rotation
                        trans.cx        = parseFloat(v[1]) || def.cx
                        trans.cy        = parseFloat(v[2]) || def.cy
                        break
                    case 'scale':
                        trans.scaleX    = SVG.regex.isNumber.test(v[0]) ? parseFloat(v[0]) : def.scaleX
                        trans.scaleY    = SVG.regex.isNumber.test(v[1]) ? parseFloat(v[1]) : def.scaleY
                        break
                    case 'skewX':
                        trans.skewX     = parseFloat(v[0]) || def.skewX
                        break
                    case 'skewY':
                        trans.skewY     = parseFloat(v[0]) || def.skewY
                        break
                    case 'translate':
                        trans.x         = parseFloat(v[0]) || def.x
                        trans.y         = parseFloat(v[1]) || def.y
                        break
                }
            }

            return trans
        }
    }

})();