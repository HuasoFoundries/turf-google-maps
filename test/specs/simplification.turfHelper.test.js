(function (QUnit) {

    QUnit.module("turfHelper Simplification");

    QUnit.test('simplifyFeature should be of type function', function (assert) {
        assert.equal(typeof turfHelper.simplifyFeature, 'function', 'simplifyFeature should be of type function');
    });
    QUnit.test('simplifyPointArray should be of type function', function (assert) {
        assert.equal(typeof turfHelper.simplifyPointArray, 'function', 'simplifyPointArray should be of type function');
    });
    QUnit.test('simplifyPointArray simplifies points correctly with the given tolerance', function (assert) {

        var result = turfHelper.simplifyPointArray(turfHelper.toCoords(testAssets.unsimplified_coords), {
            tolerance: 0.5
        });

        assert.deepEqual(result, turfHelper.toCoords(testAssets.simplified_coords), 'simplifies points correctly with the given tolerance');
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
                    "coordinates": [turfHelper.toCoords(testAssets.simplified_coords, true)]

                }
            };


            var result = turfHelper.simplifyFeature(gmPolygon, 'feature', {
                tolerance: 0.5
            });

            var simplified_result_geom = result.geometry.coordinates[0].map(function (point) {
                return [Math.round(point[0] * 1000000000) / 1000000000, Math.round(point[1] * 1000000000) / 1000000000];
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
                    "coordinates": turfHelper.toCoords(testAssets.simplified_coords)

                }
            };


            var result = turfHelper.simplifyFeature(gmPolyline, 'feature', {
                tolerance: 0.5
            });

            var simplified_result_geom = result.geometry.coordinates.map(function (point) {
                return [Math.round(point[0] * 1000000000) / 1000000000, Math.round(point[1] * 1000000000) / 1000000000];
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
