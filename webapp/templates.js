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

        var buffer = '', stack1, hashTypes, hashContexts, options;
        data.buffer.push("\n        ");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, contexts: [depth0], types: ["STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers.partial || (depth0 && depth0.partial)), stack1 ? stack1.call(depth0, "jobView", options) : helperMissing.call(depth0, "partial", "jobView", options))));
        data.buffer.push("\n    ");
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
Ember.TEMPLATES["controllerPanel"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression = this.escapeExpression, self = this, helperMissing = helpers.helperMissing;

    function program1(depth0, data) {

        var buffer = '', stack1, hashTypes, hashContexts;
        data.buffer.push("\n        ");
        hashTypes = {};
        hashContexts = {};
        stack1 = helpers['if'].call(depth0, "isProgramRunnable", {hash: {}, inverse: self.noop, fn: self.program(2, program2, data), contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data});
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        hashTypes = {};
        hashContexts = {};
        stack1 = helpers['if'].call(depth0, "isProgramAbortable", {hash: {}, inverse: self.noop, fn: self.program(4, program4, data), contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data});
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        hashTypes = {};
        hashContexts = {};
        stack1 = helpers['if'].call(depth0, "isManualModeTogglable", {hash: {}, inverse: self.noop, fn: self.program(6, program6, data), contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data});
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n    ");
        return buffer;
    }

    function program2(depth0, data) {

        var buffer = '', hashTypes, hashContexts;
        data.buffer.push("\n            <button id='send' ");
        hashTypes = {};
        hashContexts = {};
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "sendProgram", {hash: {}, contexts: [depth0], types: ["STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
        data.buffer.push(">Send Program</button>\n        ");
        return buffer;
    }

    function program4(depth0, data) {

        var buffer = '', hashTypes, hashContexts;
        data.buffer.push("\n            <button id='abort' ");
        hashTypes = {};
        hashContexts = {};
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "abort", {hash: {}, contexts: [depth0], types: ["STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
        data.buffer.push(">Abort</button>\n        ");
        return buffer;
    }

    function program6(depth0, data) {

        var buffer = '', hashTypes, hashContexts;
        data.buffer.push("\n            <button id='manualControl' ");
        hashTypes = {};
        hashContexts = {};
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "setManualMode", {hash: {}, contexts: [depth0], types: ["STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
        data.buffer.push(">");
        hashTypes = {};
        hashContexts = {};
        data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "manualButtonLabel", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
        data.buffer.push("</button>\n        ");
        return buffer;
    }

    function program8(depth0, data) {

        var buffer = '', hashTypes, hashContexts;
        data.buffer.push("\n        <button id='connect' ");
        hashTypes = {};
        hashContexts = {};
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "connect", {hash: {}, contexts: [depth0], types: ["STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
        data.buffer.push(">Connect</button>\n    ");
        return buffer;
    }

    function program10(depth0, data) {

        var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
        data.buffer.push("\n                    <tr ");
        hashContexts = {'title': depth0};
        hashTypes = {'title': "STRING"};
        options = {hash: {
            'title': ("helpText")
        }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
        data.buffer.push(" ");
        hashContexts = {'on': depth0};
        hashTypes = {'on': "STRING"};
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "editAxis", {hash: {
            'on': ("doubleClick")
        }, contexts: [depth0], types: ["STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
        data.buffer.push(" >\n                        <th>");
        hashTypes = {};
        hashContexts = {};
        data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
        data.buffer.push(":</th>\n                        <td class=\"posAxis\">\n                            ");
        hashTypes = {};
        hashContexts = {};
        stack2 = helpers['if'].call(depth0, "isEditing", {hash: {}, inverse: self.program(13, program13, data), fn: self.program(11, program11, data), contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data});
        if (stack2 || stack2 === 0) {
            data.buffer.push(stack2);
        }
        data.buffer.push("\n                        </td>\n                    </tr>\n                ");
        return buffer;
    }

    function program11(depth0, data) {

        var buffer = '', stack1, hashContexts, hashTypes, options;
        data.buffer.push("\n                                ");
        hashContexts = {'size': depth0, 'value': depth0, 'insert-newline': depth0, 'escape-press': depth0};
        hashTypes = {'size': "STRING", 'value': "ID", 'insert-newline': "STRING", 'escape-press': "STRING"};
        options = {hash: {
            'size': ("6"),
            'value': ("bufferedPosition"),
            'insert-newline': ("acceptChanges"),
            'escape-press': ("cancelChanges")
        }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers['edit-axis'] || (depth0 && depth0['edit-axis'])), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "edit-axis", options))));
        data.buffer.push("\n                            ");
        return buffer;
    }

    function program13(depth0, data) {

        var buffer = '', hashTypes, hashContexts;
        data.buffer.push("\n                                <span class=\"pos\">");
        hashTypes = {};
        hashContexts = {};
        data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "formattedPosition", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
        data.buffer.push("</span>\n                            ");
        return buffer;
    }

    function program15(depth0, data) {


        data.buffer.push("\n                    <div id=\"loader\">&nbsp;</div>\n                ");
    }

    data.buffer.push("<div id=\"header\" ");
    hashContexts = {'class': depth0};
    hashTypes = {'class': "STRING"};
    options = {hash: {
        'class': ("connection.opened:connected")
    }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
    data.buffer.push(">\n    ");
    hashTypes = {};
    hashContexts = {};
    stack2 = helpers['if'].call(depth0, "connection.opened", {hash: {}, inverse: self.program(8, program8, data), fn: self.program(1, program1, data), contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data});
    if (stack2 || stack2 === 0) {
        data.buffer.push(stack2);
    }
    data.buffer.push("\n    <div class=\"control\">\n        <div class=\"position\">\n            <table>\n                <colgroup>\n                    <col>\n                    <col>\n                </colgroup>\n                <tbody>\n                ");
    hashContexts = {'itemController': depth0};
    hashTypes = {'itemController': "STRING"};
    stack2 = helpers.each.call(depth0, "axes", {hash: {
        'itemController': ("axis")
    }, inverse: self.noop, fn: self.program(10, program10, data), contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data});
    if (stack2 || stack2 === 0) {
        data.buffer.push(stack2);
    }
    data.buffer.push("\n                </tbody>\n            </table>\n        </div>\n        <div class=\"controlButtons\">\n            <div class=\"xyBlock\">\n                <button class=\"axisButton\" ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Y+", {hash: {}, contexts: [depth0, depth0], types: ["STRING", "STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push(">Y+</button>\n                <div class=\"centerRow\">\n                    <button class=\"axisButton\" ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "X-", {hash: {}, contexts: [depth0, depth0], types: ["STRING", "STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push(">X-</button>\n                    <button class=\"axisButton\" ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "X+", {hash: {}, contexts: [depth0, depth0], types: ["STRING", "STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push(">X+</button>\n                </div>\n                <button class=\"axisButton\" ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Y-", {hash: {}, contexts: [depth0, depth0], types: ["STRING", "STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push(">Y-</button>\n            </div>\n            <div class=\"zBlock\">\n                <button class=\"axisButton\" ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Z+", {hash: {}, contexts: [depth0, depth0], types: ["STRING", "STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push(">Z+</button>\n                <div>&nbsp;</div>\n                <button class=\"axisButton\" ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Z-", {hash: {}, contexts: [depth0, depth0], types: ["STRING", "STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push(">Z-</button>\n            </div>\n        </div>\n        <div class=\"controlParams\">\n            <table>\n                <tr title=\"mm\">\n                    <th><label for=\"incrementField\">increment:</label></th>\n                    <td>");
    hashContexts = {'type': depth0, 'class': depth0, 'min': depth0, 'max': depth0, 'step': depth0, 'size': depth0, 'value': depth0, 'value': depth0};
    hashTypes = {'type': "ID", 'class': "STRING", 'min': "STRING", 'max': "STRING", 'step': "STRING", 'size': "STRING", 'value': "STRING", 'value': "ID"};
    options = {hash: {
        'type': ("number"),
        'class': ("paramField"),
        'min': ("0"),
        'max': ("100"),
        'step': ("0.01"),
        'size': ("4"),
        'value': ("10"),
        'value': ("increment")
    }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n                </tr>\n                <tr title=\"mm/min\">\n                    <th><label for=\"feedRateField\">feedrate:</label></th>\n                    <td>");
    hashContexts = {'type': depth0, 'class': depth0, 'min': depth0, 'max': depth0, 'step': depth0, 'size': depth0, 'value': depth0, 'value': depth0};
    hashTypes = {'type': "ID", 'class': "STRING", 'min': "STRING", 'max': "STRING", 'step': "STRING", 'size': "STRING", 'value': "STRING", 'value': "ID"};
    options = {hash: {
        'type': ("number"),
        'class': ("paramField"),
        'min': ("0"),
        'max': ("3000"),
        'step': ("10"),
        'size': ("4"),
        'value': ("10"),
        'value': ("jogFeedrate")
    }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n                </tr>\n                <tr title=\"mm/min\">\n                    <th>current speed:</th>\n                    <td><span id=\"currentFeedrate\">");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "feedrate", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("</span></td>\n                </tr>\n                <tr title=\"mm/min\">\n                    <th>current state:</th>\n                    <td><span>");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "displayableState", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("</span></td>\n                </tr>\n            </table>\n            <div class=\"units\">\n                ");
    hashTypes = {};
    hashContexts = {};
    stack2 = helpers['if'].call(depth0, "isBusy", {hash: {}, inverse: self.noop, fn: self.program(15, program15, data), contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data});
    if (stack2 || stack2 === 0) {
        data.buffer.push(stack2);
    }
    data.buffer.push("<span\n                    title=\"ISO units, there is no way to change it.\">mm</span>\n            </div>\n        </div>\n    </div>\n</div>\n<div class=\"camPanel\">\n    <iframe id=\"webView\" src=\"CAM.html\"></iframe>\n</div>");
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

        var buffer = '', stack1, hashTypes, hashContexts, options;
        data.buffer.push("\n        ");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, contexts: [depth0], types: ["STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers.partial || (depth0 && depth0.partial)), stack1 ? stack1.call(depth0, "jobView", options) : helperMissing.call(depth0, "partial", "jobView", options))));
        data.buffer.push("\n    ");
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
Ember.TEMPLATES["jobView"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<div>\n    <dl>\n        <dt>Total Duration:</dt>\n        <dd ");
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
    data.buffer.push("</dd>\n    </dl>\n    <dl>\n        <dt>Bounds (@tool center):</dt>\n        <dd>\n            <table class=\"boundsTable\" style=\"text-align:right;\">\n                <thead>\n                <tr>\n                    <th>&nbsp;</th>\n                    <th>min</th>\n                    <th>max</th>\n                </tr>\n                </thead>\n                <tbody>\n                <tr>\n                    <th>X</th>\n                    <td>");
    hashTypes = {};
    hashContexts = {};
    options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.min.x", options) : helperMissing.call(depth0, "num", "bbox.min.x", options))));
    data.buffer.push("</td>\n                    <td>");
    hashTypes = {};
    hashContexts = {};
    options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.max.x", options) : helperMissing.call(depth0, "num", "bbox.max.x", options))));
    data.buffer.push("</td>\n                </tr>\n                <tr>\n                    <th>Y</th>\n                    <td>");
    hashTypes = {};
    hashContexts = {};
    options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.min.y", options) : helperMissing.call(depth0, "num", "bbox.min.y", options))));
    data.buffer.push("</td>\n                    <td>");
    hashTypes = {};
    hashContexts = {};
    options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.max.y", options) : helperMissing.call(depth0, "num", "bbox.max.y", options))));
    data.buffer.push("</td>\n                </tr>\n                <tr>\n                    <th>Z</th>\n                    <td>");
    hashTypes = {};
    hashContexts = {};
    options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.min.z", options) : helperMissing.call(depth0, "num", "bbox.min.z", options))));
    data.buffer.push("</td>\n                    <td>");
    hashTypes = {};
    hashContexts = {};
    options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers.num || (depth0 && depth0.num)), stack1 ? stack1.call(depth0, "bbox.max.z", options) : helperMissing.call(depth0, "num", "bbox.max.z", options))));
    data.buffer.push("</td>\n                </tr>\n                </tbody>\n            </table>\n        </dd>\n    </dl>\n</div>");
    return buffer;

});
Ember.TEMPLATES["operation"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<div>\n    <table class=\"form\">\n        <tbody>\n        <tr class=\"form-header\">\n            <th>Name:</th>\n            <td>");
    hashContexts = {'value': depth0, 'placeholder': depth0};
    hashTypes = {'value': "ID", 'placeholder': "STRING"};
    options = {hash: {
        'value': ("name"),
        'placeholder': ("name")
    }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push(" </td>\n        </tr>\n        <tr>\n            <th>Type</th>\n            <td>");
    hashContexts = {'value': depth0, 'content': depth0, 'optionValuePath': depth0, 'optionLabelPath': depth0};
    hashTypes = {'value': "ID", 'content': "ID", 'optionValuePath': "STRING", 'optionLabelPath': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash: {
        'value': ("type"),
        'content': ("operationDescriptors"),
        'optionValuePath': ("content.class"),
        'optionLabelPath': ("content.label")
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th>Inside Shape</th>\n            <td>");
    hashContexts = {'type': depth0, 'checked': depth0};
    hashTypes = {'type': "STRING", 'checked': "ID"};
    options = {hash: {
        'type': ("checkbox"),
        'checked': ("inside")
    }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n        </tr>\n        ");
    hashTypes = {};
    hashContexts = {};
    options = {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
    data.buffer.push(escapeExpression(((stack1 = helpers.partial || (depth0 && depth0.partial)), stack1 ? stack1.call(depth0, "specialTemplate", options) : helperMissing.call(depth0, "partial", "specialTemplate", options))));
    data.buffer.push("\n        </tbody>\n    </table>\n</div>");
    return buffer;

});
Ember.TEMPLATES["rampingContour"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', hashContexts, hashTypes, escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th>Start Z:</th>\n    <td>");
    hashContexts = {'value': depth0};
    hashTypes = {'value': "ID"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("startZ")
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th>Stop Z:</th>\n    <td>");
    hashContexts = {'value': depth0};
    hashTypes = {'value': "ID"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("stopZ")
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th># of turns:</th>\n    <td>");
    hashContexts = {'value': depth0, 'min': depth0, 'step': depth0};
    hashTypes = {'value': "ID", 'min': "STRING", 'step': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("turns"),
        'min': ("1"),
        'step': ("1")
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("</td>\n</tr>\n");
    return buffer;

});
Ember.TEMPLATES["simpleContour"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', hashContexts, hashTypes, escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th>Contour Z:</th>\n    <td>");
    hashContexts = {'value': depth0};
    hashTypes = {'value': "ID"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("contourZ")
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("</td>\n</tr>\n");
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
Ember.TEMPLATES["visucamApp"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, hashContexts, hashTypes, escapeExpression = this.escapeExpression, helperMissing = helpers.helperMissing, self = this;

    function program1(depth0, data) {

        var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
        data.buffer.push("\n                <li ");
        hashContexts = {'class': depth0};
        hashTypes = {'class': "STRING"};
        options = {hash: {
            'class': ("isCurrent:current")
        }, contexts: [], types: [], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])), stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
        data.buffer.push(">");
        hashTypes = {};
        hashContexts = {};
        options = {hash: {}, inverse: self.noop, fn: self.program(2, program2, data), contexts: [depth0, depth0], types: ["STRING", "ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data};
        stack2 = ((stack1 = helpers['link-to'] || (depth0 && depth0['link-to'])), stack1 ? stack1.call(depth0, "operation", "", options) : helperMissing.call(depth0, "link-to", "operation", "", options));
        if (stack2 || stack2 === 0) {
            data.buffer.push(stack2);
        }
        data.buffer.push("\n                    <button ");
        hashTypes = {};
        hashContexts = {};
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "delete", {hash: {}, contexts: [depth0], types: ["STRING"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
        data.buffer.push(" title=\"Delete Operation\">X</button>\n                </li>\n            ");
        return buffer;
    }

    function program2(depth0, data) {

        var hashTypes, hashContexts;
        hashTypes = {};
        hashContexts = {};
        data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    }

    function program4(depth0, data) {


        data.buffer.push("\n                No operation yet.\n            ");
    }

    data.buffer.push("<div class=\"application\">\n    <div class=\"job\">\n        <table class=\"form\">\n            <tbody>\n            <tr>\n                <th>Safety Z:</th>\n                <td>");
    hashContexts = {'value': depth0};
    hashTypes = {'value': "ID"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("safetyZ")
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("</td>\n            </tr>\n            <tr>\n                <th>Tool Diameter:</th>\n                <td>");
    hashContexts = {'value': depth0, 'min': depth0};
    hashTypes = {'value': "ID", 'min': "INTEGER"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.NumberView", {hash: {
        'value': ("toolDiameter"),
        'min': (0)
    }, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("</td>\n            </tr>\n            </tbody>\n        </table>\n        <ul class=\"operations\">\n            ");
    hashContexts = {'itemController': depth0};
    hashTypes = {'itemController': "STRING"};
    stack1 = helpers.each.call(depth0, "operations", {hash: {
        'itemController': ("operationListItem")
    }, inverse: self.program(4, program4, data), fn: self.program(1, program1, data), contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data});
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n        </ul>\n    </div>\n    <div class=\"viewContainer\">\n        ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.TreeDView", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n    </div>\n    <div class=\"operation\">\n        ");
    hashTypes = {};
    hashContexts = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash: {}, contexts: [depth0], types: ["ID"], hashContexts: hashContexts, hashTypes: hashTypes, data: data})));
    data.buffer.push("\n    </div>\n</div>");
    return buffer;

});
