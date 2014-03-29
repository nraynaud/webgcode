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

    function getText(fontFamily, text, fontSize) {
        return new RSVP.Promise(
            function (resolve, reject) {
                $.get('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyC9qzOvN5FgIPj-xDohd64xz0kxW1dcTB8',function (result) {
                    for (var i = 0; i < result.items.length; i++) {
                        var font = result.items[i];
                        if (font.family == fontFamily) {
                            Ember.run(null, resolve, font);
                            return;
                        }
                    }
                    Ember.run(null, reject, this);
                }).fail(reject);
            }).then(function (fontData) {
                return getFont(fontData.files['regular']);
            }).then(function (font) {
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
            });
    }

    return {getText: getText};
});
