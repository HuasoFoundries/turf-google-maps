(function (QUnit) {


    QUnit.module("turfUtils Polygon to FeatureCollection");


    QUnit.test('polygonToFeaturePolygonCollection should be of type function', function (assert) {
        assert.equal(typeof turfUtils.polygonToFeaturePolygonCollection, 'function', 'polygonToFeaturePolygonCollection should be of type function');
    });
    QUnit.test('polygonToFeaturePolygonCollection converts a google.maps.Polygon into a FeatureCollection of points', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolygon = new gmaps.Polygon(testAssets.polygonPaths);

            var result = turfUtils.polygonToFeaturePolygonCollection(gmPolygon);
            assert.deepEqual(result, testAssets.pointsFC, 'converts a google.maps.Polygon into a FeatureCollection of Points');
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
