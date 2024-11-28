/* eslint-disable */

function init() {
  if (document.querySelector("#map")) {
    // Initialize map
    const map = L.map("map", { scrollWheelZoom: false });

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    // Define bounds object
    const bounds = L.latLngBounds();

    // Create a LayerGroup to hold the markers
    const markersGroup = L.layerGroup().addTo(map);

    return { map, bounds, markersGroup };
  } else {
    return {};
  }
}

const { map, bounds, markersGroup } = init();

export const displayMap = locations => {
  try {
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

    // Show map only after it's fully loaded
    map.on("load", () => {
      const mapEL = document.getElementById("map");
      if (mapEL) {
        mapEL.classList.remove("skeleton");
      }
    });

    loadMapLocation(locations);

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

export const setLocation = (locations, checked) => {
  try {
    // Clear existing markers
    if (checked) {
      markersGroup.clearLayers();
      loadMapLocation(locations);
    } else {
      map.setView(locations, 6);
    }

    // Allow zoom via scroll
    map.scrollWheelZoom.enable();

    // Fit the map view to include all bounds
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        paddingTopLeft: [10, 10],
        paddingBottomRight: [10, 10],
        maxZoom: 16,
        animate: true
      });
    }

    if (checked) return;

    map.on("click", e => {
      const locationFormContainer = document.querySelector(".group-lat");
      const { length } = locationFormContainer.querySelectorAll("input");
      const { lat, lng } = e.latlng;
      L.marker([lat, lng]).addTo(map);
      if (
        Boolean(locationFormContainer.querySelector("#locationLat-0").value)
      ) {
        const latInput = `<input value="${lat}" id="locationLat-${length}" type="number" step="any">`;
        document
          .querySelector(".group-lat")
          .insertAdjacentHTML("beforeend", latInput);
        const lngInput = `<input value="${lng}" id="locationLng-${length}" type="number" step="any">`;
        document
          .querySelector(".group-lng")
          .insertAdjacentHTML("beforeend", lngInput);
        const dayInput = `<input value="" id="locationDay-${length}" placeholder="Day" type="number" step="any">`;
        document
          .querySelector(".group-day")
          .insertAdjacentHTML("beforeend", dayInput);
        const descriptionTextArea = `<textarea id="locationDescription-${length}" name="locationDescription-${length}" placeholder="Add a description"></textarea>`;
        document
          .querySelector(".group-description")
          .insertAdjacentHTML("beforeend", descriptionTextArea);
      } else {
        document.querySelector("#locationLat-0").value = lat;
        document.querySelector("#locationLng-0").value = lng;
      }
    });
  } catch (err) {
    console.log(err.message);
  }
};

function loadMapLocation(locations) {
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
      // Create marker
      const marker = L.marker(latlng);

      // Add marker to LayerGroup
      markersGroup.addLayer(marker);

      return marker;
    },
    onEachFeature: (feature, layer) => {
      // Add popup to each feature
      if (feature.properties && feature.properties.description) {
        const popupContent = `<p>Day ${feature.properties.day}: ${feature.properties.description}</p>`;
        layer.bindPopup(popupContent, {
          maxWidth: 200,
          minWidth: 75,
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
  });
}
