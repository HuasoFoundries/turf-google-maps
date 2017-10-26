(function (QUnit) {

    QUnit.module("turfHelper Entities");

    QUnit.test('turfHelper.along should be of type function', function (assert) {
        assert.equal(typeof turfHelper.along, 'function', 'turfHelper.along should be of type function');
    });
    QUnit.test('turfHelper.arrayToFeaturePoints should be of type function', function (assert) {
        assert.equal(typeof turfHelper.arrayToFeaturePoints, 'function', 'turfHelper.arrayToFeaturePoints should be of type function');
    });


    QUnit.test('turfHelper.pointInPolygon should be of type function', function (assert) {
        assert.equal(typeof turfHelper.pointInPolygon, 'function', 'turfHelper.pointInPolygon should be of type function');
    });


    QUnit.test('turfHelper.union should be of type function', function (assert) {
        assert.equal(typeof turfHelper.union, 'function', 'turfHelper.union should be of type function');
    });


    QUnit.test('google.maps should be of type object', function (assert) {
        assert.equal(typeof google.maps, 'object', 'google.maps should be of type object');
    });
})(QUnit);
