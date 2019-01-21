// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Plates URL
var boundaryUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  d3.json(boundaryUrl, function(boundarydata){
    createFeatures(data.features, boundarydata.features)
  })
});

// GET request for boundary URL
// d3.json(boundaryUrl, function(boundarydata) {
//   createFeatures(boundarydata.features);
// });

function createFeatures(earthquakeData, boundaryData) {

    var earthquakes = [];
    var plates = [];

    for (var i =0; i < earthquakeData.length; i++) {

        earthquakes.push(
            L.circle([earthquakeData[i].geometry.coordinates[1], earthquakeData[i].geometry.coordinates[0]], {
                stroke: false,
                fillOpacity:0.75,
                color: colors(earthquakeData[i].properties.mag),
                fillColor : colors(earthquakeData[i].properties.mag),
                radius: (earthquakeData[i].properties.mag)*30000
            }).bindPopup(("<h3>" + earthquakeData[i].properties.place +
            "</h3><hr><p>" + new Date(earthquakeData[i].properties.time) + "</p>"))
        )
    };

  for (var i =0; i < boundaryData.length; i++) {
      plates.push(
          L.geoJson(boundaryData, {
            style: {color : "orange", weight : 1}
          })
      );
  };

  var earthquake_layer = L.layerGroup(earthquakes);
  var plates_layer = L.layerGroup(plates);

// Sending our earthquakes layer to the createMap function
createMap(earthquake_layer, plates_layer);
}

function colors(mag) {
    if (mag>5) {
        var color = "red";
    }
    else if (mag>4) {
        var color = "orangered";
    }
    else if (mag>3) {
      var color = "orange";
    }
    else if (mag>2) {
      var color = "yellow";
    }
    else if (mag>1) {
      var color = "LawnGreen";
    }
    else {
        var color = "green"}
    return color;
}

function createMap(earthquakes, plates) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Satellite Map": satellitemap,
    "Outdoors Map" : outdoorsmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Plates: plates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1, 2, 3, 4, 5],
    labels = ["green", "lawngreen", "yellow", "orange", "orangered", "red"];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + labels[i] + '">&nbsp;&nbsp;&nbsp;</i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}

return div;
};

legend.addTo(myMap);
}