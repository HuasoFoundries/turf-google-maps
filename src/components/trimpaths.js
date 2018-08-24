import {
	default as _filter
} from 'lodash-es/filter.js';
import {
	default as _max
} from 'lodash-es/max.js';
import {
	default as _min
} from 'lodash-es/min.js';

import {
	lineSlice as turf_line_slice,
	lineIntersect as turf_line_intersect,
	point as turf_point,
	lineString as turf_linestring,
	featureCollection as turf_featurecollection
} from '../turf.js';


import {
	debug
} from './utils.js';

import {
	toCoords,
	toLatLngs
} from './coords_to_latlng.js';

import {
	default as _isEqual
}
from 'lodash-es/isEqual.js';


/**
 * Takes two coordinates and returns the distance between them, in degrees
 * @param  {Array<number>} coord1 An array indicating a coordinate [lng, lat]
 * @param  {Array<number>} coord2 An array indicating a coordinate [lng, lat]
 * @return {number}        the distance between the points, in degrees 
 */
function diffCoords(coord1, coord2) {
	var vector = [Math.abs(coord1[0] - coord2[0]), Math.abs(coord1[1] - coord2[1])];
	return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
}

/**
 * Determina si dos lineas se intersectan
 * @param  {Array.<number>} line1Start [description]
 * @param  {Array.<number>} line1End   [description]
 * @param  {Array.<number>} line2Start [description]
 * @param  {Array.<number>} line2End   [description]
 * @param {boolean} useOldMethod if true, use old method instead of turf_line_intersect 
 * @return {Array}             [description]
 */
function lineIntersects(line1Start, line1End, line2Start, line2End, useOldMethod) {

	if (!useOldMethod) {
		var line1 = turf_linestring([line1Start, line1End]),
			line2 = turf_linestring([line2Start, line2End]),
			intersectionFC = turf_line_intersect(line1, line2);

		if (intersectionFC.features.length) {
			var intersection = intersectionFC.features[0].geometry.coordinates;
			intersection[0] = Math.round(intersection[0] * 100000000) / 100000000;
			intersection[1] = Math.round(intersection[1] * 100000000) / 100000000;
			return intersection;
		} else {
			return false;
		}
	}
	var line1StartX = line1Start[0],
		line1StartY = line1Start[1],
		line1EndX = line1End[0],
		line1EndY = line1End[1],
		line2StartX = line2Start[0],
		line2StartY = line2Start[1],
		line2EndX = line2End[0],
		line2EndY = line2End[1];
	// if the lines intersect, the result contains the x and y of the intersection
	// (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
	var denominator, a, b, numerator1, numerator2,
		result = {
			x: null,
			y: null,
			onLine1: false,
			onLine2: false
		};
	denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
	if (denominator === 0) {
		if (result.x !== null && result.y !== null) {
			return result;
		} else {
			return false;
		}
	}
	a = line1StartY - line2StartY;
	b = line1StartX - line2StartX;
	numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
	numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
	a = numerator1 / denominator;
	b = numerator2 / denominator;

	// if we cast these lines infinitely in both directions, they intersect here:
	result.x = line1StartX + (a * (line1EndX - line1StartX));
	result.y = line1StartY + (a * (line1EndY - line1StartY));

	// if line1 is a segment and line2 is infinite, they intersect if:
	if (a >= 0 && a <= 1) {
		result.onLine1 = true;
	}
	// if line2 is a segment and line1 is infinite, they intersect if:
	if (b >= 0 && b <= 1) {
		result.onLine2 = true;
	}
	// if line1 and line2 are segments, they intersect if both of the above are true
	if (result.onLine1 && result.onLine2) {
		result.x = Math.round(result.x * 100000000) / 100000000;
		result.y = Math.round(result.y * 100000000) / 100000000;

		return [result.x, result.y];
	} else {
		return false;
	}
}

/**
 * Takes two rings and finds their instersection points. If the rings are the same, the second ring is iterated skipping points already checked in the first one
 * @param  {Array.Array<number>} ring1 Array of coordinates [lng, lat]
 * @param  {Array.Array<number>} ring1 Array of coordinates [lng, lat]
 * @param {boolean} useOldMethod if true, use old method instead of turf_line_intersect 
 * @return {Object}       an object containing
 */
