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
                for (var i = 0; i < path.commands.length; i++) {
                    var command = path.commands[i];
                    res += ' ' + command.type;
                    if (command.type == 'M' || command.type == 'L')
                        res += ' ' + command.x + ',' + -command.y;
                    else if (command.type == 'Q')
                        res += command.x1 + ',' + -command.y1 + ' ' + command.x + ',' + -command.y;
                    else if (command.type == 'C')
                        res += command.x1 + ',' + -command.y1 + ' ' + command.x2 + ',' + -command.y2
                            + ' ' + command.x + ',' + -command.y;
                }
                return res;
            });
    }

    return {getText: getText};
});
