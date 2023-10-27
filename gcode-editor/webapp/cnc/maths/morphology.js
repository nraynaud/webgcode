"use strict";
function open(imageData, radius) {
    if (!radius)
        return imageData;

    function createStructuringElement(radius) {
        var indices = [];

        for (var j = Math.floor(-radius); j <= radius; j++) {
            for (var i = Math.floor(-radius); i <= radius; i++) {
                if (i * i + j * j <= radius * radius)
                    indices.push([i, j]);
            }
        }
        return indices;
    }

    var structuringElement = createStructuringElement(radius);
    var storeView1 = new DataView(new ArrayBuffer(Math.ceil(imageData.width * imageData.height / 8)));
    var storeView2 = new DataView(new ArrayBuffer(Math.ceil(imageData.width * imageData.height / 8)));

    function getItem(view, x, y) {
        if (y < 0 || x < 0 || y > imageData.height - 1 || x > imageData.width - 1)
            return false;
        var bitAdress = x + y * imageData.width;
        var byteAddress = Math.floor(bitAdress / 8);
        var val = view.getUint8(byteAddress);
        var shift = bitAdress % 8;
        return val & 1 << shift;
    }

    function setItem(view, x, y, val) {
        var bitAdress = x + y * imageData.width;
        var byteAddress = Math.floor(bitAdress / 8);
        var temp = view.getUint8(byteAddress);
        var shift = bitAdress % 8;
        if (val)
            temp |= 1 << shift;
        else
            temp &= ~(1 << shift);
        view.setUint8(byteAddress, temp);
    }


    eachPixel(imageData, function (i, j, pix) {
        setItem(storeView1, i, j, pix2Boolean(pix));
    }, true);

    function morpho(input, output, dilation) {
        eachPixel(imageData, function (i, j) {
            var pix = getItem(input, i, j);
            for (var k = 0; k < structuringElement.length; k++) {
                var cell = structuringElement[k];
                var res = getItem(input, i + cell[0], j + cell[1]);
                if (dilation) {
                    if (pix || res) {
                        pix = true;
                        break;
                    } else
                        pix = false;
                } else {
                    if (pix && res)
                        pix = true;
                    else {
                        pix = false;
                        break;
                    }
                }
            }
            setItem(output, i, j, pix);
        }, false);
    }

    morpho(storeView1, storeView2, false);
    morpho(storeView2, storeView1, true);
    eachPixel(imageData, function (i, j) {
        if (getItem(storeView1, i, j))
            setPixel(imageData, i, j, 0, 0, 255, 255);
        else
            setPixel(imageData, i, j, 0, 0, 0, 0);
    }, false);
    return imageData;
}

function createDisjointSet() {
    var parent = [];

    function find(i) {
        if (parent[i] == null)
            parent[i] = i;
        if (parent[i] == i)
            return i;
        else {
            var result = find(parent[i]);
            parent[i] = result;
            return result;
        }
    }

    return {
        parent: parent,
        find: find,
        union: function (i, j) {
            parent[find(i)] = find(j);
        }
    };
}

function labelImage(imageData) {
    var currentLabel = 0;
    var w = imageData.width;
    var h = imageData.height;
    var data = imageData.data;

    var labels = new DataView(new ArrayBuffer(imageData.width * imageData.height));

    var labelGraph = createDisjointSet();

    function fetchNewLabel() {
        var label = ++currentLabel;
        labelGraph.find(label);
        return label;
    }

    function imagePoint(x, y) {
        return pix2Boolean(getPixel(imageData, x, y));
    }

    function setLabel(x, y, label) {
        labels[x + y * w] = label;
    }

    function getLabel(x, y) {
        return labels[x + y * w];
    }

    eachPixel(imageData, function (i, j, pix) {
        if (pix2Boolean(pix)) {
            var neighbors = [];
            if (imagePoint(i - 1, j))
                neighbors.push(labelGraph.find(getLabel(i - 1, j)));
            if (imagePoint(i, j - 1))
                neighbors.push(labelGraph.find(getLabel(i, j - 1)));
            if (!neighbors.length) {
                setLabel(i, j, fetchNewLabel());
            } else {
                var l = Math.min.apply(null, neighbors);
                setLabel(i, j, l);
                $.each(neighbors, function (_, label) {
                    labelGraph.union(l, label);
                });
            }
        }
    }, true);
    function randomColor() {
        var redVal = Math.round(Math.random() * 254);
        var greenVal = Math.round(Math.random() * 254);
        var blueVal = Math.round(Math.random() * 254);
        return [redVal, greenVal, blueVal];
    }

    var res = {};
    eachPixel(imageData, function (i, j) {
        var label = labelGraph.find(getLabel(i, j));
        var color = res[label];
        if (color == null) {
            color = randomColor();
            res[label] = color;
        }
        setPixel(imageData, i, j, color[0], color[1], color[2], 255);
    }, false);

    console.log(res);
}

