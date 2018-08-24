(function (QUnit) {

    QUnit.module("turfSubset  Unkink");

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


    QUnit.test('turfSubset.unkink should be of type function', function (assert) {
        assert.equal(typeof turfSubset.unkink, 'function', 'turfSubset.unkink should be of type function');
    });


    QUnit.test('turfSubset.unkink should return a FeatureCollection of Polygons without kinks', function (assert) {
        var result = turfSubset.unkink(hourglass_in);

        assert.deepEqual(result, unkinked_hourglass, 'turfSubset.unkink should return a FeatureCollection of Polygons without kinks');
    });

}(QUnit));
