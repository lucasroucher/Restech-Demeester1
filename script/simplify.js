function simplify(points, epsilon) {
    var first = points[0];
    var last = points[points.length - 1];

    if (points.length < 3) {
        return points;
    }

    var max = 0;
    var index;

    for (var i = 1; i < points.length - 1; i++) {
        var dist = distance(points[i], first, last);

        if (dist > max) {
            max = dist;
            index = i;
        }
    }

    if (max > epsilon) {
        var left = points.slice(0, index + 1);
        var right = points.slice(index);

        left = simplify(left, epsilon);
        right = simplify(right, epsilon);

        return left.slice(0, left.length - 1).concat(right);
    } else {
        return [ first, last ];
    }
}

function distance(p, v, w) {
    var px = p[0];
    var py = p[1];
    var vx = v[0];
    var vy = v[1];
    var wx = w[0];
    var wy = w[1];

    if (vx === wx) {
        return Math.abs(px - vx);
    }

    var slope = (wy - vy) / (wx - vx);
    var intercept = vy - (slope * vx);

    return Math.abs(slope * px - py + intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
}
