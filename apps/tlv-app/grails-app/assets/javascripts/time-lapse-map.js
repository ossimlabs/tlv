function addBaseLayersToTheMap() {
	tlv.baseLayers = {};
	$.each(
		tlv.availableBaseLayers,
		function(i, x) {
			var source;
			switch(x.type) {
				case "wms":
					source = new ol.source.TileWMS({
						params: {
							FORMAT: x.format || "image/png",
							LAYERS: x.layers,
							STYLES: x.styles || "",
							TRANSPARENT: true,
							VERSION: x.version || "1.1.1"
						},
						url: x.url
					});

					if ( x.crs ) { source.updateParams({ CRS: x.crs }); }
					if ( x.srs ) { source.updateParams({ SRS: x.srs }); }
					break;

				case "wmts":
					var matrixIds = [];
					var projection = ol.proj.get( x.projection );
					var projectionExtent = projection.getExtent();
					var resolutions = [];
					var size = ol.extent.getWidth( projectionExtent ) * 0.5 / 256;
					for ( var i = 0; i < 20; ++i ) {
						matrixIds.push( i );
						resolutions.push( size / Math.pow( 2, i ) );
					}

					source = new ol.source.WMTS({
						format: "image/png",
						layer: x.layer,
						matrixSet: x.matrixSet,
						projection: projection,
						style: x.style,
						tileGrid: new ol.tilegrid.WMTS({
							origin: ol.extent.getTopLeft( projectionExtent ),
							resolutions: resolutions,
							matrixIds: matrixIds
						}),
						url: x.url,
					});
					break;

				case "xyz":
					source = new ol.source.XYZ({ url: x.url });
					break;
			}

			tlv.baseLayers[ i ] = new ol.layer.Tile({
				source: source,
				visible: x.visible
			});
			tlv.map.addLayer(tlv.baseLayers[i]);
			if (x.visible) { $("#baseLayersSelect option[value='" + i + "']").prop("selected", true); }
		}
	);

	if (tlv.baseLayer) { changeBaseLayer(tlv.baseLayer); }
}

function addLayerToTheMap( layer ) {
	createLayerSources( layer );
	createLayers( layer );

	tlv.map.addLayer(layer.imageLayer);
	tlv.map.addLayer(layer.tileLayer);
	layer.mapLayer = layer.tileLayer;



	layer.layerLoaded = false;
	layer.tilesLoaded = 0;
	layer.tilesLoading = 0;
	if ( !layer.opacity ) { layer.opacity = 1; }


}

function changeBaseLayer(layerName) {
	$.each(tlv.baseLayers, function(i, x) { x.setVisible(false); });
	if (tlv.baseLayers[layerName]) {
		tlv.baseLayers[layerName].setVisible(true);
	}
}

function compassRotate(event) {
	if (event.alpha) { tlv.map.getView().rotate(event.alpha * Math.PI / 180); }
	else{ displayErrorDialog("Sorry, we couldn't get a good reading. :("); }
}

function createContextMenuContent(coordinate) {
	coordinate = ol.proj.transform(coordinate, "EPSG:3857", "EPSG:4326");
	var coordConvert = new CoordinateConversion();
	var latitude = coordinate[1];
	var longitude = coordinate[0];
	var dd = latitude.toFixed(6) + ", " + longitude.toFixed(6);
	var dms = coordConvert.ddToDms(latitude, "lat") + " " + coordConvert.ddToDms(longitude, "lon");
	var mgrs = coordConvert.ddToMgrs(latitude, longitude);

	$("#mouseClickDiv").html("<div align = 'center' class = 'row'>" + dd + " // " + dms + " // " + mgrs + "</div>");


	$("#imageMetadataPre").html( JSON.stringify( tlv.layers[tlv.currentLayer].metadata, null, 2 ) );
}

function createLayers( layer ) {
	var footprint = layer.metadata.footprint.coordinates;
	var extent = footprint ? new ol.geom.MultiPolygon( footprint ).getExtent() : null;
	extent = extent ? ol.proj.transformExtent( extent, "EPSG:4326", "EPSG:3857" ) : undefined;

	layer.imageLayer = new ol.layer.Image({
		extent: extent,
		opacity: 0,
		source: layer.imageSource,
		visible: false
	});

	layer.tileLayer = new ol.layer.Tile({
		extent: extent,
		opacity: 0,
		source: layer.tileSource,
		visible: false
	});
}

