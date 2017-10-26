import {
	Wicket
} from './wicket_helper.js';


import turf_simplify from '@turf/simplify';
import {
	toCoords
} from './coords_to_latlng.js'
import {
	polygonToFeaturePolygon,
	debug,
	warn
} from './utils.js';

import turf_helpers from '@turf/helpers';

var turf_linestring = turf_helpers.lineString;


/**
 * Simplifies an array of coordinates
 * @param  {Array.<google.maps.LatLng>|Array.<google.maps.LatLngLiteral>} coordArray Array of coordinates
 * @param  {number} tolerance   [description]
 * @param  {boolean} highQuality [description]
 * @return {Array.<Number>}  Array de coordenadas [lng,lat]
 */
export function simplifyPointArray(coordArray, tolerance, highQuality) {
	tolerance = tolerance || 0.00001;
	highQuality = highQuality || false;
	var Feature = turf_linestring(toCoords(coordArray));

	var simplifiedgeom = turf_simplify(Feature, tolerance, highQuality);

	//debug('simplifyPointArray', 'geometry is', Feature.geometry, 'simplifiedgeom is', simplifiedgeom);

	return simplifiedgeom.geometry.coordinates;

};

/**
 * Simplified a Feature, google.maps.Polygon or google.maps.Polyline
 * @param  {google.maps.Polygon|google.maps.Polyline|Array.<google.maps.LatLng>|Feature.<Polygon>|Feature.<LineString>} object feature to be simplified
 * @param  {string} output either 'feature', 'geometry' or 'object' (google maps). Case insensitive. Defaults to feature
 * @param  {mumber} tolerance   simplification tolerance
 * @param  {boolean} highQuality [description]
 * @return {Feature|Geometry} whether or not to spend more time to create a higher-quality simplification with a different algorithm
 */
export function simplifyFeature(object, output, tolerance, highQuality) {

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
	var simplifiedgeom = turf_simplify(Feature, tolerance, highQuality);


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

};
