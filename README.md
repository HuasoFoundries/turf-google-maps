# turf-google-maps

[![Travis CI](https://travis-ci.org/InstaGIS/turfhelper-lib-js.svg?branch=master)](https://travis-ci.org/InstaGIS/turfhelper-lib-js)

A bridge to use Turf along with google Maps API

## Installation

Install it with

```sh
jspm install turfhelper=github:instagis/turfhelper-lib-js
```

## API


### along

Takes a google.maps.Polyline and returns a Feature of type Point at a specified distance along the line.

See [along](docs/src/components/along.md).

### buffer

Takes a google.maps.Polyline or google.maps.Polygon and returna a Feature of type Polygon or MultiPolygon surrounding the former at a specified distance

See [buffer](docs/src/components/buffer.md).

### concave

Takes a set of gooogle.maps.LatLng or google.maps.LatLngLiteral and returns a concave hull Feature of type Polygon or MultiPolygon

See [concave](docs/src/components/concave.md).

### coords_to_latlng

Different helper methods to transform gooogle.maps.LatLng or google.maps.LatLngLiteral to GeoJSON positions or viceversa

See [coords_to_latlng](docs/src/components/coords_to_latlng.md).

### kinks

Takes a google.maps.Polygon and returns a FeatureCollection of Points representing the polygon self intersections

See [kinks](docs/src/components/kinks.md).

### point_in_polygon

Takes an array of google.maps.Marker and a Polygon or MultiPolygon, returning an object containing with markers fall inside or outside it

See [point_in_polygon](docs/src/components/point_in_polygon.md).

### simplify_things

Takes a google.maps.Polygon or google.maps.Polyline and returns a simplified version given a certain tolerance. Uses Douglas-Peucker algorithm

See [simplify_things](docs/src/components/simplify_things.md).

### trimpaths

Takes two google.maps.Polyline and returns an array of coordinates [path of trimmed polyline1, path of trimmed polyline2, intersection point]

See [trimpaths](docs/src/components/trimpaths.md).

### union

Takes two or more google.maps.Polygon and returns a Feature of type Polygon or MultiPolygon with their union

See [union](docs/src/components/union.md).

### unkink

Takes a google.maps.Polygon with self intersections and returns a FeatureCollection of polygons without self intersections

See [unkink](docs/src/components/unkink.md).

### utils

Several utility functions to transform back and forth google.maps objects and Feature of their corresponding type

See [utils](docs/src/components/utils.md).
