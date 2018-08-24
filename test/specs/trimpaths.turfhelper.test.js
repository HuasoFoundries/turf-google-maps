(function (QUnit) {


    QUnit.module("turfHelper trimPaths");


    QUnit.test('trimPaths should be of type function', function (assert) {
        assert.equal(typeof turfHelper.trimPaths, 'function', 'trimPaths should be of type function');
    });


    QUnit.test('trimPaths should find the correct intersection point and trim the segments on it', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var path1 = turfHelper.toLatLngs(testAssets.lineToTrim1);
            var path2 = turfHelper.toLatLngs(testAssets.lineToTrim2);

            var result2 = turfHelper.trimPaths(path1, path2);

            assert.deepEqual(result2, testAssets.trimResult2, 'it should find the correct intersection point and trim the segments on it');
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
