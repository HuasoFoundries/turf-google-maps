(function (QUnit) {

    QUnit.module("turfHelper Kinks");

    var hourglass_in = {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-50, 5],
                    [-40, -10],
                    [-50, -10],
                    [-40, 5],
                    [-50, 5]
                ]
            ]
        }
    };

    var hourglass_out = {
        "features": [{
            "geometry": {
                "coordinates": [-45, -2.5],
                "type": "Point"
            },
            "properties": {},
            "type": "Feature"
        }],
        "type": "FeatureCollection"
    };

    var multipolygon_in = {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [
                        [-49.43847656249999, -8.798225459016345],
                        [-39.7705078125, -8.798225459016345],
                        [-39.7705078125, 0.4833927027896987],
                        [-49.43847656249999, 0.4833927027896987],
                        [-49.43847656249999, -8.798225459016345]
                    ]
                ],
                [
                    [
                        [-45, -13.795406203132826],
                        [-35.2001953125, -13.795406203132826],
                        [-35.2001953125, -4.083452772038619],
                        [-45, -4.083452772038619],
                        [-45, -13.795406203132826]
                    ]
                ]
            ]
        }
    };

    var multipolygon_out = {
        "features": [{
                "geometry": {
                    "coordinates": [-45, -8.798225459016345],
                    "type": "Point"
                },
                "properties": {},
                "type": "Feature"
            },
            {
                "geometry": {
                    "coordinates": [-39.7705078125, -4.08345277203862],
                    "type": "Point"
                },
                "properties": {},
                "type": "Feature"
            }
        ],
        "type": "FeatureCollection"
    };


    var unkinked_hourglass = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-50, 5],
                        [-45, -2.5],
                        [-40, 5],
                        [-50, 5]
                    ]
                ]
            }
        }, {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-45, -2.5],
                        [-40, -10],
                        [-50, -10],
                        [-45, -2.5]
                    ]
                ]
            }
        }]
    };


    QUnit.test('turfHelper.kinks should be of type function', function (assert) {
        assert.equal(typeof turfHelper.kinks, 'function', 'turfHelper.kinks should be of type function');
    });

    QUnit.test('turfHelper.unkink should be of type function', function (assert) {
        assert.equal(typeof turfHelper.unkink, 'function', 'turfHelper.unkink should be of type function');
    });

    QUnit.test('turfHelper.kinks finds kinks correctly on a multipolygon', function (assert) {
        var result = turfHelper.kinks(multipolygon_in);
        assert.deepEqual(result, multipolygon_out, 'finds kinks correctly on a multipolygon');
    });

    QUnit.test('turfHelper.kinks finds kinks correctly on a polygon with one self intersection', function (assert) {
        var result = turfHelper.kinks(hourglass_in);
        assert.deepEqual(result, hourglass_out, 'finds kinks correctly on polygon with one self intersection');
    });

    QUnit.test('turfHelper.unkink should return a FeatureCollection of Polygons without kinks', function (assert) {
        var result = turfHelper.unkink(hourglass_in);

        assert.deepEqual(result, unkinked_hourglass, 'turfHelper.unkink should return a FeatureCollection of Polygons without kinks');
    });

})(QUnit);
