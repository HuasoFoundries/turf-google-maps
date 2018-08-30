(function (QUnit) {


    QUnit.module("turfUtils  area");


    QUnit.test('area should be of type function', function (assert) {
        assert.equal(typeof turfUtils.area, 'function', 'area should be of type function');
    });
    QUnit.test('area calculates the correct area of a google.maps.Polygon', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolygon = new gmaps.Polygon(testAssets.areaPath);

            var result2 = Math.round(turfUtils.area(gmPolygon));

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

    QUnit.test('area calculates the correct area of a Feature.Polygon', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolygon = new gmaps.Polygon(testAssets.areaPath);

            var result = Math.round(turfUtils.area(testAssets.areaFeature));

            assert.equal(result, 2292087, 'area calculates correct area for a Feature Polygon');
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
