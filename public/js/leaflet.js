/* eslint-disable */

// export const displayMap = locations => {
//   try {
//     console.log(locations);

//     // Initialize map
//     const map = L.map("map", { scrollWheelZoom: false }).setView(
//       [34.111745, -118.113491],
//       6
//     );

//     // Add tile layer
//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       maxZoom: 19,
//       attribution: "© OpenStreetMap contributors"
//     }).addTo(map);

//     // Convert locations to GeoJSON
//     const geoJsonData = {
//       type: "FeatureCollection",
//       features: locations
//         .map(loc => {
//           const lat = parseFloat(loc.coordinates[1]);
//           const lng = parseFloat(loc.coordinates[0]);

//           // Check for null or NaN values
//           if (isNaN(lat) || isNaN(lng)) {
//             console.warn(
//               `Invalid coordinates for location: ${loc.description}`
//             );
//             return null;
//           }

//           return {
//             type: "Feature",
//             properties: {
//               day: loc.day,
//               description: loc.description
//             },
//             geometry: {
//               type: "Point",
//               coordinates: [lng, lat] // GeoJSON uses [longitude, latitude]
//             }
//           };
//         })
//         .filter(feature => feature !== null) // Remove any null features
//     };

//     // Add GeoJSON layer
//     const geoJsonLayer = L.geoJSON(geoJsonData, {
//       pointToLayer: (feature, latlng) => {
//         return L.marker(latlng);
//       },
//       onEachFeature: (feature, layer) => {
//         if (feature.properties) {
//           layer
//             .bindPopup(
//               `<p>Day ${feature.properties.day}: ${feature.properties.description}</p>`,
//               {
//                 maxWidth: 250,
//                 minWidth: 100,
//                 autoClose: false,
//                 closeOnClick: false
//               }
//             )
//             .openPopup();
//         }
//       }
//     }).addTo(map);

//     // Fit bounds to GeoJSON layer
//     const bounds = geoJsonLayer.getBounds();
//     if (bounds.isValid()) {
//       map.fitBounds(bounds, {
//         padding: { top: 200, bottom: 150, left: 100, right: 100 }
//       });
//     }

//     // Allow zoom via control button or gesture but not scroll
//     map.on("dblclick", () => {
//       map.scrollWheelZoom.enable();
//     });

//     map.on("mouseout", () => {
//       map.scrollWheelZoom.disable();
//     });

//     map.on("click", () => {
//       map.scrollWheelZoom.disable();
//     });
//   } catch (err) {
//     console.error("Error in displayMap:", err.message);
//   }
// };

export const displayMap = locations => {
  try {
    console.log(locations);

    // Initialize map
    const map = L.map("map", { scrollWheelZoom: false });

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    // Define bounds object
    const bounds = L.latLngBounds();

    // Allow zoom via control button or gesture but not scroll
    map.on("dblclick", () => {
      map.scrollWheelZoom.enable();
    });

    map.on("mouseout", () => {
      map.scrollWheelZoom.disable();
    });

    map.on("click", () => {
      map.scrollWheelZoom.disable();
    });

    // // Show map only after it's fully loaded
    // map.on("load", () => {
    //   const placeholder = document.getElementById("map-placeholder");
    //   if (placeholder) {
    //     placeholder.style.display = "none";
    //   }
    // });

    // Show map only after it's fully loaded
    map.on("load", () => {
      const mapEL = document.getElementById("map");
      if (mapEL) {
        mapEL.classList.remove("skeleton");
      }
    });

    // Convert location array into GeoJSON format
    const geoJsonData = {
      type: "FeatureCollection",
      features: locations.map(loc => ({
        type: "Feature",
        geometry: {
          type: loc.type, // Ensure type is 'Point'
          coordinates: [
            parseFloat(loc.coordinates[0]) || 0, // Longitude
            parseFloat(loc.coordinates[1]) || 0 // Latitude
          ]
        },
        properties: {
          day: loc.day,
          description: loc.description,
          id: loc.id
        }
      }))
    };

    // Add GeoJSON layer with popups open by default
    L.geoJSON(geoJsonData, {
      pointToLayer: (feature, latlng) => {
        // Create markers
        return L.marker(latlng);
      },
      onEachFeature: (feature, layer) => {
        // Add popup to each feature
        if (feature.properties && feature.properties.description) {
          const popupContent = `<p>Day ${feature.properties.day}: ${feature.properties.description}</p>`;
          layer.bindPopup(popupContent, {
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false
          });

          // Open the popup by default
          layer.openPopup();
        }

        // Extend bounds for each feature
        if (feature.geometry && feature.geometry.coordinates) {
          const [lng, lat] = feature.geometry.coordinates;
          bounds.extend([lat, lng]); // Leaflet expects [lat, lng] order
        }
      }
    }).addTo(map);

    // Fit the map view to include all bounds
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        paddingTopLeft: [200, 100],
        paddingBottomRight: [150, 100]
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};
