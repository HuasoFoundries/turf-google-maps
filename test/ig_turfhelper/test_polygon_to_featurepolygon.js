(function (QUnit) {


    QUnit.module("turfHelper Polygon to Feature Polygon");


    QUnit.test('turfHelper.polygonToFeaturePolygon should be of type function', function (assert) {
        assert.equal(typeof turfHelper.polygonToFeaturePolygon, 'function', 'turfHelper.polygonToFeaturePolygon should be of type function');
    });
    QUnit.test('turfHelper.polygonToFeaturePolygon converts a google.maps.Polygon into a Feature with Polygon geometry', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolygon = new gmaps.Polygon({
                paths: [{
                        lng: -49.4384765625,
                        lat: -8.79822545902
                    },
                    {
                        lng: -39.7705078125,
                        lat: -8.79822545902
                    },
                    {
                        lng: -39.7705078125,
                        lat: 0.48339270279
                    },
                    {
                        lng: -49.4384765625,
                        lat: 0.48339270279
                    },
                    {
                        lng: -49.4384765625,
                        lat: -8.79822545902
                    }
                ]
            });


            var featurePolygon = {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [-49.4384765625, -8.79822545902],
                            [-39.7705078125, -8.79822545902],
                            [-39.7705078125, 0.48339270279],
                            [-49.4384765625, 0.48339270279],
                            [-49.4384765625, -8.79822545902]
                        ]
                    ]

                }
            };


            var result = turfHelper.polygonToFeaturePolygon(gmPolygon);
            assert.deepEqual(result, featurePolygon, 'turfHelper.polygonToFeaturePolygon converts a google.maps.Polygon into a Feature with Polygon geometry');
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
