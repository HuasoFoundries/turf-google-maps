(function (QUnit) {


    QUnit.module("turfHelper trimPaths");


    QUnit.test('trimPaths should be of type function', function (assert) {
        assert.equal(typeof turfHelper.trimPaths, 'function', 'trimPaths should be of type function');
    });


    QUnit.test('trimPaths line2 vs line1 should find the correct intersection point and trim the segments on it', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var path1 = turfHelper.toLatLngs(testAssets.lineToTrim1);
            var path2 = turfHelper.toLatLngs(testAssets.lineToTrim2);

            var result1 = turfHelper.trimPaths(path2, path1);

            result1[0] = result1[0].map(function (latLng) {
                return roundLatLng(latLng, 6);
            });
            result1[1] = result1[1].map(function (latLng) {
                return roundLatLng(latLng, 6);
            });


            assert.deepEqual(result1[0], testAssets.trimResult1[0], 'line2 vs line1: should trim the first path correctly');
            assert.deepEqual(result1[1], testAssets.trimResult1[1], 'line2 vs line1: should trim the second path correctly');
            assert.deepEqual(result1[2], testAssets.trimResult1[2], 'line2 vs line1: should find correct intersection point');
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

    QUnit.test('trimPaths line1 vs line2 should find the correct intersection point and trim the segments on it', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var path1 = turfHelper.toLatLngs(testAssets.lineToTrim1);
            var path2 = turfHelper.toLatLngs(testAssets.lineToTrim2);

            var result2 = turfHelper.trimPaths(path1, path2);


            result2[0] = result2[0].map(function (latLng) {
                return roundLatLng(latLng, 6);
            });
            result2[1] = result2[1].map(function (latLng) {
                return roundLatLng(latLng, 6);
            });


            assert.deepEqual(result2[0], testAssets.trimResult2[0], 'line1 vs line2: should trim the first path correctly');
            assert.deepEqual(result2[1], testAssets.trimResult2[1], 'line1 vs line2: should trim the second path correctly');
            assert.deepEqual(result2[2], testAssets.trimResult2[2], 'line1 vs line2: should find correct intersection point');
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
