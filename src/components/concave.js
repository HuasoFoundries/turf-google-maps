import turf_concave from '@turf/concave';


import {
	arrayToFeaturePoints,
} from './utils.js';

/**
 * Takes a set of points and returns a concave hull polygon. Internally, this uses turf-tin to generate geometries.
 * @param  {Array<google.maps.LatLng>|Array<google.maps.LatLngLiteral>|google.maps.MVCArray} latLngArray array of google positions
 * @param  {Object} options options to pass to the concave function
 * @param  {number} options.maxEdge - the size of an edge necessary for part of the hull to become concave (in chosen units)
 * @param  {string} options.units - degrees, radians, miles, or kilometers. Defaults to kilometers
 * @return {Feature.<Polygon>}  a concave hull
 */
export function concave(latLngArray, options) {
	options = options || {};
	var FeatureCollection = arrayToFeaturePoints(latLngArray);
	return turf_concave(FeatureCollection, options);
}
