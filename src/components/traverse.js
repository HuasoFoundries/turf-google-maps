import {
	default as _isEqual
}
from 'lodash-es/isEqual.js';

import turf_helpers from '@turf/helpers';

var turf_point = turf_helpers.point,
	turf_featurecollection = turf_helpers.featureCollection;


function diffCoords(coord1, coord2) {
	var vector = [Math.abs(coord1[0] - coord2[0]), Math.abs(coord1[1] - coord2[1])];
	return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
}

/**
 * Determina si dos lineas se intersectan
 * @param  {Number} line1StartX [description]
 * @param  {Number} line1StartY [description]
 * @param  {Number} line1EndX   [description]
 * @param  {Number} line1EndY   [description]
 * @param  {Number} line2StartX [description]
 * @param  {Number} line2StartY [description]
 * @param  {Number} line2EndX   [description]
 * @param  {Number} line2EndY   [description]
 * @return {Array}             [description]
 */
function lineIntersects(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
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
		return [result.x, result.y];
	} else {
		return false;
	}
}

export function traverseRings(ring1, ring2) {
	var results = {
		intersections: turf_featurecollection([]),
		fixed: null
	};
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

			var intersection = lineIntersects(ring1[i][0], ring1[i][1], ring1[i + 1][0], ring1[i + 1][1],
				ring2[k][0], ring2[k][1], ring2[k + 1][0], ring2[k + 1][1]);

			// si son lineas consecutivas no quiero detectar el límite entre ambas
			if ((diffCoords(intersection, ring1[0]) < 0.000005 || diffCoords(intersection, ring1[ring1.length - 1]) < 0.000005) &&
				(diffCoords(intersection, ring2[0]) < 0.000005 || diffCoords(intersection, ring2[ring2.length - 1]) < 0.000005)) {
				continue;
			}
			if (intersection) {
				//debug('intersection at',
				// intersection,
				//diffCoords(intersection, ring2[0]),
				//diffCoords(intersection, ring1[ring1.length - 1]));
				var FeatureIntersection = turf_point([intersection[0], intersection[1]]);
				FeatureIntersection.properties = {
					position1: i,
					position2: k
				};
				results.intersections.features.push(FeatureIntersection);
			}
		}
	}
	return results;
};
