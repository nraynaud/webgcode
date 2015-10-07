Ember.TEMPLATES["3DMilling"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    <tr>\n        <th>Tool Angle:</th>\n        <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("3d_vToolAngle"),
    'min': (0),
    'max': (180)
  },hashTypes:{'numericValue': "ID",'min': "INTEGER",'max': "INTEGER"},hashContexts:{'numericValue': depth0,'min': depth0,'max': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n            <span class=\"input-group-addon\">°</span></td>\n    </tr>\n    <tr>\n        <th>Tip Diameter:</th>\n        <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("3d_vToolTipDiameter"),
    'min': (0),
    'max': ("job.toolDiameter")
  },hashTypes:{'numericValue': "ID",'min': "INTEGER",'max': "ID"},hashContexts:{'numericValue': depth0,'min': depth0,'max': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n            <span class=\"input-group-addon\">mm</span></td>\n    </tr>\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "task.isPaused", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <td style=\"text-align: right;\">\n                <button class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("><i class=\"fa fa-stop\"></i> Cancel</button>\n            </td>\n            <td>\n                <button class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "resume", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("><i class=\"fa fa-play\"></i> Resume</button>\n            </td>\n        ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <td></td>\n            <td>\n                <button class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "pause", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("><i class=\"fa fa-pause\"></i> Pause <i\n                        class=\"fa fa-cog fa-spin\"></i></button>\n            </td>\n        ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <td></td>\n        <td>\n            <button class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "compute3D", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("><i class=\"fa fa-play\"></i> Compute</button>\n        </td>\n    ");
  return buffer;
  }

  data.buffer.push("<tr>\n    <th>Tool Profile:</th>\n    <td>");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'value': ("3d_toolType"),
    'content': ("toolShapes"),
    'optionValuePath': ("content.id"),
    'optionLabelPath': ("content.label")
  },hashTypes:{'value': "ID",'content': "ID",'optionValuePath': "STRING",'optionLabelPath': "STRING"},hashContexts:{'value': depth0,'content': depth0,'optionValuePath': depth0,'optionLabelPath': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</td>\n</tr>\n");
  stack1 = helpers['if'].call(depth0, "isVTool", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n<tr>\n    <td colspan=\"2\">");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.ToolView", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</td>\n</tr>\n<tr>\n    <th title=\"in all directions\">Leave Stock:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("3d_leaveStock"),
    'min': ("0")
  },hashTypes:{'numericValue': "ID",'min': "STRING"},hashContexts:{'numericValue': depth0,'min': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Start Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("top_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Z slice thickness:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("3d_slice_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Min Z:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("bottom_Z")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th title=\"Engagement in %\">Diametral Engagement:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("3d_diametralEngagement")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n        <span class=\"input-group-addon\">%</span></td>\n</tr>\n<tr>\n    <th title=\"in degrees\">Path Orientation:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("3d_pathOrientation"),
    'min': (-90),
    'max': (90),
    'increment': (1)
  },hashTypes:{'numericValue': "ID",'min': "INTEGER",'max': "INTEGER",'increment': "INTEGER"},hashContexts:{'numericValue': depth0,'min': depth0,'max': depth0,'increment': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n        <span class=\"input-group-addon\">°</span></td>\n</tr>\n<tr>\n    <th title=\"to skip the beginning of the toolpath\">Start:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("3d_startPercent")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n        <span class=\"input-group-addon\">%</span></td>\n</tr>\n<tr>\n    <th title=\"to skip the end of the toolpath\">Stop:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("3d_stopPercent")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">%</span></td>\n</tr>\n<tr>\n    ");
  stack1 = helpers['if'].call(depth0, "task", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(8, program8, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</tr>");
  return buffer;
  
});
Ember.TEMPLATES["3DMilling"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression, self = this;

    function program1(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n    <tr>\n        <th>Tool Angle:</th>\n        <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("3d_vToolAngle"),
                'min': (0),
                'max': (180)
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'max': "INTEGER"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'max': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n            <span class=\"input-group-addon\">°</span></td>\n    </tr>\n    <tr>\n        <th>Tip Diameter:</th>\n        <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("3d_vToolTipDiameter"),
                'min': (0),
                'max': ("job.toolDiameter")
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'max': "ID"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'max': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n            <span class=\"input-group-addon\">mm</span></td>\n    </tr>\n");
        return buffer;
    }

    function program3(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "task.isPaused", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(6, program6, data),
            fn: self.program(4, program4, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n    ");
        return buffer;
    }

    function program4(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <td style=\"text-align: right;\">\n                <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-stop\"></i> Cancel</button>\n            </td>\n            <td>\n                <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "resume", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-play\"></i> Resume</button>\n            </td>\n        ");
        return buffer;
    }

    function program6(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <td></td>\n            <td>\n                <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "pause", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-pause\"></i> Pause <i\n                        class=\"fa fa-cog fa-spin\"></i></button>\n            </td>\n        ");
        return buffer;
    }

    function program8(depth0, data) {

        var buffer = '';
        data.buffer.push("\n        <td></td>\n        <td>\n            <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "compute3D", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-play\"></i> Compute</button>\n        </td>\n    ");
        return buffer;
    }

    data.buffer.push("<tr>\n    <th>Tool Profile:</th>\n    <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
        hash: {
            'value': ("3d_toolType"),
            'content': ("toolShapes"),
            'optionValuePath': ("content.id"),
            'optionLabelPath': ("content.label")
        },
        hashTypes: {'value': "ID", 'content': "ID", 'optionValuePath': "STRING", 'optionLabelPath': "STRING"},
        hashContexts: {'value': depth0, 'content': depth0, 'optionValuePath': depth0, 'optionLabelPath': depth0},
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("</td>\n</tr>\n");
    stack1 = helpers['if'].call(depth0, "isVTool", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.noop,
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n<tr>\n    <td colspan=\"2\">");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.ToolView", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th title=\"in all directions\">Leave Stock:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("3d_leaveStock"),
            'min': ("0")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Start Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("top_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Z slice thickness:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("3d_slice_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Min Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("bottom_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th title=\"Engagement in %\">Diametral Engagement:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("3d_diametralEngagement")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">%</span></td>\n</tr>\n<tr>\n    <th title=\"in degrees\">Path Orientation:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("3d_pathOrientation"),
            'min': (-90),
            'max': (90),
            'increment': (1)
        },
        hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'max': "INTEGER", 'increment': "INTEGER"},
        hashContexts: {'numericValue': depth0, 'min': depth0, 'max': depth0, 'increment': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">°</span></td>\n</tr>\n<tr>\n    <th title=\"to skip the beginning of the toolpath\">Start:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("3d_startPercent")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">%</span></td>\n</tr>\n<tr>\n    <th title=\"to skip the end of the toolpath\">Stop:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("3d_stopPercent")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">%</span></td>\n</tr>\n<tr>\n    ");
    stack1 = helpers['if'].call(depth0, "task", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(8, program8, data),
        fn: self.program(3, program3, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n</tr>");
    return buffer;

});
Ember.TEMPLATES["3DMilling"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression, self = this;

    function program1(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n    <tr>\n        <th>Tool Angle:</th>\n        <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("3d_vToolAngle"),
                'min': (0),
                'max': (180)
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'max': "INTEGER"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'max': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n            <span class=\"input-group-addon\">°</span></td>\n    </tr>\n    <tr>\n        <th>Tip Diameter:</th>\n        <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("3d_vToolTipDiameter"),
                'min': (0),
                'max': ("job.toolDiameter")
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'max': "ID"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'max': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n            <span class=\"input-group-addon\">mm</span></td>\n    </tr>\n");
        return buffer;
    }

    function program3(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "task.isPaused", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(6, program6, data),
            fn: self.program(4, program4, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n    ");
        return buffer;
    }

    function program4(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <td style=\"text-align: right;\">\n                <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-stop\"></i> Cancel</button>\n            </td>\n            <td>\n                <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "resume", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-play\"></i> Resume</button>\n            </td>\n        ");
        return buffer;
    }

    function program6(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <td></td>\n            <td>\n                <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "pause", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-pause\"></i> Pause <i\n                        class=\"fa fa-cog fa-spin\"></i></button>\n            </td>\n        ");
        return buffer;
    }

    function program8(depth0, data) {

        var buffer = '';
        data.buffer.push("\n        <td></td>\n        <td>\n            <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "compute3D", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-play\"></i> Compute</button>\n        </td>\n    ");
        return buffer;
    }

    data.buffer.push("<tr>\n    <th>Tool Profile:</th>\n    <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
        hash: {
            'value': ("3d_toolType"),
            'content': ("toolShapes"),
            'optionValuePath': ("content.id"),
            'optionLabelPath': ("content.label")
        },
        hashTypes: {'value': "ID", 'content': "ID", 'optionValuePath': "STRING", 'optionLabelPath': "STRING"},
        hashContexts: {'value': depth0, 'content': depth0, 'optionValuePath': depth0, 'optionLabelPath': depth0},
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("</td>\n</tr>\n");
    stack1 = helpers['if'].call(depth0, "isVTool", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.noop,
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n<tr>\n    <td colspan=\"2\">");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.ToolView", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th title=\"in all directions\">Leave Stock:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("3d_leaveStock"),
            'min': ("0")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Start Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("top_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Z slice thickness:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("3d_slice_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Min Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("bottom_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th title=\"Engagement in %\">Diametral Engagement:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("3d_diametralEngagement")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">%</span></td>\n</tr>\n<tr>\n    <th title=\"in degrees\">Path Orientation:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("3d_pathOrientation"),
            'min': (-90),
            'max': (90),
            'increment': (1)
        },
        hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'max': "INTEGER", 'increment': "INTEGER"},
        hashContexts: {'numericValue': depth0, 'min': depth0, 'max': depth0, 'increment': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">°</span></td>\n</tr>\n<tr>\n    <th title=\"to skip the beginning of the toolpath\">Start:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("3d_startPercent")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">%</span></td>\n</tr>\n<tr>\n    <th title=\"to skip the end of the toolpath\">Stop:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("3d_stopPercent")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">%</span></td>\n</tr>\n<tr>\n    ");
    stack1 = helpers['if'].call(depth0, "task", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(8, program8, data),
        fn: self.program(3, program3, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n</tr>");
    return buffer;

});
Ember.TEMPLATES["camApp"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'content': ("languages"),
    'value': ("selectedLanguage")
  },hashTypes:{'content': "ID",'value': "ID"},hashContexts:{'content': depth0,'value': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n        ");
  data.buffer.push(escapeExpression((helper = helpers['gcode-editor'] || (depth0 && depth0['gcode-editor']),options={hash:{
    'content': ("code"),
    'annotations': ("errors"),
    'currentRow': ("currentRow")
  },hashTypes:{'content': "ID",'annotations': "ID",'currentRow': "ID"},hashContexts:{'content': depth0,'annotations': depth0,'currentRow': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gcode-editor", options))));
  data.buffer.push("\n    ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n        ");
  data.buffer.push(escapeExpression((helper = helpers['js-editor'] || (depth0 && depth0['js-editor']),options={hash:{
    'content': ("jscode"),
    'annotations': ("errors"),
    'currentRow': ("currentRow")
  },hashTypes:{'content': "ID",'annotations': "ID",'currentRow': "ID"},hashContexts:{'content': depth0,'annotations': depth0,'currentRow': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "js-editor", options))));
  data.buffer.push("\n    ");
  return buffer;
  }

function program7(depth0,data) {
  
  
  data.buffer.push("\n        <div id=\"loader\">&nbsp;</div>\n    ");
  }

function program9(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n        ");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "jobView", options) : helperMissing.call(depth0, "partial", "jobView", options))));
  data.buffer.push("\n    ");
  return buffer;
  }

  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Simulator.GraphicView", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n<div class=\"editBlock\">\n    ");
  stack1 = helpers['if'].call(depth0, "canSelectLanguage", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  stack1 = helpers['if'].call(depth0, "usingGcode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "simulate", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'disabled': ("computing")
  },hashTypes:{'disabled': "STRING"},hashContexts:{'disabled': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Simulate</button>\n    <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "loadBigSample", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'disabled': ("computing")
  },hashTypes:{'disabled': "STRING"},hashContexts:{'disabled': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Load a bigger sample</button>\n\n    ");
  stack1 = helpers['if'].call(depth0, "computing", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>");
  return buffer;
  
});
Ember.TEMPLATES["camApp"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, escapeExpression = this.escapeExpression, helperMissing = helpers.helperMissing, self = this;

    function program1(depth0, data) {

        var buffer = '';
        data.buffer.push("\n        ");
        data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
            hash: {
                'content': ("languages"),
                'value': ("selectedLanguage")
            },
            hashTypes: {'content': "ID", 'value': "ID"},
            hashContexts: {'content': depth0, 'value': depth0},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("\n    ");
        return buffer;
    }

    function program3(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n        ");
        data.buffer.push(escapeExpression((helper = helpers['gcode-editor'] || (depth0 && depth0['gcode-editor']), options = {
            hash: {
                'content': ("code"),
                'annotations': ("errors"),
                'currentRow': ("currentRow")
            },
            hashTypes: {'content': "ID", 'annotations': "ID", 'currentRow': "ID"},
            hashContexts: {'content': depth0, 'annotations': depth0, 'currentRow': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gcode-editor", options))));
        data.buffer.push("\n    ");
        return buffer;
    }

    function program5(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n        ");
        data.buffer.push(escapeExpression((helper = helpers['js-editor'] || (depth0 && depth0['js-editor']), options = {
            hash: {
                'content': ("jscode"),
                'annotations': ("errors"),
                'currentRow': ("currentRow")
            },
            hashTypes: {'content': "ID", 'annotations': "ID", 'currentRow': "ID"},
            hashContexts: {'content': depth0, 'annotations': depth0, 'currentRow': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "js-editor", options))));
        data.buffer.push("\n    ");
        return buffer;
    }

    function program7(depth0, data) {


        data.buffer.push("\n        <div id=\"loader\">&nbsp;</div>\n    ");
    }

    function program9(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n        ");
        data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial), options = {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        }, helper ? helper.call(depth0, "jobView", options) : helperMissing.call(depth0, "partial", "jobView", options))));
        data.buffer.push("\n    ");
        return buffer;
    }

    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Simulator.GraphicView", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("\n<div class=\"editBlock\">\n    ");
    stack1 = helpers['if'].call(depth0, "canSelectLanguage", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.noop,
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    ");
    stack1 = helpers['if'].call(depth0, "usingGcode", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(5, program5, data),
        fn: self.program(3, program3, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    <button ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "simulate", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["STRING"],
        data: data
    })));
    data.buffer.push(" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
        hash: {
            'disabled': ("computing")
        }, hashTypes: {'disabled': "STRING"}, hashContexts: {'disabled': depth0}, contexts: [], types: [], data: data
    })));
    data.buffer.push(">Simulate</button>\n    <button ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "loadBigSample", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["STRING"],
        data: data
    })));
    data.buffer.push(" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
        hash: {
            'disabled': ("computing")
        }, hashTypes: {'disabled': "STRING"}, hashContexts: {'disabled': depth0}, contexts: [], types: [], data: data
    })));
    data.buffer.push(">Load a bigger sample</button>\n\n    ");
    stack1 = helpers['if'].call(depth0, "computing", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(9, program9, data),
        fn: self.program(7, program7, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n</div>");
    return buffer;

});
Ember.TEMPLATES["camApp"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, escapeExpression = this.escapeExpression, helperMissing = helpers.helperMissing, self = this;

    function program1(depth0, data) {

        var buffer = '';
        data.buffer.push("\n        ");
        data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
            hash: {
                'content': ("languages"),
                'value': ("selectedLanguage")
            },
            hashTypes: {'content': "ID", 'value': "ID"},
            hashContexts: {'content': depth0, 'value': depth0},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("\n    ");
        return buffer;
    }

    function program3(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n        ");
        data.buffer.push(escapeExpression((helper = helpers['gcode-editor'] || (depth0 && depth0['gcode-editor']), options = {
            hash: {
                'content': ("code"),
                'annotations': ("errors"),
                'currentRow': ("currentRow")
            },
            hashTypes: {'content': "ID", 'annotations': "ID", 'currentRow': "ID"},
            hashContexts: {'content': depth0, 'annotations': depth0, 'currentRow': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gcode-editor", options))));
        data.buffer.push("\n    ");
        return buffer;
    }

    function program5(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n        ");
        data.buffer.push(escapeExpression((helper = helpers['js-editor'] || (depth0 && depth0['js-editor']), options = {
            hash: {
                'content': ("jscode"),
                'annotations': ("errors"),
                'currentRow': ("currentRow")
            },
            hashTypes: {'content': "ID", 'annotations': "ID", 'currentRow': "ID"},
            hashContexts: {'content': depth0, 'annotations': depth0, 'currentRow': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "js-editor", options))));
        data.buffer.push("\n    ");
        return buffer;
    }

    function program7(depth0, data) {


        data.buffer.push("\n        <div id=\"loader\">&nbsp;</div>\n    ");
    }

    function program9(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n        ");
        data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial), options = {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        }, helper ? helper.call(depth0, "jobView", options) : helperMissing.call(depth0, "partial", "jobView", options))));
        data.buffer.push("\n    ");
        return buffer;
    }

    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Simulator.GraphicView", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("\n<div class=\"editBlock\">\n    ");
    stack1 = helpers['if'].call(depth0, "canSelectLanguage", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.noop,
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    ");
    stack1 = helpers['if'].call(depth0, "usingGcode", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(5, program5, data),
        fn: self.program(3, program3, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    <button ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "simulate", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["STRING"],
        data: data
    })));
    data.buffer.push(" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
        hash: {
            'disabled': ("computing")
        }, hashTypes: {'disabled': "STRING"}, hashContexts: {'disabled': depth0}, contexts: [], types: [], data: data
    })));
    data.buffer.push(">Simulate</button>\n    <button ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "loadBigSample", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["STRING"],
        data: data
    })));
    data.buffer.push(" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
        hash: {
            'disabled': ("computing")
        }, hashTypes: {'disabled': "STRING"}, hashContexts: {'disabled': depth0}, contexts: [], types: [], data: data
    })));
    data.buffer.push(">Load a bigger sample</button>\n\n    ");
    stack1 = helpers['if'].call(depth0, "computing", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(9, program9, data),
        fn: self.program(7, program7, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n</div>");
    return buffer;

});
Ember.TEMPLATES["controllerPanel"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "isProgramRunnable", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "isProgramAbortable", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "isResumable", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "isManualModeTogglable", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "isHomable", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <div class=\"control\">\n            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":estopframe toolProbe")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Tool Probe</div>\n            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":estopframe estop")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">E-STOP</div>\n            <div class=\"io\">\n                <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":spindle spindleRunning spindleUpToSpeed")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Spindle <br>\n                    <button class=\"btn btn-sm\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleSpindle", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "spindleButtonLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</button>\n                </div>\n                <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":socket socketOn")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Socket <br>\n                    <button class=\"btn btn-sm\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleSocket", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "socketButtonLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</button>\n                </div>\n            </div>\n            <div class=\"position\">\n                <table>\n                    <colgroup>\n                        <col>\n                        <col align=\"char\" char=\".\">\n                        <col align=\"char\" char=\".\">\n                    </colgroup>\n                    <tbody>\n                    <tr class=\"positionHeader\">\n                        <th></th>\n                        <th title=\"Position\">Position</th>\n                        <th title=\"Work Offset\">Work Offset</th>\n                    </tr>\n                    ");
  stack1 = helpers.each.call(depth0, "axes", {hash:{
    'itemController': ("axis")
  },hashTypes:{'itemController': "STRING"},hashContexts:{'itemController': depth0},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </tbody>\n                </table>\n            </div>\n            <div class=\"controlButtons\">\n                <div class=\"xyBlock\">\n                    <button class=\"axisButton btn btn-xs\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Y+", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push("><i class=\"fa fa-arrow-up\"></i> Y+\n                    </button>\n                    <div class=\"centerRow\">\n                        <button class=\"axisButton btn btn-xs\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "X-", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push("><i class=\"fa fa-arrow-left\"></i>\n                            X-\n                        </button>\n                        <button class=\"axisButton btn btn-xs\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "X+", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">X+ <i\n                                class=\"fa fa-arrow-right\"></i></button>\n                    </div>\n                    <button class=\"axisButton btn btn-xs\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Y-", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push("><i class=\"fa fa-arrow-down\"></i> Y-\n                    </button>\n                </div>\n                <div class=\"zBlock\">\n                    <button class=\"axisButton btn btn-xs\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Z+", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push("><i class=\"fa fa-arrow-circle-up\"></i>\n                        Z+\n                    </button>\n                    <div>&nbsp;</div>\n                    <button class=\"axisButton btn btn-xs\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Z-", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push("><i\n                            class=\"fa fa-arrow-circle-down\"></i> Z-\n                    </button>\n                </div>\n            </div>\n            <div class=\"controlParams\">\n                <table>\n                    <tr title=\"mm\">\n                        <th><label for=\"incrementField\">increment:</label></th>\n                        <td>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("number"),
    'class': ("paramField"),
    'min': ("0"),
    'max': ("100"),
    'step': ("0.01"),
    'size': ("4"),
    'value': ("10"),
    'value': ("increment")
  },hashTypes:{'type': "ID",'class': "STRING",'min': "STRING",'max': "STRING",'step': "STRING",'size': "STRING",'value': "STRING",'value': "ID"},hashContexts:{'type': depth0,'class': depth0,'min': depth0,'max': depth0,'step': depth0,'size': depth0,'value': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n                    </tr>\n                    <tr title=\"mm/min\">\n                        <th><label for=\"feedRateField\">feedrate:</label></th>\n                        <td>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("number"),
    'class': ("paramField"),
    'min': ("0"),
    'max': ("3000"),
    'step': ("10"),
    'size': ("4"),
    'value': ("10"),
    'value': ("jogFeedrate")
  },hashTypes:{'type': "ID",'class': "STRING",'min': "STRING",'max': "STRING",'step': "STRING",'size': "STRING",'value': "STRING",'value': "ID"},hashContexts:{'type': depth0,'class': depth0,'min': depth0,'max': depth0,'step': depth0,'size': depth0,'value': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n                    </tr>\n                    <tr title=\"mm/min\">\n                        <th>current speed:</th>\n                        <td><span id=\"currentFeedrate\">");
  stack1 = helpers._triageMustache.call(depth0, "feedrate", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span></td>\n                    </tr>\n                    <tr title=\"mm/min\">\n                        <th>current state:</th>\n                        <td><span>");
  stack1 = helpers._triageMustache.call(depth0, "displayableState", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span></td>\n                    </tr>\n                </table>\n                <div class=\"units\">\n                    ");
  stack1 = helpers['if'].call(depth0, "isBusy", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(21, program21, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<span\n                        title=\"ISO units, there is no way to change it.\">mm</span>\n                </div>\n            </div>\n        </div>\n    ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <button class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sendProgram", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><i class=\"fa fa-play\"></i> Send Program</button>\n        ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <button class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "abort", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><i class=\"fa fa-eject\"></i> Abort</button>\n        ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <button class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "resumeProgram", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><i class=\"fa fa-play\"></i> Resume</button>\n        ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <button class=\"btn btn-default\" id='manualControl' ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "setManualMode", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><i\n                    class=\"fa fa-arrows-alt\"></i> ");
  stack1 = helpers._triageMustache.call(depth0, "manualButtonLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </button>\n        ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <button class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "home", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><i class=\"fa fa-home\"></i> Home</button>\n        ");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        <tr ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'title': ("helpText")
  },hashTypes:{'title': "STRING"},hashContexts:{'title': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":axis limit homed")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                            <th>");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(":</th>\n                            <td class=\"posAxis\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "editAxisPosition", {hash:{
    'on': ("doubleClick")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" >\n                                ");
  stack1 = helpers['if'].call(depth0, "isEditingPosition", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(15, program15, data),fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                            </td>\n                            <td class=\"axisOffset\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "editAxisOffset", {hash:{
    'on': ("doubleClick")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" >\n                                ");
  stack1 = helpers['if'].call(depth0, "isEditingOffset", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(19, program19, data),fn:self.program(17, program17, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n                            </td>\n                        </tr>\n                    ");
  return buffer;
  }
function program13(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                                    ");
  data.buffer.push(escapeExpression((helper = helpers['edit-axis'] || (depth0 && depth0['edit-axis']),options={hash:{
    'class': ("input-sm"),
    'size': ("8"),
    'numericValue': ("bufferedPosition"),
    'insert-newline': ("acceptPositionChanges"),
    'escape-press': ("cancelChanges")
  },hashTypes:{'class': "STRING",'size': "STRING",'numericValue': "ID",'insert-newline': "STRING",'escape-press': "STRING"},hashContexts:{'class': depth0,'size': depth0,'numericValue': depth0,'insert-newline': depth0,'escape-press': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "edit-axis", options))));
  data.buffer.push("\n                                ");
  return buffer;
  }

function program15(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                    <span class=\"pos\">");
  stack1 = helpers._triageMustache.call(depth0, "formattedPosition", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                                ");
  return buffer;
  }

function program17(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                                    ");
  data.buffer.push(escapeExpression((helper = helpers['edit-axis'] || (depth0 && depth0['edit-axis']),options={hash:{
    'class': ("input-sm"),
    'size': ("!"),
    'numericValue': ("bufferedOffset"),
    'insert-newline': ("acceptOffsetChanges"),
    'escape-press': ("cancelChanges")
  },hashTypes:{'class': "STRING",'size': "STRING",'numericValue': "ID",'insert-newline': "STRING",'escape-press': "STRING"},hashContexts:{'class': depth0,'size': depth0,'numericValue': depth0,'insert-newline': depth0,'escape-press': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "edit-axis", options))));
  data.buffer.push("\n                                ");
  return buffer;
  }

function program19(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                    <span class=\"pos\">");
  stack1 = helpers._triageMustache.call(depth0, "formattedOffset", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                                ");
  return buffer;
  }

function program21(depth0,data) {
  
  
  data.buffer.push("\n                        <div id=\"loader\"><i class=\"fa fa-spinner fa-spin\"></i></div>\n                    ");
  }

function program23(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <button id='connect' ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "connect", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" class=\"btn btn-default\"><i class=\"fa fa-plug\"></i> Connect</button>\n    ");
  return buffer;
  }

  data.buffer.push("<div id=\"header\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("connection.opened:connected")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n    ");
  stack1 = helpers['if'].call(depth0, "connection.opened", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(23, program23, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n<div class=\"camPanel\">\n    <iframe id=\"webView\" src=\"visucamTest.html\"></iframe>\n</div>");
  return buffer;
  
});
Ember.TEMPLATES["controllerPanel"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, escapeExpression = this.escapeExpression, helperMissing = helpers.helperMissing, self = this;

    function program1(depth0, data) {

        var buffer = '', stack1, helper, options;
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "isProgramRunnable", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(2, program2, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "isProgramAbortable", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(4, program4, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "isResumable", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(6, program6, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "isManualModeTogglable", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(8, program8, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "isHomable", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(10, program10, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n\n        <div class=\"control\">\n            <div ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': (":estopframe toolProbe")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(">Tool Probe</div>\n            <div ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': (":estopframe estop")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(">E-STOP</div>\n            <div class=\"io\">\n                <div ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': (":spindle spindleRunning spindleUpToSpeed")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(">Spindle <br>\n                    <button class=\"btn btn-sm\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleSpindle", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(">");
        stack1 = helpers._triageMustache.call(depth0, "spindleButtonLabel", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</button>\n                </div>\n                <div ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': (":socket socketOn")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(">Socket <br>\n                    <button class=\"btn btn-sm\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleSocket", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(">");
        stack1 = helpers._triageMustache.call(depth0, "socketButtonLabel", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</button>\n                </div>\n            </div>\n            <div class=\"position\">\n                <table>\n                    <colgroup>\n                        <col>\n                        <col align=\"char\" char=\".\">\n                        <col align=\"char\" char=\".\">\n                    </colgroup>\n                    <tbody>\n                    <tr class=\"positionHeader\">\n                        <th></th>\n                        <th title=\"Position\">Position</th>\n                        <th title=\"Work Offset\">Work Offset</th>\n                    </tr>\n                    ");
        stack1 = helpers.each.call(depth0, "axes", {
            hash: {
                'itemController': ("axis")
            },
            hashTypes: {'itemController': "STRING"},
            hashContexts: {'itemController': depth0},
            inverse: self.noop,
            fn: self.program(12, program12, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                    </tbody>\n                </table>\n            </div>\n            <div class=\"controlButtons\">\n                <div class=\"xyBlock\">\n                    <button class=\"axisButton btn btn-xs\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Y+", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0, depth0],
            types: ["STRING", "STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-arrow-up\"></i> Y+\n                    </button>\n                    <div class=\"centerRow\">\n                        <button class=\"axisButton btn btn-xs\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "X-", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0, depth0],
            types: ["STRING", "STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-arrow-left\"></i>\n                            X-\n                        </button>\n                        <button class=\"axisButton btn btn-xs\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "X+", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0, depth0],
            types: ["STRING", "STRING"],
            data: data
        })));
        data.buffer.push(">X+ <i\n                                class=\"fa fa-arrow-right\"></i></button>\n                    </div>\n                    <button class=\"axisButton btn btn-xs\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Y-", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0, depth0],
            types: ["STRING", "STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-arrow-down\"></i> Y-\n                    </button>\n                </div>\n                <div class=\"zBlock\">\n                    <button class=\"axisButton btn btn-xs\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Z+", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0, depth0],
            types: ["STRING", "STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-arrow-circle-up\"></i>\n                        Z+\n                    </button>\n                    <div>&nbsp;</div>\n                    <button class=\"axisButton btn btn-xs\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Z-", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0, depth0],
            types: ["STRING", "STRING"],
            data: data
        })));
        data.buffer.push("><i\n                            class=\"fa fa-arrow-circle-down\"></i> Z-\n                    </button>\n                </div>\n            </div>\n            <div class=\"controlParams\">\n                <table>\n                    <tr title=\"mm\">\n                        <th><label for=\"incrementField\">increment:</label></th>\n                        <td>");
        data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
            hash: {
                'type': ("number"),
                'class': ("paramField"),
                'min': ("0"),
                'max': ("100"),
                'step': ("0.01"),
                'size': ("4"),
                'value': ("10"),
                'value': ("increment")
            },
            hashTypes: {
                'type': "ID",
                'class': "STRING",
                'min': "STRING",
                'max': "STRING",
                'step': "STRING",
                'size': "STRING",
                'value': "STRING",
                'value': "ID"
            },
            hashContexts: {
                'type': depth0,
                'class': depth0,
                'min': depth0,
                'max': depth0,
                'step': depth0,
                'size': depth0,
                'value': depth0,
                'value': depth0
            },
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
        data.buffer.push("</td>\n                    </tr>\n                    <tr title=\"mm/min\">\n                        <th><label for=\"feedRateField\">feedrate:</label></th>\n                        <td>");
        data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
            hash: {
                'type': ("number"),
                'class': ("paramField"),
                'min': ("0"),
                'max': ("3000"),
                'step': ("10"),
                'size': ("4"),
                'value': ("10"),
                'value': ("jogFeedrate")
            },
            hashTypes: {
                'type': "ID",
                'class': "STRING",
                'min': "STRING",
                'max': "STRING",
                'step': "STRING",
                'size': "STRING",
                'value': "STRING",
                'value': "ID"
            },
            hashContexts: {
                'type': depth0,
                'class': depth0,
                'min': depth0,
                'max': depth0,
                'step': depth0,
                'size': depth0,
                'value': depth0,
                'value': depth0
            },
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
        data.buffer.push("</td>\n                    </tr>\n                    <tr title=\"mm/min\">\n                        <th>current speed:</th>\n                        <td><span id=\"currentFeedrate\">");
        stack1 = helpers._triageMustache.call(depth0, "feedrate", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</span></td>\n                    </tr>\n                    <tr title=\"mm/min\">\n                        <th>current state:</th>\n                        <td><span>");
        stack1 = helpers._triageMustache.call(depth0, "displayableState", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</span></td>\n                    </tr>\n                </table>\n                <div class=\"units\">\n                    ");
        stack1 = helpers['if'].call(depth0, "isBusy", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(21, program21, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("<span\n                        title=\"ISO units, there is no way to change it.\">mm</span>\n                </div>\n            </div>\n        </div>\n    ");
        return buffer;
    }

    function program2(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "sendProgram", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-play\"></i> Send Program</button>\n        ");
        return buffer;
    }

    function program4(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "abort", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-eject\"></i> Abort</button>\n        ");
        return buffer;
    }

    function program6(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "resumeProgram", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-play\"></i> Resume</button>\n        ");
        return buffer;
    }

    function program8(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n            <button class=\"btn btn-default\" id='manualControl' ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "setManualMode", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i\n                    class=\"fa fa-arrows-alt\"></i> ");
        stack1 = helpers._triageMustache.call(depth0, "manualButtonLabel", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n            </button>\n        ");
        return buffer;
    }

    function program10(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "home", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-home\"></i> Home</button>\n        ");
        return buffer;
    }

    function program12(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                        <tr ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'title': ("helpText")
            }, hashTypes: {'title': "STRING"}, hashContexts: {'title': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(" ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': (":axis limit homed")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(" >\n                            <th>");
        stack1 = helpers._triageMustache.call(depth0, "name", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push(":</th>\n                            <td class=\"posAxis\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "editAxisPosition", {
            hash: {
                'on': ("doubleClick")
            },
            hashTypes: {'on': "STRING"},
            hashContexts: {'on': depth0},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(" >\n                                ");
        stack1 = helpers['if'].call(depth0, "isEditingPosition", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(15, program15, data),
            fn: self.program(13, program13, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                            </td>\n                            <td class=\"axisOffset\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "editAxisOffset", {
            hash: {
                'on': ("doubleClick")
            },
            hashTypes: {'on': "STRING"},
            hashContexts: {'on': depth0},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(" >\n                                ");
        stack1 = helpers['if'].call(depth0, "isEditingOffset", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(19, program19, data),
            fn: self.program(17, program17, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n\n                            </td>\n                        </tr>\n                    ");
        return buffer;
    }

    function program13(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n                                    ");
        data.buffer.push(escapeExpression((helper = helpers['edit-axis'] || (depth0 && depth0['edit-axis']), options = {
            hash: {
                'class': ("input-sm"),
                'size': ("8"),
                'numericValue': ("bufferedPosition"),
                'insert-newline': ("acceptPositionChanges"),
                'escape-press': ("cancelChanges")
            },
            hashTypes: {
                'class': "STRING",
                'size': "STRING",
                'numericValue': "ID",
                'insert-newline': "STRING",
                'escape-press': "STRING"
            },
            hashContexts: {
                'class': depth0,
                'size': depth0,
                'numericValue': depth0,
                'insert-newline': depth0,
                'escape-press': depth0
            },
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "edit-axis", options))));
        data.buffer.push("\n                                ");
        return buffer;
    }

    function program15(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                                    <span class=\"pos\">");
        stack1 = helpers._triageMustache.call(depth0, "formattedPosition", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</span>\n                                ");
        return buffer;
    }

    function program17(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n                                    ");
        data.buffer.push(escapeExpression((helper = helpers['edit-axis'] || (depth0 && depth0['edit-axis']), options = {
            hash: {
                'class': ("input-sm"),
                'size': ("!"),
                'numericValue': ("bufferedOffset"),
                'insert-newline': ("acceptOffsetChanges"),
                'escape-press': ("cancelChanges")
            },
            hashTypes: {
                'class': "STRING",
                'size': "STRING",
                'numericValue': "ID",
                'insert-newline': "STRING",
                'escape-press': "STRING"
            },
            hashContexts: {
                'class': depth0,
                'size': depth0,
                'numericValue': depth0,
                'insert-newline': depth0,
                'escape-press': depth0
            },
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "edit-axis", options))));
        data.buffer.push("\n                                ");
        return buffer;
    }

    function program19(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                                    <span class=\"pos\">");
        stack1 = helpers._triageMustache.call(depth0, "formattedOffset", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</span>\n                                ");
        return buffer;
    }

    function program21(depth0, data) {


        data.buffer.push("\n                        <div id=\"loader\"><i class=\"fa fa-spinner fa-spin\"></i></div>\n                    ");
    }

    function program23(depth0, data) {

        var buffer = '';
        data.buffer.push("\n        <button id='connect' ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "connect", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(" class=\"btn btn-default\"><i class=\"fa fa-plug\"></i> Connect</button>\n    ");
        return buffer;
    }

    data.buffer.push("<div id=\"header\" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
        hash: {
            'class': ("connection.opened:connected")
        }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
    })));
    data.buffer.push(">\n    ");
    stack1 = helpers['if'].call(depth0, "connection.opened", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(23, program23, data),
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n</div>\n<div class=\"camPanel\">\n    <iframe id=\"webView\" src=\"visucamTest.html\"></iframe>\n</div>");
    return buffer;

});
Ember.TEMPLATES["controllerPanel"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, escapeExpression = this.escapeExpression, helperMissing = helpers.helperMissing, self = this;

    function program1(depth0, data) {

        var buffer = '', stack1, helper, options;
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "isProgramRunnable", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(2, program2, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "isProgramAbortable", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(4, program4, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "isResumable", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(6, program6, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "isManualModeTogglable", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(8, program8, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        stack1 = helpers['if'].call(depth0, "isHomable", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(10, program10, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n\n        <div class=\"control\">\n            <div ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': (":estopframe toolProbe")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(">Tool Probe</div>\n            <div ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': (":estopframe estop")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(">E-STOP</div>\n            <div class=\"io\">\n                <div ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': (":spindle spindleRunning spindleUpToSpeed")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(">Spindle <br>\n                    <button class=\"btn btn-sm\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleSpindle", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(">");
        stack1 = helpers._triageMustache.call(depth0, "spindleButtonLabel", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</button>\n                </div>\n                <div ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': (":socket socketOn")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(">Socket <br>\n                    <button class=\"btn btn-sm\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleSocket", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(">");
        stack1 = helpers._triageMustache.call(depth0, "socketButtonLabel", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</button>\n                </div>\n            </div>\n            <div class=\"position\">\n                <table>\n                    <colgroup>\n                        <col>\n                        <col align=\"char\" char=\".\">\n                        <col align=\"char\" char=\".\">\n                    </colgroup>\n                    <tbody>\n                    <tr class=\"positionHeader\">\n                        <th></th>\n                        <th title=\"Position\">Position</th>\n                        <th title=\"Work Offset\">Work Offset</th>\n                    </tr>\n                    ");
        stack1 = helpers.each.call(depth0, "axes", {
            hash: {
                'itemController': ("axis")
            },
            hashTypes: {'itemController': "STRING"},
            hashContexts: {'itemController': depth0},
            inverse: self.noop,
            fn: self.program(12, program12, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                    </tbody>\n                </table>\n            </div>\n            <div class=\"controlButtons\">\n                <div class=\"xyBlock\">\n                    <button class=\"axisButton btn btn-xs\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Y+", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0, depth0],
            types: ["STRING", "STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-arrow-up\"></i> Y+\n                    </button>\n                    <div class=\"centerRow\">\n                        <button class=\"axisButton btn btn-xs\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "X-", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0, depth0],
            types: ["STRING", "STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-arrow-left\"></i>\n                            X-\n                        </button>\n                        <button class=\"axisButton btn btn-xs\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "X+", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0, depth0],
            types: ["STRING", "STRING"],
            data: data
        })));
        data.buffer.push(">X+ <i\n                                class=\"fa fa-arrow-right\"></i></button>\n                    </div>\n                    <button class=\"axisButton btn btn-xs\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Y-", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0, depth0],
            types: ["STRING", "STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-arrow-down\"></i> Y-\n                    </button>\n                </div>\n                <div class=\"zBlock\">\n                    <button class=\"axisButton btn btn-xs\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Z+", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0, depth0],
            types: ["STRING", "STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-arrow-circle-up\"></i>\n                        Z+\n                    </button>\n                    <div>&nbsp;</div>\n                    <button class=\"axisButton btn btn-xs\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "move", "Z-", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0, depth0],
            types: ["STRING", "STRING"],
            data: data
        })));
        data.buffer.push("><i\n                            class=\"fa fa-arrow-circle-down\"></i> Z-\n                    </button>\n                </div>\n            </div>\n            <div class=\"controlParams\">\n                <table>\n                    <tr title=\"mm\">\n                        <th><label for=\"incrementField\">increment:</label></th>\n                        <td>");
        data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
            hash: {
                'type': ("number"),
                'class': ("paramField"),
                'min': ("0"),
                'max': ("100"),
                'step': ("0.01"),
                'size': ("4"),
                'value': ("10"),
                'value': ("increment")
            },
            hashTypes: {
                'type': "ID",
                'class': "STRING",
                'min': "STRING",
                'max': "STRING",
                'step': "STRING",
                'size': "STRING",
                'value': "STRING",
                'value': "ID"
            },
            hashContexts: {
                'type': depth0,
                'class': depth0,
                'min': depth0,
                'max': depth0,
                'step': depth0,
                'size': depth0,
                'value': depth0,
                'value': depth0
            },
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
        data.buffer.push("</td>\n                    </tr>\n                    <tr title=\"mm/min\">\n                        <th><label for=\"feedRateField\">feedrate:</label></th>\n                        <td>");
        data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
            hash: {
                'type': ("number"),
                'class': ("paramField"),
                'min': ("0"),
                'max': ("3000"),
                'step': ("10"),
                'size': ("4"),
                'value': ("10"),
                'value': ("jogFeedrate")
            },
            hashTypes: {
                'type': "ID",
                'class': "STRING",
                'min': "STRING",
                'max': "STRING",
                'step': "STRING",
                'size': "STRING",
                'value': "STRING",
                'value': "ID"
            },
            hashContexts: {
                'type': depth0,
                'class': depth0,
                'min': depth0,
                'max': depth0,
                'step': depth0,
                'size': depth0,
                'value': depth0,
                'value': depth0
            },
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
        data.buffer.push("</td>\n                    </tr>\n                    <tr title=\"mm/min\">\n                        <th>current speed:</th>\n                        <td><span id=\"currentFeedrate\">");
        stack1 = helpers._triageMustache.call(depth0, "feedrate", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</span></td>\n                    </tr>\n                    <tr title=\"mm/min\">\n                        <th>current state:</th>\n                        <td><span>");
        stack1 = helpers._triageMustache.call(depth0, "displayableState", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</span></td>\n                    </tr>\n                </table>\n                <div class=\"units\">\n                    ");
        stack1 = helpers['if'].call(depth0, "isBusy", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(21, program21, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("<span\n                        title=\"ISO units, there is no way to change it.\">mm</span>\n                </div>\n            </div>\n        </div>\n    ");
        return buffer;
    }

    function program2(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "sendProgram", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-play\"></i> Send Program</button>\n        ");
        return buffer;
    }

    function program4(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "abort", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-eject\"></i> Abort</button>\n        ");
        return buffer;
    }

    function program6(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "resumeProgram", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-play\"></i> Resume</button>\n        ");
        return buffer;
    }

    function program8(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n            <button class=\"btn btn-default\" id='manualControl' ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "setManualMode", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i\n                    class=\"fa fa-arrows-alt\"></i> ");
        stack1 = helpers._triageMustache.call(depth0, "manualButtonLabel", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n            </button>\n        ");
        return buffer;
    }

    function program10(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "home", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i class=\"fa fa-home\"></i> Home</button>\n        ");
        return buffer;
    }

    function program12(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                        <tr ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'title': ("helpText")
            }, hashTypes: {'title': "STRING"}, hashContexts: {'title': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(" ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': (":axis limit homed")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(" >\n                            <th>");
        stack1 = helpers._triageMustache.call(depth0, "name", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push(":</th>\n                            <td class=\"posAxis\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "editAxisPosition", {
            hash: {
                'on': ("doubleClick")
            },
            hashTypes: {'on': "STRING"},
            hashContexts: {'on': depth0},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(" >\n                                ");
        stack1 = helpers['if'].call(depth0, "isEditingPosition", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(15, program15, data),
            fn: self.program(13, program13, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                            </td>\n                            <td class=\"axisOffset\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "editAxisOffset", {
            hash: {
                'on': ("doubleClick")
            },
            hashTypes: {'on': "STRING"},
            hashContexts: {'on': depth0},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(" >\n                                ");
        stack1 = helpers['if'].call(depth0, "isEditingOffset", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(19, program19, data),
            fn: self.program(17, program17, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n\n                            </td>\n                        </tr>\n                    ");
        return buffer;
    }

    function program13(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n                                    ");
        data.buffer.push(escapeExpression((helper = helpers['edit-axis'] || (depth0 && depth0['edit-axis']), options = {
            hash: {
                'class': ("input-sm"),
                'size': ("8"),
                'numericValue': ("bufferedPosition"),
                'insert-newline': ("acceptPositionChanges"),
                'escape-press': ("cancelChanges")
            },
            hashTypes: {
                'class': "STRING",
                'size': "STRING",
                'numericValue': "ID",
                'insert-newline': "STRING",
                'escape-press': "STRING"
            },
            hashContexts: {
                'class': depth0,
                'size': depth0,
                'numericValue': depth0,
                'insert-newline': depth0,
                'escape-press': depth0
            },
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "edit-axis", options))));
        data.buffer.push("\n                                ");
        return buffer;
    }

    function program15(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                                    <span class=\"pos\">");
        stack1 = helpers._triageMustache.call(depth0, "formattedPosition", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</span>\n                                ");
        return buffer;
    }

    function program17(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n                                    ");
        data.buffer.push(escapeExpression((helper = helpers['edit-axis'] || (depth0 && depth0['edit-axis']), options = {
            hash: {
                'class': ("input-sm"),
                'size': ("!"),
                'numericValue': ("bufferedOffset"),
                'insert-newline': ("acceptOffsetChanges"),
                'escape-press': ("cancelChanges")
            },
            hashTypes: {
                'class': "STRING",
                'size': "STRING",
                'numericValue': "ID",
                'insert-newline': "STRING",
                'escape-press': "STRING"
            },
            hashContexts: {
                'class': depth0,
                'size': depth0,
                'numericValue': depth0,
                'insert-newline': depth0,
                'escape-press': depth0
            },
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "edit-axis", options))));
        data.buffer.push("\n                                ");
        return buffer;
    }

    function program19(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                                    <span class=\"pos\">");
        stack1 = helpers._triageMustache.call(depth0, "formattedOffset", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</span>\n                                ");
        return buffer;
    }

    function program21(depth0, data) {


        data.buffer.push("\n                        <div id=\"loader\"><i class=\"fa fa-spinner fa-spin\"></i></div>\n                    ");
    }

    function program23(depth0, data) {

        var buffer = '';
        data.buffer.push("\n        <button id='connect' ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "connect", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(" class=\"btn btn-default\"><i class=\"fa fa-plug\"></i> Connect</button>\n    ");
        return buffer;
    }

    data.buffer.push("<div id=\"header\" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
        hash: {
            'class': ("connection.opened:connected")
        }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
    })));
    data.buffer.push(">\n    ");
    stack1 = helpers['if'].call(depth0, "connection.opened", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(23, program23, data),
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n</div>\n<div class=\"camPanel\">\n    <iframe id=\"webView\" src=\"visucamTest.html\"></iframe>\n</div>");
    return buffer;

});
Ember.TEMPLATES["drilling"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<tr>\n    <th>Surface :</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("top_Z")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Bottom Z :</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("bottom_Z")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n");
  return buffer;
  
});
Ember.TEMPLATES["drilling"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th>Surface :</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("top_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Bottom Z :</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("bottom_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n");
    return buffer;

});
Ember.TEMPLATES["drilling"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th>Surface :</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("top_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Bottom Z :</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("bottom_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n");
    return buffer;

});
Ember.TEMPLATES["index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
    data.buffer.push("\n        <h2 style=\"position: relative; height: 90px;\">Your Jobs\n            <button title=\"create new job\" class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createJob", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">+</button>\n            <button class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createExample", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Create An Example</button>\n        </h2>\n        <ul class=\"list-inline\"\n            style=\"display:flex; flex-flow: column wrap; display:-webkit-flex; -webkit-flex-flow: column wrap; overflow-y: hidden; \">\n            ");
  stack1 = helpers.each.call(depth0, "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(5, program5, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n    ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n                <li>");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'classNames': ("list-group-item")
  },hashTypes:{'classNames': "STRING"},hashContexts:{'classNames': depth0},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "job", "_data.job.id", options) : helperMissing.call(depth0, "link-to", "job", "_data.job.id", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</li>\n            ");
  return buffer;
  }
function program3(depth0,data) {
  
  var stack1;
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program5(depth0,data) {
  
  
  data.buffer.push("\n                No job yet.\n            ");
  }

function program7(depth0,data) {
  
  
  data.buffer.push("\n        Welcome, you need to log in before anything else.\n    ");
  }

    data.buffer.push("<div style=\"display: flex; display:-webkit-flex;flex-direction: column;-webkit-flex-direction: column;\n        align-items:inherit;\n        overflow-y: hidden;\n            flex-basis: 320px;\n            flex-grow: 1;\n            flex-shrink: 0;\n            height: 100vh;\n            -webkit-flex-basis: 320px;\n            -webkit-flex-grow: 1;\n            -webkit-flex-shrink: 0;\">\n    ");
  stack1 = helpers['if'].call(depth0, "firebase.isAuthenticated", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(7, program7, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>");
  return buffer;
  
});
Ember.TEMPLATES["index"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, self = this, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;

    function program1(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n        <h2 style=\"position: relative; height: 90px;\">Your Jobs\n            <button title=\"create new job\" class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "createJob", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(">+</button>\n            <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "createExample", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(">Create An Example</button>\n        </h2>\n        <ul class=\"list-inline\"\n            style=\"display:flex; flex-flow: column wrap; display:-webkit-flex; -webkit-flex-flow: column wrap; overflow-y: hidden; \">\n            ");
        stack1 = helpers.each.call(depth0, "model", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(5, program5, data),
            fn: self.program(2, program2, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        </ul>\n    ");
        return buffer;
    }

    function program2(depth0, data) {

        var buffer = '', stack1, helper, options;
        data.buffer.push("\n                <li>");
        stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']), options = {
            hash: {
                'classNames': ("list-group-item")
            },
            hashTypes: {'classNames': "STRING"},
            hashContexts: {'classNames': depth0},
            inverse: self.noop,
            fn: self.program(3, program3, data),
            contexts: [depth0, depth0],
            types: ["STRING", "ID"],
            data: data
        }, helper ? helper.call(depth0, "job", "_data.job.id", options) : helperMissing.call(depth0, "link-to", "job", "_data.job.id", options));
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</li>\n            ");
        return buffer;
    }

    function program3(depth0, data) {

        var stack1;
        stack1 = helpers._triageMustache.call(depth0, "name", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        else {
            data.buffer.push('');
        }
    }

    function program5(depth0, data) {


        data.buffer.push("\n                No job yet.\n            ");
    }

    function program7(depth0, data) {


        data.buffer.push("\n        Welcome, you need to log in before anything else.\n    ");
    }

    data.buffer.push("<div style=\"display: flex; display:-webkit-flex;flex-direction: column;-webkit-flex-direction: column;\n        align-items:inherit;\n        overflow-y: hidden;\n            flex-basis: 320px;\n            flex-grow: 1;\n            flex-shrink: 0;\n            height: 100vh;\n            -webkit-flex-basis: 320px;\n            -webkit-flex-grow: 1;\n            -webkit-flex-shrink: 0;\">\n    ");
    stack1 = helpers['if'].call(depth0, "firebase.isAuthenticated", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(7, program7, data),
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n</div>");
    return buffer;

});
Ember.TEMPLATES["index"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, self = this, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;

    function program1(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n        <h2 style=\"position: relative; height: 90px;\">Your Jobs\n            <button title=\"create new job\" class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "createJob", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(">+</button>\n            <button class=\"btn btn-default\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "createExample", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(">Create An Example</button>\n        </h2>\n        <ul class=\"list-inline\"\n            style=\"display:flex; flex-flow: column wrap; display:-webkit-flex; -webkit-flex-flow: column wrap; overflow-y: hidden; \">\n            ");
        stack1 = helpers.each.call(depth0, "model", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(5, program5, data),
            fn: self.program(2, program2, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        </ul>\n    ");
        return buffer;
    }

    function program2(depth0, data) {

        var buffer = '', stack1, helper, options;
        data.buffer.push("\n                <li>");
        stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']), options = {
            hash: {
                'classNames': ("list-group-item")
            },
            hashTypes: {'classNames': "STRING"},
            hashContexts: {'classNames': depth0},
            inverse: self.noop,
            fn: self.program(3, program3, data),
            contexts: [depth0, depth0],
            types: ["STRING", "ID"],
            data: data
        }, helper ? helper.call(depth0, "job", "_data.job.id", options) : helperMissing.call(depth0, "link-to", "job", "_data.job.id", options));
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</li>\n            ");
        return buffer;
    }

    function program3(depth0, data) {

        var stack1;
        stack1 = helpers._triageMustache.call(depth0, "name", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        else {
            data.buffer.push('');
        }
    }

    function program5(depth0, data) {


        data.buffer.push("\n                No job yet.\n            ");
    }

    function program7(depth0, data) {


        data.buffer.push("\n        Welcome, you need to log in before anything else.\n    ");
    }

    data.buffer.push("<div style=\"display: flex; display:-webkit-flex;flex-direction: column;-webkit-flex-direction: column;\n        align-items:inherit;\n        overflow-y: hidden;\n            flex-basis: 320px;\n            flex-grow: 1;\n            flex-shrink: 0;\n            height: 100vh;\n            -webkit-flex-basis: 320px;\n            -webkit-flex-grow: 1;\n            -webkit-flex-shrink: 0;\">\n    ");
    stack1 = helpers['if'].call(depth0, "firebase.isAuthenticated", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(7, program7, data),
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n</div>");
    return buffer;

});
Ember.TEMPLATES["job"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n            <tr class=\"speedComputerForm\">\n                <th>Tool Flutes:</th>\n                <td>");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("toolFlutes"),
    'min': (1),
    'step': (1)
  },hashTypes:{'numericValue': "ID",'min': "INTEGER",'step': "INTEGER"},hashContexts:{'numericValue': depth0,'min': depth0,'step': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("</td>\n            </tr>\n            <tr class=\"speedComputerForm\">\n                <th title=\"in m/min\">Surface Speed:</th>\n                <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("surfaceSpeed"),
    'min': (1),
    'max': (1000)
  },hashTypes:{'numericValue': "ID",'min': "INTEGER",'max': "INTEGER"},hashContexts:{'numericValue': depth0,'min': depth0,'max': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                    <span class=\"input-group-addon\">m/min</span></td>\n            </tr>\n            <tr class=\"speedComputerForm\">\n                <th title=\"in mm\">Chip Load:</th>\n                <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("chipLoad"),
    'min': ("0.001"),
    'step': ("0.001")
  },hashTypes:{'numericValue': "ID",'min': "STRING",'step': "STRING"},hashContexts:{'numericValue': depth0,'min': depth0,'step': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                    <span class=\"input-group-addon\">mm</span></td>\n            </tr>\n            <tr class=\"speedComputerForm\">\n                <th title=\"in RPM\">Speed:</th>\n                <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("speed"),
    'min': (1),
    'step': (10)
  },hashTypes:{'numericValue': "ID",'min': "INTEGER",'step': "INTEGER"},hashContexts:{'numericValue': depth0,'min': depth0,'step': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                    <span class=\"input-group-addon\">rpm</span></td>\n            </tr>\n            <tr class=\"speedComputerForm speedComputerFormLast\">\n                <th title=\"in mm/min\">Feedrate:</th>\n                <td>");
  stack1 = helpers._triageMustache.call(depth0, "computedFeedrate", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" mm/min</td>\n            </tr>\n        ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n            <tr>\n                <th title=\"in mm/min\">Feedrate:</th>\n                <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("userFeedrate"),
    'min': (10),
    'max': (3000),
    'step': (10)
  },hashTypes:{'numericValue': "ID",'min': "INTEGER",'max': "INTEGER",'step': "INTEGER"},hashContexts:{'numericValue': depth0,'min': depth0,'max': depth0,'step': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                    <span class=\"input-group-addon\">mm/min</span></td>\n            </tr>\n        ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n            ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'classNames': ("list-group-item")
  },hashTypes:{'classNames': "STRING"},hashContexts:{'classNames': depth0},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "shape", "", options) : helperMissing.call(depth0, "link-to", "shape", "", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push(" <span ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleHide", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n                    title=\"Toggle Visibility\" class=\"visibility-button\"><i\n                    class=\"fa fa-eye\"></i></span>\n                <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("visible:shape-visible:shape-hidden")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                <span class=\"delete\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "delete", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" title=\"Delete Shape\" style=\"float:right\"><i\n                        class=\"fa fa-times\"></i></span>");
  return buffer;
  }

function program8(depth0,data) {
  
  
  data.buffer.push("\n            No shape yet. Try dropping a SVG or STL file on the window.\n        ");
  }

function program10(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n            ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'classNames': ("list-group-item")
  },hashTypes:{'classNames': "STRING"},hashContexts:{'classNames': depth0},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "operation", "", options) : helperMissing.call(depth0, "link-to", "operation", "", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program11(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <div class=\"arrow-panel\">\n                    ");
  stack1 = helpers['if'].call(depth0, "isNotFirst", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  stack1 = helpers['if'].call(depth0, "isNotLast", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </div>\n                <span ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleEnabled", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" title=\"include or exclude from job\" class=\"enable-button\"\n                                                 style=\"\"> <i\n                    ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("enabled:fa-check-square-o:fa-square-o :fa")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></i></span>\n                ");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "isRunning", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(18, program18, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "computing", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(20, program20, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                <span class=\"delete\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "delete", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" title=\"Delete Operation\" style=\"float:right\"><i\n                        class=\"fa fa-times\"></i></span>");
  return buffer;
  }
function program12(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                        <div title=\"move operation one position earlier\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveEarlier", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n                             class=\"arrow-button arrow-up\">\n                            <i class=\"fa fa-arrow-up\"></i></div>\n                    ");
  return buffer;
  }

function program14(depth0,data) {
  
  
  data.buffer.push("\n                        <div class=\"arrow-button\">&nbsp;</div>\n                    ");
  }

function program16(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                        <div title=\"move operation one position later\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveLater", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n                             class=\"arrow-button arrow-down\">\n                            <i class=\"fa fa-arrow-down\"></i></div>\n                    ");
  return buffer;
  }

function program18(depth0,data) {
  
  
  data.buffer.push("<i class=\"fa fa-play-circle\" title=\"operation currently running\"></i>");
  }

function program20(depth0,data) {
  
  
  data.buffer.push("<i class=\"fa fa-cog fa-spin\" title=\"computing...\"></i>");
  }

function program22(depth0,data) {
  
  
  data.buffer.push("\n            No operation yet.\n        ");
  }

  data.buffer.push("<div class=\"jobDetail\">\n    <button class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "save", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'disabled': ("saveDisabled")
  },hashTypes:{'disabled': "ID"},hashContexts:{'disabled': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Save</button>\n    <div id=\"deleteBlock\">\n        <div id=\"realDelete\" style=\"display: none;\">\n            ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'id': ("deleteSlider"),
    'type': ("range"),
    'min': (0),
    'max': (1),
    'step': ("0.1"),
    'value': ("deleteSlider")
  },hashTypes:{'id': "STRING",'type': "STRING",'min': "INTEGER",'max': "INTEGER",'step': "STRING",'value': "ID"},hashContexts:{'id': depth0,'type': depth0,'min': depth0,'max': depth0,'step': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n            <span id=\"slideToDelete\">Slide right deletes the job</span>\n            <span id=\"releaseToDelete\" style=\"display: none;font-weight: bold\">Release mouse to delete</span>\n        </div>\n        <div id=\"fakeDelete\">\n            <button class=\"btn btn-default\">Delete</button>\n        </div>\n    </div>\n    <table class=\"form\">\n        <tbody>\n        <tr>\n            <th>Name:</th>\n            <td>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("name"),
    'classNames': ("form-control")
  },hashTypes:{'value': "ID",'classNames': "STRING"},hashContexts:{'value': depth0,'classNames': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th>Safety Z:</th>\n            <td>");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("safetyZ")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th title=\"in mm\">Tool Diameter:</th>\n            <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("toolDiameter"),
    'min': ("0.001"),
    'step': ("0.001")
  },hashTypes:{'numericValue': "ID",'min': "STRING",'step': "STRING"},hashContexts:{'numericValue': depth0,'min': depth0,'step': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                <span class=\"input-group-addon\">mm</span></td>\n        </tr>\n        <tr class=\"speedComputerForm speedComputerFormFirst\">\n            <td colspan=\"2\">");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("computeSpeedFeed")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" Compute Speed and Feed</td>\n        </tr>\n        ");
  stack1 = helpers['if'].call(depth0, "computeSpeedFeed", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <tr>\n            <th title=\"start the spindle before the job, then stop it after completion\">Start Spindle</th>\n            <td>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("startSpindle")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th title=\"switch on the front socket on the controller box during the job\">Switch Socket On</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("startSocket")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th title=\"travel path is displayed in red\">Display Travel</th>\n            <td>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("showTravel")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n        </tr>\n        </tbody>\n    </table>\n    <h2>Shapes\n        <button title=\"create new shape\" class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createShape", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">+</button>\n    </h2>\n    <ul class=\"list-group shapeList\">\n        ");
  stack1 = helpers.each.call(depth0, "shapes", {hash:{
    'itemController': ("shapeListItem")
  },hashTypes:{'itemController': "STRING"},hashContexts:{'itemController': depth0},inverse:self.program(8, program8, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </ul>\n    <h2>Operations\n        <button title=\"create new operation\" class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createOperation", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">+</button>\n    </h2>\n    <div id=\"operationList\" class=\"list-group\">\n        ");
  stack1 = helpers.each.call(depth0, "orderedOperations", {hash:{
    'itemController': ("operationListItem")
  },hashTypes:{'itemController': "STRING"},hashContexts:{'itemController': depth0},inverse:self.program(22, program22, data),fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n</div>\n<div class=\"viewContainer\">\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.ThreeDView", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n</div>\n<div class=\"operation\">\n    ");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>");
  return buffer;
  
});
Ember.TEMPLATES["job"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression, self = this;

    function program1(depth0, data) {

        var buffer = '', stack1, helper, options;
        data.buffer.push("\n            <tr class=\"speedComputerForm\">\n                <th>Tool Flutes:</th>\n                <td>");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("toolFlutes"),
                'min': (1),
                'step': (1)
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'step': "INTEGER"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("</td>\n            </tr>\n            <tr class=\"speedComputerForm\">\n                <th title=\"in m/min\">Surface Speed:</th>\n                <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("surfaceSpeed"),
                'min': (1),
                'max': (1000)
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'max': "INTEGER"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'max': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                    <span class=\"input-group-addon\">m/min</span></td>\n            </tr>\n            <tr class=\"speedComputerForm\">\n                <th title=\"in mm\">Chip Load:</th>\n                <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("chipLoad"),
                'min': ("0.001"),
                'step': ("0.001")
            },
            hashTypes: {'numericValue': "ID", 'min': "STRING", 'step': "STRING"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                    <span class=\"input-group-addon\">mm</span></td>\n            </tr>\n            <tr class=\"speedComputerForm\">\n                <th title=\"in RPM\">Speed:</th>\n                <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("speed"),
                'min': (1),
                'step': (10)
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'step': "INTEGER"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                    <span class=\"input-group-addon\">rpm</span></td>\n            </tr>\n            <tr class=\"speedComputerForm speedComputerFormLast\">\n                <th title=\"in mm/min\">Feedrate:</th>\n                <td>");
        stack1 = helpers._triageMustache.call(depth0, "computedFeedrate", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push(" mm/min</td>\n            </tr>\n        ");
        return buffer;
    }

    function program3(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n            <tr>\n                <th title=\"in mm/min\">Feedrate:</th>\n                <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("userFeedrate"),
                'min': (10),
                'max': (3000),
                'step': (10)
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'max': "INTEGER", 'step': "INTEGER"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'max': depth0, 'step': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                    <span class=\"input-group-addon\">mm/min</span></td>\n            </tr>\n        ");
        return buffer;
    }

    function program5(depth0, data) {

        var buffer = '', stack1, helper, options;
        data.buffer.push("\n            ");
        stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']), options = {
            hash: {
                'classNames': ("list-group-item")
            },
            hashTypes: {'classNames': "STRING"},
            hashContexts: {'classNames': depth0},
            inverse: self.noop,
            fn: self.program(6, program6, data),
            contexts: [depth0, depth0],
            types: ["STRING", "ID"],
            data: data
        }, helper ? helper.call(depth0, "shape", "", options) : helperMissing.call(depth0, "link-to", "shape", "", options));
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        return buffer;
    }

    function program6(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push(" <span ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleHide", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("\n                    title=\"Toggle Visibility\" class=\"visibility-button\"><i\n                    class=\"fa fa-eye\"></i></span>\n                <span ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': ("visible:shape-visible:shape-hidden")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(">");
        stack1 = helpers._triageMustache.call(depth0, "name", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</span>\n                <span class=\"delete\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "delete", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(" title=\"Delete Shape\" style=\"float:right\"><i\n                        class=\"fa fa-times\"></i></span>");
        return buffer;
    }

    function program8(depth0, data) {


        data.buffer.push("\n            No shape yet. Try dropping a SVG or STL file on the window.\n        ");
    }

    function program10(depth0, data) {

        var buffer = '', stack1, helper, options;
        data.buffer.push("\n            ");
        stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']), options = {
            hash: {
                'classNames': ("list-group-item")
            },
            hashTypes: {'classNames': "STRING"},
            hashContexts: {'classNames': depth0},
            inverse: self.noop,
            fn: self.program(11, program11, data),
            contexts: [depth0, depth0],
            types: ["STRING", "ID"],
            data: data
        }, helper ? helper.call(depth0, "operation", "", options) : helperMissing.call(depth0, "link-to", "operation", "", options));
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        return buffer;
    }

    function program11(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                <div class=\"arrow-panel\">\n                    ");
        stack1 = helpers['if'].call(depth0, "isNotFirst", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(14, program14, data),
            fn: self.program(12, program12, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                    ");
        stack1 = helpers['if'].call(depth0, "isNotLast", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(16, program16, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                </div>\n                <span ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleEnabled", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(" title=\"include or exclude from job\" class=\"enable-button\"\n                                                 style=\"\"> <i\n                    ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': ("enabled:fa-check-square-o:fa-square-o :fa")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push("></i></span>\n                ");
        stack1 = helpers._triageMustache.call(depth0, "name", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                ");
        stack1 = helpers['if'].call(depth0, "isRunning", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(18, program18, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                ");
        stack1 = helpers['if'].call(depth0, "computing", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(20, program20, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                <span class=\"delete\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "delete", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(" title=\"Delete Operation\" style=\"float:right\"><i\n                        class=\"fa fa-times\"></i></span>");
        return buffer;
    }

    function program12(depth0, data) {

        var buffer = '';
        data.buffer.push("\n                        <div title=\"move operation one position earlier\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveEarlier", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("\n                             class=\"arrow-button arrow-up\">\n                            <i class=\"fa fa-arrow-up\"></i></div>\n                    ");
        return buffer;
    }

    function program14(depth0, data) {


        data.buffer.push("\n                        <div class=\"arrow-button\">&nbsp;</div>\n                    ");
    }

    function program16(depth0, data) {

        var buffer = '';
        data.buffer.push("\n                        <div title=\"move operation one position later\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveLater", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("\n                             class=\"arrow-button arrow-down\">\n                            <i class=\"fa fa-arrow-down\"></i></div>\n                    ");
        return buffer;
    }

    function program18(depth0, data) {


        data.buffer.push("<i class=\"fa fa-play-circle\" title=\"operation currently running\"></i>");
    }

    function program20(depth0, data) {


        data.buffer.push("<i class=\"fa fa-cog fa-spin\" title=\"computing...\"></i>");
    }

    function program22(depth0, data) {


        data.buffer.push("\n            No operation yet.\n        ");
    }

    data.buffer.push("<div class=\"jobDetail\">\n    <button class=\"btn btn-default\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "save", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push(" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
        hash: {
            'disabled': ("saveDisabled")
        }, hashTypes: {'disabled': "ID"}, hashContexts: {'disabled': depth0}, contexts: [], types: [], data: data
    })));
    data.buffer.push(">Save</button>\n    <div id=\"deleteBlock\">\n        <div id=\"realDelete\" style=\"display: none;\">\n            ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'id': ("deleteSlider"),
            'type': ("range"),
            'min': (0),
            'max': (1),
            'step': ("0.1"),
            'value': ("deleteSlider")
        },
        hashTypes: {
            'id': "STRING",
            'type': "STRING",
            'min': "INTEGER",
            'max': "INTEGER",
            'step': "STRING",
            'value': "ID"
        },
        hashContexts: {'id': depth0, 'type': depth0, 'min': depth0, 'max': depth0, 'step': depth0, 'value': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n            <span id=\"slideToDelete\">Slide right deletes the job</span>\n            <span id=\"releaseToDelete\" style=\"display: none;font-weight: bold\">Release mouse to delete</span>\n        </div>\n        <div id=\"fakeDelete\">\n            <button class=\"btn btn-default\">Delete</button>\n        </div>\n    </div>\n    <table class=\"form\">\n        <tbody>\n        <tr>\n            <th>Name:</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'value': ("name"),
            'classNames': ("form-control")
        },
        hashTypes: {'value': "ID", 'classNames': "STRING"},
        hashContexts: {'value': depth0, 'classNames': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th>Safety Z:</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("safetyZ")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th title=\"in mm\">Tool Diameter:</th>\n            <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("toolDiameter"),
            'min': ("0.001"),
            'step': ("0.001")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING", 'step': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n                <span class=\"input-group-addon\">mm</span></td>\n        </tr>\n        <tr class=\"speedComputerForm speedComputerFormFirst\">\n            <td colspan=\"2\">");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("computeSpeedFeed")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push(" Compute Speed and Feed</td>\n        </tr>\n        ");
    stack1 = helpers['if'].call(depth0, "computeSpeedFeed", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(3, program3, data),
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n        <tr>\n            <th title=\"start the spindle before the job, then stop it after completion\">Start Spindle</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("startSpindle")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th title=\"switch on the front socket on the controller box during the job\">Switch Socket On</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("startSocket")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th title=\"travel path is displayed in red\">Display Travel</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("showTravel")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n        </tr>\n        </tbody>\n    </table>\n    <h2>Shapes\n        <button title=\"create new shape\" class=\"btn btn-default\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "createShape", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["STRING"],
        data: data
    })));
    data.buffer.push(">+</button>\n    </h2>\n    <ul class=\"list-group shapeList\">\n        ");
    stack1 = helpers.each.call(depth0, "shapes", {
        hash: {
            'itemController': ("shapeListItem")
        },
        hashTypes: {'itemController': "STRING"},
        hashContexts: {'itemController': depth0},
        inverse: self.program(8, program8, data),
        fn: self.program(5, program5, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    </ul>\n    <h2>Operations\n        <button title=\"create new operation\" class=\"btn btn-default\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "createOperation", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["STRING"],
        data: data
    })));
    data.buffer.push(">+</button>\n    </h2>\n    <div id=\"operationList\" class=\"list-group\">\n        ");
    stack1 = helpers.each.call(depth0, "orderedOperations", {
        hash: {
            'itemController': ("operationListItem")
        },
        hashTypes: {'itemController': "STRING"},
        hashContexts: {'itemController': depth0},
        inverse: self.program(22, program22, data),
        fn: self.program(10, program10, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    </div>\n</div>\n<div class=\"viewContainer\">\n    ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.ThreeDView", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("\n</div>\n<div class=\"operation\">\n    ");
    stack1 = helpers._triageMustache.call(depth0, "outlet", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n</div>");
    return buffer;

});
Ember.TEMPLATES["job"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression, self = this;

    function program1(depth0, data) {

        var buffer = '', stack1, helper, options;
        data.buffer.push("\n            <tr class=\"speedComputerForm\">\n                <th>Tool Flutes:</th>\n                <td>");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("toolFlutes"),
                'min': (1),
                'step': (1)
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'step': "INTEGER"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("</td>\n            </tr>\n            <tr class=\"speedComputerForm\">\n                <th title=\"in m/min\">Surface Speed:</th>\n                <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("surfaceSpeed"),
                'min': (1),
                'max': (1000)
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'max': "INTEGER"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'max': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                    <span class=\"input-group-addon\">m/min</span></td>\n            </tr>\n            <tr class=\"speedComputerForm\">\n                <th title=\"in mm\">Chip Load:</th>\n                <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("chipLoad"),
                'min': ("0.001"),
                'step': ("0.001")
            },
            hashTypes: {'numericValue': "ID", 'min': "STRING", 'step': "STRING"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                    <span class=\"input-group-addon\">mm</span></td>\n            </tr>\n            <tr class=\"speedComputerForm\">\n                <th title=\"in RPM\">Speed:</th>\n                <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("speed"),
                'min': (1),
                'step': (10)
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'step': "INTEGER"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                    <span class=\"input-group-addon\">rpm</span></td>\n            </tr>\n            <tr class=\"speedComputerForm speedComputerFormLast\">\n                <th title=\"in mm/min\">Feedrate:</th>\n                <td>");
        stack1 = helpers._triageMustache.call(depth0, "computedFeedrate", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push(" mm/min</td>\n            </tr>\n        ");
        return buffer;
    }

    function program3(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n            <tr>\n                <th title=\"in mm/min\">Feedrate:</th>\n                <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("userFeedrate"),
                'min': (10),
                'max': (3000),
                'step': (10)
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'max': "INTEGER", 'step': "INTEGER"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'max': depth0, 'step': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                    <span class=\"input-group-addon\">mm/min</span></td>\n            </tr>\n        ");
        return buffer;
    }

    function program5(depth0, data) {

        var buffer = '', stack1, helper, options;
        data.buffer.push("\n            ");
        stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']), options = {
            hash: {
                'classNames': ("list-group-item")
            },
            hashTypes: {'classNames': "STRING"},
            hashContexts: {'classNames': depth0},
            inverse: self.noop,
            fn: self.program(6, program6, data),
            contexts: [depth0, depth0],
            types: ["STRING", "ID"],
            data: data
        }, helper ? helper.call(depth0, "shape", "", options) : helperMissing.call(depth0, "link-to", "shape", "", options));
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        return buffer;
    }

    function program6(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push(" <span ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleHide", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("\n                    title=\"Toggle Visibility\" class=\"visibility-button\"><i\n                    class=\"fa fa-eye\"></i></span>\n                <span ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': ("visible:shape-visible:shape-hidden")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(">");
        stack1 = helpers._triageMustache.call(depth0, "name", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("</span>\n                <span class=\"delete\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "delete", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(" title=\"Delete Shape\" style=\"float:right\"><i\n                        class=\"fa fa-times\"></i></span>");
        return buffer;
    }

    function program8(depth0, data) {


        data.buffer.push("\n            No shape yet. Try dropping a SVG or STL file on the window.\n        ");
    }

    function program10(depth0, data) {

        var buffer = '', stack1, helper, options;
        data.buffer.push("\n            ");
        stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']), options = {
            hash: {
                'classNames': ("list-group-item")
            },
            hashTypes: {'classNames': "STRING"},
            hashContexts: {'classNames': depth0},
            inverse: self.noop,
            fn: self.program(11, program11, data),
            contexts: [depth0, depth0],
            types: ["STRING", "ID"],
            data: data
        }, helper ? helper.call(depth0, "operation", "", options) : helperMissing.call(depth0, "link-to", "operation", "", options));
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        return buffer;
    }

    function program11(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                <div class=\"arrow-panel\">\n                    ");
        stack1 = helpers['if'].call(depth0, "isNotFirst", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(14, program14, data),
            fn: self.program(12, program12, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                    ");
        stack1 = helpers['if'].call(depth0, "isNotLast", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(16, program16, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                </div>\n                <span ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleEnabled", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(" title=\"include or exclude from job\" class=\"enable-button\"\n                                                 style=\"\"> <i\n                    ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': ("enabled:fa-check-square-o:fa-square-o :fa")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push("></i></span>\n                ");
        stack1 = helpers._triageMustache.call(depth0, "name", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                ");
        stack1 = helpers['if'].call(depth0, "isRunning", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(18, program18, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                ");
        stack1 = helpers['if'].call(depth0, "computing", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(20, program20, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                <span class=\"delete\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "delete", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(" title=\"Delete Operation\" style=\"float:right\"><i\n                        class=\"fa fa-times\"></i></span>");
        return buffer;
    }

    function program12(depth0, data) {

        var buffer = '';
        data.buffer.push("\n                        <div title=\"move operation one position earlier\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveEarlier", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("\n                             class=\"arrow-button arrow-up\">\n                            <i class=\"fa fa-arrow-up\"></i></div>\n                    ");
        return buffer;
    }

    function program14(depth0, data) {


        data.buffer.push("\n                        <div class=\"arrow-button\">&nbsp;</div>\n                    ");
    }

    function program16(depth0, data) {

        var buffer = '';
        data.buffer.push("\n                        <div title=\"move operation one position later\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveLater", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("\n                             class=\"arrow-button arrow-down\">\n                            <i class=\"fa fa-arrow-down\"></i></div>\n                    ");
        return buffer;
    }

    function program18(depth0, data) {


        data.buffer.push("<i class=\"fa fa-play-circle\" title=\"operation currently running\"></i>");
    }

    function program20(depth0, data) {


        data.buffer.push("<i class=\"fa fa-cog fa-spin\" title=\"computing...\"></i>");
    }

    function program22(depth0, data) {


        data.buffer.push("\n            No operation yet.\n        ");
    }

    data.buffer.push("<div class=\"jobDetail\">\n    <button class=\"btn btn-default\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "save", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push(" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
        hash: {
            'disabled': ("saveDisabled")
        }, hashTypes: {'disabled': "ID"}, hashContexts: {'disabled': depth0}, contexts: [], types: [], data: data
    })));
    data.buffer.push(">Save</button>\n    <div id=\"deleteBlock\">\n        <div id=\"realDelete\" style=\"display: none;\">\n            ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'id': ("deleteSlider"),
            'type': ("range"),
            'min': (0),
            'max': (1),
            'step': ("0.1"),
            'value': ("deleteSlider")
        },
        hashTypes: {
            'id': "STRING",
            'type': "STRING",
            'min': "INTEGER",
            'max': "INTEGER",
            'step': "STRING",
            'value': "ID"
        },
        hashContexts: {'id': depth0, 'type': depth0, 'min': depth0, 'max': depth0, 'step': depth0, 'value': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n            <span id=\"slideToDelete\">Slide right deletes the job</span>\n            <span id=\"releaseToDelete\" style=\"display: none;font-weight: bold\">Release mouse to delete</span>\n        </div>\n        <div id=\"fakeDelete\">\n            <button class=\"btn btn-default\">Delete</button>\n        </div>\n    </div>\n    <table class=\"form\">\n        <tbody>\n        <tr>\n            <th>Name:</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'value': ("name"),
            'classNames': ("form-control")
        },
        hashTypes: {'value': "ID", 'classNames': "STRING"},
        hashContexts: {'value': depth0, 'classNames': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th>Safety Z:</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("safetyZ")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th title=\"in mm\">Tool Diameter:</th>\n            <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("toolDiameter"),
            'min': ("0.001"),
            'step': ("0.001")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING", 'step': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n                <span class=\"input-group-addon\">mm</span></td>\n        </tr>\n        <tr class=\"speedComputerForm speedComputerFormFirst\">\n            <td colspan=\"2\">");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("computeSpeedFeed")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push(" Compute Speed and Feed</td>\n        </tr>\n        ");
    stack1 = helpers['if'].call(depth0, "computeSpeedFeed", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(3, program3, data),
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n        <tr>\n            <th title=\"start the spindle before the job, then stop it after completion\">Start Spindle</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("startSpindle")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th title=\"switch on the front socket on the controller box during the job\">Switch Socket On</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("startSocket")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th title=\"travel path is displayed in red\">Display Travel</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("showTravel")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n        </tr>\n        </tbody>\n    </table>\n    <h2>Shapes\n        <button title=\"create new shape\" class=\"btn btn-default\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "createShape", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["STRING"],
        data: data
    })));
    data.buffer.push(">+</button>\n    </h2>\n    <ul class=\"list-group shapeList\">\n        ");
    stack1 = helpers.each.call(depth0, "shapes", {
        hash: {
            'itemController': ("shapeListItem")
        },
        hashTypes: {'itemController': "STRING"},
        hashContexts: {'itemController': depth0},
        inverse: self.program(8, program8, data),
        fn: self.program(5, program5, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    </ul>\n    <h2>Operations\n        <button title=\"create new operation\" class=\"btn btn-default\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "createOperation", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["STRING"],
        data: data
    })));
    data.buffer.push(">+</button>\n    </h2>\n    <div id=\"operationList\" class=\"list-group\">\n        ");
    stack1 = helpers.each.call(depth0, "orderedOperations", {
        hash: {
            'itemController': ("operationListItem")
        },
        hashTypes: {'itemController': "STRING"},
        hashContexts: {'itemController': depth0},
        inverse: self.program(22, program22, data),
        fn: self.program(10, program10, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    </div>\n</div>\n<div class=\"viewContainer\">\n    ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Visucam.ThreeDView", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("\n</div>\n<div class=\"operation\">\n    ");
    stack1 = helpers._triageMustache.call(depth0, "outlet", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n</div>");
    return buffer;

});
Ember.TEMPLATES["jobView"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("<div>\n    <dl>\n        <dt>Total Duration:</dt>\n        <dd ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'title': ("formattedTotalTime.detailed")
  },hashTypes:{'title': "ID"},hashContexts:{'title': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "formattedTotalTime.humanized", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</dd>\n    </dl>\n    <dl>\n        <dt>Bounds (@tool center):</dt>\n        <dd>\n            <table class=\"boundsTable\" style=\"text-align:right;\">\n                <thead>\n                <tr>\n                    <th>&nbsp;</th>\n                    <th>min</th>\n                    <th>max</th>\n                </tr>\n                </thead>\n                <tbody>\n                <tr>\n                    <th>X</th>\n                    <td>");
  data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "bbox.min.x", options) : helperMissing.call(depth0, "num", "bbox.min.x", options))));
  data.buffer.push("</td>\n                    <td>");
  data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "bbox.max.x", options) : helperMissing.call(depth0, "num", "bbox.max.x", options))));
  data.buffer.push("</td>\n                </tr>\n                <tr>\n                    <th>Y</th>\n                    <td>");
  data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "bbox.min.y", options) : helperMissing.call(depth0, "num", "bbox.min.y", options))));
  data.buffer.push("</td>\n                    <td>");
  data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "bbox.max.y", options) : helperMissing.call(depth0, "num", "bbox.max.y", options))));
  data.buffer.push("</td>\n                </tr>\n                <tr>\n                    <th>Z</th>\n                    <td>");
  data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "bbox.min.z", options) : helperMissing.call(depth0, "num", "bbox.min.z", options))));
  data.buffer.push("</td>\n                    <td>");
  data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "bbox.max.z", options) : helperMissing.call(depth0, "num", "bbox.max.z", options))));
  data.buffer.push("</td>\n                </tr>\n                </tbody>\n            </table>\n        </dd>\n    </dl>\n</div>");
  return buffer;
  
});
Ember.TEMPLATES["jobView"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, helper, options, escapeExpression = this.escapeExpression, helperMissing = helpers.helperMissing;


    data.buffer.push("<div>\n    <dl>\n        <dt>Total Duration:</dt>\n        <dd ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
        hash: {
            'title': ("formattedTotalTime.detailed")
        }, hashTypes: {'title': "ID"}, hashContexts: {'title': depth0}, contexts: [], types: [], data: data
    })));
    data.buffer.push(">");
    stack1 = helpers._triageMustache.call(depth0, "formattedTotalTime.humanized", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("</dd>\n    </dl>\n    <dl>\n        <dt>Bounds (@tool center):</dt>\n        <dd>\n            <table class=\"boundsTable\" style=\"text-align:right;\">\n                <thead>\n                <tr>\n                    <th>&nbsp;</th>\n                    <th>min</th>\n                    <th>max</th>\n                </tr>\n                </thead>\n                <tbody>\n                <tr>\n                    <th>X</th>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "bbox.min.x", options) : helperMissing.call(depth0, "num", "bbox.min.x", options))));
    data.buffer.push("</td>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "bbox.max.x", options) : helperMissing.call(depth0, "num", "bbox.max.x", options))));
    data.buffer.push("</td>\n                </tr>\n                <tr>\n                    <th>Y</th>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "bbox.min.y", options) : helperMissing.call(depth0, "num", "bbox.min.y", options))));
    data.buffer.push("</td>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "bbox.max.y", options) : helperMissing.call(depth0, "num", "bbox.max.y", options))));
    data.buffer.push("</td>\n                </tr>\n                <tr>\n                    <th>Z</th>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "bbox.min.z", options) : helperMissing.call(depth0, "num", "bbox.min.z", options))));
    data.buffer.push("</td>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "bbox.max.z", options) : helperMissing.call(depth0, "num", "bbox.max.z", options))));
    data.buffer.push("</td>\n                </tr>\n                </tbody>\n            </table>\n        </dd>\n    </dl>\n</div>");
    return buffer;

});
Ember.TEMPLATES["jobView"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, helper, options, escapeExpression = this.escapeExpression, helperMissing = helpers.helperMissing;


    data.buffer.push("<div>\n    <dl>\n        <dt>Total Duration:</dt>\n        <dd ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
        hash: {
            'title': ("formattedTotalTime.detailed")
        }, hashTypes: {'title': "ID"}, hashContexts: {'title': depth0}, contexts: [], types: [], data: data
    })));
    data.buffer.push(">");
    stack1 = helpers._triageMustache.call(depth0, "formattedTotalTime.humanized", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("</dd>\n    </dl>\n    <dl>\n        <dt>Bounds (@tool center):</dt>\n        <dd>\n            <table class=\"boundsTable\" style=\"text-align:right;\">\n                <thead>\n                <tr>\n                    <th>&nbsp;</th>\n                    <th>min</th>\n                    <th>max</th>\n                </tr>\n                </thead>\n                <tbody>\n                <tr>\n                    <th>X</th>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "bbox.min.x", options) : helperMissing.call(depth0, "num", "bbox.min.x", options))));
    data.buffer.push("</td>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "bbox.max.x", options) : helperMissing.call(depth0, "num", "bbox.max.x", options))));
    data.buffer.push("</td>\n                </tr>\n                <tr>\n                    <th>Y</th>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "bbox.min.y", options) : helperMissing.call(depth0, "num", "bbox.min.y", options))));
    data.buffer.push("</td>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "bbox.max.y", options) : helperMissing.call(depth0, "num", "bbox.max.y", options))));
    data.buffer.push("</td>\n                </tr>\n                <tr>\n                    <th>Z</th>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "bbox.min.z", options) : helperMissing.call(depth0, "num", "bbox.min.z", options))));
    data.buffer.push("</td>\n                    <td>");
    data.buffer.push(escapeExpression((helper = helpers.num || (depth0 && depth0.num), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "bbox.max.z", options) : helperMissing.call(depth0, "num", "bbox.max.z", options))));
    data.buffer.push("</td>\n                </tr>\n                </tbody>\n            </table>\n        </dd>\n    </dl>\n</div>");
    return buffer;

});
Ember.TEMPLATES["loading"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  


  data.buffer.push("<h1><i class=\"fa fa-spinner fa-spin\"></i> LOADING...</h1>");
  
});
Ember.TEMPLATES["loading"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};


    data.buffer.push("<h1><i class=\"fa fa-spinner fa-spin\"></i> LOADING...</h1>");

});
Ember.TEMPLATES["loading"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};


    data.buffer.push("<h1><i class=\"fa fa-spinner fa-spin\"></i> LOADING...</h1>");

});
Ember.TEMPLATES["operation"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div>\n    <table class=\"form\">\n        <tbody>\n        <tr class=\"form-header\">\n            <th>Name:</th>\n            <td>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("name"),
    'placeholder': ("name"),
    'classNames': ("form-control")
  },hashTypes:{'value': "ID",'placeholder': "STRING",'classNames': "STRING"},hashContexts:{'value': depth0,'placeholder': depth0,'classNames': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" </td>\n        </tr>\n        <tr>\n            <th>Type:</th>\n            <td>");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'value': ("type"),
    'content': ("operationDescriptors"),
    'optionValuePath': ("content.class"),
    'optionLabelPath': ("content.label"),
    'classNames': ("form-control")
  },hashTypes:{'value': "ID",'content': "ID",'optionValuePath': "STRING",'optionLabelPath': "STRING",'classNames': "STRING"},hashContexts:{'value': depth0,'content': depth0,'optionValuePath': depth0,'optionLabelPath': depth0,'classNames': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th>Outline:</th>\n            <td>\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'selection': ("outline"),
    'content': ("suitableShapes"),
    'optionValuePath': ("content.id"),
    'optionLabelPath': ("content.name"),
    'classNames': ("form-control")
  },hashTypes:{'selection': "ID",'content': "ID",'optionValuePath': "STRING",'optionLabelPath': "STRING",'classNames': "STRING"},hashContexts:{'selection': depth0,'content': depth0,'optionValuePath': depth0,'optionLabelPath': depth0,'classNames': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            </td>\n        </tr>\n        <tr>\n            <th title=\"Check the box and set a value for an operation specific feedrate. Otherwise the job feed rate will be used.\">\n                Feed Rate\n                Over.:\n            </th>\n            <td class=\"input-group input-group-sm\"><span class=\"input-group-addon\">\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("feedrateOverride")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n            </span>");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("feedrate"),
    'min': (0),
    'max': (3000),
    'step': (10),
    'disabled': ("cannotChangeFeedrate")
  },hashTypes:{'numericValue': "ID",'min': "INTEGER",'max': "INTEGER",'step': "INTEGER",'disabled': "ID"},hashContexts:{'numericValue': depth0,'min': depth0,'max': depth0,'step': depth0,'disabled': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("<span\n                    class=\"input-group-addon\">mm/min</span></td>\n        </tr>        ");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "specialTemplate", options) : helperMissing.call(depth0, "partial", "specialTemplate", options))));
  data.buffer.push("\n        </tbody>\n    </table>\n</div>");
  return buffer;
  
});
Ember.TEMPLATES["operation"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<div>\n    <table class=\"form\">\n        <tbody>\n        <tr class=\"form-header\">\n            <th>Name:</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'value': ("name"),
            'placeholder': ("name"),
            'classNames': ("form-control")
        },
        hashTypes: {'value': "ID", 'placeholder': "STRING", 'classNames': "STRING"},
        hashContexts: {'value': depth0, 'placeholder': depth0, 'classNames': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push(" </td>\n        </tr>\n        <tr>\n            <th>Type:</th>\n            <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
        hash: {
            'value': ("type"),
            'content': ("operationDescriptors"),
            'optionValuePath': ("content.class"),
            'optionLabelPath': ("content.label"),
            'classNames': ("form-control")
        },
        hashTypes: {
            'value': "ID",
            'content': "ID",
            'optionValuePath': "STRING",
            'optionLabelPath': "STRING",
            'classNames': "STRING"
        },
        hashContexts: {
            'value': depth0,
            'content': depth0,
            'optionValuePath': depth0,
            'optionLabelPath': depth0,
            'classNames': depth0
        },
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th>Outline:</th>\n            <td>\n                ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
        hash: {
            'selection': ("outline"),
            'content': ("suitableShapes"),
            'optionValuePath': ("content.id"),
            'optionLabelPath': ("content.name"),
            'classNames': ("form-control")
        },
        hashTypes: {
            'selection': "ID",
            'content': "ID",
            'optionValuePath': "STRING",
            'optionLabelPath': "STRING",
            'classNames': "STRING"
        },
        hashContexts: {
            'selection': depth0,
            'content': depth0,
            'optionValuePath': depth0,
            'optionLabelPath': depth0,
            'classNames': depth0
        },
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("\n            </td>\n        </tr>\n        <tr>\n            <th title=\"Check the box and set a value for an operation specific feedrate. Otherwise the job feed rate will be used.\">\n                Feed Rate\n                Over.:\n            </th>\n            <td class=\"input-group input-group-sm\"><span class=\"input-group-addon\">\n                ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("feedrateOverride")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n            </span>");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("feedrate"),
            'min': (0),
            'max': (3000),
            'step': (10),
            'disabled': ("cannotChangeFeedrate")
        },
        hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'max': "INTEGER", 'step': "INTEGER", 'disabled': "ID"},
        hashContexts: {'numericValue': depth0, 'min': depth0, 'max': depth0, 'step': depth0, 'disabled': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("<span\n                    class=\"input-group-addon\">mm/min</span></td>\n        </tr>        ");
    data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "specialTemplate", options) : helperMissing.call(depth0, "partial", "specialTemplate", options))));
    data.buffer.push("\n        </tbody>\n    </table>\n</div>");
    return buffer;

});
Ember.TEMPLATES["operation"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<div>\n    <table class=\"form\">\n        <tbody>\n        <tr class=\"form-header\">\n            <th>Name:</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'value': ("name"),
            'placeholder': ("name"),
            'classNames': ("form-control")
        },
        hashTypes: {'value': "ID", 'placeholder': "STRING", 'classNames': "STRING"},
        hashContexts: {'value': depth0, 'placeholder': depth0, 'classNames': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push(" </td>\n        </tr>\n        <tr>\n            <th>Type:</th>\n            <td>");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
        hash: {
            'value': ("type"),
            'content': ("operationDescriptors"),
            'optionValuePath': ("content.class"),
            'optionLabelPath': ("content.label"),
            'classNames': ("form-control")
        },
        hashTypes: {
            'value': "ID",
            'content': "ID",
            'optionValuePath': "STRING",
            'optionLabelPath': "STRING",
            'classNames': "STRING"
        },
        hashContexts: {
            'value': depth0,
            'content': depth0,
            'optionValuePath': depth0,
            'optionLabelPath': depth0,
            'classNames': depth0
        },
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("</td>\n        </tr>\n        <tr>\n            <th>Outline:</th>\n            <td>\n                ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
        hash: {
            'selection': ("outline"),
            'content': ("suitableShapes"),
            'optionValuePath': ("content.id"),
            'optionLabelPath': ("content.name"),
            'classNames': ("form-control")
        },
        hashTypes: {
            'selection': "ID",
            'content': "ID",
            'optionValuePath': "STRING",
            'optionLabelPath': "STRING",
            'classNames': "STRING"
        },
        hashContexts: {
            'selection': depth0,
            'content': depth0,
            'optionValuePath': depth0,
            'optionLabelPath': depth0,
            'classNames': depth0
        },
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("\n            </td>\n        </tr>\n        <tr>\n            <th title=\"Check the box and set a value for an operation specific feedrate. Otherwise the job feed rate will be used.\">\n                Feed Rate\n                Over.:\n            </th>\n            <td class=\"input-group input-group-sm\"><span class=\"input-group-addon\">\n                ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("feedrateOverride")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n            </span>");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("feedrate"),
            'min': (0),
            'max': (3000),
            'step': (10),
            'disabled': ("cannotChangeFeedrate")
        },
        hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'max': "INTEGER", 'step': "INTEGER", 'disabled': "ID"},
        hashContexts: {'numericValue': depth0, 'min': depth0, 'max': depth0, 'step': depth0, 'disabled': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("<span\n                    class=\"input-group-addon\">mm/min</span></td>\n        </tr>        ");
    data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "specialTemplate", options) : helperMissing.call(depth0, "partial", "specialTemplate", options))));
    data.buffer.push("\n        </tbody>\n    </table>\n</div>");
    return buffer;

});
Ember.TEMPLATES["operationPocket"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<tr>\n    <th title=\"in mm\">Bottom Z:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("bottom_Z")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th title=\"Engagement in %\">Radial Engagement:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("pocket_engagement"),
    'min': ("0"),
    'increment': ("1"),
    'max': ("100")
  },hashTypes:{'numericValue': "ID",'min': "STRING",'increment': "STRING",'max': "STRING"},hashContexts:{'numericValue': depth0,'min': depth0,'increment': depth0,'max': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n        <span class=\"input-group-addon\">%</span></td>\n</tr>\n<tr>\n    <th title=\"Lateral in mm\">Leave Stock:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
      'numericValue': ("leaveStock"),
    'min': ("0")
  },hashTypes:{'numericValue': "ID",'min': "STRING"},hashContexts:{'numericValue': depth0,'min': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th title=\"Avoid straight plunging\">Ramping Entry:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("pocket_ramping_entry")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n</tr>\n<tr>\n    <th>Ramp Starting Z:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("top_Z"),
    'disabled': ("noRamping")
  },hashTypes:{'numericValue': "ID",'disabled': "ID"},hashContexts:{'numericValue': depth0,'disabled': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th># of Ramping Turns:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("ramping_turns"),
    'min': ("1"),
    'step': ("1"),
    'disabled': ("noRamping"),
    'classNames': ("form-control")
  },hashTypes:{'numericValue': "ID",'min': "STRING",'step': "STRING",'disabled': "ID",'classNames': "STRING"},hashContexts:{'numericValue': depth0,'min': depth0,'step': depth0,'disabled': depth0,'classNames': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n        <span class=\"input-group-addon\">units</span></td>\n</tr>");
  return buffer;
  
});
Ember.TEMPLATES["operationPocket"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th title=\"in mm\">Bottom Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("bottom_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th title=\"Engagement in %\">Radial Engagement:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("pocket_engagement"),
            'min': ("0"),
            'increment': ("1"),
            'max': ("100")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING", 'increment': "STRING", 'max': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0, 'increment': depth0, 'max': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">%</span></td>\n</tr>\n<tr>\n    <th title=\"Lateral in mm\">Leave Stock:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("leaveStock"),
            'min': ("0")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th title=\"Avoid straight plunging\">Ramping Entry:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("pocket_ramping_entry")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th>Ramp Starting Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("top_Z"),
            'disabled': ("noRamping")
        },
        hashTypes: {'numericValue': "ID", 'disabled': "ID"},
        hashContexts: {'numericValue': depth0, 'disabled': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th># of Ramping Turns:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("ramping_turns"),
            'min': ("1"),
            'step': ("1"),
            'disabled': ("noRamping"),
            'classNames': ("form-control")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING", 'step': "STRING", 'disabled': "ID", 'classNames': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0, 'disabled': depth0, 'classNames': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">units</span></td>\n</tr>");
    return buffer;

});
Ember.TEMPLATES["operationPocket"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th title=\"in mm\">Bottom Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("bottom_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th title=\"Engagement in %\">Radial Engagement:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("pocket_engagement"),
            'min': ("0"),
            'increment': ("1"),
            'max': ("100")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING", 'increment': "STRING", 'max': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0, 'increment': depth0, 'max': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">%</span></td>\n</tr>\n<tr>\n    <th title=\"Lateral in mm\">Leave Stock:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("leaveStock"),
            'min': ("0")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th title=\"Avoid straight plunging\">Ramping Entry:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("pocket_ramping_entry")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th>Ramp Starting Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("top_Z"),
            'disabled': ("noRamping")
        },
        hashTypes: {'numericValue': "ID", 'disabled': "ID"},
        hashContexts: {'numericValue': depth0, 'disabled': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th># of Ramping Turns:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("ramping_turns"),
            'min': ("1"),
            'step': ("1"),
            'disabled': ("noRamping"),
            'classNames': ("form-control")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING", 'step': "STRING", 'disabled': "ID", 'classNames': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0, 'disabled': depth0, 'classNames': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">units</span></td>\n</tr>");
    return buffer;

});
Ember.TEMPLATES["rampingContour"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<tr>\n    <th>Inside Shape</th>\n    <td>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("contour_inside")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n</tr>\n<tr>\n    <th>Climb Milling</th>\n    <td>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("contour_climbMilling")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n</tr>\n<tr>\n    <th title=\"How far the tool should stay away from the line in X-Y plane\">Leave Stock:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
      'numericValue': ("leaveStock"),
    'min': ("0")
  },hashTypes:{'numericValue': "ID",'min': "STRING"},hashContexts:{'numericValue': depth0,'min': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Start Z:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("top_Z")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Stop Z:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("bottom_Z")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th># of turns:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("ramping_turns"),
    'min': ("1"),
    'step': ("1")
  },hashTypes:{'numericValue': "ID",'min': "STRING",'step': "STRING"},hashContexts:{'numericValue': depth0,'min': depth0,'step': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n        <span class=\"input-group-addon\">units</span></td>\n</tr>\n");
  return buffer;
  
});
Ember.TEMPLATES["rampingContour"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th>Inside Shape</th>\n    <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("contour_inside")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th>Climb Milling</th>\n    <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("contour_climbMilling")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th title=\"How far the tool should stay away from the line in X-Y plane\">Leave Stock:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("leaveStock"),
            'min': ("0")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Start Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("top_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Stop Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("bottom_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th># of turns:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("ramping_turns"),
            'min': ("1"),
            'step': ("1")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING", 'step': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">units</span></td>\n</tr>\n");
    return buffer;

});
Ember.TEMPLATES["rampingContour"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th>Inside Shape</th>\n    <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("contour_inside")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th>Climb Milling</th>\n    <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("contour_climbMilling")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th title=\"How far the tool should stay away from the line in X-Y plane\">Leave Stock:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("leaveStock"),
            'min': ("0")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Start Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("top_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Stop Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("bottom_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th># of turns:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("ramping_turns"),
            'min': ("1"),
            'step': ("1")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING", 'step': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n        <span class=\"input-group-addon\">units</span></td>\n</tr>\n");
    return buffer;

});
Ember.TEMPLATES["shape"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <tr>\n                <th>Shape:</th>\n                <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'value': ("manualDefinition.type"),
    'content': ("shapeTypes")
  },hashTypes:{'value': "ID",'content': "ID"},hashContexts:{'value': depth0,'content': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</td>\n            </tr>\n            ");
  stack1 = helpers['if'].call(depth0, "isRectangle", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                <tr>\n                    <th>Width:</th>\n                    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("manualDefinition.width")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n                            class=\"input-group-addon\">mm</span></td>\n                </tr>\n                <tr>\n                    <th>Height:</th>\n                    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("manualDefinition.height")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n                            class=\"input-group-addon\">mm</span></td>\n                </tr>\n                <tr>\n                    <th>X Offset:</th>\n                    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("manualDefinition.x")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n                            class=\"input-group-addon\">mm</span></td>\n                </tr>\n                <tr>\n                    <th>Y Offset:</th>\n                    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("manualDefinition.y")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n                            class=\"input-group-addon\">mm</span></td>\n                </tr>\n            ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "isCircle", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program5(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                    <tr>\n                        <th>Radius:</th>\n                        <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("manualDefinition.radius")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                            <span class=\"input-group-addon\">mm</span></td>\n                    </tr>\n                    <tr>\n                        <th>X:</th>\n                        <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("manualDefinition.x")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n                                class=\"input-group-addon\">mm</span></td>\n                    </tr>\n                    <tr>\n                        <th>Y:</th>\n                        <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("manualDefinition.y")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n                                class=\"input-group-addon\">mm</span></td>\n                    </tr>\n                ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    ");
  stack1 = helpers['if'].call(depth0, "isText", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                        <tr>\n                            <th>Text:</th>\n                            <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("manualDefinition.text")
  },hashTypes:{'value': "ID"},hashContexts:{'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n                        </tr>\n                        <tr>\n                            <th>X:</th>\n                            <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("manualDefinition.x")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                                <span class=\"input-group-addon\">mm</span></td>\n                        </tr>\n                        <tr>\n                            <th>Y:</th>\n                            <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("manualDefinition.y")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                                <span class=\"input-group-addon\">mm</span></td>\n                        </tr>\n                        <tr>\n                            <th>Font:</th>\n                            <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'content': ("fonts"),
    'value': ("manualDefinition.fontName"),
    'optionLabelPath': ("content.family"),
    'optionValuePath': ("content.family")
  },hashTypes:{'content': "ID",'value': "ID",'optionLabelPath': "STRING",'optionValuePath': "STRING"},hashContexts:{'content': depth0,'value': depth0,'optionLabelPath': depth0,'optionValuePath': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                            </td>\n                        </tr>\n                        <tr>\n                            <th>Size:</th>\n                            <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("manualDefinition.fontSize")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                                <span class=\"input-group-addon\">mm</span></td>\n                        </tr>\n                    ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        ");
  stack1 = helpers['if'].call(depth0, "isPoint", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  return buffer;
  }
function program11(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                            <tr>\n                                <th>X:</th>\n                                <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("manualDefinition.x")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                                    <span class=\"input-group-addon\">mm</span></td>\n                            </tr>\n                            <tr>\n                                <th>Y:</th>\n                                <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("manualDefinition.y")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                                    <span class=\"input-group-addon\">mm</span></td>\n                            </tr>\n                        ");
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n            <tr>\n                <th title=\"the plane of symmetry is along the Y axis and passes by the center of the bbox\">Flipped:</th>\n                <td>\n                    ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("flipped")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                </td>\n            </tr>\n        ");
  return buffer;
  }

