(function (QUnit) {


    QUnit.module("turfSubset Create Buffer");


    QUnit.test('createbuffer should be of type function', function (assert) {
        assert.equal(typeof turfSubset.createbuffer, 'function', 'createbuffer should be of type function');
    });
    QUnit.test('createbuffer should create a correct buffer from a  google.maps.Polygon', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolygon = new gmaps.Polygon(testAssets.bufferPath);

            var result = turfSubset.createbuffer(gmPolygon, 'feature', 500, {
                units: 'meters',
                steps: 12
            });

            var simplified_result_geom = result.geometry.coordinates[0].map(function (point) {
                return [Math.round(point[0] * 1000000000) / 1000000000, Math.round(point[1] * 1000000000) / 1000000000];
            });
            result.geometry.coordinates = [
                simplified_result_geom
            ];


            assert.deepEqual(result, testAssets.bufferActual1, 'createbuffer should create a correct buffer from a  google.maps.Polygon');
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
