Ember.TEMPLATES["camApp"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, stack2, hashTypes, hashContexts, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression, self = this;

    function program1(depth0, data) {

        var buffer = '', stack1, hashContexts, hashTypes, options;
        data.buffer.push("\n        ");
        hashContexts = {'content': depth0, 'annotations': depth0, 'currentRow': depth0};
        hashTypes = {'content': "ID", 'annotations': "ID", 'currentRow': "ID"};
        options = {hash: {
            'content': ("code"),
            'annotations': ("errors"),
            'currentRow': ("currentRow")
        }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers['gcode-editor'] || (depth0 && depth0['gcode-editor'])), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "gcode-editor", options))));
        data.buffer.push("\n    ");
        return buffer;
    }

    function program3(depth0, data) {

        var buffer = '', stack1, hashContexts, hashTypes, options;
        data.buffer.push("\n        ");
        hashContexts = {'content': depth0, 'annotations': depth0, 'currentRow': depth0};
        hashTypes = {'content': "ID", 'annotations': "ID", 'currentRow': "ID"};
        options = {hash: {
            'content': ("jscode"),
            'annotations': ("errors"),
            'currentRow': ("currentRow")
        }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers['js-editor'] || (depth0 && depth0['js-editor'])), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "js-editor", options))));
        data.buffer.push("\n    ");
        return buffer;
    }

    function program5(depth0, data) {


        data.buffer.push("\n        <div id=\"loader\">&nbsp;</div>\n    ");
    }

    function program7(depth0, data) {

        var buffer = '', stack1, hashContexts, hashTypes, options;
        data.buffer.push("\n        <div>\n            <dl>\n                <dt>Total Duration:</dt>\n                <dd ");
        hashContexts = {'title': depth0};
        hashTypes = {'title': "ID"};
        options = {hash: {
            'title': ("formattedTotalTime.detailed")
        }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
        data.buffer.push(">");
        hashTypes = {};
        hashContexts = {};
        data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "formattedTotalTime.humanized", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
        data.buffer.push("</dd>\n            </dl>\n            <dl>\n                <dt>Bounds (@tool center):</dt>\n                <dd>\n                    <table class=\"boundsTable\" style=\"text-align:right;\">\n                        <thead>\n                        <tr>\n                            <th>&nbsp;</th>\n                            <th>min</th>\n                            <th>max</th>\n                        </tr>\n                        </thead>\n                        <tbody>\n                        <tr>\n                            <th>X</th>\n                            <td>");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.min.x", options) : helperMissing.call(depth0, "num", "bbox.min.x", options))));
        data.buffer.push("</td>\n                            <td>");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.max.x", options) : helperMissing.call(depth0, "num", "bbox.max.x", options))));
        data.buffer.push("</td>\n                        </tr>\n                        <tr>\n                            <th>Y</th>\n                            <td>");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.min.y", options) : helperMissing.call(depth0, "num", "bbox.min.y", options))));
        data.buffer.push("</td>\n                            <td>");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.max.y", options) : helperMissing.call(depth0, "num", "bbox.max.y", options))));
        data.buffer.push("</td>\n                        </tr>\n                        <tr>\n                            <th>Z</th>\n                            <td>");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.min.z", options) : helperMissing.call(depth0, "num", "bbox.min.z", options))));
        data.buffer.push("</td>\n                            <td>");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.max.z", options) : helperMissing.call(depth0, "num", "bbox.max.z", options))));
        data.buffer.push("</td>\n                        </tr>\n                        </tbody>\n                    </table>\n                </dd>\n            </dl>\n        </div>\n    ");
        return buffer;
    }

    data.buffer.push("<div class=\"viewContainer\">\n    ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Simulator.ThreeDView", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n    ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Simulator.TwoDView", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n</div>\n<div class=\"editBlock\">\n    ");
    hashContexts = {'content': depth0, 'value': depth0};
    hashTypes = {'content': "ID", 'value': "ID"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash: {
        'content': ("languages"),
        'value': ("selectedLanguage")
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n    ");
    hashTypes = {};
    hashContexts = {};
    stack1 = helpers['if'].call(depth0, "usingGcode", {hash: {}, inverse: self.program(3, program3, data), fn: self.program(1, program1, data), contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data});
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    <button ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "simulate", {hash: {}, contexts: [depth0], types: ["STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push(" ");
    hashContexts = {'disabled': depth0};
    hashTypes = {'disabled': "STRING"};
    options = {hash: {
        'disabled': ("computing")
    }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
    data.buffer.push(">Simulate</button>\n\n    ");
    hashTypes = {};
    hashContexts = {};
    stack2 = helpers['if'].call(depth0, "computing", {hash: {}, inverse: self.program(7, program7, data), fn: self.program(5, program5, data), contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data});
    if (stack2 || stack2 === 0) {
        data.buffer.push(stack2);
    }
    data.buffer.push("\n</div>");
    return buffer;

});
Ember.TEMPLATES["draftApp"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var hashTypes, hashContexts, escapeExpression = this.escapeExpression;


    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.TwoDView", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));

});
Ember.TEMPLATES["gcodeSimulator"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, stack2, hashTypes, hashContexts, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression, self = this;

    function program1(depth0, data) {


        data.buffer.push("\n        <div id=\"loader\">&nbsp;</div>\n    ");
    }

    function program3(depth0, data) {

        var buffer = '', stack1, hashContexts, hashTypes, options;
        data.buffer.push("\n        <div>\n            <dl>\n                <dt>Total Duration:</dt>\n                <dd ");
        hashContexts = {'title': depth0};
        hashTypes = {'title': "ID"};
        options = {hash: {
            'title': ("formattedTotalTime.detailed")
        }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
        data.buffer.push(">");
        hashTypes = {};
        hashContexts = {};
        data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "formattedTotalTime.humanized", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
        data.buffer.push("</dd>\n            </dl>\n            <dl>\n                <dt>Bounds (@tool center):</dt>\n                <dd>\n                    <table class=\"boundsTable\" style=\"text-align:right;\">\n                        <thead>\n                        <tr>\n                            <th>&nbsp;</th>\n                            <th>min</th>\n                            <th>max</th>\n                        </tr>\n                        </thead>\n                        <tbody>\n                        <tr>\n                            <th>X</th>\n                            <td>");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.min.x", options) : helperMissing.call(depth0, "num", "bbox.min.x", options))));
        data.buffer.push("</td>\n                            <td>");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.max.x", options) : helperMissing.call(depth0, "num", "bbox.max.x", options))));
        data.buffer.push("</td>\n                        </tr>\n                        <tr>\n                            <th>Y</th>\n                            <td>");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.min.y", options) : helperMissing.call(depth0, "num", "bbox.min.y", options))));
        data.buffer.push("</td>\n                            <td>");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.max.y", options) : helperMissing.call(depth0, "num", "bbox.max.y", options))));
        data.buffer.push("</td>\n                        </tr>\n                        <tr>\n                            <th>Z</th>\n                            <td>");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.min.z", options) : helperMissing.call(depth0, "num", "bbox.min.z", options))));
        data.buffer.push("</td>\n                            <td>");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.max.z", options) : helperMissing.call(depth0, "num", "bbox.max.z", options))));
        data.buffer.push("</td>\n                        </tr>\n                        </tbody>\n                    </table>\n                </dd>\n            </dl>\n        </div>\n    ");
        return buffer;
    }

    data.buffer.push("<div class=\"viewContainer\">\n    ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Simulator.ThreeDView", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n    ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Simulator.TwoDView", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n</div>\n<div class=\"editBlock\">\n    ");
    hashContexts = {'content': depth0, 'annotations': depth0, 'currentRow': depth0};
    hashTypes = {'content': "ID", 'annotations': "ID", 'currentRow': "ID"};
    options = {hash: {
        'content': ("code"),
        'annotations': ("errors"),
        'currentRow': ("currentRow")
    }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers['gcode-editor'] || (depth0 && depth0['gcode-editor'])), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "gcode-editor", options))));
    data.buffer.push("\n    <button ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "simulate", {hash: {}, contexts: [depth0], types: ["STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push(" ");
    hashContexts = {'disabled': depth0};
    hashTypes = {'disabled': "STRING"};
    options = {hash: {
        'disabled': ("computing")
    }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
    data.buffer.push(">Simulate</button>\n    <button ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "loadBigSample", {hash: {}, contexts: [depth0], types: ["STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push(" ");
    hashContexts = {'disabled': depth0};
    hashTypes = {'disabled': "STRING"};
    options = {hash: {
        'disabled': ("computing")
    }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
    data.buffer.push(">Load a bigger sample</button>\n\n    ");
    hashTypes = {};
    hashContexts = {};
    stack2 = helpers['if'].call(depth0, "computing", {hash: {}, inverse: self.program(3, program3, data), fn: self.program(1, program1, data), contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data});
    if (stack2 || stack2 === 0) {
        data.buffer.push(stack2);
    }
    data.buffer.push("\n</div>");
    return buffer;

});
Ember.TEMPLATES["textApp"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression = this.escapeExpression, helperMissing = helpers.helperMissing, self = this;

    function program1(depth0, data) {

        var buffer = '', hashContexts, hashTypes;
        data.buffer.push("\n                ");
        hashContexts = {'content': depth0, 'value': depth0};
        hashTypes = {'content': "ID", 'value': "ID"};
        data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash: {
            'content': ("font.variants"),
            'value': ("fontVariant")
        }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
        data.buffer.push("\n            ");
        return buffer;
    }

    function program3(depth0, data) {

        var buffer = '', hashTypes, hashContexts;
        data.buffer.push("\n                ");
        hashTypes = {};
        hashContexts = {};
        data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "font.variants", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
        data.buffer.push("\n            ");
        return buffer;
    }

    data.buffer.push("<div class=\"controls\">\n    <div class=\"controlPanel\">\n        <h3><label for=\"text\">Text</label></h3>\n\n        <div class=\"controlPanelContent\">\n            ");
    hashContexts = {'type': depth0, 'id': depth0, 'valueBinding': depth0, 'title': depth0};
    hashTypes = {'type': "STRING", 'id': "STRING", 'valueBinding': "STRING", 'title': "STRING"};
    options = {hash: {
        'type': ("text"),
        'id': ("text"),
        'valueBinding': ("text"),
        'title': ("your text")
    }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n        </div>\n    </div>\n    <div class=\"controlPanel\">\n        <h3>Font</h3>\n\n        <div class=\"controlPanelContent\">\n            <label for=\"fontSize\">Size:</label><br>\n            ");
    hashContexts = {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'min': depth0, 'max': depth0};
    hashTypes = {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'min': "STRING", 'max': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.NumberField", {hash: {
        'id': ("fontSize"),
        'placeholder': ("Font Size"),
        'numericValueBinding': ("fontSize"),
        'min': ("0.01"),
        'max': ("500")
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n            <br>\n            ");
    hashContexts = {'content': depth0, 'value': depth0, 'optionLabelPath': depth0, 'optionValuePath': depth0};
    hashTypes = {'content': "ID", 'value': "ID", 'optionLabelPath': "STRING", 'optionValuePath': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash: {
        'content': ("controllers.fonts"),
        'value': ("fontName"),
        'optionLabelPath': ("content.family"),
        'optionValuePath': ("content.family")
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n            <br>\n            ");
    hashTypes = {};
    hashContexts = {};
    stack2 = helpers['if'].call(depth0, "hasFontVariants", {hash: {}, inverse: self.program(3, program3, data), fn: self.program(1, program1, data), contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data});
    if (stack2 || stack2 === 0) {
        data.buffer.push(stack2);
    }
    data.buffer.push("\n        </div>\n    </div>\n\n    <div class=\"controlPanel\">\n        <h3>Tool</h3>\n\n        <div class=\"controlPanelContent\">\n            <label for=\"toolDiameter\" title=\"in mm\">Tool Diameter:</label><br>\n            ");
    hashContexts = {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'min': depth0, 'action': depth0};
    hashTypes = {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'min': "STRING", 'action': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.NumberField", {hash: {
        'id': ("toolDiameter"),
        'placeholder': ("tool diameter"),
        'numericValueBinding': ("toolDiameter"),
        'min': ("0"),
        'action': ("launchComputationImmediately")
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n            <br>\n            <label for=\"radialEngagement\" title=\"ratio ]0-1]\">Radial Engagement:</label><br>\n            ");
    hashContexts = {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'min': depth0, 'max': depth0, 'step': depth0, 'action': depth0};
    hashTypes = {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'min': "STRING", 'max': "STRING", 'step': "STRING", 'action': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.NumberField", {hash: {
        'id': ("radialEngagement"),
        'placeholder': ("radial engagement"),
        'numericValueBinding': ("radialEngagementRatio"),
        'min': ("0"),
        'max': ("1"),
        'step': ("0.05"),
        'action': ("launchComputationImmediately")
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n            <br>\n\n            <div class=\"controlPanel\">\n                <h3>Pocket</h3>\n\n                <div class=\"controlPanelContent\">\n                    <label for=\"workZ\" title=\"in mm\">Work Z:</label><br>\n                    ");
    hashContexts = {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'action': depth0};
    hashTypes = {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'action': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.NumberField", {hash: {
        'id': ("workZ"),
        'placeholder': ("workZ"),
        'numericValueBinding': ("workZ"),
        'action': ("computeGCode")
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n                    <br>\n                    <label for=\"travelZ\" title=\"in mm\">Travel Z:</label><br>\n                    ");
    hashContexts = {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'action': depth0};
    hashTypes = {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'action': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.NumberField", {hash: {
        'id': ("travelZ"),
        'placeholder': ("travelZ"),
        'numericValueBinding': ("travelZ"),
        'action': ("computeGCode")
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n                    <br>\n                    <label for=\"feedRate\" title=\"in mm/min\">Feed Rate:</label><br>\n                    ");
    hashContexts = {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'action': depth0};
    hashTypes = {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'action': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.NumberField", {hash: {
        'id': ("feedRate"),
        'placeholder': ("feedRate"),
        'numericValueBinding': ("feedRate"),
        'action': ("computeGCode")
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n<div id=\"drawing\">\n    ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.OperationView", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n</div>\n");
    hashContexts = {'id': depth0, 'value': depth0, 'rows': depth0};
    hashTypes = {'id': "STRING", 'value': "ID", 'rows': "STRING"};
    options = {hash: {
        'id': ("code"),
        'value': ("code"),
        'rows': ("400")
    }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers.textarea || (depth0 && depth0.textarea)), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
    return buffer;

});
