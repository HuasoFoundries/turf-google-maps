(function (QUnit) {

    QUnit.module("turfUtils Entities");

    QUnit.test('arrayToFeaturePolygon should be of type function', function (assert) {
        assert.equal(typeof turfUtils.arrayToFeaturePolygon, 'function', 'arrayToFeaturePolygon should be of type function');
    });
    QUnit.test('arrayToFeaturePoints should be of type function', function (assert) {
        assert.equal(typeof turfUtils.arrayToFeaturePoints, 'function', 'arrayToFeaturePoints should be of type function');
    });


    QUnit.test('polygonToFeaturePolygonCollection should be of type function', function (assert) {
        assert.equal(typeof turfUtils.polygonToFeaturePolygonCollection, 'function', 'polygonToFeaturePolygonCollection should be of type function'); // eslint-disable-line max-len
    });


    QUnit.test('markerToFeaturePoint should be of type function', function (assert) {
        assert.equal(typeof turfUtils.markerToFeaturePoint, 'function', 'markerToFeaturePoint should be of type function');
    });

    QUnit.test('latlngToFeaturePoint should be of type function', function (assert) {
        assert.equal(typeof turfUtils.latlngToFeaturePoint, 'function', 'latlngToFeaturePoint should be of type function');
    });

}(QUnit));
