function addDimension() {
	if ( checkWebGlCompatability() ) {
		if ( tlv.globe === undefined ) {
			displayLoadingDialog( "Retrieving globe... yes, the ENTIRE globe." );

			loadCesiumJavascript().done( function() {
				hideLoadingDialog();

				setupGlobe();
				tlv.globe.setEnabled( true );
			});
		}
		else {
			tlv.globe.setEnabled( true );
		}
	}
	else { $( "#dimensionsSelect" ).val( 2 ); }
}

function addSwipeListenerToMap() {
	var firstLayer, secondLayer = null;
	if (!firstLayer) { firstLayer = tlv.currentLayer; }
	if (!secondLayer) { secondLayer = tlv.currentLayer >= tlv.layers.length - 1 ? 0 : tlv.currentLayer + 1; }

	tlv.layers[ firstLayer ].mapLayer.setVisible( true );
	tlv.layers[ firstLayer ].mapLayer.setOpacity( 1 );
	tlv.layers[ secondLayer ].mapLayer.setVisible( true );
	tlv.layers[ secondLayer ].mapLayer.setOpacity( 1 );

	tlv.swipeLayers = [ firstLayer, secondLayer ].sort();
	tlv.layers[ tlv.swipeLayers[ 0 ] ].mapLayer.on( "precompose", precomposeSwipeLeft );
	tlv.layers[ tlv.swipeLayers[ 0 ] ].mapLayer.on( "postcompose", postcomposeSwipe );
	tlv.layers[ tlv.swipeLayers[ 1 ] ].mapLayer.on( "precompose", precomposeSwipeRight );
	tlv.layers[ tlv.swipeLayers[ 1 ] ].mapLayer.on( "postcompose", postcomposeSwipe );

	var globeLayers = tlv.globe.getCesiumScene().imageryLayers;
	var numberOfBaseLayers = Object.keys( tlv.baseLayers ).length;
	var splitLeft = Cesium.ImagerySplitDirection.LEFT;
	var splitRight = Cesium.ImagerySplitDirection.RIGHT;
	globeLayers.get( tlv.swipeLayers[ 0 ] + numberOfBaseLayers ).splitDirection = splitLeft;
	globeLayers.get( tlv.swipeLayers[ 1 ] + numberOfBaseLayers ).splitDirection = splitRight;

	tlv.swipeDragStartX = 0;
	swipeSliderMove({ clientX: $( "#swipeSlider" ).offset().left });
}

var changeFrameView = changeFrame;
	changeFrame = function( params ) {
	if ( $("#swipeSelect").val() == "on" ) {
		turnOffSwipe();
		changeFrameView( params );
		turnOnSwipe();
	}
	else { changeFrameView( params ); }
}

function changeWmsLayerType() {
	var layerType = $( "#wmsTilesSelect" ).val();

	$.each(
		tlv.layers,
		function( index, layer ) {
			layer.mapLayer.setVisible( false );
			var styles = layer.mapLayer.getSource().getParams().STYLES;

			layer.mapLayer = layer[ layerType ];
			layer.mapLayer.getSource().updateParams({ STYLES: styles });
		}
	);

	changeFrame( "rewind" );
	changeFrame( "fastForward" );
}

var createMapControlsView = createMapControls;
createMapControls = function() {
	createMapControlsView();

	$.each( createSwipeControls(), function( i, x ) { tlv.mapControls.push( x ); } );
}

function createSwipeControls() {
	var sliderInput = document.createElement( "input" );
	sliderInput.id = "swipeSlider";
	var sliderControl = new ol.control.Control({ element: sliderInput });


	return [ sliderControl ];
}

function dimensionToggle() {
	var dimensions = $( "#dimensionsSelect" ).val();
	if ( dimensions == 2 ) { removeDimension(); }
	else { addDimension(); }
}

function initializeSwipeSlider() {
	tlv.swipeDragStartX = 0;
	var swipeSlider = $("#swipeSlider" );
	swipeSlider.on( "mousedown", swipeSliderMouseDown );
	$( window ).on( "mouseup", swipeSliderMouseUp );
}

