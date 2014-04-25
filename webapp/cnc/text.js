"use strict";
define(['libs/rsvp-latest', 'cnc/cam', 'cnc/clipper', 'libs/opentype'], function (rsvp, cam, clipper, opentype) {
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
                $.get('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyC9qzOvN5FgIPj-xDohd64xz0kxW1dcTB8',function (result) {
                    Ember.run(null, resolve, result.items);
                }).fail(Ember.run.bind(null, reject));
            });
    }

    function getTextFromData(fontData, fontVariant, text, fontSize) {
        if (fontVariant == null)
            fontVariant = 'regular';
        return getFont(fontData.files[fontVariant]).then(function (font) {
            var path = font.getPath(text, 0, 0, fontSize);
            var res = '';

            function xy(x, y) {
                return x + ',' + -y;
            }

            for (var i = 0; i < path.commands.length; i++) {
                var c = path.commands[i];
                // do not push a 'Z' at the front side, this happens when the text starts with a space
                if (!(res.length === 0 && c.type == 'Z'))
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

    return {getText: getText, getFontList: getFontList, searchFontInList: searchFontInList,
        getTextFromData: getTextFromData};
});
