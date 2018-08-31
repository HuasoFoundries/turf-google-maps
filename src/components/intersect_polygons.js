import turf_intersect from '@turf/intersect';


import {
	warn,
	debug,
	polygonToFeaturePolygon,
} from './utils.js';

/**
 * Takes two polygons and returns their intersection Feature, or null if there is no intersection
 * @param  {google.maps.Polygon|Array.<google.maps.LatLng>|Feature.<Polygon>} polygon1 the first polygon
 * @param  {google.maps.Polygon|Array.<google.maps.LatLng>|Feature.<Polygon>} polygon2 the second polygon
 * @return {Feature|null}  a Feature containing the points, borders or area they share
 */
export function intersect_polygons(polygon1, polygon2) {


	if (!(polygon1 instanceof google.maps.Polygon && polygon2 instanceof google.maps.Polygon)) {
		warn('you must pass only google.maps.Polygons');
		return null;
	}
	let feature1 = polygonToFeaturePolygon(polygon1),
		feature2 = polygonToFeaturePolygon(polygon2),

		intersection = turf_intersect(feature1, feature2);
	return intersection;
}