function createLayerSources( layer ) {
	var params = {
		FILTER: "in(" + layer.metadata.id + ")",
		FORMAT: "image/png",
		IDENTIFIER: Math.floor( Math.random() * 1000000 ),
		LAYERS: "omar:raster_entry",
		STYLES: JSON.stringify({
			bands: layer.bands || "default",
			brightness: layer.brightness || 0,
			contrast: layer.contrast || 1,
			hist_center: true,
			hist_op: layer.histOp || "auto-minmax",
			resampler_filter: layer.resamplerFilter || "bilinear",
			sharpen_mode: layer.sharpenMode || "none"
		}),
		TRANSPARENT: true,
		VERSION: "1.1.1"
	};

	layer.imageSource = new ol.source.ImageWMS({
		params: params,
		url: tlv.libraries[ layer.library ].wmsUrl
	});

	layer.tileSource = new ol.source.TileWMS({
		params: params,
		url: tlv.libraries[ layer.library ].wmsUrl
	});
	layer.tileSource.on("tileloadstart", function( event ) { theTileHasStartedLoadingMap( this ); });
	layer.tileSource.on("tileloadend", function( event ) { theTileHasFinishedLoadingMap( this ); });
}

function createMapControls() {
	var span = document.createElement("span");
	span.className = "glyphicon glyphicon-fullscreen";
	var fullScreenControl = new ol.control.FullScreen({ label: span });

	tlv.mapControls = [
		createMousePositionControl(),
		fullScreenControl
	];
}

function createMousePositionControl() {
	var mousePositionControl = new ol.control.MousePosition({
		coordinateFormat: function(coordinate) {
			var lat = coordinate[1];
			var lon = coordinate[0];
			var coordConvert = new CoordinateConversion();
			switch(mousePositionControl.coordinateDisplayFormat) {
				case 0: return coordinate[1].toFixed(6) + ", " + coordinate[0].toFixed(6); break;
				case 1: return coordConvert.ddToDms(lat, "lat") + " " + coordConvert.ddToDms(lon, "lon"); break;
				case 2: return coordConvert.ddToMgrs(lat, lon); break;
			}
		},
		projection: "EPSG:4326"
	});

	mousePositionControl.coordinateDisplayFormat = 0;
	$(mousePositionControl.element).click(function() {
		mousePositionControl.coordinateDisplayFormat++;
		if (mousePositionControl.coordinateDisplayFormat >= 3) { mousePositionControl.coordinateDisplayFormat = 0; }
	});


	return mousePositionControl;
}

function getLayerIdentifier(source) {
	if (typeof source.getParams == "function") { return source.getParams().IDENTIFIER; }
	// assume an XYZ layer
	else { return source.getUrls()[0]; }
}

function preloadAnotherLayer(index) {
	var layer = tlv.layers[index];
	// if the loayer is already loaded, find a layer that isn't loaded and load that one
	if (layer.layerLoaded) {
		$.each(
			tlv.layers,
			function(i, x) {
				if (!x.layerLoaded) {
					preloadAnotherLayer(i);


					return false;
				}
			}
		);
	}
	else { layer.mapLayer.setVisible(true); }
}

function rightClick( event ) {
	event.preventDefault();
	var pixel = [event.layerX, event.layerY];
	var coordinate = tlv.map.getCoordinateFromPixel( pixel );
	createContextMenuContent( coordinate );
	$("#contextMenuDialog").modal("show");
}

