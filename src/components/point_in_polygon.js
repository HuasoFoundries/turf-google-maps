import turf_inside from '@turf/inside';
import {
	default as _each
} from 'lodash-es/forEach.js';

import {
	markerToFeaturePoint
} from './utils.js';
/**
 * Filters an array of points returning those who falls inside a given {@link Polygon}
 * @param {Array<google.maps.Marker>} sourceArray array of {@link google.maps.Marker}
 * @param {Polygon|Multipolygon} geojsonPolygon  the polygon thay may contain the points
 * @return {{pointsInside:Array<google.maps.Marker>, pointsOutside:Array<google.maps.Marker>}} an object with the points that fall inside and outside the polygon
 */
export function pointInPolygon(sourceArray, geojsonPolygon) {
	var pointsInside = [];
	var pointsOutside = [];

	if (geojsonPolygon.type !== 'Feature') {
		geojsonPolygon = {
			"type": "Feature",
			"properties": {},
			"geometry": geojsonPolygon
		};
	}
	if (geojsonPolygon.geometry.type === 'Polygon' || geojsonPolygon.geometry.type === 'Multipolygon') {
		_each(sourceArray, function (item) {

			var Point = markerToFeaturePoint(item);
			//console.zlog('Point is', Point);
			if (turf_inside(Point, geojsonPolygon)) {
				pointsInside.push(item);
			} else {
				pointsOutside.push(item);
			}
		});
	}

	return {
		pointsInside: pointsInside,
		pointsOutside: pointsOutside
	};
};
