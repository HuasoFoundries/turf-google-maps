import {
    Wicket
} from './wicket_helper.js';


import {
    default as _map
} from 'lodash-es/map.js';

import {
    default as _each
} from 'lodash-es/forEach.js';

import {
    toCoords
} from './coords_to_latlng.js';

import {
    default as _size
} from 'lodash-es/size.js';

import {
    default as _reduce
}
from 'lodash-es/reduce.js';


import turf_helpers from '@turf/helpers';

var turf_linestring = turf_helpers.lineString;

var debug = console.debug.bind(console, '%c turfHelper' + ':', "color:#00CC00;font-weight:bold;"),
    warn = console.debug.bind(console, '%c turfHelper' + ':', "color:orange;font-weight:bold;");


/**
 * Transforma un array de gmaps.LatLng en un Feature.Polygon
 * @param  {Array.<google.maps.LatLng>} LatLngArray [description]
 * @return {Feature.<Polygon>}             [description]
 */
function arrayToFeaturePolygon(LatLngArray) {

    var vertices = toCoords(LatLngArray, true);

    return {
        type: "Feature",
        properties: {},
        geometry: {
            type: "Polygon",

            coordinates: [vertices]
        }
    };
}

/**
 * Transforms a {@link google.maps.LatLng} or {@link google.maps.LatLngLiteral} into a {@link Feature.<Point>}
 * @param  {google.maps.LatLng|google.maps.LatLngLiteral|Array.<Number>} LatLng a coordinate to transform
 * @return {Feature.<Point>} a Point type Feature
 */
function latlngToFeaturePoint(LatLng) {
    var coords = toCoord([LatLng])[0],
        feature = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: coords
            }
        };

    return feature;
}

/**
 * Transforms a {@link google.maps.Marker} to a {@link Feature<Point>}
 * @param  {google.maps.Marker} marker  - marker object to transform
 * @return {Feature<Point>}    output Feature
 */
function markerToFeaturePoint(marker) {
    if (!marker.getPosition || typeof marker.getPosition !== 'function') {
        throw new Error('input object does not have a getPosition method');
    }
    var position = marker.getPosition(),
        Feature = {
            type: "Feature",
            properties: {},
            geometry: {
                type: "Point",
                coordinates: [position.lng(), position.lat()]
            }
        };

    return Feature;
};

/**
 * [polylineToFeatureLinestring description]
 * @param  {Array.<google.maps.LatLng>|google.maps.Polyline} objeto array of positions or a google.maps.Polyline
 * @return {Feature.<LineString>}          [description]
 */
function polylineToFeatureLinestring(objeto) {
    var vertices
    if (objeto instanceof google.maps.Polyline) {
        vertices = toCoords(objeto.getPath().getArray());
    } else {
        vertices = toCoords(objeto);
    }

    return turf_linestring(vertices);
}


/**
 * Receives an object and returns a GeoJson Feature of type Polygon
 * @param  {google.maps.Polygon|Array.<google.maps.LatLng>|Feature.Polygon|Geometry} object object to transform into a Feature.Polygon
 * @return {Feature.Polygon}        [description]
 */
function polygonToFeaturePolygon(object) {
    var ring, polygonFeature;

    if (object.type === 'Feature') {
        polygonFeature = object;

    } else if (object instanceof google.maps.Polygon) {

        object = object.getPath().getArray();
        ring = toCoords(object, true);
        polygonFeature = arrayToFeaturePolygon(ring);

    } else if (!!(object && object.constructor === Array)) {

        ring = toCoords(object, true);
        polygonFeature = arrayToFeaturePolygon(ring);

    } else if (object.geometry) {

        polygonFeature = {
            type: "Feature",
            properties: {},
            geometry: object.geometry
        };

    } else {
        throw new Error('object is not a Feature, google.maps.Polygon nor an array of google.maps.LatLng');
    }

    polygonFeature.properties = {};


    return polygonFeature;
}


/**
 * Transforma un array de gmaps.LatLng en un featurecollection geoJson
 * donde cada Feature es un punto del array de entrada
 * @param  {Array<google.maps.LatLng>|google.maps.MVCArray} latLngArray array de posiciones {@link google.maps.LatLng}
 * @return {FeatureCollection}             geojson FeatureCollection
 */
function arrayToFeaturePoints(latLngArray) {


    var FeatureCollection = {
        "type": "FeatureCollection",
        "features": []
    };
    latLngArray.forEach(function (latLng) {
        var Feature = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: toCoords([latLng])[0]
            }
        };
        FeatureCollection.features.push(Feature);
    });

    return FeatureCollection;

}


/**
 * Convierte un gmaps.Polygon en un FeatureCollection de puntos
 * @param  {google.maps.Polygon} polygon [description]
 * @return {FeatureCollection.<Point>}         [description]
 */
function polygonToFeaturePolygonCollection(polygon) {
    var geojsonPolygon = polygonToFeaturePolygon(polygon);

    var vertexToFeature = function (vertex) {
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: vertex
            }
        };
    };

    var FeatureCollection = {
        type: "FeatureCollection",
        features: _map(geojsonPolygon.coordinates[0], vertexToFeature)
    };

    FeatureCollection.features.push(vertexToFeature(geojsonPolygon.coordinates[0][0]));

    return FeatureCollection;
}


export {
    debug,
    warn,
    centroid,
    arrayToFeaturePolygon,
    polygonToFeaturePolygonCollection,
    arrayToFeaturePoints,
    markerToFeaturePoint,
    latlngToFeaturePoint,
    polygonToFeaturePolygon,
    polylineToFeatureLinestring
};
