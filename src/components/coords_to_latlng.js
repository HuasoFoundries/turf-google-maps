/**
 * Converts a coordinate pair into a {@link google.maps.LatLngLiteral}
 * @param  {Position|google.maps.LatLngLiteral|google.maps.LatLng} position a coordinate pair, google.maps LatLng or google.maps.LatLngLiteral
 * @return {google.maps.LatLngLiteral}     a {@link google.maps.LatLngLiteral}
 * @private
 */
function toLatLng(position) {
	if (position instanceof google.maps.LatLng) {
		return {
			lat: position.lat(),
			lng: position.lng()
		};
	} else if (position.lat && position.lng) {
		return position;
	} else {
		return {
			lat: position[1],
			lng: position[0]
		};
	}
}

/**
 * Transforms an array of Positions into array of google.maps.LatLngLiteral
 * @param {Array.<Position>} coordinates an array of positions
 * @return {Array.<google.maps.LatLngLiteral>} array of {@link google.maps.LatLngLiteral}
 */
function toLatLngs(coordinates) {
	return coordinates.map((coord) => {
		return toLatLng(coord);
	});

}

/**
 * Transforms a {@link google.maps.LatLng} or {@link google.maps.LatLngLiteral} into a Position
 * @param  {google.maps.LatLng|google.maps.LatLngLiteral|Position} LatLng a coordinate to transform
 * @return {Position}   a coordinate pair
 * @private
 */
function toCoord(LatLng) {
	if (google.maps && google.maps.LatLng && LatLng instanceof google.maps.LatLng) {
		return [LatLng.lng(), LatLng.lat()];
	} else if (LatLng.lat && LatLng.lng) {
		return [LatLng.lng, LatLng.lat];
	} else if (LatLng.length && LatLng.length >= 2) {
		return LatLng;
	} else {
		throw new Error('input must be an instance of google.maps.LatLng, google.maps.LatLngLiteral or Position');
	}
}

/* eslint-disable max-len */
/**
 * Transforms an array of coordinates to an array of [Lng, Lat]
 * @param {Array.<google.maps.LatLng>|Array.<google.maps.LatLngLiteral>} arrayLatLng Array of {@link google.maps.LatLng} or {@link google.maps.LatLngLiteral}
 * @param {bool} [closeRing=false] optionally, ensure the passed coordinate array forms a closed ring
 * @return {Array.<Position>} an array of {@link Position}
 */
function toCoords(arrayLatLng, closeRing) {
	/* eslint-enable max-len */

	var ring = arrayLatLng.map((latLng) => {
		return toCoord(latLng);
	});


	if (closeRing === true) {
		var last_coord = ring.pop();
		if (last_coord[0] === ring[0][0] && last_coord[1] === ring[0][1]) {
			ring.push(ring[0]);
		} else {
			ring.push(last_coord);
			ring.push(ring[0]);
		}

	}
	return ring;
}


export {
	toLatLngs,
	toCoords
};
