"use strict";
define(['Ember', 'ace'], function (Em, ace) {
    var GcodeEditorComponent = Em.Component.extend({
        tagName: 'pre',
        didInsertElement: function () {
            window.gcodeEditor = this;
            var _this = this;
            this.set('editor', window.editor);
            var editor = window.editor;

            editor.onDidChangeModelContent((e) => {
                Em.run.once(_this, _this.notifyPropertyChange, 'content');
                this.lastUpdate = Date.now();

                setTimeout(() => {
                    if (Date.now() - this.lastUpdate > 550 && this.lastUpdate != 0){
                        if (localStorage.getItem('liveReload') == 'true'){
                            window.TwoDForceUpdate = true;
                            window.ThreeDForceUpdate = true;
                            document.getElementsByClassName('editBlock')[0].getElementsByTagName('button')[0].click();
                        }
                    }
                }, 551)
            });
            editor.onDidChangeCursorPosition((e) => {
                const cursorPosition = window.editor.getPosition();
                _this.set('currentRow', cursorPosition.lineNumber - 1);
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
                return window.editor.getValue();
            } else {
                console.log(val);
                window.editor.setValue(val);
                return val;
            }
        }.property(),
        annotations: function (key, val) {
            if (!this.get('editor'))
                return val;
            if (arguments.length == 1){
                // return this.get('aceeditor').getSession().getAnnotations();
                return [];
            }

            else {
                if (val.length){
                    console.log('error on line '+val);
                    window.setMarker(window.editor, val[0].row + 1, 'error')
                    // window.editor.setPosition({
                    //     lineNumber: val[0].row+1,
                    //     column: 0
                    // }); 
                    window.editor.revealLine(val[0].row+1);
                    window.editor.focus();
                }
                return val;
            }
        }.property()
    });
    return {GcodeEditorComponent: GcodeEditorComponent};
});