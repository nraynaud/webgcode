/**
 *
 * @author Ignas Bernotas (c) 2012
 * @url http://blog.iber.co.uk/javascript/2012/06/28/emberjs-history-with-undo-redo/
 * @license MIT
 */
History = {

    _max: 30, //max number of states we store
    _states: [], //array of states
    _index: -1, //current index

    //these are needed for a check when pushing a state

    _isUndo: false,
    _isRedo: false,
    _active: true,

    disable: function () {
        this._active = false;
    },

    enable: function () {
        this._active = true;
    },

    isActive: function () {
        return this._active;
    },

    /**
     * Clear all history entries
     */
    clear: function () {
        this._states = [];
        this._index = -1;
    },
    /**
     * Push a new history state
     */
    pushState: function (obj) {
        this.clearFuture();
        this._states[this._index + 1] = obj;
        this._index++;
        if (this._states.length > this._max) {
            this._states = this._states.slice(1, this._states.length);
            this._index = this._states.length - 1;
        }
    },
    /**
     * Update last history state
     */
    updateLastState: function (value) {
        this._states[this._index].after = value;
    },
    /**
     * This method clears all the states after the current index
     */
    clearFuture: function () {
        if (this._index != this._states.length - 1) {
            this._states = this._states.slice(0, this._index + 1);
        }
    },
    /**
     * Load state for undo
     */
    loadUndoState: function (index) {
        var obj = this._states[index];
        obj.element.set(obj.property, obj.before);
    },
    /**
     * Load state for redo
     */
    loadRedoState: function (index) {
        var obj = this._states[index];
        obj.element.set(obj.property, obj.after);
    },
    /**
     * Do undo
     */
    undo: function () {
        if (this._index in this._states) {
            this._isUndo = true;
            this.loadUndoState(this._index);
            this._index--;
            this._isUndo = false;
        }
    },
    /**
     * Do redo
     */
    redo: function () {
        if (this._states[this._index + 1]) {
            this._isRedo = true;
            this.loadRedoState(this._index + 1);
            this._index++;
            this._isRedo = false;
        }
    },
    isUndo: function () {
        return this._isUndo;
    },
    isRedo: function () {
        return this._isRedo;
    }
}

Ember.History = Em.Mixin.create({

    //Initiate and add observers for the object properties
    init: function () {
        var props = this.get('_trackProperties');
        var $this = this;
        props.forEach(function (item) {
            Ember.addBeforeObserver($this, item, $this, '_beforeChange');
            Ember.addObserver($this, item, $this, '_afterChange');
        });
    },
    //The before observer saves adds the element with the value it was before the change
    _beforeChange: function (element, prop, value) {
        if (!History.isUndo() && !History.isRedo() && History.isActive()) {
            History.pushState({
                element: element,
                property: prop,
                before: value
            });
        }
    },
    //This method updates the last state and adds the current value
    _afterChange: function (element, prop, value) {
        if (!History.isUndo() && !History.isRedo() && History.isActive()) {
            History.updateLastState(value);
        }
    }
});