/**
 * This module acts as a bridge between google.maps and Turf
 * By converting google maps overlays such as
 * {@link google.maps.Polygon}
 * {@link google.maps.Polyline}
 * {@link google.maps.Point}
 *
 * to their proper geojson representation.
 *
 * This in turn allows to perform Turf operations that google.maps doesn't natively support
 *
 * @name igSubset
 * @memberof turfHelper
 * @module igSubset
 */


import {
    polygonToFeaturePolygon
} from './components/utils.js';

import {
    toLatLngs,
    toCoords
} from './components/coords_to_latlng.js';


import {
    simplifyFeature
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


/**
 * @alias module:igSubset
 * @type {Object}
 */
export {
    along,
    createbuffer,
    kinks,
    polygonToFeaturePolygon,
    simplifyFeature,
    toCoords,
    toLatLngs,
    union,
    unkink,
    pointInPolygon
};

export default {
    along,
    createbuffer,
    kinks,
    polygonToFeaturePolygon,
    simplifyFeature,
    toCoords,
    toLatLngs,
    union,
    unkink,
    pointInPolygon
};
