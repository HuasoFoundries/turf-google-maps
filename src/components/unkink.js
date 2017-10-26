import turf_unkink from '@turf/unkink-polygon';

import {
	polygonToFeaturePolygon
} from './utils.js';

/**
 * Takes a kinked polygon and returns a feature collection of polygons that have no kinks. 
 * @param  {google.maps.Polygon|Array.<google.maps.LatLng>|Feature<Polygon>} object array of points, a google.maps.Polygon or Feature<Polygon>
 * @return {FeatureCollection<Polygon>}  Unkinked polygons
 */
export function unkink(object) {

	var polygonFeature = polygonToFeaturePolygon(object);

	return turf_unkink(polygonFeature);
};
