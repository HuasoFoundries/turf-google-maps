  window.roundCoord = function (coord, decimals) {
    var pow = Math.pow(10, decimals);
    return [Math.round(coord[0] * pow) / pow, Math.round(coord[1] * pow) / pow];
  };
  window.roundLatLng = function (LatLng, decimals) {
    var pow = Math.pow(10, decimals);
    return {
      lat: Math.round(LatLng.lat * pow) / pow,
      lng: Math.round(LatLng.lng * pow) / pow
    };
  };
