test("eval test", function () {
    var code = 'G0 X10';
    var result = evaluate(code);
    equal(result.length, 1, '"' + code + '" code length');
    deepEqual(result[0], {
        feedRate: 3000,
        from: {x: 0, y: 0, z: 0},
        to: {x: 10, y: 0, z: 0},
        type: "line"}, '"' + code + '" second component check');
});