(function (QUnit) {


    QUnit.module("turfUtils Polyline to Feature Linestring");


    QUnit.test('polylineToFeatureLinestring should be of type function', function (assert) {
        assert.equal(typeof turfUtils.polylineToFeatureLinestring, 'function', 'polylineToFeatureLinestring should be of type function');
    });
    QUnit.test('polylineToFeatureLinestring converts a google.maps.Polyline into a Feature with Polyline geometry', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolyline = new gmaps.Polyline(testAssets.polylinePath);

            var result = turfUtils.polylineToFeatureLinestring(gmPolyline);

            var simplified_result_geom = result.geometry.coordinates.map(function (point) {
                return roundCoord(point, 9);
            });
            result.geometry.coordinates = simplified_result_geom;


            assert.deepEqual(result, testAssets.convertedPolyline, 'polylineToFeatureLinestring converts a google.maps.Polyline into a Feature with Linestring geometry'); // eslint-disable-line max-len
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