function traverseRings(ring1, ring2, useOldMethod) {
	var intersections = turf_featurecollection([]);

	var samering = false,
		consecutive = false;
	if (_isEqual(ring1, ring2)) {
		samering = true;
	}
	for (var i = 0; i < ring1.length - 1; i++) {
		var startK = samering ? i : 0;
		for (var k = startK; k < ring2.length - 1; k++) {
			// don't check adjacent sides of a given ring, since of course they intersect in a vertex.
			if (ring1 === ring2 && (Math.abs(i - k) === 1 || Math.abs(i - k) === ring1.length - 2)) {
				continue;
			}


			var intersection = lineIntersects(
				ring1[i],
				ring1[i + 1],
				ring2[k],
				ring2[k + 1],
				useOldMethod
			);
			if (!intersection) {
				continue;
			}

			// si son lineas consecutivas no quiero detectar el límite entre ambas
			if ((diffCoords(intersection, ring1[0]) < 0.000005 || diffCoords(intersection, ring1[ring1.length - 1]) < 0.000005) &&
				(diffCoords(intersection, ring2[0]) < 0.000005 || diffCoords(intersection, ring2[ring2.length - 1]) < 0.000005)) {
				continue;
			}

			//debug('intersection at',
			// intersection,
			//diffCoords(intersection, ring2[0]),
			//diffCoords(intersection, ring1[ring1.length - 1]));
			var FeatureIntersection = turf_point([intersection[0], intersection[1]]);
			FeatureIntersection.properties = {
				position1: i,
				position2: k
			};
			intersections.features.push(FeatureIntersection);

		}
	}
	return intersections;
};


/**
 * [polylineToFeatureLinestring description]
 * @param  {Array.<google.maps.LatLng>} polyline [description]
 * @return {Feature.Polyline}          [description]
 */
function polylineToFeatureLinestring(polyline) {
	var vertices = toCoords(polyline.getPath().getArray());
	return turf_linestring(vertices);
}


/**
 * Finds the {@link Point|points} where two {@link LineString|linestrings} intersect each other
 * @param  {Array.<google.maps.LatLng>} arrayLatLng1 array de posiciones {@link google.maps.LatLng}
 * @param  {Array.<google.maps.LatLng>} arrayLatLng2 array de posiciones {@link google.maps.LatLng}
 * @param {boolean} useOldMethod if true,use old method instead of turf_line_intersect 
 * @return {Array}        an array with [line1 trimmed at intersection,line2 trimmed at intersection,intersection ] 
 */
function trimPaths(arrayLatLng1, arrayLatLng2, useOldMethod) {

	var ring1 = toCoords(arrayLatLng1); // googleGeom1.geometry.coordinates;
	var ring2 = toCoords(arrayLatLng2); // googleGeom2.geometry.coordinates;


	var intersections = traverseRings(ring1, ring2, useOldMethod);

	if (intersections.features.length > 0) {

		var line1 = turf_linestring(ring1);
		var line2 = turf_linestring(ring2);
		var line1Start = turf_point(ring1[0]);
		var line2End = turf_point(ring2.slice(-1)[0]);
		var sliced1, sliced2;

		// The first segment of the first ring with a kink
		var first_segment_with_kinks = _min(intersections.features, function (kink) {
			return kink.properties.position1;
		});
		//console.log('first_segment_with_kinks', JSON.stringify(first_segment_with_kinks));

		// All the intersections which belong to the first segment with a kink of the first ring
		var kinks_in_first_segment = _filter(intersections.features, function (kink) {
			return kink.properties.position1 === first_segment_with_kinks.properties.position1;
		});

		// Among the kinks in the first segment, which one happens further along the ring2
		var chosenIntersection = _max(kinks_in_first_segment, function (kink) {
			return kink.properties.position2;
		});

		var intersectLatLng = toLatLngs([chosenIntersection.geometry.coordinates])[0];

		// if the first intersection happens in the first segment of line1
		// then we don't slice it
		if (chosenIntersection.properties.position1 === 0) {
			sliced1 = line1;
		} else {
			sliced1 = turf_line_slice(line1Start, chosenIntersection, line1);
		}

		// if the first intersection happens after the last segment of line2
		// then we don't slice it
		if (chosenIntersection.properties.position2 >= (ring2.length - 1)) {
			sliced2 = line2;
		} else {
			sliced2 = turf_line_slice(chosenIntersection, line2End, line2);
		}


		return [toLatLngs(sliced1.geometry.coordinates), toLatLngs(sliced2.geometry.coordinates), intersectLatLng];
	}
	return [];

};

export {
	trimPaths
}
