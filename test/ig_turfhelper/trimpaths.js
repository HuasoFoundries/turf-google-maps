(function (QUnit) {


    QUnit.module("turfHelper trimPaths");


    var line1 = [
        [1.33, -1.14],
        [1.44, -1.12],
        [1.45, -1.11],
        [1.67, -1.28],
        [1.84, -1.21],
        [1.91, -1.23]
    ];
    var line2 = [
        [1.33, -1.18],
        [1.44, -1.16],
        [1.55, -1.14],
        [1.77, -1.2],
        [1.81, -1.27],
        [1.88, -1.14]
    ];
    var trimResult1 = [
        [{
                "lat": -1.14,
                "lng": 1.33
            },
            {
                "lat": -1.12,
                "lng": 1.44
            },
            {
                "lat": -1.11,
                "lng": 1.45
            },
            {
                "lat": -1.1489994454100185,
                "lng": 1.5004698705306123
            }
        ],
        [{
                "lat": -1.1490042874786746,
                "lng": 1.500476418867289
            },
            {
                "lat": -1.14,
                "lng": 1.55
            },
            {
                "lat": -1.2,
                "lng": 1.77
            },
            {
                "lat": -1.27,
                "lng": 1.81
            },
            {
                "lat": -1.14,
                "lng": 1.88
            },
            {
                "lat": -1.14,
                "lng": 1.88
            }
        ],
        {
            "lat": -1.14900433,
            "lng": 1.50047619
        }
    ];

    var trimResult2 = [
        [{
                "lat": -1.14,
                "lng": 1.33
            },
            {
                "lat": -1.12,
                "lng": 1.44
            },
            {
                "lat": -1.11,
                "lng": 1.45
            },
            {
                "lat": -1.1489994454100185,
                "lng": 1.5004698705306123
            }
        ],
        [{
                "lat": -1.1490042874786746,
                "lng": 1.500476418867289
            },
            {
                "lat": -1.14,
                "lng": 1.55
            },
            {
                "lat": -1.2,
                "lng": 1.77
            },
            {
                "lat": -1.27,
                "lng": 1.81
            },
            {
                "lat": -1.14,
                "lng": 1.88
            },
            {
                "lat": -1.14,
                "lng": 1.88
            }
        ],
        {
            "lat": -1.14900433,
            "lng": 1.50047619
        }
    ];

    QUnit.test('turfHelper.trimPaths should be of type function', function (assert) {
        assert.equal(typeof turfHelper.trimPaths, 'function', 'turfHelper.trimPaths should be of type function');
    });


    QUnit.test('turfHelper.trimPaths Using older method, it should find the correct intersection point and trim the segments on it', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var path1 = turfHelper.toLatLngs(line1);
            var path2 = turfHelper.toLatLngs(line2);

            var result1 = turfHelper.trimPaths(path1, path2, true);

            assert.deepEqual(result1, trimResult1, 'Using older method, it should find the correct intersection point and trim the segments on it');
            done();
        };
        if (window.gmaps.then) {
            window.gmaps.then(function (gmaps) {
                runtest(gmaps);
            })
        } else {
            runtest(window.gmaps);
        }
    });

    QUnit.test('turfHelper.trimPaths Using turf-line-intersect, it should find the correct intersection point and trim the segments on it', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var path1 = turfHelper.toLatLngs(line1);
            var path2 = turfHelper.toLatLngs(line2);

            var result2 = turfHelper.trimPaths(path1, path2);

            assert.deepEqual(result2, trimResult2, 'Using turf-line-intersect, it should find the correct intersection point and trim the segments on it');
            done();
        };
        if (window.gmaps.then) {
            window.gmaps.then(function (gmaps) {
                runtest(gmaps);
            })
        } else {
            runtest(window.gmaps);
        }
    });
})(QUnit);
