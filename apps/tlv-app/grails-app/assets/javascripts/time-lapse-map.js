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
					source = new ol.source.XYZ({
						url: x.url
					});
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
		STYLES: JSON.stringify(
			getDefaultImageProperties()
		),
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
	var acquisitionDateDiv = document.createElement( "div" );
	acquisitionDateDiv.className = "custom-map-control";
	acquisitionDateDiv.id = "acquisitionDateDiv";
	var acquisitionDateControl = new ol.control.Control({ element: acquisitionDateDiv });

	var FastForwardControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-step-forward'></span>";
		button.title = "Fast Forward";

		var this_ = this;
		$( button ).on( "click", function( event ) {
			$( this ).blur();
			changeFrame( "fastForward" );
		});

		var element = document.createElement( "div" );
		element.className = "fast-forward-control ol-unselectable ol-control";
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( FastForwardControl, ol.control.Control );

	var fullScreenSpan = document.createElement( "span" );
	fullScreenSpan.className = "glyphicon glyphicon-fullscreen";
	var fullScreenControl = new ol.control.FullScreen({ label: fullScreenSpan });

	var imageIdOuterDiv = document.createElement( "div" );
	imageIdOuterDiv.className = "custom-map-control";
	imageIdOuterDiv.id = "imageIdOuterDiv";
	imageIdOuterDiv.style = "background-color: rgba(0, 0, 0, 0); pointer-events: none;"

	var imageIdDiv = document.createElement( "div" );
	imageIdDiv.id = "imageIdDiv";
	imageIdDiv.style = "background-color: rgba(0, 0, 0, 0.5); display: inline-block; text-align: left";
	$( imageIdOuterDiv ).append( imageIdDiv );

	var imageIdControl = new ol.control.Control({ element: imageIdOuterDiv });

	var PlayStopControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-play'></span>";
		button.title = "Play/Stop";

		var this_ = this;
		$( button ).on( "click", function( event ) {
			$( this ).blur();
			playStopTimeLapse( $( button ).children()[ 0 ] );
		});

		var element = document.createElement( "div" );
		element.className = "play-stop-control ol-unselectable ol-control";
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( PlayStopControl, ol.control.Control );

	var RewindControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-step-backward'></span>";
		button.title = "Rewind";

		var this_ = this;
		$( button ).on( "click", function( event ) {
			$( this ).blur();
			changeFrame( "rewind" );
		});

		var element = document.createElement( "div" );
		element.className = "rewind-control ol-unselectable ol-control";
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( RewindControl, ol.control.Control );

	var RotationTiltControl = function() {
		var rotationInput = document.createElement( "input" );
		rotationInput.id = "rotationSliderInput";
		rotationInput.max = "360";
		rotationInput.min = "0";
		rotationInput.oninput = function( event ) {
			var degrees = $( rotationInput ).val();
			tlv.map.getView().setRotation( degrees * Math.PI / 180 );
		};
		rotationInput.step = "1";
		rotationInput.style.display = "none";
		rotationInput.style[ "vertical-algin" ] = "middle";
		rotationInput.type = "range";
 		rotationInput.value = "0";

		var tiltInput = document.createElement( "input" );
		tiltInput.id = "tiltSliderInput";
		tiltInput.max = "270";
		tiltInput.min = "-90";
		tiltInput.oninput = function( event ) {
			var degrees = $( tiltInput ).val();
			tlv.globe.getCesiumScene().camera.setView({
				orientation: {
					pitch: -degrees * Math.PI / 180
				}
			});
		};

		tiltInput.step = "1";
		tiltInput.style.display = "none";
		tiltInput.style[ "vertical-algin" ] = "middle";
		tiltInput.type = "range";
		tiltInput.value = "90";

		setTimeout( function() {
			$( ".ol-rotate" ).on( "click", function( event ) {
				if ( $( rotationInput ).is( ":visible" ) || $( "#tiltInput" ).is( ":visible" ) ) {
					$( rotationInput ).fadeOut();
					$( tiltInput ).fadeOut();
				}
				else {
					$( rotationInput ).fadeIn();
					if ( $( "#dimensionsSelect" ).val() == "3" ) {
						$( tiltInput ).fadeIn();
					}
				}
			});
		}, 2000 );

		var this_ = this;

		var element = document.createElement( "div" );
		element.appendChild( tiltInput );
		element.appendChild( rotationInput );
		element.className = "rotation-tilt-control ol-unselectable ol-control";


		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});


	};
	ol.inherits( RotationTiltControl, ol.control.Control );

	var SummaryTableControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span id = 'tlvLayerCountSpan'>0/0</span>&nbsp;<span class = 'glyphicon glyphicon-list-alt'></span>";
		button.style = "width: auto";
		button.title = "Summary Table";

		var this_ = this;
		$( button ).on( "click", function( event ) {
			buildSummaryTable();
			$( "#summaryTableDialog" ).modal( "show" );
		});

		var element = document.createElement( "div" );
		element.className = "summary-table-control ol-unselectable ol-control";
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( SummaryTableControl, ol.control.Control );

	tlv.mapControls = [
		acquisitionDateControl,
		createMousePositionControl(),
		fullScreenControl,
		imageIdControl,
		new RewindControl(),
		new PlayStopControl(),
		new RotationTiltControl(),
		new FastForwardControl(),
		new SummaryTableControl()
	];
}

