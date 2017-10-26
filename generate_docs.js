#!/usr/bin/env node

const fs = require('fs');
const d3 = require('d3-queue');
const path = require('path');
const ProgressBar = require('progress');
const documentation = require('documentation');

const q = d3.queue(1);
const packages = path.join(__dirname, 'src/components') + path.sep;
const bar = new ProgressBar('progress [:bar] :rate/bps :percent :etas :name', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: fs.readdirSync(packages).length
});


fs.readdirSync(packages).forEach(file => {
    q.defer(generateDocs, packages + file);
});

const paths = {
    GeoJSON: 'http://geojson.org/geojson-spec.html#geojson-objects',
    GeometryCollection: 'http://geojson.org/geojson-spec.html#geometrycollection',
    Point: 'http://geojson.org/geojson-spec.html#point',
    MultiPoint: 'http://geojson.org/geojson-spec.html#multipoint',
    LineString: 'http://geojson.org/geojson-spec.html#linestring',
    MultiLineString: 'http://geojson.org/geojson-spec.html#multilinestring',
    Polygon: 'http://geojson.org/geojson-spec.html#polygon',
    MultiPolygon: 'http://geojson.org/geojson-spec.html#multipolygon',
    Geometry: 'http://geojson.org/geojson-spec.html#geometry',
    Feature: 'http://geojson.org/geojson-spec.html#feature-objects',
    FeatureCollection: 'http://geojson.org/geojson-spec.html#feature-collection-objects',
    Position: 'http://geojson.org/geojson-spec.html#positions',
    'google.maps.LatLng': 'https://github.com/amenadiel/google-maps-documentation/blob/master/docs/LatLng.md',
    'google.maps.LatLngLiteral': 'https://github.com/amenadiel/google-maps-documentation/blob/master/docs/LatLngLiteral.md',
    'google.maps.Marker': 'https://github.com/amenadiel/google-maps-documentation/blob/master/docs/Marker.md',
    'google.maps.Polygon': 'https://github.com/amenadiel/google-maps-documentation/blob/master/docs/Polygon.md',
    'google.maps.Polyline': 'https://github.com/amenadiel/google-maps-documentation/blob/master/docs/Polyline.md',
    'google.maps.Rectangle': 'https://github.com/amenadiel/google-maps-documentation/blob/master/docs/Rectangle.md',
    'Wkt.Wkt': 'https://github.com/arthur-e/Wicket',
    'Wkt': 'https://github.com/arthur-e/Wicket'
};

function generateDocs(filename, callback) {

    var name = filename.split('/').pop().replace('.js', '');

    console.log();
    // Build Documentation
    documentation.build(filename, {
        shallow: true
    }).then(res => {
        return documentation.formats.md(res, {
            paths
        })
    }).then(output => {

        fs.writeFileSync(`${__dirname}/docs/${name}.md`, output);


        bar.tick({
            name: name
        });
        callback(null);
        return;


    }).catch(function (err) {

        bar.tick({
            name: name
        });
        callback(err);
        return;
    });
}