function openGeometries() {
	var layer = tlv.layers[ tlv.currentLayer ];
	var metadata = layer.metadata;
	$.ajax({
        data: $.param({
            entry: metadata.entry_id,
            filename: metadata.filename
        }),
        url: tlv.libraries[ layer.library ].omsUrl + "/getAngles"
    })
    .done( function( data ) {
		var north = data.northAngle * 180 / Math.PI;
		var up = data.upAngle * 180 / Math.PI;

		tlv.map.once( "postcompose", function( event ) {
			var size = tlv.map.getSize();
			var viewRotation = tlv.map.getView().getRotation() * 180 / Math.PI;
			var params = {
				azimuth: metadata.azimuth_angle - viewRotation,
				elevation: metadata.grazing_angle,
				height: size[ 1 ],
				north: 90 - viewRotation,
				sunAzimuth: metadata.sun_azimuth - viewRotation,
				sunElevation: metadata.sun_elevation,
				up: up + north + 90 - viewRotation,
				width: size[ 0 ]
			};

			mapCanvas = event.context.canvas;

			var popup = window.open( tlv.contextPath + "/geometries?" + $.param( params ), "Collection Geometries", "height=512,width=512" );
		});
		tlv.map.renderSync();
	});
}

function openImageSpace() {
	var layer = tlv.layers[ tlv.currentLayer ];
	var library = tlv.libraries[ layer.library ];
	var metadata = layer.metadata;
	var styles = JSON.parse( layer.mapLayer.getSource().getParams().STYLES );

	var url = library.imageSpaceUrl;
	var params = {
		bands: styles.bands,
		brightness: styles.brightness,
		contrast: styles.contrast,
		entry_id: metadata.entry_id,
		filename: metadata.filename,
		height: metadata.height,
		histCenterTile: styles.hist_center,
		histOp: styles.hist_op,
		imageId: metadata.id,
		imageSpaceRequestUrl: tlv.baseUrl + "/omar-oms",
		imageRenderType: "tile",
		mensaRequestUrl: tlv.baseUrl + "/omar-mensa",
		numOfBands: metadata.number_of_bands,
		numResLevels: metadata.number_of_res_levels,
		resamplerFilter: styles.resampler_filter,
		sharpenMode: styles.sharpen_mode,
		showModalSplash: false,
		uiRequestUrl: tlv.baseUrl + "/omar-ui",
		wfsRequestUrl: library.wfsUrl,
		width: metadata.width,
		wmsRequestUrl: tlv.baseUrl + "/omar-wms"
	};

	window.open( url + "?" + $.param( params ) );
}

function precomposeSwipeLeft( event ) {
	// only
	var swipeSlider = $( "#swipeSlider" );
	var context = event.context;
	var width = context.canvas.width * swipeSlider.offset().left / swipeSlider.parent().width();

	context.save();
	context.beginPath();
	context.rect( 0, 0, width, context.canvas.height);
	context.clip();
}

function precomposeSwipeRight( event ) {
	var swipeSlider = $( "#swipeSlider" );
	var context = event.context;
	var width = context.canvas.width * swipeSlider.offset().left / swipeSlider.parent().width();

	context.save();
	context.beginPath();
	context.rect( width, 0, context.canvas.width - width, context.canvas.height);
	context.clip();
}

var postcomposeSwipe = function(event) { event.context.restore(); }

function removeDimension() { tlv.globe.setEnabled( false ); }

function removeSwipeListenerFromMap() {
	$.each(
		tlv.layers,
		function( index, layer ) {
			layer.mapLayer.un( "precompose", precomposeSwipeLeft );
			layer.mapLayer.un( "precompose", precomposeSwipeRight );
			layer.mapLayer.un( "postcompose", postcomposeSwipe );
			layer.mapLayer.setOpacity( 0 );
			layer.mapLayer.setVisible( false );
		}
	);

	for ( var index = 0; index < tlv.globe.getCesiumScene().imageryLayers.length; index++ ) {
		var layer = tlv.globe.getCesiumScene().imageryLayers.get( index );
		if ( layer.splitDirection ) {
			layer.splitDirection = Cesium.ImagerySplitDirection.NONE;
		}
	}

	tlv.layers[ tlv.currentLayer ].mapLayer.setVisible( true );
	tlv.layers[ tlv.currentLayer ].mapLayer.setOpacity( 1 );
}

