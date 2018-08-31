window.testAssets = window.testAssets || {};
var testAssets = window.testAssets;

testAssets.squareFeature1 = {
	"type": "Feature",
	"properties": {},
	"geometry": {
		"type": "Polygon",
		"coordinates": [
			[
				[1, 1],
				[1, 2],
				[2, 2],
				[2, 1],
				[1, 1]
			]
		]

	}
};

testAssets.squareFeature2 = {
	"type": "Feature",
	"properties": {},
	"geometry": {
		"type": "Polygon",
		"coordinates": [
			[
				[1.5, 1.5],
				[1.5, 2.5],
				[2.5, 2.5],
				[2.5, 1.5],
				[1.5, 1.5]
			]
		]

	}
};


testAssets.intersectedFeature = {
	"geometry": {
		"coordinates": [
			[
				[1.5, 2],
				[2, 2],
				[2, 1.5],
				[1.5, 1.5],
				[1.5, 2]
			]
		],

		"type": "Polygon"
	},
	"properties": {},
	"type": "Feature"
};
testAssets.disjointPath = [{
		lng: 10,
		lat: 10
	},
	{
		lng: 10,
		lat: 20
	},
	{
		lng: 20,
		lat: 20
	},
	{
		lng: 20,
		lat: 10
	},
	{
		lng: 10,
		lat: 10
	}
];

testAssets.unionPath1 = [

	{
		lng: 1,
		lat: 1
	},
	{
		lng: 1,
		lat: 2
	},
	{
		lng: 2,
		lat: 2
	},
	{
		lng: 2,
		lat: 1
	},
	{
		lng: 1,
		lat: 1
	}
];

testAssets.unionPath2 = [

	{
		lng: 1.5,
		lat: 1.5
	},
	{
		lng: 1.5,
		lat: 2.5
	},
	{
		lng: 2.5,
		lat: 2.5
	},
	{
		lng: 2.5,
		lat: 1.5
	},
	{
		lng: 1.5,
		lat: 1.5
	}
];

testAssets.unionPath3 = [

	{
		lng: 0.5,
		lat: 0.5
	},
	{
		lng: 0.5,
		lat: 1.5
	},
	{
		lng: 1.5,
		lat: 1.5
	},
	{
		lng: 1.5,
		lat: 0
	},
	{
		lng: 0.5,
		lat: 0.5
	}
];

testAssets.unitedFeature = {
	"geometry": {
		"coordinates": [
			[
				[1, 1],
				[1, 2],
				[1.5, 2],
				[1.5, 2.5],
				[2.5, 2.5],
				[2.5, 1.5],
				[2, 1.5],
				[2, 1],
				[1, 1]
			]
		],
		"type": "Polygon"
	},
	"properties": {},
	"type": "Feature"
};

testAssets.unitedFeature2 = {
	"geometry": {
		"coordinates": [
			[
				[1, 1.5],
				[1, 2],
				[1.5, 2],
				[1.5, 2.5],
				[2.5, 2.5],
				[2.5, 1.5],
				[2, 1.5],
				[2, 1],
				[1.5, 1],
				[1.5, 0],
				[0.5, 0.5],
				[0.5, 1.5],
				[1, 1.5]
			]
		],

		"type": "Polygon"
	},
	"properties": {},
	"type": "Feature"
};

testAssets.latLngInside = {
	lat: 1.4,
	lng: 1.5
};
testAssets.latLngOutside = {
	lat: 2.4,
	lng: 2.5
};
