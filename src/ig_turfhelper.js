/**
 * This module acts as a bridge between google.maps and Turf, 
 * By converting google maps overlays such as
 * {@link google.maps.Polygon}
 * {@link google.maps.Polyline}
 * {@link google.maps.Point}
 *
 * to their proper geojson representation.
 *
 * This in turn allows to perform Turf operations that google.maps doesn't natively support
 * 
 * @name turfHelper
 * @module turfHelper
 */
import {
    polylineToFeatureLinestring,
    polygonToFeaturePolygon,
    arrayToFeaturePoints
} from './components/utils.js';

import {
    concave
} from './components/concave.js';

import {
    toLatLngs,
    toCoords
} from './components/coords_to_latlng.js';

import {
    simplifyFeature,
    simplifyPointArray
} from './components/simplify_things.js';

import {
    along
} from './components/along.js';
import {
    union
} from './components/union.js';
import {
    createbuffer
} from './components/buffer.js';
import {
    pointInPolygon
} from './components/point_in_polygon.js';

import {
    kinks,
} from './components/kinks.js';

import {
    unkink
} from './components/unkink.js';

import {

    trimPaths
} from './components/trimpaths.js';

/**
 * @alias module:turfHelper
 * @type {Object}
 */
export {
    along,
    arrayToFeaturePoints,
    createbuffer,
    pointInPolygon,
    polygonToFeaturePolygon,
    polylineToFeatureLinestring,
    simplifyFeature,
    simplifyPointArray,
    toLatLngs,
    toCoords,
    trimPaths,
    kinks,
    unkink,
    union,
    concave
};

export default {
    along: along,
    arrayToFeaturePoints: arrayToFeaturePoints,
    createbuffer: createbuffer,
    pointInPolygon: pointInPolygon,
    polygonToFeaturePolygon: polygonToFeaturePolygon,
    polylineToFeatureLinestring: polylineToFeatureLinestring,
    simplifyFeature: simplifyFeature,
    simplifyPointArray: simplifyPointArray,
    toLatLngs: toLatLngs,
    toCoords: toCoords,
    trimPaths: trimPaths,
    union: union,
    kinks: kinks,
    unkink: unkink,
    concave: concave
};
