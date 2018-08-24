window.testAssets = window.testAssets || {};
var testAssets = window.testAssets;

testAssets.latLngLiterals = [{
		lng: -70.682780,
		lat: -33.43015
	},
	{
		lng: -70.692350,
		lat: -33.43821
	},
	{
		lng: -70.687458,
		lat: -33.44143
	},
	{
		lng: -70.676085,
		lat: -33.44143
	},
	{
		lng: -70.665614,
		lat: -33.43577
	},
	{
		lng: -70.670206,
		lat: -33.43018
	},
	{
		lng: -70.678875,
		lat: -33.42868
	},
	{
		lng: -70.682780,
		lat: -33.43015
	}
];


testAssets.coordinates = [
	[-70.682780, -33.43015],
	[-70.692350, -33.43821],
	[-70.687458, -33.44143],
	[-70.676085, -33.44143],
	[-70.665614, -33.43577],
	[-70.670206, -33.43018],
	[-70.678875, -33.42868],
	[-70.682780, -33.43015]
];


testAssets.areaPath = {
	paths: testAssets.latLngLiterals
};

testAssets.areaFeature = {
	"type": "Feature",
	"properties": {},
	"geometry": {

		"coordinates": [
			testAssets.coordinates
		],
		"type": "Polygon"

	}
};

testAssets.polygonPaths = {
	paths: [{
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
	]
};

testAssets.polylinePath = {
	path: [{
			lng: -49.438476562,
			lat: -8.798225459
		},
		{
			lng: -39.770507812,
			lat: -8.798225459
		},
		{
			lng: -39.770507812,
			lat: 0.483392703
		},
		{
			lng: -49.438476562,
			lat: 5.483392703
		},
		{
			lng: -51.4512345678,
			lat: 8.798225459
		}
	]
};

testAssets.convertedFeature = {
	"type": "Feature",
	"properties": {},
	"geometry": {
		"type": "Polygon",
		"coordinates": [
			[
				[-49.4384765625, -8.79822545902],
				[-39.7705078125, -8.79822545902],
				[-39.7705078125, 0.48339270279],
				[-49.4384765625, 0.48339270279],
				[-49.4384765625, -8.79822545902]
			]
		]

	}
};

testAssets.convertedPolyline = {
	"geometry": {
		"coordinates": [
			[-49.438476562, -8.798225459],
			[-39.770507812, -8.798225459],
			[-39.770507812, 0.483392703],
			[-49.438476562, 5.483392703],
			[-51.451234568, 8.798225459]
		],
		"type": "LineString"
	},
	"properties": {},
	"type": "Feature"
};
