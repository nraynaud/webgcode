Ember.TEMPLATES["camApp"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, escapeExpression = this.escapeExpression, helperMissing = helpers.helperMissing, self = this;

    function program1(depth0, data) {

        var buffer = '';
        data.buffer.push("\n        ");
        data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash: {
            'content': ("languages"),
            'value': ("selectedLanguage")
        }, hashTypes: {'content': "ID", 'value': "ID"}, hashContexts: {'content': depth0, 'value': depth0}, contexts: [depth0], types: ["ID"], data: data})));
        data.buffer.push("\n    ");
        return buffer;
    }

    function program3(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n        ");
        data.buffer.push(escapeExpression((helper = helpers['gcode-editor'] || (depth0 && depth0['gcode-editor']), options = {hash: {
            'content': ("code"),
            'annotations': ("errors"),
            'currentRow': ("currentRow")
        }, hashTypes: {'content': "ID", 'annotations': "ID", 'currentRow': "ID"}, hashContexts: {'content': depth0, 'annotations': depth0, 'currentRow': depth0}, contexts: [], types: [], data: data}, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gcode-editor", options))));
        data.buffer.push("\n    ");
        return buffer;
    }

    function program5(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n        ");
        data.buffer.push(escapeExpression((helper = helpers['js-editor'] || (depth0 && depth0['js-editor']), options = {hash: {
            'content': ("jscode"),
            'annotations': ("errors"),
            'currentRow': ("currentRow")
        }, hashTypes: {'content': "ID", 'annotations': "ID", 'currentRow': "ID"}, hashContexts: {'content': depth0, 'annotations': depth0, 'currentRow': depth0}, contexts: [], types: [], data: data}, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "js-editor", options))));
        data.buffer.push("\n    ");
        return buffer;
    }

    function program7(depth0, data) {


        data.buffer.push("\n        <div id=\"loader\">&nbsp;</div>\n    ");
    }

    function program9(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n        ");
        data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial), options = {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["STRING"], data: data}, helper ? helper.call(depth0, "jobView", options) : helperMissing.call(depth0, "partial", "jobView", options))));
        data.buffer.push("\n    ");
        return buffer;
    }

    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Simulator.GraphicView", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("\n<div class=\"editBlock\">\n    ");
    stack1 = helpers['if'].call(depth0, "canSelectLanguage", {hash: {}, hashTypes: {}, hashContexts: {}, inverse: self.noop, fn: self.program(1, program1, data), contexts: [depth0], types: ["ID"], data: data});
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    ");
    stack1 = helpers['if'].call(depth0, "usingGcode", {hash: {}, hashTypes: {}, hashContexts: {}, inverse: self.program(5, program5, data), fn: self.program(3, program3, data), contexts: [depth0], types: ["ID"], data: data});
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    <button ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "simulate", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["STRING"], data: data})));
    data.buffer.push(" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash: {
        'disabled': ("computing")
    }, hashTypes: {'disabled': "STRING"}, hashContexts: {'disabled': depth0}, contexts: [], types: [], data: data})));
    data.buffer.push(">Simulate</button>\n    <button ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "loadBigSample", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["STRING"], data: data})));
    data.buffer.push(" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash: {
        'disabled': ("computing")
    }, hashTypes: {'disabled': "STRING"}, hashContexts: {'disabled': depth0}, contexts: [], types: [], data: data})));
    data.buffer.push(">Load a bigger sample</button>\n\n    ");
    stack1 = helpers['if'].call(depth0, "computing", {hash: {}, hashTypes: {}, hashContexts: {}, inverse: self.program(9, program9, data), fn: self.program(7, program7, data), contexts: [depth0], types: ["ID"], data: data});
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n</div>");
    return buffer;

});
Ember.TEMPLATES["controllerPanel"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, helper, options, escapeExpression = this.escapeExpression, self = this, helperMissing = helpers.helperMissing;

    function program1(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "isProgramRunnable", {hash: {}, hashTypes: {}, hashContexts: {}, inverse: self.noop, fn: self.program(2, program2, data), contexts: [depth0], types: ["ID"], data: data});
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "isProgramAbortable", {hash: {}, hashTypes: {}, hashContexts: {}, inverse: self.noop, fn: self.program(4, program4, data), contexts: [depth0], types: ["ID"], data: data});
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "isManualModeTogglable", {hash: {}, hashTypes: {}, hashContexts: {}, inverse: self.noop, fn: self.program(6, program6, data), contexts: [depth0], types: ["ID"], data: data});
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n    ");
        return buffer;
    }

    function program2(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <button id='send' ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "sendProgram", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["STRING"], data: data})));
        data.buffer.push(">Send Program</button>\n        ");
        return buffer;
    }

    function program4(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <button id='abort' ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "abort", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["STRING"], data: data})));
        data.buffer.push(">Abort</button>\n        ");
        return buffer;
    }

    function program6(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n            <button id='manualControl' ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "setManualMode", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["STRING"], data: data})));
        data.buffer.push(">");
        stack1 = helpers._triageMustache.call(depth0, "manualButtonLabel", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data});
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</button>\n        ");
        return buffer;
    }

    function program8(depth0, data) {

        var buffer = '';
        data.buffer.push("\n        <button id='connect' ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "connect", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["STRING"], data: data})));
        data.buffer.push(">Connect</button>\n    ");
        return buffer;
    }

    function program10(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                    <tr ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash: {
            'title': ("helpText")
        }, hashTypes: {'title': "STRING"}, hashContexts: {'title': depth0}, contexts: [], types: [], data: data})));
        data.buffer.push(" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "editAxis", {hash: {
            'on': ("doubleClick")
        }, hashTypes: {'on': "STRING"}, hashContexts: {'on': depth0}, contexts: [depth0], types: ["STRING"], data: data})));
        data.buffer.push(" >\n                        <th>");
        stack1 = helpers._triageMustache.call(depth0, "name", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data});
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push(":</th>\n                        <td class=\"posAxis\">\n                            ");
        stack1 = helpers['if'].call(depth0, "isEditing", {hash: {}, hashTypes: {}, hashContexts: {}, inverse: self.program(13, program13, data), fn: self.program(11, program11, data), contexts: [depth0], types: ["ID"], data: data});
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                        </td>\n                    </tr>\n                ");
        return buffer;
    }

    function program11(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n                                ");
        data.buffer.push(escapeExpression((helper = helpers['edit-axis'] || (depth0 && depth0['edit-axis']), options = {hash: {
            'size': ("6"),
            'value': ("bufferedPosition"),
            'insert-newline': ("acceptChanges"),
            'escape-press': ("cancelChanges")
        }, hashTypes: {'size': "STRING", 'value': "ID", 'insert-newline': "STRING", 'escape-press': "STRING"}, hashContexts: {'size': depth0, 'value': depth0, 'insert-newline': depth0, 'escape-press': depth0}, contexts: [], types: [], data: data}, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "edit-axis", options))));
        data.buffer.push("\n                            ");
        return buffer;
    }

    function program13(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                                <span class=\"pos\">");
        stack1 = helpers._triageMustache.call(depth0, "formattedPosition", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data});
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</span>\n                            ");
        return buffer;
    }

    function program15(depth0, data) {


        data.buffer.push("\n                    <div id=\"loader\">&nbsp;</div>\n                ");
    }

    data.buffer.push("<div id=\"header\" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash: {
        'class': ("connection.opened:connected")
    }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data})));
    data.buffer.push(">\n    ");
    stack1 = helpers['if'].call(depth0, "connection.opened", {hash: {}, hashTypes: {}, hashContexts: {}, inverse: self.program(8, program8, data), fn: self.program(1, program1, data), contexts: [depth0], types: ["ID"], data: data});
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    <div class=\"control\">\n        <div class=\"position\">\n            <table>\n                <colgroup>\n                    <col>\n                    <col>\n                </colgroup>\n                <tbody>\n                ");
    stack1 = helpers.each.call(depth0, "axes", {hash: {
        'itemController': ("axis")
    }, hashTypes: {'itemController': "STRING"}, hashContexts: {'itemController': depth0}, inverse: self.noop, fn: self.program(10, program10, data), contexts: [depth0], types: ["ID"], data: data});
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n                </tbody>\n            </table>\n        </div>\n        <div class=\"controlButtons\">\n            <div class=\"xyBlock\">\n                <button class=\"axisButton\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Y+", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0, depth0], types: ["STRING", "STRING"], data: data})));
    data.buffer.push(">Y+</button>\n                <div class=\"centerRow\">\n                    <button class=\"axisButton\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "X-", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0, depth0], types: ["STRING", "STRING"], data: data})));
    data.buffer.push(">X-</button>\n                    <button class=\"axisButton\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "X+", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0, depth0], types: ["STRING", "STRING"], data: data})));
    data.buffer.push(">X+</button>\n                </div>\n                <button class=\"axisButton\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Y-", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0, depth0], types: ["STRING", "STRING"], data: data})));
    data.buffer.push(">Y-</button>\n            </div>\n            <div class=\"zBlock\">\n                <button class=\"axisButton\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Z+", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0, depth0], types: ["STRING", "STRING"], data: data})));
    data.buffer.push(">Z+</button>\n                <div>&nbsp;</div>\n                <button class=\"axisButton\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Z-", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0, depth0], types: ["STRING", "STRING"], data: data})));
    data.buffer.push(">Z-</button>\n            </div>\n        </div>\n        <div class=\"controlParams\">\n            <table>\n                <tr title=\"mm\">\n                    <th><label for=\"incrementField\">increment:</label></th>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {hash: {
        'type': ("number"),
        'class': ("paramField"),
        'min': ("0"),
        'max': ("100"),
        'step': ("0.01"),
        'size': ("4"),
        'value': ("10"),
        'value': ("increment")
    }, hashTypes: {'type': "ID", 'class': "STRING", 'min': "STRING", 'max': "STRING", 'step': "STRING", 'size': "STRING", 'value': "STRING", 'value': "ID"}, hashContexts: {'type': depth0, 'class': depth0, 'min': depth0, 'max': depth0, 'step': depth0, 'size': depth0, 'value': depth0, 'value': depth0}, contexts: [], types: [], data: data}, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n                </tr>\n                <tr title=\"mm/min\">\n                    <th><label for=\"feedRateField\">feedrate:</label></th>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {hash: {
        'type': ("number"),
        'class': ("paramField"),
        'min': ("0"),
        'max': ("3000"),
        'step': ("10"),
        'size': ("4"),
        'value': ("10"),
        'value': ("jogFeedrate")
    }, hashTypes: {'type': "ID", 'class': "STRING", 'min': "STRING", 'max': "STRING", 'step': "STRING", 'size': "STRING", 'value': "STRING", 'value': "ID"}, hashContexts: {'type': depth0, 'class': depth0, 'min': depth0, 'max': depth0, 'step': depth0, 'size': depth0, 'value': depth0, 'value': depth0}, contexts: [], types: [], data: data}, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n                </tr>\n                <tr title=\"mm/min\">\n                    <th>current speed:</th>\n                    <td><span id=\"currentFeedrate\">");
    stack1 = helpers._triageMustache.call(depth0, "feedrate", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data});
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("</span></td>\n                </tr>\n                <tr title=\"mm/min\">\n                    <th>current state:</th>\n                    <td><span>");
    stack1 = helpers._triageMustache.call(depth0, "displayableState", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data});
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("</span></td>\n                </tr>\n            </table>\n            <div class=\"units\">\n                ");
    stack1 = helpers['if'].call(depth0, "isBusy", {hash: {}, hashTypes: {}, hashContexts: {}, inverse: self.noop, fn: self.program(15, program15, data), contexts: [depth0], types: ["ID"], data: data});
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("<span\n                    title=\"ISO units, there is no way to change it.\">mm</span>\n            </div>\n        </div>\n    </div>\n</div>\n<div class=\"camPanel\">\n    <iframe id=\"webView\" src=\"CAM.html\"></iframe>\n</div>");
    return buffer;

});
Ember.TEMPLATES["draftApp"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var escapeExpression = this.escapeExpression;


    data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.TwoDView", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data})));

});
Ember.TEMPLATES["jobView"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, helper, options, escapeExpression = this.escapeExpression, helperMissing = helpers.helperMissing;


    data.buffer.push("<div>\n    <dl>\n        <dt>Total Duration:</dt>\n        <dd ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash: {
        'title': ("formattedTotalTime.detailed")
    }, hashTypes: {'title': "ID"}, hashContexts: {'title': depth0}, contexts: [], types: [], data: data})));
    data.buffer.push(">");
    stack1 = helpers._triageMustache.call(depth0, "formattedTotalTime.humanized", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data});
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("</dd>\n    </dl>\n    <dl>\n        <dt>Bounds (@tool center):</dt>\n        <dd>\n            <table class=\"boundsTable\" style=\"text-align:right;\">\n                <thead>\n                <tr>\n                    <th>&nbsp;</th>\n                    <th>min</th>\n                    <th>max</th>\n                </tr>\n                </thead>\n                <tbody>\n                <tr>\n                    <th>X</th>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data}, helper ? helper.call(depth0, "bbox.min.x", options) : helperMissing.call(depth0, "num", "bbox.min.x", options))));
    data.buffer.push("</td>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data}, helper ? helper.call(depth0, "bbox.max.x", options) : helperMissing.call(depth0, "num", "bbox.max.x", options))));
    data.buffer.push("</td>\n                </tr>\n                <tr>\n                    <th>Y</th>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data}, helper ? helper.call(depth0, "bbox.min.y", options) : helperMissing.call(depth0, "num", "bbox.min.y", options))));
    data.buffer.push("</td>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data}, helper ? helper.call(depth0, "bbox.max.y", options) : helperMissing.call(depth0, "num", "bbox.max.y", options))));
    data.buffer.push("</td>\n                </tr>\n                <tr>\n                    <th>Z</th>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data}, helper ? helper.call(depth0, "bbox.min.z", options) : helperMissing.call(depth0, "num", "bbox.min.z", options))));
    data.buffer.push("</td>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data}, helper ? helper.call(depth0, "bbox.max.z", options) : helperMissing.call(depth0, "num", "bbox.max.z", options))));
    data.buffer.push("</td>\n                </tr>\n                </tbody>\n            </table>\n        </dd>\n    </dl>\n</div>");
    return buffer;

});
Ember.TEMPLATES["operation"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<div>\n    <table class=\"form\">\n        <tbody>\n        <tr class=\"form-header\">\n            <th>Name:</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {hash: {
        'value': ("name"),
        'placeholder': ("name")
    }, hashTypes: {'value': "ID", 'placeholder': "STRING"}, hashContexts: {'value': depth0, 'placeholder': depth0}, contexts: [], types: [], data: data}, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push(" </td>\n        </tr>\n        <tr>\n            <th>Type</th>\n            <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash: {
        'value': ("type"),
        'content': ("operationDescriptors"),
        'optionValuePath': ("content.class"),
        'optionLabelPath': ("content.label")
    }, hashTypes: {'value': "ID", 'content': "ID", 'optionValuePath': "STRING", 'optionLabelPath': "STRING"}, hashContexts: {'value': depth0, 'content': depth0, 'optionValuePath': depth0, 'optionLabelPath': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("</td>\n        </tr>\n        ");
    data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial), options = {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data}, helper ? helper.call(depth0, "specialTemplate", options) : helperMissing.call(depth0, "partial", "specialTemplate", options))));
    data.buffer.push("\n        </tbody>\n    </table>\n</div>");
    return buffer;

});
Ember.TEMPLATES["operationPocket"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th title=\"Engagement in %\">Radial Engagement:</th>\n    <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("pocket_engagement"),
        'min': ("0"),
        'increment': ("1"),
        'max': ("100")
    }, hashTypes: {'value': "ID", 'min': "STRING", 'increment': "STRING", 'max': "STRING"}, hashContexts: {'value': depth0, 'min': depth0, 'increment': depth0, 'max': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("</td>\n</tr>");
    return buffer;

});
Ember.TEMPLATES["rampingContour"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th>Inside Shape</th>\n    <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {hash: {
        'type': ("checkbox"),
        'checked': ("ramping_inside")
    }, hashTypes: {'type': "STRING", 'checked': "ID"}, hashContexts: {'type': depth0, 'checked': depth0}, contexts: [], types: [], data: data}, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th title=\"How far the tool should stay away from the line in X-Y plane\">Leave Stock:</th>\n    <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("ramping_leaveStock"),
        'min': ("0")
    }, hashTypes: {'value': "ID", 'min': "STRING"}, hashContexts: {'value': depth0, 'min': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th>Start Z:</th>\n    <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("ramping_startZ")
    }, hashTypes: {'value': "ID"}, hashContexts: {'value': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th>Stop Z:</th>\n    <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("ramping_stopZ")
    }, hashTypes: {'value': "ID"}, hashContexts: {'value': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th># of turns:</th>\n    <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("ramping_turns"),
        'min': ("1"),
        'step': ("1")
    }, hashTypes: {'value': "ID", 'min': "STRING", 'step': "STRING"}, hashContexts: {'value': depth0, 'min': depth0, 'step': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("</td>\n</tr>\n");
    return buffer;

});
Ember.TEMPLATES["simpleContour"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th>Inside Shape</th>\n    <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {hash: {
        'type': ("checkbox"),
        'checked': ("simple_inside")
    }, hashTypes: {'type': "STRING", 'checked': "ID"}, hashContexts: {'type': depth0, 'checked': depth0}, contexts: [], types: [], data: data}, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th title=\"How far the tool should stay away from the line in X-Y plane\">Leave Stock:</th>\n    <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("simple_leaveStock"),
        'min': ("0")
    }, hashTypes: {'value': "ID", 'min': "STRING"}, hashContexts: {'value': depth0, 'min': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th>Contour Z:</th>\n    <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("simple_contourZ")
    }, hashTypes: {'value': "ID"}, hashContexts: {'value': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("</td>\n</tr>\n");
    return buffer;

});
Ember.TEMPLATES["simpleEngraving"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th>engraving Z:</th>\n    <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("engraing_engravingZ")
    }, hashTypes: {'value': "ID"}, hashContexts: {'value': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("</td>\n</tr>\n");
    return buffer;

});
Ember.TEMPLATES["textApp"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, helper, options, escapeExpression = this.escapeExpression, helperMissing = helpers.helperMissing, self = this;

    function program1(depth0, data) {

        var buffer = '';
        data.buffer.push("\n                ");
        data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash: {
            'content': ("font.variants"),
            'value': ("fontVariant")
        }, hashTypes: {'content': "ID", 'value': "ID"}, hashContexts: {'content': depth0, 'value': depth0}, contexts: [depth0], types: ["ID"], data: data})));
        data.buffer.push("\n            ");
        return buffer;
    }

    function program3(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                ");
        stack1 = helpers._triageMustache.call(depth0, "font.variants", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data});
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n            ");
        return buffer;
    }

    data.buffer.push("<div class=\"controls\">\n    <div class=\"controlPanel\">\n        <h3><label for=\"text\">Text</label></h3>\n\n        <div class=\"controlPanelContent\">\n            ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {hash: {
        'type': ("text"),
        'id': ("text"),
        'valueBinding': ("text"),
        'title': ("your text")
    }, hashTypes: {'type': "STRING", 'id': "STRING", 'valueBinding': "STRING", 'title': "STRING"}, hashContexts: {'type': depth0, 'id': depth0, 'valueBinding': depth0, 'title': depth0}, contexts: [], types: [], data: data}, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n        </div>\n    </div>\n    <div class=\"controlPanel\">\n        <h3>Font</h3>\n\n        <div class=\"controlPanelContent\">\n            <label for=\"fontSize\">Size:</label><br>\n            ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.NumberField", {hash: {
        'id': ("fontSize"),
        'placeholder': ("Font Size"),
        'numericValueBinding': ("fontSize"),
        'min': ("0.01"),
        'max': ("500")
    }, hashTypes: {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'min': "STRING", 'max': "STRING"}, hashContexts: {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'min': depth0, 'max': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("\n            <br>\n            ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash: {
        'content': ("controllers.fonts"),
        'value': ("fontName"),
        'optionLabelPath': ("content.family"),
        'optionValuePath': ("content.family")
    }, hashTypes: {'content': "ID", 'value': "ID", 'optionLabelPath': "STRING", 'optionValuePath': "STRING"}, hashContexts: {'content': depth0, 'value': depth0, 'optionLabelPath': depth0, 'optionValuePath': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("\n            <br>\n            ");
    stack1 = helpers['if'].call(depth0, "hasFontVariants", {hash: {}, hashTypes: {}, hashContexts: {}, inverse: self.program(3, program3, data), fn: self.program(1, program1, data), contexts: [depth0], types: ["ID"], data: data});
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n        </div>\n    </div>\n\n    <div class=\"controlPanel\">\n        <h3>Tool</h3>\n\n        <div class=\"controlPanelContent\">\n            <label for=\"toolDiameter\" title=\"in mm\">Tool Diameter:</label><br>\n            ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.NumberField", {hash: {
        'id': ("toolDiameter"),
        'placeholder': ("tool diameter"),
        'numericValueBinding': ("toolDiameter"),
        'min': ("0"),
        'action': ("launchComputationImmediately")
    }, hashTypes: {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'min': "STRING", 'action': "STRING"}, hashContexts: {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'min': depth0, 'action': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("\n            <br>\n            <label for=\"radialEngagement\" title=\"ratio ]0-1]\">Radial Engagement:</label><br>\n            ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.NumberField", {hash: {
        'id': ("radialEngagement"),
        'placeholder': ("radial engagement"),
        'numericValueBinding': ("radialEngagementRatio"),
        'min': ("0"),
        'max': ("1"),
        'step': ("0.05"),
        'action': ("launchComputationImmediately")
    }, hashTypes: {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'min': "STRING", 'max': "STRING", 'step': "STRING", 'action': "STRING"}, hashContexts: {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'min': depth0, 'max': depth0, 'step': depth0, 'action': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("\n            <br>\n\n            <div class=\"controlPanel\">\n                <h3>Pocket</h3>\n\n                <div class=\"controlPanelContent\">\n                    <label for=\"workZ\" title=\"in mm\">Work Z:</label><br>\n                    ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.NumberField", {hash: {
        'id': ("workZ"),
        'placeholder': ("workZ"),
        'numericValueBinding': ("workZ"),
        'action': ("computeGCode")
    }, hashTypes: {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'action': "STRING"}, hashContexts: {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'action': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("\n                    <br>\n                    <label for=\"travelZ\" title=\"in mm\">Travel Z:</label><br>\n                    ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.NumberField", {hash: {
        'id': ("travelZ"),
        'placeholder': ("travelZ"),
        'numericValueBinding': ("travelZ"),
        'action': ("computeGCode")
    }, hashTypes: {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'action': "STRING"}, hashContexts: {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'action': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("\n                    <br>\n                    <label for=\"feedRate\" title=\"in mm/min\">Feed Rate:</label><br>\n                    ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.NumberField", {hash: {
        'id': ("feedRate"),
        'placeholder': ("feedRate"),
        'numericValueBinding': ("feedRate"),
        'action': ("computeGCode")
    }, hashTypes: {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'action': "STRING"}, hashContexts: {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'action': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n<div id=\"drawing\">\n    ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.OperationView", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("\n</div>\n");
    data.buffer.push(escapeExpression((helper = helpers.textarea || (depth0 && depth0.textarea), options = {hash: {
        'id': ("code"),
        'value': ("code"),
        'rows': ("400")
    }, hashTypes: {'id': "STRING", 'value': "ID", 'rows': "STRING"}, hashContexts: {'id': depth0, 'value': depth0, 'rows': depth0}, contexts: [], types: [], data: data}, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
    return buffer;

});
Ember.TEMPLATES["visucamApp"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, escapeExpression = this.escapeExpression, self = this, helperMissing = helpers.helperMissing;

    function program1(depth0, data) {

        var buffer = '', stack1, helper, options;
        data.buffer.push("\n                <li ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash: {
            'class': ("isCurrent:current")
        }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data})));
        data.buffer.push(">");
        stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']), options = {hash: {}, hashTypes: {}, hashContexts: {}, inverse: self.noop, fn: self.program(2, program2, data), contexts: [depth0, depth0], types: ["STRING", "ID"], data: data}, helper ? helper.call(depth0, "operation", "", options) : helperMissing.call(depth0, "link-to", "operation", "", options));
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                    <button ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "delete", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["STRING"], data: data})));
        data.buffer.push(" title=\"Delete Operation\">X</button>\n                </li>\n            ");
        return buffer;
    }

    function program2(depth0, data) {

        var stack1;
        stack1 = helpers._triageMustache.call(depth0, "name", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data});
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        else {
            data.buffer.push('');
        }
    }

    function program4(depth0, data) {


        data.buffer.push("\n                No operation yet.\n            ");
    }

    data.buffer.push("<div class=\"application\">\n    <div class=\"job\">\n        <table class=\"form\">\n            <tbody>\n            <tr>\n                <th>Safety Z:</th>\n                <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("safetyZ")
    }, hashTypes: {'value': "ID"}, hashContexts: {'value': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("</td>\n            </tr>\n            <tr>\n                <th>Tool Diameter:</th>\n                <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("toolDiameter"),
        'min': (0)
    }, hashTypes: {'value': "ID", 'min': "INTEGER"}, hashContexts: {'value': depth0, 'min': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("</td>\n            </tr>\n            <tr>\n                <th>Feedrate:</th>\n                <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("feedrate"),
        'min': (0),
        'max': (3000)
    }, hashTypes: {'value': "ID", 'min': "INTEGER", 'max': "INTEGER"}, hashContexts: {'value': depth0, 'min': depth0, 'max': depth0}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("</td>\n            </tr>\n            </tbody>\n        </table>\n        <ul class=\"operations\">\n            ");
    stack1 = helpers.each.call(depth0, "operations", {hash: {
        'itemController': ("operationListItem")
    }, hashTypes: {'itemController': "STRING"}, hashContexts: {'itemController': depth0}, inverse: self.program(4, program4, data), fn: self.program(1, program1, data), contexts: [depth0], types: ["ID"], data: data});
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n        </ul>\n    </div>\n    <div class=\"viewContainer\">\n        ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.ThreeDView", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data})));
    data.buffer.push("\n    </div>\n    <div class=\"operation\">\n        ");
    stack1 = helpers._triageMustache.call(depth0, "outlet", {hash: {}, hashTypes: {}, hashContexts: {}, contexts: [depth0], types: ["ID"], data: data});
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    </div>\n</div>");
    return buffer;

});
