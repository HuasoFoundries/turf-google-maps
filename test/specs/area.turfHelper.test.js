(function (QUnit) {


    QUnit.module("turfHelper area");


    QUnit.test('area should be of type function', function (assert) {
        assert.equal(typeof turfHelper.area, 'function', 'area should be of type function');
    });
    QUnit.test('area converts a google.maps.Polygon into a Feature with Polygon geometry', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolygon = new gmaps.Polygon(testAssets.areaPath);

            var result = Math.round(turfHelper.area(testAssets.areaFeature));

            var result2 = Math.round(turfHelper.area(gmPolygon));

            assert.equal(result, 2292087, 'area calculates correct area for a Feature Polygon');
            assert.equal(result2, 2292087, 'area calculates correct area for a google.maps.Polygon');
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
