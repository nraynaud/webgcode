"use strict";
require(['Ember', 'templates', 'cnc/ui/views', 'cnc/controller/CNCMachine'], function (Ember, templates, views, CNCMachine) {
    window.CNCController = Ember.Application.create({
        rootElement: '#body'
    });

    function createCurrentStateProperty() {
        var args = arguments;
        return function () {
            for (var i = 0, state = this.get('model.currentState'); i < args.length; i++)
                if (state == CNCMachine.STATES[args[i]])
                    return true;
            return false;
        }.property('model.currentState');
    }

    CNCController.ApplicationController = Ember.ObjectController.extend({
        init: function () {
            this._super();
            var _this = this;
            this.set('model', CNCMachine.create());
            chrome.app.window.onClosed.addListener(function () {
                _this.get('model.connection').reset()
                    .then(function () {
                        return _this.get('model.connection').close();
                    })
            });
        },
        actions: {
            connect: function () {
                this.get('model').connect();
            },
            setManualMode: function () {
                this.get('model').setManualMode();
            },
            move: function (direction) {
                var text = "G91 G1 F" + this.get('jogFeedrate') + " " + direction + this.get('increment');
                this.get('model').sendGcode(text);
            },
            abort: function () {
                this.get('model').abort();
            },
            sendProgram: function () {
                console.time('program');
                this.get('model').transmitProgram().finally(function () {
                    console.timeEnd('program');
                });
            },
            resumeProgram: function () {
                this.get('model').resumeProgram();
            },
            toggleSpindle: function () {
                if (this.get('model.spindleRunning'))
                    this.get('model').stopSpindle();
                else
                    this.get('model').startSpindle();
            },
            toggleSocket: function () {
                this.get('model').toggleSocket();
            },
            home: function () {
                this.get('model').home();
            }
        },
        camCanSendProgram: false,
        increment: 10,
        jogFeedrate: 200,
        feedrate: function () {
            return this.get('model.feedRate').toFixed(0);
        }.property('model.feedRate'),
        displayableState: function () {
            var map = {
                READY: 'ready', MANUAL_CONTROL: 'manual', RUNNING_PROGRAM: 'running', ABORTING_PROGRAM: 'aborting',
                PAUSED_PROGRAM: 'paused', HOMING: 'homing'
            };
            var stateToTxt = [];
            Object.keys(map).forEach(function (key) {
                stateToTxt[CNCMachine.STATES[key]] = map[key];
            });
            var val = stateToTxt[this.get('model.currentState')];
            return val ? val : "unknown";
        }.property('model.currentState'),
        manualButtonLabel: function () {
            return this.get('model.currentState') == CNCMachine.STATES.MANUAL_CONTROL ?
                "Stop Jog" : "Jog";
        }.property('model.currentState'),
        isManualModeTogglable: createCurrentStateProperty('READY', 'MANUAL_CONTROL'),
        canInterpolatorReceiveProgram: createCurrentStateProperty('READY', 'MANUAL_CONTROL'),
        isProgramRunnable: Ember.computed.and('canInterpolatorReceiveProgram', 'camCanSendProgram'),
        isNotProgramRunnable: Ember.computed.not('isProgramRunnable'),
        isProgramAbortable: createCurrentStateProperty('RUNNING_PROGRAM', 'PAUSED_PROGRAM', 'HOMING'),
        isHomable: createCurrentStateProperty('READY'),
        isBusy: createCurrentStateProperty('RUNNING_PROGRAM', 'HOMING'),
        isResumable: createCurrentStateProperty('PAUSED_PROGRAM'),
        spindleButtonLabel: function () {
            return this.get('model.spindleRunning') ? 'Stop' : 'Start';
        }.property('model.spindleRunning'),
        socketButtonLabel: function () {
            return this.get('model.socketOn') ? 'Stop' : 'Start';
        }.property('model.socketOn')
    });
    CNCController.ApplicationView = Ember.View.extend({
        templateName: 'controllerPanel',
        classNames: ['mainDiv'],
        didInsertElement: function () {
            this.$('#webView')[0].contentWindow.addEventListener("message", Ember.run.bind(this, function (event) {
                if (event.data['canSendProgram'] !== undefined)
                    this.set('controller.camCanSendProgram', event.data['canSendProgram']);
            }));
        }
    });

    CNCController.EditAxisView = views.NumberField.extend({
        didInsertElement: function () {
            this.$().focus();
            this.$().select();
        }
    });
    Ember.Handlebars.helper('edit-axis', CNCController.EditAxisView);

    CNCController.AxisController = Ember.ObjectController.extend({
        actions: {
            editAxisPosition: function () {
                this.set('isEditingOffset', false);
                if (!this.get('isEditingPosition'))
                    this.set('isEditingPosition', true);
            },
            editAxisOffset: function () {
                this.set('isEditingPosition', false);
                if (!this.get('isEditingOffset'))
                    this.set('isEditingOffset', true);
            },
            acceptPositionChanges: function () {
                this.get('model').definePosition(this.get('bufferedPosition'));
                this.set('isEditingPosition', false);
                this.set('isEditingOffset', false);
            },
            acceptOffsetChanges: function () {
                this.get('model').defineOffset(this.get('bufferedOffset'));
                this.set('isEditingPosition', false);
                this.set('isEditingOffset', false);
            },
            cancelChanges: function () {
                this.set('isEditingPosition', false);
                this.set('isEditingOffset', false);
            }
        },
        isEditingPosition: false,
        isEditingOffset: false,
        bufferedPosition: 0,
        bufferedOffset: 0,
        helpText: function () {
            var txt = this.get('isEditingPosition') ? 'enter to validate, escape to cancel change' : 'double click to edit';
            if (!this.get('model.homed'))
                txt += ' | *this axis is not homed*';
            if (this.get('model.limit'))
                txt += ' | this axis is on the limit switch';
            return txt;
        }.property('isEditingPosition', 'model.limit', 'model.homed'),
        isEditingPositionChanged: function () {
            if (this.get('isEditingPosition'))
                this.set('bufferedPosition', this.get('model.position'));
        }.observes('isEditingPosition'),
        isEditingOffsetChanged: function () {
            if (this.get('isEditingOffset'))
                this.set('bufferedOffset', this.get('model.offset'));
        }.observes('isEditingOffset'),
        formattedPosition: function () {
            return this.get('model.position').toFixed(3);
        }.property('model.position'),
        formattedOffset: function () {
            return this.get('model.offset').toFixed(3);
        }.property('model.offset')
    });
});