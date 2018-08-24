(function (QUnit) {


    QUnit.module("turfUtils  area");


    QUnit.test('turfUtils.area should be of type function', function (assert) {
        assert.equal(typeof turfUtils.area, 'function', 'turfUtils.area should be of type function');
    });
    QUnit.test('turfUtils.area converts a google.maps.Polygon into a Feature with Polygon geometry', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolygon = new gmaps.Polygon({
                paths: [{
                        lng: -70.682780,
                        lat: -33.43015
                    },
                    {
                        lng: -70.692350,
                        lat: -33.43821
                    },
                    {
                        lng: -70.687458,
                        lat: -33.44143
                    },
                    {
                        lng: -70.676085,
                        lat: -33.44143
                    },
                    {
                        lng: -70.665614,
                        lat: -33.43577
                    },
                    {
                        lng: -70.670206,
                        lat: -33.43018
                    },
                    {
                        lng: -70.678875,
                        lat: -33.42868
                    },
                    {
                        lng: -70.682780,
                        lat: -33.43015
                    }
                ]
            });


            var featurePolygon = {
                "type": "Feature",
                "properties": {},
                "geometry": {

                    "coordinates": [
                        [
                            [-70.682780, -33.43015],
                            [-70.692350, -33.43821],
                            [-70.687458, -33.44143],
                            [-70.676085, -33.44143],
                            [-70.665614, -33.43577],
                            [-70.670206, -33.43018],
                            [-70.678875, -33.42868],
                            [-70.682780, -33.43015]
                        ]
                    ],
                    "type": "Polygon"

                }
            };


            var result = Math.round(turfUtils.area(featurePolygon));

            var result2 = Math.round(turfUtils.area(gmPolygon));

            assert.equal(result, 2292087, 'turfUtils.area calculates correct area for a Feature Polygon');
            assert.equal(result2, 2292087, 'turfUtils.area calculates correct area for a google.maps.Polygon');
            done();
        };


        if (window.gmaps.then) {
            window.gmaps.then(function (gmaps) {
                runtest(gmaps);
            });
        } else {
            runtest(window.gmaps);
        }
    });
}(QUnit));
