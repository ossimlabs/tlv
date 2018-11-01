function changeFrameGlobe(param) {
	var layer = tlv.layers[tlv.currentLayer];
	layer.globeLayer.show = layer.keepVisible;

	if (param === "fastForward") { tlv.currentLayer = getNextFrameIndex(); }
	else if (param === "rewind") { tlv.currentLayer = getPreviousFrameIndex(); }
	else if (typeof param === "number") { tlv.currentLayer = param; }

	tlv.layers[tlv.currentLayer].globeLayer.show = true;
}

function checkWebGlCompatability() {
	if (!window.WebGLRenderingContext) { displayErrorDialog("Your browser doesn't know what WebGL is. :("); }
	else {
		var canvas = document.createElement("canvas");
		var context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		if (!context) { displayErrorDialog("Your browser supports WebGL but the initialization failed. :("); }
		else { return true; }
	}
}

var pageLoadTimeLapseGlobe = pageLoad;
pageLoad = function() {
	pageLoadTimeLapseGlobe();

	CESIUM_BASE_URL = tlv.contextPath + "/assets/webjars/cesium/1.43.0/Build/Cesium";
}

function setupGlobe() {
	tlv.globe = new olcs.OLCesium({
		map: tlv.map,
		sceneOptions: {
    		contextOptions: {
      			webgl: { preserveDrawingBuffer: true }
    		},
			//terrainExaggeration: 1
  		}
	});
	// only render the globe when necessary
	tlv.globe.enableAutoRenderLoop();

	var globe = tlv.globe.getCesiumScene().globe;
	// make the globe background color the same as the body background
	globe.baseColor = new Cesium.Color( 0.153, 0.169, 0.188, 1 );
	// dont display tiles that are hidden by the terrain
	tlv.globe.depthTestAgainstTerrain = true;
	// make the cache size large so the scene render is faster
	//tlv.globe.globe_.tileCacheSize = 5000;
	// add a tile loading function to tell when the glove had finished loading
	globe.tileLoadProgressEvent.addEventListener(
		function(event) {
			var layer = tlv.layers[ tlv.currentLayer ];

			if ( layer.layerLoaded ) {
				layer.layerLoaded = false;
				layer.tilesLoaded = 0;
				layer.tilesLoading = 0;
			}

			if ( event == 0 ) { layer.layerLoaded = true; }
			else if ( event > layer.tilesLoading ) { layer.tilesLoading = event; }
			layer.tilesLoaded = layer.tilesLoading - event;
			updateTileLoadingProgressBar();
		}
	);

	tlv.globe.getCesiumScene().screenSpaceCameraController.zoomEventTypes = Cesium.CameraEventType.WHEEL;


	if ( tlv.terrainProvider ) {
		tlv.globe.getCesiumScene().terrainProvider = new Cesium.CesiumTerrainProvider({
			url: tlv.terrainProvider
		});
	}
	else if ( tlv.ionAccessToken ) {
		Cesium.Ion.defaultAccessToken = tlv.ionAccessToken;
		tlv.globe.getCesiumScene().terrainProvider = Cesium.createWorldTerrain();
	}

	if ( tlv.dimensions == "3" ) {
		tlv.dimensions = null;
		$( "#dimensionsSelect" ).val( 3 );
		addDimension();
		if ( tlv.tilt ) { tlv.globe.getCamera().setTilt( Math.PI / 180 * tlv.tilt ); }
	}
}

var setupTimeLapseGlobe = setupTimeLapse;
setupTimeLapse = function() {
	setupTimeLapseGlobe();
}
