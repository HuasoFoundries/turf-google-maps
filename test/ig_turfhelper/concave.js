(function (QUnit) {


    QUnit.module("turfHelper Concave");


    QUnit.test('turfHelper.concave should be of type function', function (assert) {
        assert.equal(typeof turfHelper.concave, 'function', 'turfHelper.concave should be of type function');
    });

    QUnit.test('turfHelper.concave should create a correct concave hull from an array of LatLngLiterals', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {


            var coords = [{
                    lng: -63.601226,
                    lat: 44.642643
                },
                {
                    lng: -63.591442,
                    lat: 44.651436
                },
                {
                    lng: -63.580799,
                    lat: 44.648749
                },
                {
                    lng: -63.573589,
                    lat: 44.641788
                },
                {
                    lng: -63.587665,
                    lat: 44.64533
                },
                {
                    lng: -63.595218,
                    lat: 44.64765
                }
            ];


            var featurePolygon = {
                "geometry": {
                    "coordinates": [
                        [
                            [-63.591442, 44.651436],
                            [-63.580799, 44.648749],
                            [-63.573589, 44.641788],
                            [-63.587665, 44.64533],
                            [-63.601226, 44.642643],
                            [-63.591442, 44.651436]
                        ]
                    ],
                    "type": "Polygon"
                },
                "properties": {},
                "type": "Feature"
            };


            var result = turfHelper.concave(coords, 2, 'kilometers');

            var simplified_result_geom = result.geometry.coordinates[0].map(function (point) {
                return [Math.round(point[0] * 1000000000) / 1000000000, Math.round(point[1] * 1000000000) / 1000000000];
            });
            result.geometry.coordinates = [
                simplified_result_geom
            ];


            assert.deepEqual(result, featurePolygon, 'turfHelper.concave should create a correct concave hull from an array of LatLngLiterals');
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
