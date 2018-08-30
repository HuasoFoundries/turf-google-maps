# turf-google-maps

[![Travis CI](https://travis-ci.org/InstaGIS/turfhelper-lib-js.svg?branch=master)](https://travis-ci.org/InstaGIS/turfhelper-lib-js)

A bridge to use [Turf](http://turfjs.org) along with [google Maps API](https://developers.google.com/maps/documentation/javascript/reference/).

## Motivation

Turf offers a rich set of geometric operations, but it works with GeoJSON inputs. This library bridges a subset of turf operations (that might steadily grow)
to allow the user to apply the same operations to google maps objects such as Polygons, Polylines and Markers.

Most of these methods return a GeoJSON feature, given the output of these geometric operations might not be suitable for conversion to a google maps object (which is the case of MultiPolygons or MultiLinestring). Some of them accept an `output` parameter that, if passed `object` as value, will try to return 
a google maps object using [Wicket](https://www.npmjs.com/package/wicket). 

In future releases, we might consider returning MultiGeometries or FeatureCollections as an instance of a [google.maps.Data](https://developers.google.com/maps/documentation/javascript/reference/#data) layer. We have avoided said functionality in the current release.



## Installation

Install it with

```sh
npm install turf-google-maps
```

Or, if you're using [JSPM](https://www.npmjs.com/package/jspm)

```sh
jspm install npm:turf-google-maps
```

## Usage

The `main` script as defined in `package.json` is an UMD module. If you're using ES6 syntax, you might import individual 
modules from `dist/ig_turfhelper.esm.js`like so:

```js
import {
	createbuffer,
	simplifyFeature,
	kinks,
	unkink
} from 'turf-google-maps/dist/ig_turfhelper.esm.js'
``` 

Which might help you perform some tree shaking in your build stage.

## API


### along

Takes a google.maps.Polyline and returns a Feature of type Point at a specified distance along the line.

See [along](docs/along.md).

### buffer

Takes a google.maps.Polyline or google.maps.Polygon and returns a Feature of type Polygon or MultiPolygon surrounding the former at a specified distance

See [buffer](docs/buffer.md).

### concave

Takes a set of gooogle.maps.LatLng or google.maps.LatLngLiteral and returns a concave hull Feature of type Polygon or MultiPolygon

See [concave](docs/concave.md).

### coords_to_latlng

Different helper methods to transform gooogle.maps.LatLng or google.maps.LatLngLiteral to GeoJSON positions or viceversa

See [coords_to_latlng](docs/coords_to_latlng.md).

### kinks

Takes a google.maps.Polygon and returns a FeatureCollection of Points representing the polygon self intersections

See [kinks](docs/kinks.md).

### point_in_polygon

Takes an array of google.maps.Marker and a Polygon or MultiPolygon, returning an object containing with markers fall inside or outside it

See [point_in_polygon](docs/point_in_polygon.md).

### simplify_things

Takes a google.maps.Polygon or google.maps.Polyline and returns a simplified version given a certain tolerance. Uses Douglas-Peucker algorithm

See [simplify_things](docs/simplify_things.md).

### trimpaths

Takes two google.maps.Polyline and returns an array of coordinates [path of trimmed polyline1, path of trimmed polyline2, intersection point]

See [trimpaths](docs/trimpaths.md).

### union

Takes two or more google.maps.Polygon and returns a Feature of type Polygon or MultiPolygon with their union

See [union](docs/union.md).

### unkink

Takes a google.maps.Polygon with self intersections and returns a FeatureCollection of polygons without self intersections

See [unkink](docs/unkink.md).

### utils

Several utility functions to transform back and forth google.maps objects and Feature of their corresponding type

See [utils](docs/utils.md).
