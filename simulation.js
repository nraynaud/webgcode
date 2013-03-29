function displayPath(path) {
    var indexes = [];
    var points = [];
    for (i = 0; i < path.length; i++) {
        indexes.push(i);
        var p = path[i];
        points.push([p.x.toFixed(2), p.y.toFixed(2), p.z.toFixed(2)].join(' '))
    }
    indexes.push(-1);
    var lineset = $('<IndexedLineSet></IndexedLineSet>');
    var coordinates = $('<Coordinate></Coordinate>');
    lineset.attr('coordIndex', indexes.join(' '));
    coordinates.attr('point', points.join(', '));
    lineset.append(coordinates);
    $('#toolpath').remove();
    $('#scene').append($('<Shape id="toolpath"></Shape>').append(lineset));
}

function simulate(path) {
    var acceleration = 200; //mm.s^-2

    var posData = [
        {label: 'x position(mm/s)', color: 'red', data: []},
        {label: 'y position(mm/s)', color: 'green', data: []},
        {label: 'z position(mm/s)', color: 'blue', data: []}
    ];
    var currentTime = 0;
    var currentDistance = 0;
    posData[0].data.push([currentTime, path[0]['x']]);
    posData[1].data.push([currentTime, path[0]['y']]);
    posData[2].data.push([currentTime, path[0]['z']]);
    for (var i = 1; i < path.length; i++) {
        var p0 = path[i - 1];
        var p1 = path[i];

        var speed = p1.speed / 60; //mm.min^-1 -> mm.s^-1
        var accelerationLength = speed * speed / (2 * acceleration); //mm
        var accelerationDuration = speed / acceleration;

        function dist(axis) {
            return Math.abs(p1[axis] - p0[axis]);
        }

        var dx = dist('x');
        var dy = dist('y');
        var dz = dist('z');
        var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        var time;
        if (len < 2 * accelerationLength) {
            // computes for len/2 then double (acceleration then deceleration)
            time = 2 * Math.sqrt(len / acceleration);
            currentTime += time
        } else {
            var constantSpeedDuration = (len - 2 * accelerationLength) / speed;
            var accelerationRatio = accelerationLength/len;
            currentTime += accelerationDuration;
            //just show end of acceleration and begining of braking
            posData[0].data.push([currentTime, p0['x'] + accelerationRatio * dx]);
            posData[1].data.push([currentTime, p0['y'] + accelerationRatio * dy]);
            posData[2].data.push([currentTime, p0['z'] + accelerationRatio * dz]);
            currentTime += constantSpeedDuration;
            posData[0].data.push([currentTime, p1['x'] - accelerationRatio * dx]);
            posData[1].data.push([currentTime, p1['y'] - accelerationRatio * dy]);
            posData[2].data.push([currentTime, p1['z'] - accelerationRatio * dz]);
            currentTime += accelerationDuration;
        }
        posData[0].data.push([currentTime, p1['x']]);
        posData[1].data.push([currentTime, p1['y']]);
        posData[2].data.push([currentTime, p1['z']]);
        currentDistance += len;
    }
    $.plot("#chart1", posData);
}