var rightClickView = rightClick;
rightClick = function( event ) {
	event.preventDefault();

	if ( tlv.layers.length > 1 ) {
		var time = new Date().getTime();
		var rightClickUp = function( event ) {
			$( window ).off( "mouseup", rightClickUp );
			if ( new Date().getTime() - time < 250 ) {
				clearTimeout( activateSwipeTimeout );
				rightClickView( event );
			}
			else {
				$( "#swipeSelect" ).val( "off" );
				swipeSliderMouseUp()
				turnOffSwipe();
			}
		}

		$( window ).on( "mouseup", rightClickUp );

		var activateSwipeTimeout = setTimeout( function() {
			// move the slider to the current mouse position
			var swipeSlider = $( "#swipeSlider" );
			var splitPosition = ( event.clientX - tlv.swipeDragStartX ) / swipeSlider.parent().width();
			swipeSlider.css( "left", ( 100.0 * splitPosition ) + "%" );

			turnOnSwipe();
			swipeSliderMouseDown( event );
		},
		300 );
	}
	else {
		rightClickView( event );
	}
}

function swipeToggle() {
	var state = $( "#swipeSelect" ).val();
	if (state == "on") { turnOnSwipe(); }
	else { turnOffSwipe(); }
}

var setupMapView = setupMap;
setupMap = function() {
	setupMapView();
	initializeSwipeSlider();
}

function swipeSliderMouseDown( event ) {
	tlv.swipeDragStartX = event.clientX - $( "#swipeSlider" ).offset().left;
	$( window ).on( "mousemove", swipeSliderMove );
}

function swipeSliderMouseUp( event ) {
	$( "#swipeSlider" ).blur();
	$( window ).unbind( "mousemove", swipeSliderMove );
}

function swipeSliderMove( event ) {
	var swipeSlider = $( "#swipeSlider" );
	var splitPosition = ( event.clientX - tlv.swipeDragStartX ) / swipeSlider.parent().width();
	swipeSlider.css( "left", ( 100.0 * splitPosition ) + "%" );
	tlv.map.render();

	tlv.globe.getCesiumScene().imagerySplitPosition = splitPosition;
}

function terrainWireframeToggle() {
	var state = $( "#terrainWireframeSelect" ).val();
	if ( state == "on" ) {
		var dimensions = $( "#dimensionsSelect" ).val();
		if ( dimensions == 2 ) { displayErrorDialog( "This only works in 3 dimensions." ); }
		else { tlv.globe.getCesiumScene().globe._surface.tileProvider._debug.wireframe = true; }
	}
	else { tlv.globe.getCesiumScene().globe._surface.tileProvider._debug.wireframe = false; }
}

function turnOffSwipe() {
	$( "#swipeSelect" ).val( "off" );

	$( "#swipeSlider" ).hide();
	removeSwipeListenerFromMap();

	updateScreenText();
}

function turnOnSwipe() {
	$( "#swipeSelect" ).val( "on" );

	$( "#swipeSlider" ).show();
	addSwipeListenerToMap();

	updateScreenText();
}

var updateScreenTextView = updateScreenText;
updateScreenText = function() {
	updateScreenTextView();

	if ( $( "#swipeSelect" ).val() == "on" ) {
		$.each(
			{ imageId: tlv.swipeLayers[ 0 ], acquisitionDate: tlv.swipeLayers[ 1 ] },
			function( key, value ) {
				var layer = tlv.layers[ value ];
				var acquisitionDate = layer ? layer.acquisitionDate : "";
				var imageId = layer ? layer.imageId + "<br>" : "";
				var libraryLabel = layer ? tlv.libraries[ layer.library ].label + ":" : "";
				$( "#" + key + "Div" ).html( libraryLabel + imageId + acquisitionDate );
			}
		);
	}
}

function zoomToFullResolution() {
	var metadata = tlv.layers[ tlv.currentLayer ].metadata;
	var gsdX = metadata.gsdx;
	var gsdY = metadata.gsdy;
	var resolution = Math.sqrt( Math.pow( gsdX, 2 ) + Math.pow( gsdY, 2 ) );
	tlv.map.getView().setResolution( resolution );
}

function zoomToMaximumExtent() {
	var footprint = tlv.layers[ tlv.currentLayer ].metadata.footprint;
	var polygon = new ol.geom.MultiPolygon( footprint.coordinates );
	var extent = ol.proj.transformExtent( polygon.getExtent(), "EPSG:4326", "EPSG:3857" );
	tlv.map.getView().fit( extent );
}
