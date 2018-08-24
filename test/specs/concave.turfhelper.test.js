(function (QUnit) {


    QUnit.module("turfHelper Concave");


    QUnit.test('concave should be of type function', function (assert) {
        assert.equal(typeof turfHelper.concave, 'function', 'concave should be of type function');
    });

    QUnit.test('concave should create a correct concave hull from an array of LatLngLiterals', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {


            var result = turfHelper.concave(testAssets.concaveLatLngs, {
                maxEdge: 2,
                units: 'kilometers'
            });

            var simplified_result_geom = result.geometry.coordinates[0].map(function (point) {
                return [Math.round(point[0] * 1000000000) / 1000000000, Math.round(point[1] * 1000000000) / 1000000000];
            });
            result.geometry.coordinates = [
                simplified_result_geom
            ];


            assert.deepEqual(result, testAssets.concaveFeaturePolygon, 'concave should create a correct concave hull from an array of LatLngLiterals'); // eslint-disable-line max-len
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
