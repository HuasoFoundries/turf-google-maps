import {
	default as _max
} from 'lodash-es/max.js';
import {
	default as _min
} from 'lodash-es/min.js';

import turk_kinks from '@turf/kinks';

import turf_line_slice from '@turf/line-slice';

import turf_line_intersect from '@turf/line-intersect';

import {
	point as turf_point,
	lineString as turf_linestring,
	featureCollection as turf_featurecollection
} from '@turf/helpers';


import {
	debug,
	polylineToFeatureLinestring
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
 * (it is an ugly approach but still valid when applied to really close coordinates)
 * @param  {Array<number>} coord1 An array indicating a coordinate [lng, lat]
 * @param  {Array<number>} coord2 An array indicating a coordinate [lng, lat]
 * @return {number}        the distance between the points, in degrees
 * @private
 */
function diffCoords(coord1, coord2) {
	var vector = [Math.abs(coord1[0] - coord2[0]), Math.abs(coord1[1] - coord2[1])];
	return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
}

/**
 * Finds out if two segments intersect each other
 * @param  {Position} line1Start coordinates of first line start
 * @param  {Position} line1End   coordinates of first line end
 * @param  {Position} line2Start coordinates of second line start
 * @param  {Position} line2End   coordinates of second line end
 * @return {Position|Boolean} coordinates of the intersection, if any, or false
 * @private
 */
function findLineIntersection(line1Start, line1End, line2Start, line2End) {

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

/**
 * Takes two rings and finds their instersection points.
 * If the rings are the same, the second ring is iterated skipping points already checked in the first one
 * @param  {Array.<Position>} ring1 Array of coordinates [lng, lat]
 * @param  {Array.<Position>} ring2 Array of coordinates [lng, lat]
 * @return {FeatureCollection}   an FeatureCollection containing the line intersections
 * @private
 */
function traverseRings(ring1, ring2) {
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


			var intersection = findLineIntersection(
				ring1[i],
				ring1[i + 1],
				ring2[k],
				ring2[k + 1]
			);
			if (!intersection) {
				continue;
			}

			// if they are consecutive segments, I don't want to detect the point where they meet each other
			if ((diffCoords(intersection, ring1[0]) < 0.000005 || diffCoords(intersection, ring1[ring1.length - 1]) < 0.000005) &&
				(diffCoords(intersection, ring2[0]) < 0.000005 || diffCoords(intersection, ring2[ring2.length - 1]) < 0.000005)) {
				continue;
			}

			var FeatureIntersection = turf_point([intersection[0], intersection[1]]);
			FeatureIntersection.properties = {
				position1: i,
				position2: k
			};
			intersections.features.push(FeatureIntersection);

		}
	}
	return intersections;
}


/**
 * Finds the {@link Point|points} where two {@link google.maps.Polyline} intersect each other
 * @param  {Array.<google.maps.LatLng>} arrayLatLng1 array de posiciones {@link google.maps.LatLng}
 * @param  {Array.<google.maps.LatLng>} arrayLatLng2 array de posiciones {@link google.maps.LatLng}
 * @return {Array.<Array.<google.maps.LatLngLiteral>>}  an array with [line1 trimmed at intersection,line2 trimmed at intersection,intersection]
 */
function trimPaths(arrayLatLng1, arrayLatLng2) {

	var ring1 = toCoords(arrayLatLng1); // googleGeom1.geometry.coordinates;
	var ring2 = toCoords(arrayLatLng2); // googleGeom2.geometry.coordinates;


	var intersections = traverseRings(ring1, ring2);

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
		var kinks_in_first_segment = intersections.features.filter(function (kink) {
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

}

export {
	trimPaths
};