function createMapInteractions() {
	var dragAndDropInteraction = new ol.interaction.DragAndDrop({
		formatConstructors: [
			ol.format.GPX,
			ol.format.GeoJSON,
			ol.format.IGC,
			ol.format.KML,
			ol.format.TopoJSON
		]
	});

	dragAndDropInteraction.on( "addfeatures", function( event ) {
        var source = new ol.source.Vector({
			features: event.features
		});
		var styleFunction = function() {
			createDefaultStyle();
		}
		var layer = new ol.layer.Vector({
			source: source,
			style: styleFunction
        })
        tlv.map.addLayer( layer );
        tlv.map.getView().fit( source.getExtent() );
		$.each(event.features, function(index, feature) {
		console.dir(feature.getStyle());
		});
	});

	var dragPanInteraction = new ol.interaction.DragPan({
		condition: function( event ) {
			return ol.events.condition.noModifierKeys( event ) &&
				ol.events.condition.primaryAction( event );
		}
	});

	tlv.mapInteractions = [
		dragAndDropInteraction,
		dragPanInteraction
	];
}

function createMousePositionControl() {
	var mousePositionControl = new ol.control.MousePosition({
		coordinateFormat: function(coordinate) {
			var lat = coordinate[ 1 ];
			var lon = coordinate[ 0 ];
			var coordConvert = new CoordinateConversion();
			switch( mousePositionControl.coordinateDisplayFormat ) {
				case 0: return coordinate[ 1 ].toFixed( 6 ) + ", " + coordinate[ 0 ].toFixed( 6 ); break;
				case 1: return coordConvert.ddToDms( lat, "lat" ) + " " + coordConvert.ddToDms( lon, "lon" ); break;
				case 2: return coordConvert.ddToMgrs( lat, lon ); break;
			}
		},
		projection: "EPSG:4326"
	});

	switch ( tlv.preferences.coordinateFormat ) {
		case "dd": mousePositionControl.coordinateDisplayFormat = 0; break;
		case "dms": mousePositionControl.coordinateDisplayFormat = 1; break;
		case "mgrs": mousePositionControl.coordinateDisplayFormat = 2; break;
	}
	$( mousePositionControl.element ).click( function() {
		mousePositionControl.coordinateDisplayFormat++;
		if ( mousePositionControl.coordinateDisplayFormat >= 3 ) { mousePositionControl.coordinateDisplayFormat = 0; }
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
	var pixel = [ event.clientX, event.clientY ];
	var coordinate = tlv.map.getCoordinateFromPixel( pixel );
	createContextMenuContent( coordinate );
	$( "#contextMenuDialog" ).modal( "show" );
}

function setupMap() {
	// if a map already exists, reset it and start from scratch
	if (tlv.map) { tlv.map.setTarget(null); }

	createMapControls();
	createMapInteractions();
	tlv.map = new ol.Map({
		controls: ol.control.defaults().extend( tlv.mapControls ),
		interactions: ol.interaction.defaults({
			doubleClickZoom: false,
 			dragPan: false
		}).extend( tlv.mapInteractions ),
		logo: false,
		target: "map"
	});

	updateMapSize();

	// setup context menu
	tlv.map.getViewport().addEventListener( "contextmenu", rightClick );

	tlv.map.on( "moveend", theMapHasMoved );
	tlv.map.getView().on( "change:rotation", theMapHasRotated );

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

function theMapHasRotated( event ) {
	var radians = tlv.map.getView().getRotation();
	$( "#rotationSliderInput" ).val( radians * 180 / Math.PI );
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
