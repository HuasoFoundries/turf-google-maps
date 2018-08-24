window.testAssets = window.testAssets || {};
var testAssets = window.testAssets;

testAssets.hourglass_in = {
	"type": "Feature",
	"properties": {},
	"geometry": {
		"type": "Polygon",
		"coordinates": [
			[
				[-50, 5],
				[-40, -10],
				[-50, -10],
				[-40, 5],
				[-50, 5]
			]
		]
	}
};

testAssets.unkinked_hourglass = {
	"type": "FeatureCollection",
	"features": [{
		"type": "Feature",
		"properties": {},
		"geometry": {
			"type": "Polygon",
			"coordinates": [
				[
					[-50, 5],
					[-45, -2.5],
					[-40, 5],
					[-50, 5]
				]
			]
		}
	}, {
		"type": "Feature",
		"properties": {},
		"geometry": {
			"type": "Polygon",
			"coordinates": [
				[
					[-45, -2.5],
					[-40, -10],
					[-50, -10],
					[-45, -2.5]
				]
			]
		}
	}]
};


testAssets.hourglass_out = {
	"features": [{
		"geometry": {
			"coordinates": [-45, -2.5],
			"type": "Point"
		},
		"properties": {},
		"type": "Feature"
	}],
	"type": "FeatureCollection"
};

testAssets.kinkMultipolygon_in = {
	"type": "Feature",
	"properties": {},
	"geometry": {
		"type": "MultiPolygon",
		"coordinates": [
			[
				[
					[-49.43847656249999, -8.798225459016345],
					[-39.7705078125, -8.798225459016345],
					[-39.7705078125, 0.4833927027896987],
					[-49.43847656249999, 0.4833927027896987],
					[-49.43847656249999, -8.798225459016345]
				]
			],
			[
				[
					[-45, -13.795406203132826],
					[-35.2001953125, -13.795406203132826],
					[-35.2001953125, -4.083452772038619],
					[-45, -4.083452772038619],
					[-45, -13.795406203132826]
				]
			]
		]
	}
};

testAssets.kinkMultipolygon_out = {
	"features": [{
			"geometry": {
				"coordinates": [-45, -8.798225459016345],
				"type": "Point"
			},
			"properties": {},
			"type": "Feature"
		},
		{
			"geometry": {
				"coordinates": [-39.7705078125, -4.08345277203862],
				"type": "Point"
			},
			"properties": {},
			"type": "Feature"
		}
	],
	"type": "FeatureCollection"
};
