(function (QUnit) {

    QUnit.module("turfHelper Simplification");

    var points = [{
        lng: 22.455,
        lat: 25.015
    }, {
        lng: 22.691,
        lat: 24.419
    }, {
        lng: 23.331,
        lat: 24.145
    }, {
        lng: 23.498,
        lat: 23.606
    }, {
        lng: 24.421,
        lat: 23.276
    }, {
        lng: 26.259,
        lat: 21.531
    }, {
        lng: 26.776,
        lat: 21.381
    }, {
        lng: 27.357,
        lat: 20.184
    }, {
        lng: 27.312,
        lat: 19.216
    }, {
        lng: 27.762,
        lat: 18.903
    }, {
        lng: 28.036,
        lat: 18.141
    }, {
        lng: 28.651,
        lat: 17.774
    }, {
        lng: 29.241,
        lat: 15.937
    }, {
        lng: 29.691,
        lat: 15.564
    }, {
        lng: 31.495,
        lat: 15.137
    }, {
        lng: 31.975,
        lat: 14.516
    }, {
        lng: 33.033,
        lat: 13.757
    }, {
        lng: 34.148,
        lat: 13.996
    }, {
        lng: 36.998,
        lat: 13.789
    }, {
        lng: 38.739,
        lat: 14.251
    }, {
        lng: 39.128,
        lat: 13.939
    }, {
        lng: 40.952,
        lat: 14.114
    }, {
        lng: 41.482,
        lat: 13.975
    }, {
        lng: 42.772,
        lat: 12.730
    }, {
        lng: 43.960,
        lat: 11.974
    }, {
        lng: 47.493,
        lat: 10.787
    }, {
        lng: 48.651,
        lat: 10.675
    }, {
        lng: 48.920,
        lat: 10.945
    }, {
        lng: 49.379,
        lat: 10.863
    }, {
        lng: 50.474,
        lat: 11.966
    }, {
        lng: 51.296,
        lat: 12.235
    }, {
        lng: 51.863,
        lat: 12.089
    }, {
        lng: 52.409,
        lat: 12.688
    }, {
        lng: 52.957,
        lat: 12.786
    }, {
        lng: 53.421,
        lat: 14.093
    }, {
        lng: 53.927,
        lat: 14.724
    }, {
        lng: 56.769,
        lat: 14.891
    }, {
        lng: 57.525,
        lat: 15.726
    }, {
        lng: 58.062,
        lat: 15.815
    }, {
        lng: 60.153,
        lat: 15.685
    }, {
        lng: 61.774,
        lat: 15.986
    }, {
        lng: 62.200,
        lat: 16.704
    }, {
        lng: 62.955,
        lat: 19.460
    }, {
        lng: 63.890,
        lat: 19.561
    }, {
        lng: 64.126,
        lat: 20.081
    }, {
        lng: 65.177,
        lat: 20.456
    }, {
        lng: 67.155,
        lat: 22.255
    }, {
        lng: 68.368,
        lat: 21.745
    }, {
        lng: 69.525,
        lat: 21.915
    }, {
        lng: 70.064,
        lat: 21.798
    }, {
        lng: 70.312,
        lat: 21.436
    }, {
        lng: 71.226,
        lat: 21.587
    }, {
        lng: 72.149,
        lat: 21.281
    }, {
        lng: 72.781,
        lat: 21.336
    }, {
        lng: 72.998,
        lat: 20.873
    }, {
        lng: 73.532,
        lat: 20.820
    }, {
        lng: 73.994,
        lat: 20.477
    }, {
        lng: 76.998,
        lat: 20.842
    }, {
        lng: 77.960,
        lat: 21.687
    }, {
        lng: 78.420,
        lat: 21.816
    }, {
        lng: 80.024,
        lat: 21.462
    }, {
        lng: 81.053,
        lat: 21.973
    }, {
        lng: 81.719,
        lat: 22.682
    }, {
        lng: 82.077,
        lat: 23.617
    }, {
        lng: 82.723,
        lat: 23.616
    }, {
        lng: 82.989,
        lat: 23.989
    }, {
        lng: 85.100,
        lat: 24.894
    }, {
        lng: 85.988,
        lat: 25.549
    }, {
        lng: 86.521,
        lat: 26.853
    }, {
        lng: 85.795,
        lat: 28.030
    }, {
        lng: 86.548,
        lat: 29.145
    }, {
        lng: 86.681,
        lat: 29.866
    }, {
        lng: 86.468,
        lat: 30.271
    }, {
        lng: 86.779,
        lat: 30.617
    }, {
        lng: 85.987,
        lat: 31.137
    }, {
        lng: 86.008,
        lat: 31.435
    }, {
        lng: 85.829,
        lat: 31.494
    }, {
        lng: 85.810,
        lat: 32.760
    }, {
        lng: 85.454,
        lat: 33.540
    }, {
        lng: 86.092,
        lat: 34.300
    }, {
        lng: 85.643,
        lat: 35.015
    }, {
        lng: 85.142,
        lat: 35.296
    }, {
        lng: 84.984,
        lat: 35.959
    }, {
        lng: 85.456,
        lat: 36.553
    }, {
        lng: 84.974,
        lat: 37.038
    }, {
        lng: 84.409,
        lat: 37.189
    }, {
        lng: 84.475,
        lat: 38.044
    }, {
        lng: 84.152,
        lat: 38.367
    }, {
        lng: 83.957,
        lat: 39.040
    }, {
        lng: 84.559,
        lat: 39.905
    }, {
        lng: 84.840,
        lat: 40.755
    }, {
        lng: 84.371,
        lat: 41.130
    }, {
        lng: 84.409,
        lat: 41.988
    }, {
        lng: 83.951,
        lat: 43.276
    }, {
        lng: 84.133,
        lat: 44.104
    }, {
        lng: 84.762,
        lat: 44.922
    }, {
        lng: 84.716,
        lat: 45.844
    }, {
        lng: 85.138,
        lat: 46.279
    }, {
        lng: 85.397,
        lat: 47.115
    }, {
        lng: 86.636,
        lat: 48.077
    }];

    var simplified = [{
        lng: 22.455,
        lat: 25.015
    }, {
        lng: 26.776,
        lat: 21.381
    }, {
        lng: 29.691,
        lat: 15.564
    }, {
        lng: 33.033,
        lat: 13.757
    }, {
        lng: 40.952,
        lat: 14.114
    }, {
        lng: 43.960,
        lat: 11.974
    }, {
        lng: 48.651,
        lat: 10.675
    }, {
        lng: 52.957,
        lat: 12.786
    }, {
        lng: 53.927,
        lat: 14.724
    }, {
        lng: 61.774,
        lat: 15.986
    }, {
        lng: 62.955,
        lat: 19.460
    }, {
        lng: 67.155,
        lat: 22.255
    }, {
        lng: 72.781,
        lat: 21.336
    }, {
        lng: 73.994,
        lat: 20.477
    }, {
        lng: 76.998,
        lat: 20.842
    }, {
        lng: 77.960,
        lat: 21.687
    }, {
        lng: 80.024,
        lat: 21.462
    }, {
        lng: 82.077,
        lat: 23.617
    }, {
        lng: 85.988,
        lat: 25.549
    }, {
        lng: 86.521,
        lat: 26.853
    }, {
        lng: 85.795,
        lat: 28.030
    }, {
        lng: 86.779,
        lat: 30.617
    }, {
        lng: 85.987,
        lat: 31.137
    }, {
        lng: 85.454,
        lat: 33.540
    }, {
        lng: 86.092,
        lat: 34.300
    }, {
        lng: 84.984,
        lat: 35.959
    }, {
        lng: 85.456,
        lat: 36.553
    }, {
        lng: 84.409,
        lat: 37.189
    }, {
        lng: 83.957,
        lat: 39.040
    }, {
        lng: 84.840,
        lat: 40.755
    }, {
        lng: 83.951,
        lat: 43.276
    }, {
        lng: 85.397,
        lat: 47.115
    }, {
        lng: 86.636,
        lat: 48.077
    }];

    QUnit.test('turfHelper.simplifyFeature should be of type function', function (assert) {
        assert.equal(typeof turfHelper.simplifyFeature, 'function', 'turfHelper.simplifyFeature should be of type function');
    });
    QUnit.test('turfHelper.simplifyPointArray should be of type function', function (assert) {
        assert.equal(typeof turfHelper.simplifyPointArray, 'function', 'turfHelper.simplifyPointArray should be of type function');
    });
    QUnit.test('turfHelper.simplifyPointArray simplifies points correctly with the given tolerance', function (assert) {
        var result = turfHelper.simplifyPointArray(turfHelper.toCoords(points), 0.5);
        assert.deepEqual(result, turfHelper.toCoords(simplified), 'simplifies points correctly with the given tolerance');
    });

    QUnit.test('turfHelper.simplifyFeature should simplify a google.maps.Polygon into a Feature.Polygon', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolygon = new gmaps.Polygon({
                paths: points
            });


            var featurePolygon = {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [turfHelper.toCoords(simplified, true)]

                }
            };


            var result = turfHelper.simplifyFeature(gmPolygon, 'feature', 0.5);

            var simplified_result_geom = result.geometry.coordinates[0].map(function (point) {
                return [Math.round(point[0] * 1000000000) / 1000000000, Math.round(point[1] * 1000000000) / 1000000000];
            });
            result.geometry.coordinates = [
                simplified_result_geom
            ];

            assert.deepEqual(result, featurePolygon, 'turfHelper.simplifyFeature should simplify a google.maps.Polygon into a Feature.Polygon');
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

    QUnit.test('turfHelper.simplifyFeature should simplify a google.maps.Polyline into a Feature.LineString', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolyline = new gmaps.Polyline({
                path: points
            });


            var featurePolygon = {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": turfHelper.toCoords(simplified)

                }
            };


            var result = turfHelper.simplifyFeature(gmPolyline, 'feature', 0.5);

            var simplified_result_geom = result.geometry.coordinates.map(function (point) {
                return [Math.round(point[0] * 1000000000) / 1000000000, Math.round(point[1] * 1000000000) / 1000000000];
            });
            result.geometry.coordinates = simplified_result_geom;

            assert.deepEqual(result, featurePolygon, 'turfHelper.simplifyFeature should simplify a google.maps.Polyline into a Feature.LineString');
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
