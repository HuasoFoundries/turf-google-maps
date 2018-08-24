(function (QUnit) {


    QUnit.module("turfHelper Polygon to Feature Polygon");


    QUnit.test('polygonToFeaturePolygon should be of type function', function (assert) {
        assert.equal(typeof turfHelper.polygonToFeaturePolygon, 'function', 'polygonToFeaturePolygon should be of type function');
    });
    QUnit.test('polygonToFeaturePolygon converts a google.maps.Polygon into a Feature with Polygon geometry', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolygon = new gmaps.Polygon(testAssets.polygonPaths);

            var result = turfHelper.polygonToFeaturePolygon(gmPolygon);
            assert.deepEqual(result, testAssets.convertedFeature, 'converts a google.maps.Polygon into a Feature with Polygon geometry');
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
