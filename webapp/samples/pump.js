"use strict";
var impellerDiameter = 22.50;
var chamberDiameter = 26;
var inletDiameter = 10;
var impellerHeight = 5.62 + 0.5;
var chamberHeight = 10.34;

var toolDiameter = 3;
var toolRadius = toolDiameter / 2;

var ceilingThickness = chamberHeight - impellerHeight - 2.73;
var stockThickness = 16;


function makeInside(machine) {
    machine.setParams(-stockThickness + ceilingThickness, 5, 800);
    var inlet = machine.createOutline(geom.createCircle(0, 0, inletDiameter / 2));
    machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(inlet, toolRadius, true, true), 0, -stockThickness + 1, 5));

    var innerWall = machine.createOutline(geom.createCircle(0, 0, impellerDiameter / 2));
    machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(innerWall, toolRadius * 3, true, true), 0, -stockThickness + ceilingThickness, 5));
    machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(innerWall, toolRadius * 2, true, true), 0, -stockThickness + ceilingThickness, 5));
    machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(innerWall, toolRadius, true, true), 0, -stockThickness + ceilingThickness, 5));

    var outerWall = machine.createOutline(geom.createCircle(0, 0, chamberDiameter / 2));
    machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(outerWall, 0, false, true), 0, -stockThickness + ceilingThickness + chamberHeight, 3));

    machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(outerWall, toolRadius * 1.5, false, true), 0, -stockThickness + 1, 5));
    machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(outerWall, toolRadius, false, true), 0, -stockThickness + 1, 5));

}

function makefixture(machine) {
    machine.setParams(-chamberHeight - 1, 5, 800);
    var cylinder = machine.createOutline(geom.createCircle(0, 0, impellerDiameter / 2));
    var radius = 0;
    while (impellerDiameter / 2 - radius > 0) {
        machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(cylinder, -radius, false, true), 0, 0, 0));
        radius += toolDiameter;
    }
    machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(cylinder, toolRadius * 1.5, false, true), 0, -chamberHeight - 2, 4));
    machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(cylinder, toolRadius, false, true), 0, -chamberHeight - 2, 4));
}

function makeCeiling(machine) {
    machine.setParams(-chamberHeight - 1, 5, 800);
    var ceilingThinckness = chamberHeight - impellerHeight;
    machine.setParams(ceilingThinckness, ceilingThinckness + 15, 1000);
    var outerWall = machine.createOutline(geom.createCircle(0, 0, chamberDiameter / 2));
    var radius = 0;
    while (chamberDiameter / 2 - radius > 0) {
        machine.registerToolPathArray(machine.rampToolPathArray(machine.contouring(outerWall, -radius, false, true), ceilingThinckness + 10, ceilingThinckness, 5));
        radius += toolDiameter * 0.5;
    }
}
makeInside(machine);