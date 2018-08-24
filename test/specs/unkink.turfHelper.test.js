(function (QUnit) {

    QUnit.module("turfHelper Unkink");


    QUnit.test('unkink should be of type function', function (assert) {
        assert.equal(typeof turfHelper.unkink, 'function', 'unkink should be of type function');
    });


    QUnit.test('unkink should return a FeatureCollection of Polygons without kinks', function (assert) {
        var result = turfHelper.unkink(testAssets.hourglass_in);

        assert.deepEqual(result, testAssets.unkinked_hourglass, 'unkink should return a FeatureCollection of Polygons without kinks');
    });

}(QUnit));
