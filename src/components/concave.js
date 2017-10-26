import turf_concave from '@turf/concave';


import {
	arrayToFeaturePoints,
} from './utils.js';

/**
 * Takes a set of points and returns a concave hull polygon. Internally, this uses turf-tin to generate geometries.
 * @param  {Array<google.maps.LatLng>|Array<google.maps.LatLngLiteral>|google.maps.MVCArray} latLngArray array of google positions
 * @param  {number} maxEdge the size of an edge necessary for part of the hull to become concave (in miles)
 * @param  {string} units degrees, radians, miles, or kilometers
 * @return {Feature.<Polygon>}  a concave hull
 */
export function concave(latLngArray, maxEdge, units) {

	var FeatureCollection = arrayToFeaturePoints(latLngArray)
	return turf_concave(FeatureCollection, maxEdge, units);
};