function pixelInBounds(image, x, y) {
    return x >= 0 && y >= 0 && x < image.width && y < image.height;
}

function setPixel(image, x, y, r, g, b, a) {
    if (!pixelInBounds(image, x, y))
        throw 'out of bounds: (' + x + ', ' + y + ')';
    var index = (x + y * image.width) * 4;
    image.data[index] = r;
    image.data[index + 1] = g;
    image.data[index + 2] = b;
    image.data[index + 3] = a;
}

function getPixel(image, x, y) {
    if (!pixelInBounds(image, x, y))
        throw 'out of bounds: (' + x + ', ' + y + ')';
    var index = (x + y * image.width) * 4;
    return [image.data[index], image.data[index + 1], image.data[index + 2], image.data[index + 3]];
}

function pix2Boolean(pix) {
    return pix[0] == 0 && pix[1] == 0 && pix[2] == 255;
}

// you can return false in the handler to stop.
function eachPixel(image, handler, withValue) {
    for (var j = 0; j < image.height; j++)
        for (var i = 0; i < image.width; i++) {
            var res;
            if (withValue)
                res = handler(i, j, getPixel(image, i, j));
            else
                res = handler(i, j);
            if (res === false)
                return;
        }
}

function extractContour(imageData, predicate) {
    if (predicate == null)
        predicate = pix2Boolean;
    var NORTH = {x: 0, y: -1};
    var NE = {x: 1, y: -1};
    var EAST = {x: 1, y: 0};
    var SE = {x: 1, y: 1};
    var SOUTH = {x: 0, y: 1};
    var SW = {x: -1, y: 1};
    var WEST = {x: -1, y: 0};
    var NW = {x: -1, y: -1};

    $.extend(NORTH, {backwards: SOUTH, cw: NE, ccw: NW, cwDir: EAST, ccwDir: WEST});
    $.extend(NE, {cw: EAST, ccw: NORTH, cwDir: EAST, ccwDir: SOUTH});
    $.extend(EAST, {backwards: WEST, cw: SE, ccw: NE, cwDir: SOUTH, ccwDir: NORTH});
    $.extend(SE, {cw: SOUTH, ccw: EAST, cwDir: SOUTH, ccwDir: EAST});
    $.extend(SOUTH, {backwards: NORTH, cw: SW, ccw: SE, cwDir: WEST, ccwDir: EAST});
    $.extend(SW, {cw: WEST, ccw: SOUTH, cwDir: WEST, ccwDir: SOUTH});
    $.extend(WEST, {backwards: EAST, cw: NW, ccw: SW, cwDir: NORTH, ccwDir: SOUTH});
    $.extend(NW, {cw: NORTH, ccw: WEST, cwDir: NORTH, ccwDir: EAST});
    var list = [];
    eachPixel(imageData, function (x, y, pix) {
        if (predicate(pix)) {
            list.push([x, y]);
            return false;
        }
        return true;
    }, true);
    function turnAroundPixel(centerX, centerY, direction) {
        var pos = direction.backwards;
        do {
            var x = centerX + pos.x;
            var y = centerY + pos.y;
            if (pixelInBounds(imageData, x, y))
                if (pix2Boolean(getPixel(imageData, x, y)))
                    return {direction: pos.cwDir, x: x, y: y};
            pos = pos.cw;
        } while (pos != direction.backwards);
        return null;
    }

    if (!list.length)
        return list;
    var initialState = {direction: EAST, x: list[0][0], y: list[0][1]};
    var state = initialState;
    do {
        var res = turnAroundPixel(state.x, state.y, state.direction);
        if (res == null)
            return list;
        list.push([res.x, res.y]);
        state = res;
    } while (!(res.direction == initialState.direction && res.x == initialState.x && res.y == initialState.y));
    $.each(list, function (_, pixel) {
        setPixel(imageData, pixel[0], pixel[1], 255, 0, 0, 255);
    });
    return list;
}