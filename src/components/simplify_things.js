import turf_simplify from '@turf/simplify';
import {
	toCoords
} from './coords_to_latlng.js';

import {
	Wicket,
	polygonToFeaturePolygon,
	debug,
	warn
} from './utils.js';

import {
	lineString as turf_linestring
} from '@turf/helpers';


/**
 * Simplifies an array of coordinates
 * @param  {Array.<google.maps.LatLng>|Array.<google.maps.LatLngLiteral>} coordArray Array of coordinates
 * @param  {object}  options - options to pass to the simplification function
 * @param  {mumber}  options.tolerance   simplification tolerance
 * @param  {boolean} options.highQuality - higher quality simplification (but slower)
 * @param  {boolean} options.mutate - allows GeoJSON input to be mutated (much faster)
 *
 * @return {Array.Array.<Number>}  Array of coordinates [lng,lat]
 */
export function simplifyPointArray(coordArray, options) {
	options = options || {};
	options.tolerance = options.tolerance || 0.00001;
	var Feature = turf_linestring(toCoords(coordArray));

	var simplifiedgeom = turf_simplify(Feature, options);
	return simplifiedgeom.geometry.coordinates;
}

/* eslint-disable max-len*/
/**
 * Simplified a Feature, google.maps.Polygon or google.maps.Polyline
 * @param  {google.maps.Polygon|google.maps.Polyline|Array.<google.maps.LatLng>|Feature.<Polygon>|Feature.<LineString>} object feature to be simplified
 * @param  {string}  output either 'feature', 'geometry' or 'object' (google maps). Case insensitive. Defaults to feature
 * @param  {object}  options - options to pass to the simplification function
 * @param  {mumber}  options.tolerance   simplification tolerance
 * @param  {boolean} options.highQuality - higher quality simplification (but slower)
 * @param  {boolean} options.mutate - allows GeoJSON input to be mutated (much faster)
 *
 * @return {Feature|Geometry|google.maps.Polygon|google.maps.Polyline} simplified Feature or Geometry
 */
export function simplifyFeature(object, output, options) {

	options = options || {};
	options.tolerance = options.tolerance || 0.00001;
	output = (output || 'feature').toLowerCase();

	var Feature;
	if (object instanceof google.maps.Polyline || object instanceof google.maps.Polygon) {
		var geometry = Wicket().fromObject(object).toJson();
		Feature = {
			type: "Feature",
			properties: {},
			geometry: geometry
		};
	} else if (object.type && object.type === 'Feature' && object.geometry) {
		Feature = object;
	} else {
		Feature = polygonToFeaturePolygon(object);
	}


	if (Feature.geometry.type === 'MultiPolygon') {
		Feature.geometry.type = 'Polygon';
		Feature.geometry.coordinates = Feature.geometry.coordinates[0];
	}
	var simplifiedgeom = turf_simplify(Feature, options);


	if (simplifiedgeom && simplifiedgeom.geometry) {
		//debug('Simplified Feature', Feature, 'simplifiedgeom', simplifiedgeom);
		Feature = simplifiedgeom;
	} else {
		warn('Cannot simplify  Feature', Feature);

	}
	if (output === 'geometry') {
		return Feature.geometry;
	} else if (output === 'object') {
		return Wicket().fromJson(Feature.geometry).toObject();
	} else {
		return Feature;
	}

}
/* eslint-enable max-len*/
