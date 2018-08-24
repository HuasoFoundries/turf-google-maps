(function (QUnit) {

	QUnit.module("turfSubset Kinks");


	QUnit.test('kinks finds kinks correctly on a testAssets.kinkMultipolygon', function (assert) {
		var result = turfSubset.kinks(testAssets.kinkMultipolygon_in);
		assert.deepEqual(result, testAssets.kinkMultipolygon_out, 'finds kinks correctly on a testAssets.kinkMultipolygon');
	});

	QUnit.test('kinks finds kinks correctly on a polygon with one self intersection', function (assert) {
		var result = turfSubset.kinks(testAssets.hourglass_in);
		assert.deepEqual(result, testAssets.hourglass_out, 'finds kinks correctly on polygon with one self intersection');
	});


}(QUnit));
