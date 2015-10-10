"use strict";
// http://www.codeproject.com/Articles/566614/Elliptic-integrals
function sq(x) {
    return Math.pow(x, 2);
}

function cb(x) {
    return Math.pow(x, 3);
}

function rf(X, Y, Z) {
    var dx, dy, dz;
    var previousDx, previousDy, previousDz;
    var c = 0;
    do {
        var lambda = Math.sqrt(X * Y) + Math.sqrt(Y * Z) + Math.sqrt(Z * X);
        X = (X + lambda) / 4;
        Y = (Y + lambda) / 4;
        Z = (Z + lambda) / 4;
        var A = (X + Y + Z) / 3;
        dx = (1 - X / A);
        dy = (1 - Y / A);
        dz = (1 - Z / A);
        //stronger convergence criterion, I don't really know if it's useful
        var moved = previousDx !== dx || previousDy !== dy || previousDz !== dz;
        var stop = isNaN(dx) || isNaN(dy) || isNaN(dz);
        stop |= dx === 0 && dy === 0 && dz === 0;
        previousDx = dx;
        previousDy = dy;
        previousDz = dz;
        c++;
    } while (c < 1000 && moved && !stop);
    var E2 = dx * dy + dy * dz + dz * dx;
    var E3 = dy * dx * dz;

    //http://dlmf.nist.gov/19.36#E1
    var result = 1
        - (1 / 10) * E2 + (1 / 14) * E3
        + (1 / 24) * sq(E2)
        - (3 / 44) * E2 * E3
        - (5 / 208) * cb(E2)
        + (3 / 104) * sq(E3)
        + (1 / 16) * sq(E2) * E3;
    result /= Math.sqrt(A);
    return result;
}

// I don't know anything about this algorithm's numerical properties. It converged in 20-30 iterations in the values I tested.
// I tweaked it anyways, just because I could.
function rd(X, Y, Z) {
    var dx, dy, dz;
    var fac = 1;
    var c = 0;
    var previousDx, previousDy, previousDz;
    var sumComp = 0;
    var sum = 0;
    do {
        var lambda = Math.sqrt(X * Y) + Math.sqrt(Y * Z) + Math.sqrt(Z * X);
        var v = fac / (Math.sqrt(Z) * (Z + lambda));
        //Kahan sum I don't really know if it's useful for about 20 iterations, I don't really raise sumComp to ~ sum
        var diff = v - sumComp;
        var t = sum + diff;
        sumComp = (t - sum) - diff;
        sum = t;
        fac /= 4;
        X = (X + lambda) / 4;
        Y = (Y + lambda) / 4;
        Z = (Z + lambda) / 4;
        var A = (X + Y + 3 * Z) / 5;
        dx = (1 - X / A);
        dy = (1 - Y / A);
        dz = (1 - Z / A);
        //stronger convergence criterion, I don't really know if it's useful
        var moved = previousDx !== dx || previousDy !== dy || previousDz !== dz;
        var stop = isNaN(dx) || isNaN(dy) || isNaN(dz);
        stop |= dx === 0 && dy === 0 && dz === 0;
        previousDx = dx;
        previousDy = dy;
        previousDz = dz;
        //not sure if it might oscillate instead of converging
        c++;
    } while (c < 1000 && moved && !stop);
    var E2 = dx * dy + dy * dz + 3 * sq(dz) + 2 * dz * dx + dx * dz + 2 * dy * dz;
    var E3 = cb(dz) + dx * sq(dz) + 3 * dx * dy * dz + 2 * dy * sq(dz) + dy * sq(dz) + 2 * dx * sq(dz);
    var E4 = dy * cb(dz) + dx * cb(dz) + dx * dy * sq(dz) + 2 * dx * dy * sq(dz);
    var E5 = dx * dy * cb(dz);
    //http://dlmf.nist.gov/19.36#E2
    var result = 1 - (3 / 14) * E2
        + (1 / 6) * E3 + (9 / 88) * sq(E2)
        - (3 / 22) * E4
        - (9 / 52) * E2 * E3
        + (3 / 26) * E5
        - (1 / 16) * cb(E2)
        + (3 / 40) * sq(E3)
        + (3 / 20) * E2 * E4
        + (45 / 272) * sq(E2) * E3
        - (9 / 68) * (E3 * E4 + E2 * E5);
    result = 3.0 * sum + fac * result / (A * Math.sqrt(A));
    return result;
}

function completeEllipticIntegralSecondKind(m) {
    var sum = 1;
    var term = 1;
    var above = 1;
    var below = 2;
    for (var i = 1; i <= 100; i++) {
        term *= above / below;
        sum -= Math.pow(m, i) * sq(term) / above;
        above += 2;
        below += 2;
    }
    sum *= 0.5 * Math.PI;
    return sum;
}

// m is k^2
// incompleteEllipticIntegralSecondKind(Math.PI/4, 0.5) -> 0.7481865041776611
// incompleteEllipticIntegralSecondKind(Math.PI/4, 0.7) -> 0.7323015038648828
// incompleteEllipticIntegralSecondKind(Math.PI/2, 0.7) -> 1.2416705679458233
function incompleteEllipticIntegralSecondKind(phi, m) {
    var sign = phi < 0 ? -1 : 1;
    phi = Math.abs(phi);
    var rphi = phi % (Math.PI / 2);
    var periods = Math.floor(2 * phi / Math.PI);
    var s = 1;
    if (periods % 2 > 0.5) {
        periods += 1;
        s = -1;
        rphi = Math.PI / 2 - rphi;
    }
    var sinP = Math.sin(rphi);
    var sqSinP = sq(sinP);
    var sqCosP = sq(Math.cos(rphi));
    var result = s * (sinP * rf(sqCosP, 1 - m * sqSinP, 1)
        - 1 / 3 * m * cb(sinP) * rd(sqCosP, 1 - m * sqSinP, 1));
    if (periods != 0)
        result += periods * completeEllipticIntegralSecondKind(m);
    return sign * result;
}