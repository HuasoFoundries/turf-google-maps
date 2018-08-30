(function (QUnit) {

    QUnit.module("turfSubset Simplification");

    QUnit.test('simplifyFeature should be of type function', function (assert) {
        assert.equal(typeof turfSubset.simplifyFeature, 'function', 'simplifyFeature should be of type function');
    });

    QUnit.test('simplifyFeature should simplify a google.maps.Polygon into a Feature.Polygon', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolygon = new gmaps.Polygon({
                paths: testAssets.unsimplified_coords
            });


            var featurePolygon = {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [turfSubset.toCoords(testAssets.simplified_coords, true)]

                }
            };


            var result = turfSubset.simplifyFeature(gmPolygon, 'feature', {
                tolerance: 0.5
            });

            var simplified_result_geom = result.geometry.coordinates[0].map(function (point) {
                return roundCoord(point, 9);
            });
            result.geometry.coordinates = [
                simplified_result_geom
            ];

            assert.deepEqual(result, featurePolygon, 'simplifyFeature should simplify a google.maps.Polygon into a Feature.Polygon');
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

    QUnit.test('simplifyFeature should simplify a google.maps.Polyline into a Feature.LineString', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolyline = new gmaps.Polyline({
                path: testAssets.unsimplified_coords
            });


            var featurePolygon = {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": turfSubset.toCoords(testAssets.simplified_coords)

                }
            };


            var result = turfSubset.simplifyFeature(gmPolyline, 'feature', {
                tolerance: 0.5
            });

            var simplified_result_geom = result.geometry.coordinates.map(function (point) {
                return roundCoord(point, 9);
            });
            result.geometry.coordinates = simplified_result_geom;

            assert.deepEqual(result, featurePolygon, 'simplifyFeature should simplify a google.maps.Polyline into a Feature.LineString');
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
