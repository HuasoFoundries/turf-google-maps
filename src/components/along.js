import {
	Wicket
} from './wicket_helper.js';
import {
	toCoords
} from './coords_to_latlng.js';
import turf_along from '@turf/along';
import turf_helpers from '@turf/helpers';

var turf_linestring = turf_helpers.lineString;


/**
 * Takes a linestring and returns a {@link Point|point} at a specified distance along the line.
 * @param  {google.maps.Polyline|Array.<google.maps.LatLng>|Array.<google.maps.LatLngLiteral>|Feature<LineString>} object input object
 * @param  {Number} distance    [description]
 * @param  {string} units can be degrees, radians, miles, or kilometers. Defaults to kilometers
 * @return {Feature.<Point>} Point distance units along the line
 */
export function along(object, distance, units) {
	var Feature;

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

	return turf_along(Feature, distance, units);

};
