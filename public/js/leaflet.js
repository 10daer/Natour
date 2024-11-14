// /* eslint-disable */
// export const displayMap = locations => {
//   mapboxgl.accessToken =
//     'pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A';

//   var map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
//     scrollZoom: false
//     // center: [-118.113491, 34.111745],
//     // zoom: 10,
//     // interactive: false
//   });

//   const bounds = new mapboxgl.LngLatBounds();

//   locations.forEach(loc => {
//     // Create marker
//     const el = document.createElement('div');
//     el.className = 'marker';

//     // Add marker
//     new mapboxgl.Marker({
//       element: el,
//       anchor: 'bottom'
//     })
//       .setLngLat(loc.coordinates)
//       .addTo(map);

//     // Add popup
//     new mapboxgl.Popup({
//       offset: 30
//     })
//       .setLngLat(loc.coordinates)
//       .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
//       .addTo(map);

//     // Extend map bounds to include current location
//     bounds.extend(loc.coordinates);
//   });

//   map.fitBounds(bounds, {
//     padding: {
//       top: 200,
//       bottom: 150,
//       left: 100,
//       right: 100
//     }
//   });
// };

/* eslint-disable */
export const displayMap = locations => {
  // Initialize map with correct coordinate order - Leaflet uses [lat, lng]
  let map = L.map("map").setView([34.111745, -118.113491], 10); // Note the swapped coordinates

  // Initialize bounds
  let bounds = L.latLngBounds();

  // Add tile layer
  L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // Add markers and popups
  locations.forEach(loc => {
    // Ensure coordinates are in [lat, lng] order
    let coordinates = Array.isArray(loc.coordinates)
      ? [loc.coordinates[1], loc.coordinates[0]]
      : loc.coordinates;

    // Add marker
    var marker = L.marker(coordinates)
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false
      })
      .addTo(map);

    // Extend bounds to include this location
    bounds.extend(coordinates);
  });

  console.log(bounds);
  // Fit bounds if there are any locations
  if (locations.length > 0 && bounds.isValid()) {
    map.fitBounds(bounds, {
      padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
      }
    });
  }

  map.fitBounds;
};
