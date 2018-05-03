(function (QUnit) {

    QUnit.module("turfHelper conversion between coordinates and latlngs");

    var latLngLiterals = [{
            lng: -49.4384765625,
            lat: -8.79822545902
        },
        {
            lng: -39.7705078125,
            lat: -8.79822545902
        },
        {
            lng: -39.7705078125,
            lat: 0.48339270279
        },
        {
            lng: -49.4384765625,
            lat: 0.48339270279
        },
        {
            lng: -49.4384765625,
            lat: -8.79822545902
        }
    ];


    var coordinates = [
        [-49.4384765625, -8.79822545902],
        [-39.7705078125, -8.79822545902],
        [-39.7705078125, 0.48339270279],
        [-49.4384765625, 0.48339270279],
        [-49.4384765625, -8.79822545902]
    ];


    QUnit.test('turfHelper.toLatLngs should be of type function', function (assert) {
        assert.equal(typeof turfHelper.toLatLngs, 'function', 'turfHelper.toLatLngs should be of type function');
    });

    QUnit.test('turfHelper.toCoords should be of type function', function (assert) {
        assert.equal(typeof turfHelper.toCoords, 'function', 'turfHelper.toCoords should be of type function');
    });

    QUnit.test('turfHelper.toLatLngs should convert an array of coordinates to an array of google.maps.LatLngLiteral', function (assert) {
        var result = turfHelper.toLatLngs(coordinates);
        assert.deepEqual(result, latLngLiterals, 'turfHelper.toLatLngs should convert an array of coordinates to an array of google.maps.LatLngLiteral');
    });

    QUnit.test('turfHelper.toCoords should should convert an array of google.maps.LatLngLiteral to an array of coordinates', function (assert) {
        var result = turfHelper.toCoords(latLngLiterals);
        assert.deepEqual(result, coordinates, 'turfHelper.toCoords should should convert an array of google.maps.LatLngLiteral to an array of coordinates');
    });

})(QUnit);
