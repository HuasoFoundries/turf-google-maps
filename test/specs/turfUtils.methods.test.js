(function (QUnit) {

    QUnit.module("turfUtils Entities");

    QUnit.test('turfUtils.arrayToFeaturePolygon should be of type function', function (assert) {
        assert.equal(typeof turfUtils.arrayToFeaturePolygon, 'function', 'turfUtils.arrayToFeaturePolygon should be of type function');
    });
    QUnit.test('turfUtils.arrayToFeaturePoints should be of type function', function (assert) {
        assert.equal(typeof turfUtils.arrayToFeaturePoints, 'function', 'turfUtils.arrayToFeaturePoints should be of type function');
    });


    QUnit.test('turfUtils.polygonToFeaturePolygonCollection should be of type function', function (assert) {
        assert.equal(typeof turfUtils.polygonToFeaturePolygonCollection, 'function', 'turfUtils.polygonToFeaturePolygonCollection should be of type function'); // eslint-disable-line max-len
    });


    QUnit.test('turfUtils.markerToFeaturePoint should be of type function', function (assert) {
        assert.equal(typeof turfUtils.markerToFeaturePoint, 'function', 'turfUtils.markerToFeaturePoint should be of type function');
    });

    QUnit.test('turfUtils.latlngToFeaturePoint should be of type function', function (assert) {
        assert.equal(typeof turfUtils.latlngToFeaturePoint, 'function', 'turfUtils.latlngToFeaturePoint should be of type function');
    });

}(QUnit));
