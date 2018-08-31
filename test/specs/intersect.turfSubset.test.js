(function (QUnit) {

	QUnit.module("turfSubset intersect_polygons");


	QUnit.test('intersect_polygons should be of type function', function (assert) {
		assert.equal(typeof turfSubset.intersect_polygons, 'function', 'intersect_polygons should be of type function');
	});


	QUnit.test('find the correct intersection of two google.maps.Polygons', function (assert) {
		var done = assert.async();

		var runtest = function (gmaps) {

			var gmPolygon1 = new gmaps.Polygon({
				path: testAssets.unionPath1
			});
			var gmPolygon2 = new gmaps.Polygon({
				path: testAssets.unionPath2
			});

			var result = turfSubset.intersect_polygons(gmPolygon1, gmPolygon2);

			assert.deepEqual(result, testAssets.intersectedFeature, 'find the correct intersection of two google.maps.Polygons');
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

	QUnit.skip('find the correct intersection of two Feature.Polygons', function (assert) {
		var done = assert.async();

		var runtest = function (gmaps) {


			var result = turfSubset.intersect_polygons(testAssets.squareFeature1, testAssets.squareFeature2);

			assert.deepEqual(result, testAssets.intersectedFeature, 'find the correct intersection of two Feature.Polygons');
			done();
		};

	});


}(QUnit));
