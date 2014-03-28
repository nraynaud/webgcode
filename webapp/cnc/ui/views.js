"use strict";

define({
    NumberField: Ember.TextField.extend({
        type: 'number',
        attributeBindings: ['min', 'max', 'step'],
        numericValue: function (key, v) {
            if (arguments.length === 1) {
                var val = parseFloat(this.get('value'));
                return isNaN(val) ? null : val;
            } else
                this.set('value', v + '');
        }.property('value')
    })
})
;