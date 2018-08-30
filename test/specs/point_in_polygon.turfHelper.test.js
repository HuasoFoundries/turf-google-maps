(function (QUnit) {


    QUnit.module("turfHelper pointInPolygon");


    QUnit.test('pointInPolygon should be of type function', function (assert) {
        assert.equal(typeof turfHelper.pointInPolygon, 'function', 'pointInPolygon should be of type function');
    });

    QUnit.test('pointInPolygon detects which points are inside and outside a given Feature.Polygon', function (assert) {
        var done = assert.async();

        var runtest = function (gmaps) {


            var gmMarkerIn = new gmaps.Marker({
                position: testAssets.latLngInside
            });
            var gmMarkerOut = new gmaps.Marker({
                position: testAssets.latLngOutside
            });

            var result = turfHelper.pointInPolygon([gmMarkerIn, gmMarkerOut], testAssets.squareFeature);


            assert.equal(result.pointsInside[0].getPosition().toString(), gmMarkerIn.getPosition().toString(), 'find point inside polygon');
            assert.equal(result.pointsOutside[0].getPosition().toString(), gmMarkerOut.getPosition().toString(), 'find point outside polygon');
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