function setupMap() {
	// if a map already exists, reset it and start from scratch
	if (tlv.map) { tlv.map.setTarget(null); }

	createMapControls();
	tlv.map = new ol.Map({
		controls: ol.control.defaults().extend(tlv.mapControls),
		interactions: ol.interaction.defaults({
			doubleClickZoom: false,
 			dragPan: false
		}).extend([
			new ol.interaction.DragAndDrop({
				formatConstructors: [
					ol.format.GPX,
					ol.format.GeoJSON,
					ol.format.IGC,
					ol.format.KML,
					ol.format.TopoJSON
				]
			}),
			new ol.interaction.DragPan({
				condition: function( event ) { return ol.events.condition.primaryAction( event ); }
			})
		]),
		logo: false,
		target: "map"
	});

	updateMapSize();

	// setup context menu
	tlv.map.getViewport().addEventListener( "contextmenu", rightClick );

	tlv.map.on("moveend", theMapHasMoved);

	$(".ol-zoom-in").click(function() { $(this).blur(); });
	$(".ol-zoom-out").click(function() { $(this).blur(); });
}

function syncMapPositionWithGlobe() {
	var position = tlv.globe.camera.positionCartographic;
	var latitude = position.latitude * 180 / Math.PI;
	var longitude = position.longitude * 180 / Math.PI;
	tlv.map.getView().setCenter([longitude, latitude]);
}

function theMapHasMoved(event) {
	$.each(
		tlv.layers,
		function(i, x) {
			x.layerLoaded = false;
			x.tilesLoaded = 0;
			x.tilesLoading = 0;
		}
	);
}

function theTileHasFinishedLoadingMap(layerSource) {
	setTimeout(function() {
		var thisLayerId = getLayerIdentifier(layerSource);
		var thisLayer;

		var allVisibleLayersHaveFinishedLoading = true;
		$.each(
			tlv.layers,
			function(i, x) {
				var id = getLayerIdentifier(x.mapLayer.getSource());
				if (thisLayerId == id) {
					thisLayer = x;
					x.tilesLoaded += 1;
					if (x.tilesLoading == x.tilesLoaded) {
						x.layerLoaded = true;
						if (x.mapLayer.getOpacity() == 0) { x.mapLayer.setVisible(false); }
					}
				}
				if (!x.layerLoaded && x.mapLayer.getVisible() && x.mapLayer.getOpacity() != 0) {
					updateTileLoadingProgressBar();
 					allVisibleLayersHaveFinishedLoading = false;
				}
			}
		);

		if (allVisibleLayersHaveFinishedLoading) { updateTileLoadingProgressBar(); }

		if (thisLayer.layerLoaded && allVisibleLayersHaveFinishedLoading) { preloadAnotherLayer(getNextFrameIndex()); }
	}, 100);
}

function theTileHasStartedLoadingMap(layerSource) {
	var thisLayerId = getLayerIdentifier(layerSource);
	$.each(
		tlv.layers,
		function(i, x) {
			var id = getLayerIdentifier(x.mapLayer.getSource());
			if (thisLayerId == id) {
				x.tilesLoading += 1;

				if (x.mapLayer.getVisible() && x.mapLayer.getOpacity() != 0) { updateTileLoadingProgressBar(); }
			}
		}
	);
}

function updateMapSize() {
	if ( tlv.map ) {
		var windowHeight = $( window ).height();
		var banners = $( ".security-classification" ).length;
		var bannersHeight = banners * $( ".security-classification" ).height();
		var navigationMenuHeight = $( "#navigationMenu" ).parent().height();
		var imageInfoHeight = $( "#navigationMenu" ).parent().next().height();
		var tileLoadProgressBarHeight = $( "#tileLoadProgressBar" ).height();
		var mapHeight = windowHeight
			- bannersHeight
			- navigationMenuHeight
			- imageInfoHeight
			- tileLoadProgressBarHeight;
		$( "#map" ).height( mapHeight );
		tlv.map.updateSize();
	}
}

function updateTileLoadingProgressBar() {
	var tilesLoaded = tilesLoading = 0;
	$.each(
		tlv.layers,
		function(i, x) {
			if (x.mapLayer.getVisible() && x.mapLayer.getOpacity() != 0) {
				tilesLoaded += x.tilesLoaded;
				tilesLoading += x.tilesLoading;
			}
		}
	);

	var width = (tilesLoaded / tilesLoading * 100).toFixed(1);
	var progressBar = $("#tileLoadProgressBar");
	progressBar.css("width", (width >= 100 ? 100 : width) + "%");
	if (width < 100) { progressBar.css("visibility", "visible"); }
	else { setTimeout(function() { progressBar.css("visibility", "hidden"); }, 500) }
}
