import Wkt from 'wicket';
import 'wicket/wicket-gmap3.js';


import {
    toCoords
} from './coords_to_latlng.js';


import turf_area from '@turf/area';


import {
    lineString as turf_linestring
} from '@turf/helpers';


var debug = console.debug.bind(console, '%c turfHelper' + ':', "color:#00CC00;font-weight:bold;"),
    warn = console.warn.bind(console, '%c turfHelper' + ':', "color:orange;font-weight:bold;");


/**
 * Factory that returns a new instance of {@link Wicket}
 *
 * @return {Wkt}  new instance of {@link Wicket}
 */
function Wicket() {
    return new Wkt.Wkt();
}
/**
 * Transforms an array of {@link google.maps.LatLng} into a {@link Feature.<Polygon>}
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
    var coords = toCoords([LatLng])[0],
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
}


/**
 * Converts a {@link google.maps.Polyline} into a  {@link Feature.<LineString>}
 * @param  {Array.<google.maps.LatLng>|google.maps.Polyline} objeto array of positions or a google.maps.Polyline
 * @return {Feature.<LineString>}          [description]
 */
function polylineToFeatureLinestring(objeto) {
    var vertices;
    if (objeto instanceof google.maps.Polyline) {
        vertices = toCoords(objeto.getPath().getArray());
    } else {
        vertices = toCoords(objeto);
    }

    return turf_linestring(vertices);
}

var validTypes = ['Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon'
];
/**
 * Receives an object and returns a {@link Feature.<Polygon>}
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

    } else if (!!(object && object.constructor === Array)) { // eslint-disable-line

        ring = toCoords(object, true);
        polygonFeature = arrayToFeaturePolygon(ring);

    } else if (object.coordinates && validTypes.indexOf(object.type) !== -1) {

        polygonFeature = {
            type: "Feature",
            properties: {},
            geometry: object
        };

    } else {
        throw new Error('object is not a Feature, Geometry, google.maps.Polygon nor an array of google.maps.LatLng');
    }

    polygonFeature.properties = {};


    return polygonFeature;
}


/**
 * Converts an array of google.maps.LatLng into a FeatureCollection
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
 * Converts a google.maps.Polygon or google.maps.Polyline into a FeatureCollection of points
 * @param  {google.maps.Polygon|google.maps.Polyline} googleObject the google.maps object to convert
 * @return {FeatureCollection.<Point>}         [description]
 */
function polygonToFeaturePolygonCollection(googleObject) {
    let latLngArray;
    if (googleObject instanceof google.maps.Polygon || googleObject instanceof google.maps.Polyline) {
        latLngArray = googleObject.getPath().getArray();
    }

    return arrayToFeaturePoints(latLngArray);
}


/**
 * Receives an object and returns a GeoJson Feature of type Polygon
 * @param  {google.maps.Polygon|Feature.Polygon|Geometry} object object whose area will be calculated
 * @return {Number} object's area
 */
function area(object) {
    var polygonFeature = polygonToFeaturePolygon(object);
    return turf_area(polygonFeature);
}

export {
    debug,
    warn,
    area,
    Wicket,
    arrayToFeaturePolygon,
    polygonToFeaturePolygonCollection,
    arrayToFeaturePoints,
    markerToFeaturePoint,
    latlngToFeaturePoint,
    polygonToFeaturePolygon,
    polylineToFeatureLinestring
};
