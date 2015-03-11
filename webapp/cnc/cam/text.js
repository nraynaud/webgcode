"use strict";
define(['RSVP', 'cnc/cam/cam', 'clipper', 'libs/opentype'], function (RSVP, cam, clipper, opentype) {
    RSVP.on('error', function (reason) {
        console.log(reason.stack);
    });
    var getFont = function (url) {
        return new RSVP.Promise(function (resolve, reject) {
            opentype.load(url, function (err, font) {
                if (err)
                    Ember.run(null, reject, err);
                else
                    Ember.run(null, resolve, font);
            });
        });
    };

    function getFontList() {
        return new RSVP.Promise(
            function (resolve, reject) {
                $.get('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyC9qzOvN5FgIPj-xDohd64xz0kxW1dcTB8', function (result) {
                    Ember.run(null, resolve, result.items);
                }).fail(Ember.run.bind(null, reject));
            });
    }

    function getTextFromData(fontData, fontVariant, text, fontSize, x, y) {
        if (fontVariant == null)
            fontVariant = 'regular';
        x = x == null ? 0 : x;
        y = y == null ? 0 : y;
        return getTextFromFile(fontData.files[fontVariant], text, fontSize, x, y);
    }

    function getTextFromFile(file, text, fontSize, offsetX, offsetY) {
        return getFont(file).then(function (font) {
            var path = font.getPath(text, 0, 0, fontSize);
            var res = '';

            function xy(x, y) {
                return (offsetX + x) + ',' + (offsetY - y);
            }

            for (var i = 0; i < path.commands.length; i++) {
                var c = path.commands[i];
                res += ' ' + c.type;
                if (c.type == 'M' || c.type == 'L')
                    res += ' ' + xy(c.x, c.y);
                else if (c.type == 'Q')
                    res += xy(c.x1, c.y1) + ' ' + xy(c.x, c.y);
                else if (c.type == 'C')
                    res += xy(c.x1, c.y1) + ' ' + xy(c.x2, c.y2) + ' ' + xy(c.x, c.y);
            }
            return res;
        })
    }

    function searchFontInList(fontList, fontFamily) {
        for (var i = 0; i < fontList.length; i++) {
            var font = fontList[i];
            if (font.family == fontFamily)
                return font;
        }
        throw {name: 'FontNotFound'};
    }

    function getText(fontFamily, fontVariant, text, fontSize) {
        return getFontList().then(function (fontList) {
            return getTextFromData(searchFontInList(fontList, fontFamily), fontVariant, text, fontSize);
        })
    }

    return {
        getText: getText, getFontList: getFontList, searchFontInList: searchFontInList,
        getTextFromData: getTextFromData, getTextFromFile: getTextFromFile
    };
});
