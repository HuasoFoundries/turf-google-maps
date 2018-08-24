(function (QUnit) {

    QUnit.module("turfHelper conversion between coordinates and latlngs");


    QUnit.test('toLatLngs should be of type function', function (assert) {
        assert.equal(typeof turfHelper.toLatLngs, 'function', 'toLatLngs should be of type function');
    });

    QUnit.test('toCoords should be of type function', function (assert) {
        assert.equal(typeof turfHelper.toCoords, 'function', 'toCoords should be of type function');
    });

    QUnit.test('toLatLngs should convert an array of coordinates to an array of google.maps.LatLngLiteral', function (assert) {
        var result = turfHelper.toLatLngs(testAssets.coordinates);
        assert.deepEqual(result, testAssets.latLngLiterals, 'toLatLngs should convert an array of coordinates to an array of google.maps.LatLngLiteral'); // eslint-disable-line max-len
    });

    QUnit.test('toCoords should should convert an array of google.maps.LatLngLiteral to an array of coordinates', function (assert) {
        var result = turfHelper.toCoords(testAssets.latLngLiterals);
        assert.deepEqual(result, testAssets.coordinates, 'toCoords should should convert an array of google.maps.LatLngLiteral to an array of coordinates'); // eslint-disable-line max-len
    });

}(QUnit));
