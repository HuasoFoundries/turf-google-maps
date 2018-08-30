(function (QUnit) {

    QUnit.module("turfHelper Entities");

    QUnit.test('along should be of type function', function (assert) {
        assert.equal(typeof turfHelper.along, 'function', 'along should be of type function');
    });
    QUnit.test('arrayToFeaturePoints should be of type function', function (assert) {
        assert.equal(typeof turfHelper.arrayToFeaturePoints, 'function', 'arrayToFeaturePoints should be of type function');
    });


    QUnit.test('union should be of type function', function (assert) {
        assert.equal(typeof turfHelper.union, 'function', 'union should be of type function');
    });


}(QUnit));
