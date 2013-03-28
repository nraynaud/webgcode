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
    var speed = 3000 / 60; //mm.s^-1
    var acceleration = 200; //mm.s^-2
    var accelerationLength = speed * speed / (2 * acceleration); //mm
    var accelerationDuration = speed / acceleration;
    var posData = [
        {label: 'x position(mm/s)', color: 'red', data: []},
        {label: 'y position(mm/s)', color: 'green', data: []},
        {label: 'z position(mm/s)', color: 'blue', data: []}
    ];
    var currentTime = 0;
    var currentDistance = 0;

    for (var i = 1; i < path.length; i++) {
        var p0 = path[i - 1];
        var p1 = path[i];

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
        } else {
            time = 2 * accelerationDuration + (len - 2 * accelerationLength) / speed;
        }

        posData[0].data.push([currentTime, p1['x']]);
        posData[1].data.push([currentTime, p1['y']]);
        posData[2].data.push([currentTime, p1['z']]);
        currentTime += time;
        currentDistance += len;
    }
    $.plot("#chart1", posData);
}