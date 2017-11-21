 import turk_kinks from '@turf/kinks';

 import {
 	polygonToFeaturePolygon
 } from './utils.js';


 /**
  * Takes an array of points, google.maps.Polygon or Feature<Polygon> and returns {@link Point|points} at all self-intersections.
  *
  * @name kinks
  * @param  {google.maps.Polyline|google.maps.Polygon|Array.<google.maps.LatLng>|Feature<Polygon>} object array of points, google.maps.Polygon or Feature<Polygon>
  * @returns {FeatureCollection<Point>} self-intersections
  *
  */
 export function kinks(object) {
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


 	return turk_kinks(Feature);
 }
