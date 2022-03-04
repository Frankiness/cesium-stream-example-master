$(function () {
  var viewer = new Cesium.Viewer('cesiumContainer', {

  });

  var scene = viewer.scene;

  // Create new CZML datasource
  var czmlStream = new Cesium.CzmlDataSource();
  var czmlStreamUrl = 'http://localhost:3000/czml';

  // Setup EventSource
  var czmlEventSource = new EventSource(czmlStreamUrl);

  // Listen for EventSource data coming
  czmlEventSource.onmessage = function (e) {
    console.log(e.data);
    czmlStream.process(JSON.parse(e.data));
    // Put the datasource into Cesium
    viewer.dataSources.add(czmlStream);
  }


});