import turf_union from '@turf/union';


import {
	polygonToFeaturePolygon,
} from './utils.js';

/**
 * Takes two or more polygons and returns a combined polygon or multipolygon
 * @param  {google.maps.Polygon|Array.<google.maps.LatLng>|Feature.Polygon} polygons N objects to combine
 * @return {Feature.<Polygon>|Feature.<MultiPolygon>}  result of the union. If inputs are disjoint, returns a Feature.Multipolygon
 */
export function union(...polygons) {
	let polyArray = polygons.map((polygon) => {
			return polygonToFeaturePolygon(polygon);
		}),
		FeatureUnion = turf_union.apply(turf_union, polyArray);
	return FeatureUnion;
}
