(function (QUnit) {


    QUnit.module("turfHelper Polyline to Feature Linestring");


    QUnit.test('turfHelper.polylineToFeatureLinestring should be of type function', function (assert) {
        assert.equal(typeof turfHelper.polylineToFeatureLinestring, 'function', 'turfHelper.polylineToFeatureLinestring should be of type function');
    });
    QUnit.test('turfHelper.polylineToFeatureLinestring converts a google.maps.Polyline into a Feature with Polyline geometry', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolyline = new gmaps.Polyline({
                path: [{
                        lng: -49.438476562,
                        lat: -8.798225459
                    },
                    {
                        lng: -39.770507812,
                        lat: -8.798225459
                    },
                    {
                        lng: -39.770507812,
                        lat: 0.483392703
                    },
                    {
                        lng: -49.438476562,
                        lat: 5.483392703
                    },
                    {
                        lng: -51.4512345678,
                        lat: 8.798225459
                    }
                ]
            });


            var featurePolyline = {
                "geometry": {
                    "coordinates": [
                        [-49.438476562, -8.798225459],
                        [-39.770507812, -8.798225459],
                        [-39.770507812, 0.483392703],
                        [-49.438476562, 5.483392703],
                        [-51.451234568, 8.798225459]
                    ],
                    "type": "LineString"
                },
                "properties": {},
                "type": "Feature"
            };

            var result = turfHelper.polylineToFeatureLinestring(gmPolyline);

            var simplified_result_geom = result.geometry.coordinates.map(function (point) {
                return [Math.round(point[0] * 1000000000) / 1000000000, Math.round(point[1] * 1000000000) / 1000000000];
            });
            result.geometry.coordinates = simplified_result_geom;


            assert.deepEqual(result, featurePolyline, 'turfHelper.polylineToFeatureLinestring converts a google.maps.Polyline into a Feature with Linestring geometry');
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
