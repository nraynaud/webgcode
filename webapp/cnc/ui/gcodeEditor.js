"use strict";
define(['Ember', 'ace'], function (Em, ace) {
    var GcodeEditorComponent = Em.Component.extend({
        tagName: 'pre',
        didInsertElement: function () {
            var _this = this;
            this.set('editor', ace.edit(this.get('element')));
            var editor = this.get('editor');
            editor.setTheme("ace/theme/chaos");
            editor.on('change', function () {
                Em.run.once(_this, _this.notifyPropertyChange, 'content');
                if (window.awaitingRedraw) window.awaitingRedraw();
            });
            editor.selection.on('changeCursor', function (event) {
                _this.set('currentRow', editor.selection.getCursor().row);
            });
            if (this.get('preset')) {
                this.set('content', this.get('preset'));
                this.set('preset', null);
            }
        },
        content: function (key, val) {
            if (!this.get('editor')) {
                this.set('preset', val);
                return val;
            }
            if (arguments.length == 1) {
                return this.get('editor').getSession().getValue();
            } else {
                this.get('editor').getSession().setValue(val);
                return val;
            }
        }.property(),
        annotations: function (key, val) {
            if (!this.get('editor'))
                return val;
            if (arguments.length == 1)
                return this.get('editor').getSession().getAnnotations();
            else {
                this.get('editor').getSession().setAnnotations(val);
                if (val.length)
                    this.get('editor').gotoLine(val[0].row);
                return val;
            }
        }.property()
    });
    return {GcodeEditorComponent: GcodeEditorComponent};
});