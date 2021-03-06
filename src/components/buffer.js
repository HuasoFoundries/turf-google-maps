import {
    toCoords
} from './coords_to_latlng.js';

import turf_buffer from '@turf/buffer';

import {
    Wicket,
    polygonToFeaturePolygon,
    debug,
    warn
} from './utils.js';

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
