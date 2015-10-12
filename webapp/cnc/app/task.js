"use strict";
define(['Ember'], function (Ember) {
    return Ember.Object.extend({
        init: function () {
            var _this = this;
            var promise = new Ember.RSVP.Promise(function (resolve, reject) {
                _this.set('resolve', resolve);
                _this.set('reject', reject);
            }, this.get('label'));
            _this.set('promise', promise.finally(function () {
                _this.set('isDone', true);
            }));
        },
        isPaused: false,
        isCanceled: false,
        isDone: false,
        resumeWork: function () {
        },
        cancelWork: function () {

        },
        start: function () {
            this.work(this, this.get('resolve'), this.get('reject'));
        },
        cancel: function () {
            this.set('isCanceled', true);
            this.reject('cancel');
            this.cancelWork();
        },
        pause: function () {
            this.set('isPaused', true);
        },
        resume: function () {
            this.set('isPaused', false);
            this.resumeWork();
        }
    });
});