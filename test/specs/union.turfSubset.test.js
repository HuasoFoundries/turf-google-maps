(function (QUnit) {

	QUnit.module("turfSubset Union");


	QUnit.test('union should be of type function', function (assert) {
		assert.equal(typeof turfSubset.union, 'function', 'union should be of type function');
	});


	QUnit.test('union combines two google.maps.Polygons correctly', function (assert) {
		var done = assert.async();

		var runtest = function (gmaps) {

			var gmPolygon1 = new gmaps.Polygon({
				path: testAssets.unionPath1
			});
			var gmPolygon2 = new gmaps.Polygon({
				path: testAssets.unionPath2
			});

			var result = turfSubset.union(gmPolygon1, gmPolygon2);

			assert.deepEqual(result, testAssets.unitedFeature, 'union combines two google.maps.Polygons correctly');
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

	QUnit.test('union combines three google.maps.Polygons correctly', function (assert) {
		var done = assert.async();

		var runtest = function (gmaps) {

			var gmPolygon1 = new gmaps.Polygon({
				path: testAssets.unionPath1
			});
			var gmPolygon2 = new gmaps.Polygon({
				path: testAssets.unionPath2
			});

			var gmPolygon3 = new gmaps.Polygon({
				path: testAssets.unionPath3
			});

			var result = turfSubset.union(gmPolygon1, gmPolygon2, gmPolygon3);

			assert.deepEqual(result, testAssets.unitedFeature2, 'union combines three google.maps.Polygons correctly');
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
