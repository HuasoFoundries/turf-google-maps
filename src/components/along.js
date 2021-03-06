import {
	Wicket
} from './utils.js';
import {
	toCoords
} from './coords_to_latlng.js';
import turf_along from '@turf/along';
import {
	lineString as turf_linestring
} from '@turf/helpers';


/**
 * Takes a linestring and returns a {@link Point|point} at a specified distance along the line.
 * @param  {google.maps.Polyline|Array.<google.maps.LatLng>|Array.<google.maps.LatLngLiteral>|Feature<LineString>} object input object
 * @param  {Number} distance    distance along the line
 * @param  {Object} options  optional parameters
 * @param  {string} options.units can be degrees, radians, miles, or kilometers. Defaults to kilometers
 *
 * @return {Feature.<Point>} Point distance units along the line
 */
export function along(object, distance, options) {
	var Feature;
	options = options || {};

	if (object instanceof google.maps.Polyline) {
		var geometry = Wicket().fromObject(object).toJson();
		Feature = {
			type: "Feature",
			properties: {},
			geometry: geometry
		};
	} else if (object.type && object.type === 'Feature' && object.geometry) {
		Feature = object;
	} else {
		var arrayCoords = toCoords(object);
		Feature = turf_linestring(arrayCoords);
	}

	return turf_along(Feature, distance, options);

}
