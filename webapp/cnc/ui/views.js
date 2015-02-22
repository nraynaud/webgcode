"use strict";

define(['Ember'], function (Ember) {
    return {
        NumberField: Ember.TextField.extend({
            type: 'number',
            attributeBindings: ['type', 'fieldValue:value', 'size', 'pattern', 'name', 'min', 'max',
                'accept', 'autocomplete', 'autosave', 'formaction',
                'formenctype', 'formmethod', 'formnovalidate', 'formtarget',
                'height', 'inputmode', 'list', 'multiple', 'step',
                'width'],
            fieldValue: function (key, value) {
                if (arguments.length > 1) {
                    this.set('value', Number(value));
                    return value;
                } else {
                    return this.get('value');
                }
            }.property('value')
        })
    };
});