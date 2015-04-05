"use strict";
define(['cnc/util', 'cnc/cam/cam'], function (util) {
    return function (excellonText) {
        var unitFactor = null;
        var toolDict = {};
        var toolDefs = {};
        var currentTool;
        var currentBucket;
        var lines = excellonText.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line[0] == ';')
                continue;
            if (line.match(/\s*INCH/))
                unitFactor = 25.4 / 10000;
            if (line.match(/\s*METRIC/))
                unitFactor = 1 / 10000;
            var toolDefMatch = line.match(/\s*(T\d+)C(\d*.?\d+)/);
            if (toolDefMatch) {
                toolDefs[toolDefMatch[1]] = parseFloat(toolDefMatch[2]) * unitFactor * 10000;
            } else {
                var toolMatch = line.match(/\s*(T\d+)/);
                if (toolMatch) {
                    currentTool = toolMatch[1];
                    currentBucket = toolDict[currentTool];
                    if (currentBucket == null) {
                        currentBucket = [];
                        toolDict[currentTool] = currentBucket;
                    }
                }
            }
            var positionMatch = line.match(/\s*X(\d+)Y(\d+)/);
            if (positionMatch)
                currentBucket.push(new util.Point(positionMatch[1], positionMatch[2]).scale(unitFactor));
        }
        return {defs: toolDefs, holes: toolDict};
    }
});