function program15(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        \n        ");
  return buffer;
  }

function program17(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n            <tr>\n                <th>X repetition:</th>\n                <td>\n                    ");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("repetitionX"),
    'min': (1),
    'step': (1)
  },hashTypes:{'numericValue': "ID",'min': "INTEGER",'step': "INTEGER"},hashContexts:{'numericValue': depth0,'min': depth0,'step': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                </td>\n            </tr>\n            <tr>\n                <th>Y repetition:</th>\n                <td>\n                    ");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("repetitionY"),
    'min': (1),
    'step': (1)
  },hashTypes:{'numericValue': "ID",'min': "INTEGER",'step': "INTEGER"},hashContexts:{'numericValue': depth0,'min': depth0,'step': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                </td>\n            </tr>\n            <tr>\n                <th>X Spacing:</th>\n                <td>\n                    ");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("repetitionSpacingX")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                </td>\n            </tr>\n            <tr>\n                <th>Y Spacing:</th>\n                <td>\n                    ");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("repetitionSpacingY")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                </td>\n            </tr>\n        ");
  return buffer;
  }

  data.buffer.push("<div>\n    <table class=\"form\">\n        <tbody>\n        <tr class=\"form-header\">\n            <th>Name:</th>\n            <td>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("name"),
    'placeholder': ("name")
  },hashTypes:{'value': "ID",'placeholder': "STRING"},hashContexts:{'value': depth0,'placeholder': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n        </tr>\n        ");
  stack1 = helpers['if'].call(depth0, "isManual", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(13, program13, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "isPoint", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(17, program17, data),fn:self.program(15, program15, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <tr>\n            <th>Bounds:</th>\n            <td>\n                <table>\n                    <tbody>\n                    <tr>\n                        <th>X:</th>\n                        <td>");
  data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "boundingBox.x.min", options) : helperMissing.call(depth0, "number", "boundingBox.x.min", options))));
  data.buffer.push("</td>\n                        <td>→</td>\n                        <td>");
  data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "boundingBox.x.max", options) : helperMissing.call(depth0, "number", "boundingBox.x.max", options))));
  data.buffer.push("</td>\n                        <td title=\"span\">[");
  data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "boundingBox.x.range", options) : helperMissing.call(depth0, "number", "boundingBox.x.range", options))));
  data.buffer.push("]</td>\n                    </tr>\n                    <tr>\n                        <th>Y:</th>\n                        <td>");
  data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "boundingBox.y.min", options) : helperMissing.call(depth0, "number", "boundingBox.y.min", options))));
  data.buffer.push("</td>\n                        <td>→</td>\n                        <td>");
  data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "boundingBox.y.max", options) : helperMissing.call(depth0, "number", "boundingBox.y.max", options))));
  data.buffer.push("</td>\n                        <td title=\"span\">[");
  data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "boundingBox.y.range", options) : helperMissing.call(depth0, "number", "boundingBox.y.range", options))));
  data.buffer.push("]</td>\n                    </tr>\n                    <tr>\n                        <th>Z:</th>\n                        <td>");
  data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "boundingBox.z.min", options) : helperMissing.call(depth0, "number", "boundingBox.z.min", options))));
  data.buffer.push("</td>\n                        <td>→</td>\n                        <td>");
  data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "boundingBox.z.max", options) : helperMissing.call(depth0, "number", "boundingBox.z.max", options))));
  data.buffer.push("</td>\n                        <td title=\"span\">[");
  data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "boundingBox.z.range", options) : helperMissing.call(depth0, "number", "boundingBox.z.range", options))));
  data.buffer.push("]</td>\n                    </tr>\n                    </tbody>\n                </table>\n            </td>\n        </tr>\n        </tbody>\n    </table>\n\n</div>");
  return buffer;
  
});
Ember.TEMPLATES["shape"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression, self = this;

    function program1(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n            <tr>\n                <th>Shape:</th>\n                <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
            hash: {
                'value': ("manualDefinition.type"),
                'content': ("shapeTypes")
            },
            hashTypes: {'value': "ID", 'content': "ID"},
            hashContexts: {'value': depth0, 'content': depth0},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("</td>\n            </tr>\n            ");
        stack1 = helpers['if'].call(depth0, "isRectangle", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(4, program4, data),
            fn: self.program(2, program2, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        return buffer;
    }

    function program2(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n                <tr>\n                    <th>Width:</th>\n                    <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.width")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push(" <span\n                            class=\"input-group-addon\">mm</span></td>\n                </tr>\n                <tr>\n                    <th>Height:</th>\n                    <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.height")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push(" <span\n                            class=\"input-group-addon\">mm</span></td>\n                </tr>\n                <tr>\n                    <th>X Offset:</th>\n                    <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.x")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push(" <span\n                            class=\"input-group-addon\">mm</span></td>\n                </tr>\n                <tr>\n                    <th>Y Offset:</th>\n                    <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.y")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push(" <span\n                            class=\"input-group-addon\">mm</span></td>\n                </tr>\n            ");
        return buffer;
    }

    function program4(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                ");
        stack1 = helpers['if'].call(depth0, "isCircle", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(7, program7, data),
            fn: self.program(5, program5, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n            ");
        return buffer;
    }

    function program5(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n                    <tr>\n                        <th>Radius:</th>\n                        <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.radius")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                            <span class=\"input-group-addon\">mm</span></td>\n                    </tr>\n                    <tr>\n                        <th>X:</th>\n                        <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.x")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push(" <span\n                                class=\"input-group-addon\">mm</span></td>\n                    </tr>\n                    <tr>\n                        <th>Y:</th>\n                        <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.y")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push(" <span\n                                class=\"input-group-addon\">mm</span></td>\n                    </tr>\n                ");
        return buffer;
    }

    function program7(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                    ");
        stack1 = helpers['if'].call(depth0, "isText", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(10, program10, data),
            fn: self.program(8, program8, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                ");
        return buffer;
    }

    function program8(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n                        <tr>\n                            <th>Text:</th>\n                            <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
            hash: {
                'value': ("manualDefinition.text")
            }, hashTypes: {'value': "ID"}, hashContexts: {'value': depth0}, contexts: [], types: [], data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
        data.buffer.push("</td>\n                        </tr>\n                        <tr>\n                            <th>X:</th>\n                            <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.x")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                                <span class=\"input-group-addon\">mm</span></td>\n                        </tr>\n                        <tr>\n                            <th>Y:</th>\n                            <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.y")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                                <span class=\"input-group-addon\">mm</span></td>\n                        </tr>\n                        <tr>\n                            <th>Font:</th>\n                            <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
            hash: {
                'content': ("fonts"),
                'value': ("manualDefinition.fontName"),
                'optionLabelPath': ("content.family"),
                'optionValuePath': ("content.family")
            },
            hashTypes: {'content': "ID", 'value': "ID", 'optionLabelPath': "STRING", 'optionValuePath': "STRING"},
            hashContexts: {'content': depth0, 'value': depth0, 'optionLabelPath': depth0, 'optionValuePath': depth0},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("\n                            </td>\n                        </tr>\n                        <tr>\n                            <th>Size:</th>\n                            <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.fontSize")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                                <span class=\"input-group-addon\">mm</span></td>\n                        </tr>\n                    ");
        return buffer;
    }

    function program10(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                        ");
        stack1 = helpers['if'].call(depth0, "isPoint", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(11, program11, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                    ");
        return buffer;
    }

    function program11(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n                            <tr>\n                                <th>X:</th>\n                                <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.x")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                                    <span class=\"input-group-addon\">mm</span></td>\n                            </tr>\n                            <tr>\n                                <th>Y:</th>\n                                <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.y")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                                    <span class=\"input-group-addon\">mm</span></td>\n                            </tr>\n                        ");
        return buffer;
    }

    function program13(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n            <tr>\n                <th title=\"the plane of symmetry is along the Y axis and passes by the center of the bbox\">Flipped:</th>\n                <td>\n                    ");
        data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
            hash: {
                'type': ("checkbox"),
                'checked': ("flipped")
            },
            hashTypes: {'type': "STRING", 'checked': "ID"},
            hashContexts: {'type': depth0, 'checked': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
        data.buffer.push("\n                </td>\n            </tr>\n        ");
        return buffer;
    }

    function program15(depth0, data) {

        var buffer = '';
        data.buffer.push("\n        \n        ");
        return buffer;
    }

    function program17(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n            <tr>\n                <th>X repetition:</th>\n                <td>\n                    ");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("repetitionX"),
                'min': (1),
                'step': (1)
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'step': "INTEGER"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                </td>\n            </tr>\n            <tr>\n                <th>Y repetition:</th>\n                <td>\n                    ");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("repetitionY"),
                'min': (1),
                'step': (1)
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'step': "INTEGER"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                </td>\n            </tr>\n            <tr>\n                <th>X Spacing:</th>\n                <td>\n                    ");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("repetitionSpacingX")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                </td>\n            </tr>\n            <tr>\n                <th>Y Spacing:</th>\n                <td>\n                    ");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("repetitionSpacingY")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                </td>\n            </tr>\n        ");
        return buffer;
    }

    data.buffer.push("<div>\n    <table class=\"form\">\n        <tbody>\n        <tr class=\"form-header\">\n            <th>Name:</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'value': ("name"),
            'placeholder': ("name")
        },
        hashTypes: {'value': "ID", 'placeholder': "STRING"},
        hashContexts: {'value': depth0, 'placeholder': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n        </tr>\n        ");
    stack1 = helpers['if'].call(depth0, "isManual", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(13, program13, data),
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n        ");
    stack1 = helpers['if'].call(depth0, "isPoint", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(17, program17, data),
        fn: self.program(15, program15, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n        <tr>\n            <th>Bounds:</th>\n            <td>\n                <table>\n                    <tbody>\n                    <tr>\n                        <th>X:</th>\n                        <td>");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.x.min", options) : helperMissing.call(depth0, "number", "boundingBox.x.min", options))));
    data.buffer.push("</td>\n                        <td>→</td>\n                        <td>");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.x.max", options) : helperMissing.call(depth0, "number", "boundingBox.x.max", options))));
    data.buffer.push("</td>\n                        <td title=\"span\">[");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.x.range", options) : helperMissing.call(depth0, "number", "boundingBox.x.range", options))));
    data.buffer.push("]</td>\n                    </tr>\n                    <tr>\n                        <th>Y:</th>\n                        <td>");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.y.min", options) : helperMissing.call(depth0, "number", "boundingBox.y.min", options))));
    data.buffer.push("</td>\n                        <td>→</td>\n                        <td>");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.y.max", options) : helperMissing.call(depth0, "number", "boundingBox.y.max", options))));
    data.buffer.push("</td>\n                        <td title=\"span\">[");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.y.range", options) : helperMissing.call(depth0, "number", "boundingBox.y.range", options))));
    data.buffer.push("]</td>\n                    </tr>\n                    <tr>\n                        <th>Z:</th>\n                        <td>");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.z.min", options) : helperMissing.call(depth0, "number", "boundingBox.z.min", options))));
    data.buffer.push("</td>\n                        <td>→</td>\n                        <td>");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.z.max", options) : helperMissing.call(depth0, "number", "boundingBox.z.max", options))));
    data.buffer.push("</td>\n                        <td title=\"span\">[");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.z.range", options) : helperMissing.call(depth0, "number", "boundingBox.z.range", options))));
    data.buffer.push("]</td>\n                    </tr>\n                    </tbody>\n                </table>\n            </td>\n        </tr>\n        </tbody>\n    </table>\n\n</div>");
    return buffer;

});
Ember.TEMPLATES["shape"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression, self = this;

    function program1(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n            <tr>\n                <th>Shape:</th>\n                <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
            hash: {
                'value': ("manualDefinition.type"),
                'content': ("shapeTypes")
            },
            hashTypes: {'value': "ID", 'content': "ID"},
            hashContexts: {'value': depth0, 'content': depth0},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("</td>\n            </tr>\n            ");
        stack1 = helpers['if'].call(depth0, "isRectangle", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(4, program4, data),
            fn: self.program(2, program2, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n        ");
        return buffer;
    }

    function program2(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n                <tr>\n                    <th>Width:</th>\n                    <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.width")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push(" <span\n                            class=\"input-group-addon\">mm</span></td>\n                </tr>\n                <tr>\n                    <th>Height:</th>\n                    <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.height")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push(" <span\n                            class=\"input-group-addon\">mm</span></td>\n                </tr>\n                <tr>\n                    <th>X Offset:</th>\n                    <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.x")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push(" <span\n                            class=\"input-group-addon\">mm</span></td>\n                </tr>\n                <tr>\n                    <th>Y Offset:</th>\n                    <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.y")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push(" <span\n                            class=\"input-group-addon\">mm</span></td>\n                </tr>\n            ");
        return buffer;
    }

    function program4(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                ");
        stack1 = helpers['if'].call(depth0, "isCircle", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(7, program7, data),
            fn: self.program(5, program5, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n            ");
        return buffer;
    }

    function program5(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n                    <tr>\n                        <th>Radius:</th>\n                        <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.radius")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                            <span class=\"input-group-addon\">mm</span></td>\n                    </tr>\n                    <tr>\n                        <th>X:</th>\n                        <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.x")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push(" <span\n                                class=\"input-group-addon\">mm</span></td>\n                    </tr>\n                    <tr>\n                        <th>Y:</th>\n                        <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.y")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push(" <span\n                                class=\"input-group-addon\">mm</span></td>\n                    </tr>\n                ");
        return buffer;
    }

    function program7(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                    ");
        stack1 = helpers['if'].call(depth0, "isText", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.program(10, program10, data),
            fn: self.program(8, program8, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                ");
        return buffer;
    }

    function program8(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n                        <tr>\n                            <th>Text:</th>\n                            <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
            hash: {
                'value': ("manualDefinition.text")
            }, hashTypes: {'value': "ID"}, hashContexts: {'value': depth0}, contexts: [], types: [], data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
        data.buffer.push("</td>\n                        </tr>\n                        <tr>\n                            <th>X:</th>\n                            <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.x")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                                <span class=\"input-group-addon\">mm</span></td>\n                        </tr>\n                        <tr>\n                            <th>Y:</th>\n                            <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.y")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                                <span class=\"input-group-addon\">mm</span></td>\n                        </tr>\n                        <tr>\n                            <th>Font:</th>\n                            <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
            hash: {
                'content': ("fonts"),
                'value': ("manualDefinition.fontName"),
                'optionLabelPath': ("content.family"),
                'optionValuePath': ("content.family")
            },
            hashTypes: {'content': "ID", 'value': "ID", 'optionLabelPath': "STRING", 'optionValuePath': "STRING"},
            hashContexts: {'content': depth0, 'value': depth0, 'optionLabelPath': depth0, 'optionValuePath': depth0},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("\n                            </td>\n                        </tr>\n                        <tr>\n                            <th>Size:</th>\n                            <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.fontSize")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                                <span class=\"input-group-addon\">mm</span></td>\n                        </tr>\n                    ");
        return buffer;
    }

    function program10(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                        ");
        stack1 = helpers['if'].call(depth0, "isPoint", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(11, program11, data),
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n                    ");
        return buffer;
    }

    function program11(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n                            <tr>\n                                <th>X:</th>\n                                <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.x")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                                    <span class=\"input-group-addon\">mm</span></td>\n                            </tr>\n                            <tr>\n                                <th>Y:</th>\n                                <td class=\"input-group input-group-sm\">");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("manualDefinition.y")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                                    <span class=\"input-group-addon\">mm</span></td>\n                            </tr>\n                        ");
        return buffer;
    }

    function program13(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n            <tr>\n                <th title=\"the plane of symmetry is along the Y axis and passes by the center of the bbox\">Flipped:</th>\n                <td>\n                    ");
        data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
            hash: {
                'type': ("checkbox"),
                'checked': ("flipped")
            },
            hashTypes: {'type': "STRING", 'checked': "ID"},
            hashContexts: {'type': depth0, 'checked': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
        data.buffer.push("\n                </td>\n            </tr>\n        ");
        return buffer;
    }

    function program15(depth0, data) {

        var buffer = '';
        data.buffer.push("\n        \n        ");
        return buffer;
    }

    function program17(depth0, data) {

        var buffer = '', helper, options;
        data.buffer.push("\n            <tr>\n                <th>X repetition:</th>\n                <td>\n                    ");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("repetitionX"),
                'min': (1),
                'step': (1)
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'step': "INTEGER"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                </td>\n            </tr>\n            <tr>\n                <th>Y repetition:</th>\n                <td>\n                    ");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("repetitionY"),
                'min': (1),
                'step': (1)
            },
            hashTypes: {'numericValue': "ID", 'min': "INTEGER", 'step': "INTEGER"},
            hashContexts: {'numericValue': depth0, 'min': depth0, 'step': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                </td>\n            </tr>\n            <tr>\n                <th>X Spacing:</th>\n                <td>\n                    ");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("repetitionSpacingX")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                </td>\n            </tr>\n            <tr>\n                <th>Y Spacing:</th>\n                <td>\n                    ");
        data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
            hash: {
                'numericValue': ("repetitionSpacingY")
            },
            hashTypes: {'numericValue': "ID"},
            hashContexts: {'numericValue': depth0},
            contexts: [],
            types: [],
            data: data
        }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
        data.buffer.push("\n                </td>\n            </tr>\n        ");
        return buffer;
    }

    data.buffer.push("<div>\n    <table class=\"form\">\n        <tbody>\n        <tr class=\"form-header\">\n            <th>Name:</th>\n            <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'value': ("name"),
            'placeholder': ("name")
        },
        hashTypes: {'value': "ID", 'placeholder': "STRING"},
        hashContexts: {'value': depth0, 'placeholder': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n        </tr>\n        ");
    stack1 = helpers['if'].call(depth0, "isManual", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(13, program13, data),
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n        ");
    stack1 = helpers['if'].call(depth0, "isPoint", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(17, program17, data),
        fn: self.program(15, program15, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n        <tr>\n            <th>Bounds:</th>\n            <td>\n                <table>\n                    <tbody>\n                    <tr>\n                        <th>X:</th>\n                        <td>");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.x.min", options) : helperMissing.call(depth0, "number", "boundingBox.x.min", options))));
    data.buffer.push("</td>\n                        <td>→</td>\n                        <td>");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.x.max", options) : helperMissing.call(depth0, "number", "boundingBox.x.max", options))));
    data.buffer.push("</td>\n                        <td title=\"span\">[");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.x.range", options) : helperMissing.call(depth0, "number", "boundingBox.x.range", options))));
    data.buffer.push("]</td>\n                    </tr>\n                    <tr>\n                        <th>Y:</th>\n                        <td>");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.y.min", options) : helperMissing.call(depth0, "number", "boundingBox.y.min", options))));
    data.buffer.push("</td>\n                        <td>→</td>\n                        <td>");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.y.max", options) : helperMissing.call(depth0, "number", "boundingBox.y.max", options))));
    data.buffer.push("</td>\n                        <td title=\"span\">[");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.y.range", options) : helperMissing.call(depth0, "number", "boundingBox.y.range", options))));
    data.buffer.push("]</td>\n                    </tr>\n                    <tr>\n                        <th>Z:</th>\n                        <td>");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.z.min", options) : helperMissing.call(depth0, "number", "boundingBox.z.min", options))));
    data.buffer.push("</td>\n                        <td>→</td>\n                        <td>");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.z.max", options) : helperMissing.call(depth0, "number", "boundingBox.z.max", options))));
    data.buffer.push("</td>\n                        <td title=\"span\">[");
    data.buffer.push(escapeExpression((helper = helpers.number || (depth0 && depth0.number), options = {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    }, helper ? helper.call(depth0, "boundingBox.z.range", options) : helperMissing.call(depth0, "number", "boundingBox.z.range", options))));
    data.buffer.push("]</td>\n                    </tr>\n                    </tbody>\n                </table>\n            </td>\n        </tr>\n        </tbody>\n    </table>\n\n</div>");
    return buffer;

});
Ember.TEMPLATES["simpleContour"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<tr>\n    <th>Inside Shape</th>\n    <td>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("contour_inside")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n</tr>\n<tr>\n    <th>Climb Milling</th>\n    <td>");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("contour_climbMilling")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n</tr>\n<tr>\n    <th title=\"How far the tool should stay away from the line in X-Y plane\">Leave Stock:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
      'numericValue': ("leaveStock"),
    'min': ("0")
  },hashTypes:{'numericValue': "ID",'min': "STRING"},hashContexts:{'numericValue': depth0,'min': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Contour Z:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("bottom_Z")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n");
  return buffer;
  
});
Ember.TEMPLATES["simpleContour"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th>Inside Shape</th>\n    <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("contour_inside")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th>Climb Milling</th>\n    <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("contour_climbMilling")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th title=\"How far the tool should stay away from the line in X-Y plane\">Leave Stock:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("leaveStock"),
            'min': ("0")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Contour Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("bottom_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n");
    return buffer;

});
Ember.TEMPLATES["simpleContour"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th>Inside Shape</th>\n    <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("contour_inside")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th>Climb Milling</th>\n    <td>");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("checkbox"),
            'checked': ("contour_climbMilling")
        },
        hashTypes: {'type': "STRING", 'checked': "ID"},
        hashContexts: {'type': depth0, 'checked': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("</td>\n</tr>\n<tr>\n    <th title=\"How far the tool should stay away from the line in X-Y plane\">Leave Stock:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("leaveStock"),
            'min': ("0")
        },
        hashTypes: {'numericValue': "ID", 'min': "STRING"},
        hashContexts: {'numericValue': depth0, 'min': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n<tr>\n    <th>Contour Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("bottom_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n");
    return buffer;

});
Ember.TEMPLATES["simpleEngraving"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<tr>\n    <th>engraving Z:</th>\n    <td class=\"input-group input-group-sm\">");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'numericValue': ("bottom_Z")
  },hashTypes:{'numericValue': "ID"},hashContexts:{'numericValue': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n");
  return buffer;
  
});
Ember.TEMPLATES["simpleEngraving"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th>engraving Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("bottom_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n");
    return buffer;

});
Ember.TEMPLATES["simpleEngraving"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', helper, options, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;


    data.buffer.push("<tr>\n    <th>engraving Z:</th>\n    <td class=\"input-group input-group-sm\">");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'numericValue': ("bottom_Z")
        },
        hashTypes: {'numericValue': "ID"},
        hashContexts: {'numericValue': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push(" <span\n            class=\"input-group-addon\">mm</span></td>\n</tr>\n");
    return buffer;

});
Ember.TEMPLATES["textApp"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'content': ("font.variants"),
    'value': ("fontVariant")
  },hashTypes:{'content': "ID",'value': "ID"},hashContexts:{'content': depth0,'value': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                ");
  stack1 = helpers._triageMustache.call(depth0, "font.variants", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }

  data.buffer.push("<div class=\"controls\">\n    <div class=\"controlPanel\">\n        <h3><label for=\"text\">Text</label></h3>\n\n        <div class=\"controlPanelContent\">\n            ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'id': ("text"),
    'valueBinding': ("text"),
    'title': ("your text")
  },hashTypes:{'type': "STRING",'id': "STRING",'valueBinding': "STRING",'title': "STRING"},hashContexts:{'type': depth0,'id': depth0,'valueBinding': depth0,'title': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n        </div>\n    </div>\n    <div class=\"controlPanel\">\n        <h3>Font</h3>\n\n        <div class=\"controlPanelContent\">\n            <label for=\"fontSize\">Size:</label><br>\n            ");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'id': ("fontSize"),
    'placeholder': ("Font Size"),
    'numericValue': ("fontSize"),
    'min': ("0.01"),
    'max': ("500")
  },hashTypes:{'id': "STRING",'placeholder': "STRING",'numericValue': "ID",'min': "STRING",'max': "STRING"},hashContexts:{'id': depth0,'placeholder': depth0,'numericValue': depth0,'min': depth0,'max': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n            <br>\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'content': ("controllers.fonts"),
    'value': ("fontName"),
    'optionLabelPath': ("content.family"),
    'optionValuePath': ("content.family")
  },hashTypes:{'content': "ID",'value': "ID",'optionLabelPath': "STRING",'optionValuePath': "STRING"},hashContexts:{'content': depth0,'value': depth0,'optionLabelPath': depth0,'optionValuePath': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            <br>\n            ");
  stack1 = helpers['if'].call(depth0, "hasFontVariants", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n    </div>\n\n    <div class=\"controlPanel\">\n        <h3>Tool</h3>\n\n        <div class=\"controlPanelContent\">\n            <label for=\"toolDiameter\" title=\"in mm\">Tool Diameter:</label><br>\n            ");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'id': ("toolDiameter"),
    'placeholder': ("tool diameter"),
    'numericValueBinding': ("toolDiameter"),
    'min': ("0"),
    'action': ("launchComputationImmediately")
  },hashTypes:{'id': "STRING",'placeholder': "STRING",'numericValueBinding': "STRING",'min': "STRING",'action': "STRING"},hashContexts:{'id': depth0,'placeholder': depth0,'numericValueBinding': depth0,'min': depth0,'action': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n            <br>\n            <label for=\"radialEngagement\" title=\"ratio ]0-1]\">Radial Engagement:</label><br>\n            ");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'id': ("radialEngagement"),
    'placeholder': ("radial engagement"),
    'numericValueBinding': ("radialEngagementRatio"),
    'min': ("0"),
    'max': ("1"),
    'step': ("0.05"),
    'action': ("launchComputationImmediately")
  },hashTypes:{'id': "STRING",'placeholder': "STRING",'numericValueBinding': "STRING",'min': "STRING",'max': "STRING",'step': "STRING",'action': "STRING"},hashContexts:{'id': depth0,'placeholder': depth0,'numericValueBinding': depth0,'min': depth0,'max': depth0,'step': depth0,'action': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n            <br>\n\n            <div class=\"controlPanel\">\n                <h3>Pocket</h3>\n\n                <div class=\"controlPanelContent\">\n                    <label for=\"workZ\" title=\"in mm\">Work Z:</label><br>\n                    ");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'id': ("workZ"),
    'placeholder': ("workZ"),
    'numericValueBinding': ("workZ"),
    'action': ("computeGCode")
  },hashTypes:{'id': "STRING",'placeholder': "STRING",'numericValueBinding': "STRING",'action': "STRING"},hashContexts:{'id': depth0,'placeholder': depth0,'numericValueBinding': depth0,'action': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                    <br>\n                    <label for=\"travelZ\" title=\"in mm\">Travel Z:</label><br>\n                    ");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'id': ("travelZ"),
    'placeholder': ("travelZ"),
    'numericValueBinding': ("travelZ"),
    'action': ("computeGCode")
  },hashTypes:{'id': "STRING",'placeholder': "STRING",'numericValueBinding': "STRING",'action': "STRING"},hashContexts:{'id': depth0,'placeholder': depth0,'numericValueBinding': depth0,'action': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                    <br>\n                    <label for=\"feedRate\" title=\"in mm/min\">Feed Rate:</label><br>\n                    ");
  data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']),options={hash:{
    'id': ("feedRate"),
    'placeholder': ("feedRate"),
    'numericValueBinding': ("feedRate"),
    'action': ("computeGCode")
  },hashTypes:{'id': "STRING",'placeholder': "STRING",'numericValueBinding': "STRING",'action': "STRING"},hashContexts:{'id': depth0,'placeholder': depth0,'numericValueBinding': depth0,'action': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
  data.buffer.push("\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n<div id=\"drawing\">\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.OperationView", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n</div>\n");
  data.buffer.push(escapeExpression((helper = helpers.textarea || (depth0 && depth0.textarea),options={hash:{
    'id': ("code"),
    'value': ("code"),
    'rows': ("400")
  },hashTypes:{'id': "STRING",'value': "ID",'rows': "STRING"},hashContexts:{'id': depth0,'value': depth0,'rows': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
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
        data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
            hash: {
                'content': ("font.variants"),
                'value': ("fontVariant")
            },
            hashTypes: {'content': "ID", 'value': "ID"},
            hashContexts: {'content': depth0, 'value': depth0},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("\n            ");
        return buffer;
    }

    function program3(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                ");
        stack1 = helpers._triageMustache.call(depth0, "font.variants", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n            ");
        return buffer;
    }

    data.buffer.push("<div class=\"controls\">\n    <div class=\"controlPanel\">\n        <h3><label for=\"text\">Text</label></h3>\n\n        <div class=\"controlPanelContent\">\n            ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("text"),
            'id': ("text"),
            'valueBinding': ("text"),
            'title': ("your text")
        },
        hashTypes: {'type': "STRING", 'id': "STRING", 'valueBinding': "STRING", 'title': "STRING"},
        hashContexts: {'type': depth0, 'id': depth0, 'valueBinding': depth0, 'title': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n        </div>\n    </div>\n    <div class=\"controlPanel\">\n        <h3>Font</h3>\n\n        <div class=\"controlPanelContent\">\n            <label for=\"fontSize\">Size:</label><br>\n            ");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'id': ("fontSize"),
            'placeholder': ("Font Size"),
            'numericValue': ("fontSize"),
            'min': ("0.01"),
            'max': ("500")
        },
        hashTypes: {'id': "STRING", 'placeholder': "STRING", 'numericValue': "ID", 'min': "STRING", 'max': "STRING"},
        hashContexts: {'id': depth0, 'placeholder': depth0, 'numericValue': depth0, 'min': depth0, 'max': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n            <br>\n            ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
        hash: {
            'content': ("controllers.fonts"),
            'value': ("fontName"),
            'optionLabelPath': ("content.family"),
            'optionValuePath': ("content.family")
        },
        hashTypes: {'content': "ID", 'value': "ID", 'optionLabelPath': "STRING", 'optionValuePath': "STRING"},
        hashContexts: {'content': depth0, 'value': depth0, 'optionLabelPath': depth0, 'optionValuePath': depth0},
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("\n            <br>\n            ");
    stack1 = helpers['if'].call(depth0, "hasFontVariants", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(3, program3, data),
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n        </div>\n    </div>\n\n    <div class=\"controlPanel\">\n        <h3>Tool</h3>\n\n        <div class=\"controlPanelContent\">\n            <label for=\"toolDiameter\" title=\"in mm\">Tool Diameter:</label><br>\n            ");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'id': ("toolDiameter"),
            'placeholder': ("tool diameter"),
            'numericValueBinding': ("toolDiameter"),
            'min': ("0"),
            'action': ("launchComputationImmediately")
        },
        hashTypes: {
            'id': "STRING",
            'placeholder': "STRING",
            'numericValueBinding': "STRING",
            'min': "STRING",
            'action': "STRING"
        },
        hashContexts: {
            'id': depth0,
            'placeholder': depth0,
            'numericValueBinding': depth0,
            'min': depth0,
            'action': depth0
        },
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n            <br>\n            <label for=\"radialEngagement\" title=\"ratio ]0-1]\">Radial Engagement:</label><br>\n            ");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'id': ("radialEngagement"),
            'placeholder': ("radial engagement"),
            'numericValueBinding': ("radialEngagementRatio"),
            'min': ("0"),
            'max': ("1"),
            'step': ("0.05"),
            'action': ("launchComputationImmediately")
        },
        hashTypes: {
            'id': "STRING",
            'placeholder': "STRING",
            'numericValueBinding': "STRING",
            'min': "STRING",
            'max': "STRING",
            'step': "STRING",
            'action': "STRING"
        },
        hashContexts: {
            'id': depth0,
            'placeholder': depth0,
            'numericValueBinding': depth0,
            'min': depth0,
            'max': depth0,
            'step': depth0,
            'action': depth0
        },
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n            <br>\n\n            <div class=\"controlPanel\">\n                <h3>Pocket</h3>\n\n                <div class=\"controlPanelContent\">\n                    <label for=\"workZ\" title=\"in mm\">Work Z:</label><br>\n                    ");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'id': ("workZ"),
            'placeholder': ("workZ"),
            'numericValueBinding': ("workZ"),
            'action': ("computeGCode")
        },
        hashTypes: {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'action': "STRING"},
        hashContexts: {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'action': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n                    <br>\n                    <label for=\"travelZ\" title=\"in mm\">Travel Z:</label><br>\n                    ");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'id': ("travelZ"),
            'placeholder': ("travelZ"),
            'numericValueBinding': ("travelZ"),
            'action': ("computeGCode")
        },
        hashTypes: {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'action': "STRING"},
        hashContexts: {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'action': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n                    <br>\n                    <label for=\"feedRate\" title=\"in mm/min\">Feed Rate:</label><br>\n                    ");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'id': ("feedRate"),
            'placeholder': ("feedRate"),
            'numericValueBinding': ("feedRate"),
            'action': ("computeGCode")
        },
        hashTypes: {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'action': "STRING"},
        hashContexts: {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'action': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n<div id=\"drawing\">\n    ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.OperationView", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("\n</div>\n");
    data.buffer.push(escapeExpression((helper = helpers.textarea || (depth0 && depth0.textarea), options = {
        hash: {
            'id': ("code"),
            'value': ("code"),
            'rows': ("400")
        },
        hashTypes: {'id': "STRING", 'value': "ID", 'rows': "STRING"},
        hashContexts: {'id': depth0, 'value': depth0, 'rows': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
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
        data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
            hash: {
                'content': ("font.variants"),
                'value': ("fontVariant")
            },
            hashTypes: {'content': "ID", 'value': "ID"},
            hashContexts: {'content': depth0, 'value': depth0},
            contexts: [depth0],
            types: ["ID"],
            data: data
        })));
        data.buffer.push("\n            ");
        return buffer;
    }

    function program3(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n                ");
        stack1 = helpers._triageMustache.call(depth0, "font.variants", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push("\n            ");
        return buffer;
    }

    data.buffer.push("<div class=\"controls\">\n    <div class=\"controlPanel\">\n        <h3><label for=\"text\">Text</label></h3>\n\n        <div class=\"controlPanelContent\">\n            ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input), options = {
        hash: {
            'type': ("text"),
            'id': ("text"),
            'valueBinding': ("text"),
            'title': ("your text")
        },
        hashTypes: {'type': "STRING", 'id': "STRING", 'valueBinding': "STRING", 'title': "STRING"},
        hashContexts: {'type': depth0, 'id': depth0, 'valueBinding': depth0, 'title': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n        </div>\n    </div>\n    <div class=\"controlPanel\">\n        <h3>Font</h3>\n\n        <div class=\"controlPanelContent\">\n            <label for=\"fontSize\">Size:</label><br>\n            ");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'id': ("fontSize"),
            'placeholder': ("Font Size"),
            'numericValue': ("fontSize"),
            'min': ("0.01"),
            'max': ("500")
        },
        hashTypes: {'id': "STRING", 'placeholder': "STRING", 'numericValue': "ID", 'min': "STRING", 'max': "STRING"},
        hashContexts: {'id': depth0, 'placeholder': depth0, 'numericValue': depth0, 'min': depth0, 'max': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n            <br>\n            ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {
        hash: {
            'content': ("controllers.fonts"),
            'value': ("fontName"),
            'optionLabelPath': ("content.family"),
            'optionValuePath': ("content.family")
        },
        hashTypes: {'content': "ID", 'value': "ID", 'optionLabelPath': "STRING", 'optionValuePath': "STRING"},
        hashContexts: {'content': depth0, 'value': depth0, 'optionLabelPath': depth0, 'optionValuePath': depth0},
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("\n            <br>\n            ");
    stack1 = helpers['if'].call(depth0, "hasFontVariants", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(3, program3, data),
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n        </div>\n    </div>\n\n    <div class=\"controlPanel\">\n        <h3>Tool</h3>\n\n        <div class=\"controlPanelContent\">\n            <label for=\"toolDiameter\" title=\"in mm\">Tool Diameter:</label><br>\n            ");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'id': ("toolDiameter"),
            'placeholder': ("tool diameter"),
            'numericValueBinding': ("toolDiameter"),
            'min': ("0"),
            'action': ("launchComputationImmediately")
        },
        hashTypes: {
            'id': "STRING",
            'placeholder': "STRING",
            'numericValueBinding': "STRING",
            'min': "STRING",
            'action': "STRING"
        },
        hashContexts: {
            'id': depth0,
            'placeholder': depth0,
            'numericValueBinding': depth0,
            'min': depth0,
            'action': depth0
        },
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n            <br>\n            <label for=\"radialEngagement\" title=\"ratio ]0-1]\">Radial Engagement:</label><br>\n            ");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'id': ("radialEngagement"),
            'placeholder': ("radial engagement"),
            'numericValueBinding': ("radialEngagementRatio"),
            'min': ("0"),
            'max': ("1"),
            'step': ("0.05"),
            'action': ("launchComputationImmediately")
        },
        hashTypes: {
            'id': "STRING",
            'placeholder': "STRING",
            'numericValueBinding': "STRING",
            'min': "STRING",
            'max': "STRING",
            'step': "STRING",
            'action': "STRING"
        },
        hashContexts: {
            'id': depth0,
            'placeholder': depth0,
            'numericValueBinding': depth0,
            'min': depth0,
            'max': depth0,
            'step': depth0,
            'action': depth0
        },
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n            <br>\n\n            <div class=\"controlPanel\">\n                <h3>Pocket</h3>\n\n                <div class=\"controlPanelContent\">\n                    <label for=\"workZ\" title=\"in mm\">Work Z:</label><br>\n                    ");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'id': ("workZ"),
            'placeholder': ("workZ"),
            'numericValueBinding': ("workZ"),
            'action': ("computeGCode")
        },
        hashTypes: {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'action': "STRING"},
        hashContexts: {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'action': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n                    <br>\n                    <label for=\"travelZ\" title=\"in mm\">Travel Z:</label><br>\n                    ");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'id': ("travelZ"),
            'placeholder': ("travelZ"),
            'numericValueBinding': ("travelZ"),
            'action': ("computeGCode")
        },
        hashTypes: {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'action': "STRING"},
        hashContexts: {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'action': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n                    <br>\n                    <label for=\"feedRate\" title=\"in mm/min\">Feed Rate:</label><br>\n                    ");
    data.buffer.push(escapeExpression((helper = helpers['number-input'] || (depth0 && depth0['number-input']), options = {
        hash: {
            'id': ("feedRate"),
            'placeholder': ("feedRate"),
            'numericValueBinding': ("feedRate"),
            'action': ("computeGCode")
        },
        hashTypes: {'id': "STRING", 'placeholder': "STRING", 'numericValueBinding': "STRING", 'action': "STRING"},
        hashContexts: {'id': depth0, 'placeholder': depth0, 'numericValueBinding': depth0, 'action': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "number-input", options))));
    data.buffer.push("\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n<div id=\"drawing\">\n    ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "TextApplication.OperationView", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    })));
    data.buffer.push("\n</div>\n");
    data.buffer.push(escapeExpression((helper = helpers.textarea || (depth0 && depth0.textarea), options = {
        hash: {
            'id': ("code"),
            'value': ("code"),
            'rows': ("400")
        },
        hashTypes: {'id': "STRING", 'value': "ID", 'rows': "STRING"},
        hashContexts: {'id': depth0, 'value': depth0, 'rows': depth0},
        contexts: [],
        types: [],
        data: data
    }, helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
    return buffer;

});
Ember.TEMPLATES["visucamApp"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, self = this, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;

    function program1(depth0, data) {

        var stack1, helper, options;
        stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']), options = {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(2, program2, data),
            contexts: [depth0],
            types: ["STRING"],
            data: data
        }, helper ? helper.call(depth0, "index", options) : helperMissing.call(depth0, "link-to", "index", options));
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        else {
            data.buffer.push('');
        }
    }

    function program2(depth0, data) {


        data.buffer.push("Job List");
    }

    function program4(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n            <div class=\"dropdown\">\n                <button class=\"btn btn-default dropdown-toggle\" type=\"button\" id=\"dropdownMenu1\" data-toggle=\"dropdown\"\n                    ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'title': ("authTitle")
            }, hashTypes: {'title': "STRING"}, hashContexts: {'title': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(">\n                    <i ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': ("authProviderIcon")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push("></i> ");
        stack1 = helpers._triageMustache.call(depth0, "firebase.username", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push(" <span class=\"caret\"></span>\n                </button>\n                <ul class=\"dropdown-menu dropdown-menu-right\" role=\"menu\" aria-labelledby=\"dropdownMenu1\">\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "logout", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(">logout</a>\n                    </li>\n                </ul>\n            </div>\n        ");
        return buffer;
    }

    function program6(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <div class=\"dropdown\">\n                <button class=\"btn btn-default dropdown-toggle\" type=\"button\" id=\"dropdownMenu1\" data-toggle=\"dropdown\">\n                    login\n                    <span class=\"caret\"></span>\n                </button>\n                <ul class=\"dropdown-menu dropdown-menu-right\" role=\"menu\" aria-labelledby=\"dropdownMenu1\">\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "loginanonymous", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i\n                            class=\"fa fa-eye-slash\"></i> Anonymous Login</a></li>\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "logintwitter", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i\n                            class=\"fa fa-twitter\"></i> Twitter Login</a></li>\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "logingithub", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i\n                            class=\"fa fa-github\"></i> Github Login</a></li>\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "loginfacebook", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i\n                            class=\"fa fa-facebook\"></i> Facebook Login</a></li>\n                </ul>\n            </div>\n        ");
        return buffer;
    }

    data.buffer.push("<div class=\"header\">\n    <div class=\"topMenu\">");
    stack1 = helpers['if'].call(depth0, "firebase.isAuthenticated", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.noop,
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("</div>\n    <div class=\"identity\">\n        ");
    stack1 = helpers['if'].call(depth0, "firebase.isAuthenticated", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(6, program6, data),
        fn: self.program(4, program4, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    </div>\n</div>\n");
    stack1 = helpers._triageMustache.call(depth0, "outlet", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    return buffer;

});
Ember.TEMPLATES["visucamApp"] = Ember.Handlebars.template(function anonymous(Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers);
    data = data || {};
    var buffer = '', stack1, self = this, helperMissing = helpers.helperMissing, escapeExpression = this.escapeExpression;

    function program1(depth0, data) {

        var stack1, helper, options;
        stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']), options = {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            inverse: self.noop,
            fn: self.program(2, program2, data),
            contexts: [depth0],
            types: ["STRING"],
            data: data
        }, helper ? helper.call(depth0, "index", options) : helperMissing.call(depth0, "link-to", "index", options));
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        else {
            data.buffer.push('');
        }
    }

    function program2(depth0, data) {


        data.buffer.push("Job List");
    }

    function program4(depth0, data) {

        var buffer = '', stack1;
        data.buffer.push("\n            <div class=\"dropdown\">\n                <button class=\"btn btn-default dropdown-toggle\" type=\"button\" id=\"dropdownMenu1\" data-toggle=\"dropdown\"\n                    ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'title': ("authTitle")
            }, hashTypes: {'title': "STRING"}, hashContexts: {'title': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push(">\n                    <i ");
        data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {
            hash: {
                'class': ("authProviderIcon")
            }, hashTypes: {'class': "STRING"}, hashContexts: {'class': depth0}, contexts: [], types: [], data: data
        })));
        data.buffer.push("></i> ");
        stack1 = helpers._triageMustache.call(depth0, "firebase.username", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["ID"],
            data: data
        });
        if (stack1 || stack1 === 0) {
            data.buffer.push(stack1);
        }
        data.buffer.push(" <span class=\"caret\"></span>\n                </button>\n                <ul class=\"dropdown-menu dropdown-menu-right\" role=\"menu\" aria-labelledby=\"dropdownMenu1\">\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "logout", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push(">logout</a>\n                    </li>\n                </ul>\n            </div>\n        ");
        return buffer;
    }

    function program6(depth0, data) {

        var buffer = '';
        data.buffer.push("\n            <div class=\"dropdown\">\n                <button class=\"btn btn-default dropdown-toggle\" type=\"button\" id=\"dropdownMenu1\" data-toggle=\"dropdown\">\n                    login\n                    <span class=\"caret\"></span>\n                </button>\n                <ul class=\"dropdown-menu dropdown-menu-right\" role=\"menu\" aria-labelledby=\"dropdownMenu1\">\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "loginanonymous", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i\n                            class=\"fa fa-eye-slash\"></i> Anonymous Login</a></li>\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "logintwitter", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i\n                            class=\"fa fa-twitter\"></i> Twitter Login</a></li>\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "logingithub", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i\n                            class=\"fa fa-github\"></i> Github Login</a></li>\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
        data.buffer.push(escapeExpression(helpers.action.call(depth0, "loginfacebook", {
            hash: {},
            hashTypes: {},
            hashContexts: {},
            contexts: [depth0],
            types: ["STRING"],
            data: data
        })));
        data.buffer.push("><i\n                            class=\"fa fa-facebook\"></i> Facebook Login</a></li>\n                </ul>\n            </div>\n        ");
        return buffer;
    }

    data.buffer.push("<div class=\"header\">\n    <div class=\"topMenu\">");
    stack1 = helpers['if'].call(depth0, "firebase.isAuthenticated", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.noop,
        fn: self.program(1, program1, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("</div>\n    <div class=\"identity\">\n        ");
    stack1 = helpers['if'].call(depth0, "firebase.isAuthenticated", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        inverse: self.program(6, program6, data),
        fn: self.program(4, program4, data),
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
    data.buffer.push("\n    </div>\n</div>\n");
    stack1 = helpers._triageMustache.call(depth0, "outlet", {
        hash: {},
        hashTypes: {},
        hashContexts: {},
        contexts: [depth0],
        types: ["ID"],
        data: data
    });
    if (stack1 || stack1 === 0) {
        data.buffer.push(stack1);
    }
  return buffer;
  
});
Ember.TEMPLATES["visucamApp"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var stack1, helper, options;
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "index", options) : helperMissing.call(depth0, "link-to", "index", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program2(depth0,data) {
  
  
  data.buffer.push("Job List");
  }

function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <div class=\"dropdown\">\n                <button class=\"btn btn-default dropdown-toggle\" type=\"button\" id=\"dropdownMenu1\" data-toggle=\"dropdown\"\n                    ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'title': ("authTitle")
  },hashTypes:{'title': "STRING"},hashContexts:{'title': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                    <i ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("authProviderIcon")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></i> ");
  stack1 = helpers._triageMustache.call(depth0, "firebase.username", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" <span class=\"caret\"></span>\n                </button>\n                <ul class=\"dropdown-menu dropdown-menu-right\" role=\"menu\" aria-labelledby=\"dropdownMenu1\">\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "logout", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">logout</a>\n                    </li>\n                </ul>\n            </div>\n        ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <div class=\"dropdown\">\n                <button class=\"btn btn-default dropdown-toggle\" type=\"button\" id=\"dropdownMenu1\" data-toggle=\"dropdown\">\n                    login\n                    <span class=\"caret\"></span>\n                </button>\n                <ul class=\"dropdown-menu dropdown-menu-right\" role=\"menu\" aria-labelledby=\"dropdownMenu1\">\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "loginanonymous", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><i\n                            class=\"fa fa-eye-slash\"></i> Anonymous Login</a></li>\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "logintwitter", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><i\n                            class=\"fa fa-twitter\"></i> Twitter Login</a></li>\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "logingithub", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><i\n                            class=\"fa fa-github\"></i> Github Login</a></li>\n                    <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "loginfacebook", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><i\n                            class=\"fa fa-facebook\"></i> Facebook Login</a></li>\n                </ul>\n            </div>\n        ");
  return buffer;
  }

  data.buffer.push("<div class=\"header\">\n    <div class=\"topMenu\">");
  stack1 = helpers['if'].call(depth0, "firebase.isAuthenticated", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n    <div class=\"identity\">\n        ");
  stack1 = helpers['if'].call(depth0, "firebase.isAuthenticated", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n</div>\n");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  
});
