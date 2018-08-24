(function (QUnit) {

    QUnit.module("turfHelper Unkink");

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


    QUnit.test('turfHelper.unkink should be of type function', function (assert) {
        assert.equal(typeof turfHelper.unkink, 'function', 'turfHelper.unkink should be of type function');
    });


    QUnit.test('turfHelper.unkink should return a FeatureCollection of Polygons without kinks', function (assert) {
        var result = turfHelper.unkink(hourglass_in);

        assert.deepEqual(result, unkinked_hourglass, 'turfHelper.unkink should return a FeatureCollection of Polygons without kinks');
    });

}(QUnit));
