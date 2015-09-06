"use strict";
require(['Ember', 'templates', 'cnc/ui/views', 'cnc/controller/CNCMachine'], function (Ember, templates, views, CNCMachine) {
    window.CNCController = Ember.Application.create({
        rootElement: '#body'
    });
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
        increment: 10,
        jogFeedrate: 200,
        feedrate: function () {
            return this.get('model.feedRate').toFixed(0);
        }.property('model.feedRate'),
        displayableState: function () {
            var state = this.get('model.currentState');
            if (state == CNCMachine.STATES.READY)
                return "ready";
            if (state == CNCMachine.STATES.MANUAL_CONTROL)
                return "manual";
            if (state == CNCMachine.STATES.RUNNING_PROGRAM)
                return "running";
            if (state == CNCMachine.STATES.ABORTING_PROGRAM)
                return "aborting";
            if (state == CNCMachine.STATES.PAUSED_PROGRAM)
                return "paused";
            if (state == CNCMachine.STATES.HOMING)
                return "homing";
            return "unknown";
        }.property('model.currentState'),
        manualButtonLabel: function () {
            return this.get('model.currentState') == CNCMachine.STATES.MANUAL_CONTROL ?
                "Stop Manual Jogging" : "Manual Jogging";
        }.property('model.currentState'),
        isManualModeTogglable: function () {
            return this.get('model.currentState') == CNCMachine.STATES.READY;
        }.property('model.currentState'),
        isProgramRunnable: function () {
            return this.get('model.currentState') == CNCMachine.STATES.READY
                || this.get('model.currentState') == CNCMachine.STATES.MANUAL_CONTROL;
        }.property('model.currentState'),
        isProgramAbortable: function () {
            return this.get('model.currentState') == CNCMachine.STATES.RUNNING_PROGRAM
                || this.get('model.currentState') == CNCMachine.STATES.PAUSED_PROGRAM
                || this.get('model.currentState') == CNCMachine.STATES.HOMING;
        }.property('model.currentState'),
        isHomable: function () {
            return this.get('model.currentState') == CNCMachine.STATES.READY;
        }.property('model.currentState'),
        isBusy: function () {
            return this.get('model.currentState') == CNCMachine.STATES.RUNNING_PROGRAM
                || this.get('model.currentState') == CNCMachine.STATES.HOMING;
        }.property('model.currentState'),
        isResumable: function () {
            return this.get('model.currentState') == CNCMachine.STATES.PAUSED_PROGRAM;
        }.property('model.currentState'),
        spindleButtonLabel: function () {
            return this.get('model.spindleRunning') ? 'Stop' : 'Start';
        }.property('model.spindleRunning'),
        socketButtonLabel: function () {
            return this.get('model.socketOn') ? 'Stop' : 'Start';
        }.property('model.socketOn')
    });
    CNCController.ApplicationView = Ember.View.extend({
        templateName: 'controllerPanel',
        classNames: ['mainDiv']
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
            editAxis: function () {
                if (!this.get('isEditing'))
                    this.set('isEditing', true);
            },
            acceptChanges: function () {
                this.get('model').definePosition(this.get('bufferedPosition'));
                this.set('isEditing', false);
            },
            cancelChanges: function () {
                this.set('isEditing', false);
            }
        },
        isEditing: false,
        bufferedPosition: 0,
        helpText: function () {
            var txt = this.get('isEditing') ? 'enter to validate, escape to cancel change' : 'double click to edit';
            if (!this.get('model.homed'))
                txt += ' | *this axis is not homed*';
            if (this.get('model.limit'))
                txt += ' | this axis is on the limit switch';
            return txt;
        }.property('isEditing', 'model.limit', 'model.homed'),
        isEditingChanged: function () {
            if (this.get('isEditing'))
                this.set('bufferedPosition', this.get('model.position'))
        }.observes('isEditing'),
        formattedPosition: function () {
            return this.get('model.position').toFixed(3);
        }.property('model.position')
    });
});