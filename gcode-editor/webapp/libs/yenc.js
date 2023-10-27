//*jshint parameters*
/*jshint curly:true, eqeqeq:true, strict:true, boss:true, laxcomma:true */

(function (attach) {
    'use strict';

    // - - -
    // # yEnc
    // ** A minimal yEnc [en|de]coder **
    var yEnc = function () {
        // ##### Private Variables
        var
            self = {}
            , reserved = [0, 10, 13, 61]
            ;

        // ##### Public Variables

        // ##### Private Methods

        // #### each()
        // >`@param obj [collection]` our source collection
        // >`@param iterator [function]` the function that will be called for each element in the collection
        // >`@param context [object]` the context our iterator should operate within
        //
        // essentially copied from underscore.js
        var each = function (obj, iterator, context) {
            var breaker = {};
            if (obj === null) {
                return;
            }
            if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
                obj.forEach(iterator, context);
            } else if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (iterator.call(context, obj[i], i, obj) === breaker) {
                        return;
                    }
                }
            } else {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (iterator.call(context, obj[key], key, obj) === breaker) {
                            return;
                        }
                    }
                }
            }
        };

        // #### toBytes()
        // >`@param source [array]` our source UTF-8 string
        //
        // toBytes takes a UTF8 string and returns an array of bytes (as integers)
        var toBytes = function (source) {
            var
                output = []
                , i = 0
                , j = 0
                , subchar
                ;
            for (; i < source.length; i++) {
                if (source.charCodeAt(i) <= 0x7F) {
                    output.push(source.charCodeAt(i));
                } else {
                    subchar = encodeURIComponent(source.charAt(i)).substr(1).split('%');
                    for (j = 0; j < subchar.length; j++) {
                        output.push(parseInt(subchar[j], 16));
                    }
                }
            }
            return output;
        };

        // #### fromBytes()
        // >`@param source [array]` our source array of integers
        //
        // fromBytes turns an array of bytes (as integers) into a UTF8 string
        var fromBytes = function (source) {
            var
                output = ''
                , i = 0
                ;

            for (; i < source.length; i++) {
                if (source[i] <= 127) {
                    if (source[i] === 37) {
                        output += "%25";
                    } else {
                        output += String.fromCharCode(source[i]);
                    }
                } else {
                    output += "%" + source[i].toString(16).toUpperCase();
                }
            }
            return decodeURIComponent(output);
        };


        // ##### Public Methods

        // #### yEnc.encode()
        // >`@param source [string]` the source string we will be encoding
        //
        // This is our encoding method for taking a text string and encoding it into the yEnc
        // format, the output string is a UTF-8 string
        self.encode = function (source) {
            var
                output = ''
                , bytes = []
                , converted
                ;

            bytes = toBytes(source);
            each(bytes, function (ele, i) {
                converted = (ele + 42) % 256;
                if (reserved.indexOf(converted) < 0) {
                    output += String.fromCharCode(converted);
                } else {
                    converted = (converted + 64) % 256;
                    output += "=" + String.fromCharCode(converted);
                }
            });

            return output;
        };

        // #### yEnc.decode()
        // >`@param source [string]` the source string we will be decoding
        //
        // This is our encoding method for taking a UTF-8 text string and decoding it into
        // the original text string
        self.decode = function (source) {
            var
                output = []
                , ck = false
                , bytes = []
                , i = 0
                , c
                ;

            for (i = 0; i < source.length; i++) {
                c = source.charCodeAt(i);
                // ignore newlines
                if (c === 13 || c === 10) {
                    continue;
                }
                // if we're an "=" and we haven't been flagged, set flag
                if (c === 61 && !ck) {
                    ck = true;
                    continue;
                }
                if (ck) {
                    ck = false;
                    c = c - 64;
                }
                if (c < 42 && c > 0) {
                    output.push(c + 214);
                } else {
                    output.push(c - 42);
                }
            }

            return fromBytes(output);
        };

        return self;
    }();

    // *exports for various module managers*
    if (typeof define !== 'undefined' && define.amd) {
        // require.js/amd
        define([], function () {
            return yEnc;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        // node.js
        module.exports = yEnc;
    } else if (attach !== undefined) {
        // user provided attachment
        attach.yEnc = yEnc;
    } else {
        // browser global
        this.yEnc = yEnc;
    }
})();