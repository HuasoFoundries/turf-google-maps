(function (QUnit) {

    QUnit.module("turfHelper Kinks");


    QUnit.test('kinks should be of type function', function (assert) {
        assert.equal(typeof turfHelper.kinks, 'function', 'kinks should be of type function');
    });


    QUnit.test('kinks finds kinks correctly on a testAssets.kinkMultipolygon', function (assert) {
        var result = turfHelper.kinks(testAssets.kinkMultipolygon_in);
        assert.deepEqual(result, testAssets.kinkMultipolygon_out, 'finds kinks correctly on a testAssets.kinkMultipolygon');
    });

    QUnit.test('kinks finds kinks correctly on a polygon with one self intersection', function (assert) {
        var result = turfHelper.kinks(testAssets.hourglass_in);
        assert.deepEqual(result, testAssets.hourglass_out, 'finds kinks correctly on polygon with one self intersection');
    });


}(QUnit));
