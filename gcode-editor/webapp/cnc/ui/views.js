"use strict";

define(['Ember'], function (Ember) {
    return {
        NumberField: Ember.TextField.extend({
            type: 'number',
            attributeBindings: ['min', 'max', 'step'],
            classNames: ['form-control'],
            valueChanged: function () {
                var previousNumericValue = this.get('numericValue');
                var newNumericValue = parseFloat(this.get('value'));
                if (!isNaN(newNumericValue) && newNumericValue != previousNumericValue)
                    this.set('numericValue', newNumericValue);
            }.observes('value').on('init'),
            numericValueChanged: function () {
                var newNumericValue = this.get('numericValue');
                var previousValue = parseFloat(this.get('value'));
                if (previousValue != newNumericValue)
                    this.set('value', newNumericValue + '');
            }.observes('numericValue').on('init')
        })
    };
});