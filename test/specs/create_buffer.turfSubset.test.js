(function (QUnit) {


    QUnit.module("turfSubset Create Buffer");


    QUnit.test('createbuffer should be of type function', function (assert) {
        assert.equal(typeof turfSubset.createbuffer, 'function', 'createbuffer should be of type function');
    });
    QUnit.test('createbuffer should create a correct buffer at 500m from a google.maps.Polygon', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolygon = new gmaps.Polygon(testAssets.bufferPath);

            var result1 = turfSubset.createbuffer(gmPolygon, 'feature', 500, {
                units: 'meters',
                steps: 12
            });

            var simplified_result_geom1 = result1.geometry.coordinates[0].map(function (point) {
                return roundCoord(point, 7);
            });

            result1.geometry.coordinates = [
                simplified_result_geom1
            ];


            assert.deepEqual(result1, testAssets.bufferActual1, 'createbuffer at 500m should create a correct buffer from a  google.maps.Polygon');

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

    QUnit.test('createbuffer should create a correct buffer at 500m from a google.maps.Polygon', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {

            var gmPolygon = new gmaps.Polygon(testAssets.bufferPath);


            var result2 = turfSubset.createbuffer(gmPolygon, 'feature', 100, {
                units: 'meters',
                steps: 12
            });


            var simplified_result_geom2 = result2.geometry.coordinates[0].map(function (point) {
                return roundCoord(point, 7);
            });
            result2.geometry.coordinates = [
                simplified_result_geom2
            ];


            assert.deepEqual(result2, testAssets.bufferActual2, 'createbuffer at 100m should create a correct buffer from a  google.maps.Polygon');
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
