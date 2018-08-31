import turf_intersect from '@turf/intersect';
import turf_buffer from '@turf/buffer';
import turf_union from '@turf/union';


import {
	toCoords
} from './coords_to_latlng.js';


import {
	Wicket,
	polygonToFeaturePolygon,
	debug,
	warn
} from './utils.js';


/**
 * Takes two or more polygons and returns a combined polygon or multipolygon
 * @param  {google.maps.Polygon|Array.<google.maps.LatLng>|Feature.<Polygon>} polygons N objects to combine
 * @return {Feature.<Polygon>|Feature.<MultiPolygon>}  result of the union. If inputs are disjoint, returns a Feature.Multipolygon
 */
export function union(...polygons) {
	let polyArray = polygons.map((polygon) => {
			return polygonToFeaturePolygon(polygon);
		}),
		FeatureUnion = turf_union.apply(turf_union, polyArray);
	return FeatureUnion;
}


/* eslint-disable max-len*/
/**
 * Calculates a buffer for input features for a given radius. Units supported are miles, kilometers, and degrees.
 * @param {google.maps.Polygon|google.maps.Polyline|google.maps.Marker|google.maps.LatLng|Array.<google.maps.LatLng>|Feature.<Polygon|Linestring|Point>} object - input object to be buffered
 * @param {String} output        - either 'geometry','object' (google.maps) or 'feature', case insensitive, defaults to 'feature'
 * @param {Number} radius        - distance to draw the buffer (negative values are allowed)
 * @param {Object} options       - options to pass to the buffer creation function
 * @param {String} options.units - units in which the radius is expressed: 'kilometers', 'meters', 'miles'
 * @param {number} options.steps - steps of the buffer. Higher steps result in smoother curves but more vertices
 *
 * @return {Feature|Feature.<Geometry>}  A GeoJson Feature or its geometry, according to output parameter
 */
export function createbuffer(object, output, radius, options) {
	options = options || {}; // eslint-disable-line no-param-reassign;
	options.units = options.units || 'meters';
	output = (output || 'feature').toLowerCase();


	var Feature;
	if (object instanceof google.maps.Polyline ||
		object instanceof google.maps.Polygon ||
		object instanceof google.maps.Marker ||
		object instanceof google.maps.LatLng) {
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


	var buffered = turf_buffer(Feature, radius, options);

	if (buffered.type === 'FeatureCollection') {
		buffered = buffered.features[0];
	}

	if (output === 'geometry') {
		return buffered.geometry;
	} else if (output === 'object') {
		return Wicket().fromJson(buffered.geometry).toObject();
	} else {
		return buffered;
	}

}
/* eslint-enable max-len*/

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
