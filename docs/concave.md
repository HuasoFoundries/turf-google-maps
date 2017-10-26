<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## concave

Takes a set of points and returns a concave hull polygon. Internally, this uses turf-tin to generate geometries.

**Parameters**

-   `latLngArray` **([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[google.maps.LatLng](https://github.com/amenadiel/google-maps-documentation/blob/master/docs/LatLng.md)> | [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[google.maps.LatLngLiteral](https://github.com/amenadiel/google-maps-documentation/blob/master/docs/LatLngLiteral.md)> | google.maps.MVCArray)** array of google positions
-   `maxEdge` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** the size of an edge necessary for part of the hull to become concave (in miles)
-   `units` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** degrees, radians, miles, or kilometers

Returns **[Feature](http://geojson.org/geojson-spec.html#feature-objects)&lt;[Polygon](http://geojson.org/geojson-spec.html#polygon)>** a concave hull