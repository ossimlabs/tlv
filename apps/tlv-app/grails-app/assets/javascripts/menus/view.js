function addDimension() {
	if ( checkWebGlCompatability() ) {
		$.each( tlv.layers, function( index, layer ) {
			var source = layer.mapLayer.getSource();
			var styles = source.getParams().STYLES;
			source.updateParams({
				STYLES: encodeURIComponent( styles )
			});
		});

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

var addLayerToTheMapView = addLayerToTheMap;
addLayerToTheMap = function( layer ) {
	addLayerToTheMapView( layer );

	layer.imageSpaceMap.addLayer( layer.imageSpaceImageLayer );
	layer.imageSpaceMap.addLayer( layer.imageSpaceTileLayer );
	layer.imageSpaceMapLayer = layer.imageSpaceTileLayer;
}

function addSwipeListenerToMap() {
	var firstLayer = tlv.currentLayer;
	var secondLayer = tlv.currentLayer >= tlv.layers.length - 1 ? 0 : tlv.currentLayer + 1;

	tlv.layers[ firstLayer ].mapLayer.setVisible( true );
	tlv.layers[ firstLayer ].mapLayer.setOpacity( 1 );
	tlv.layers[ secondLayer ].mapLayer.setVisible( true );
	tlv.layers[ secondLayer ].mapLayer.setOpacity( 1 );

	tlv.swipeLayers = [ firstLayer, secondLayer ].sort();
	tlv.layers[ tlv.swipeLayers[ 0 ] ].mapLayer.on( "precompose", precomposeSwipeLeft );
	tlv.layers[ tlv.swipeLayers[ 0 ] ].mapLayer.on( "postcompose", postcomposeSwipe );
	tlv.layers[ tlv.swipeLayers[ 1 ] ].mapLayer.on( "precompose", precomposeSwipeRight );
	tlv.layers[ tlv.swipeLayers[ 1 ] ].mapLayer.on( "postcompose", postcomposeSwipe );

	if ( tlv.globe && tlv.globe.getEnabled() ) {
		var globeLayers = tlv.globe.getCesiumScene().imageryLayers;
		var numberOfBaseLayers = Object.keys( tlv.baseLayers ).length;
		var splitLeft = Cesium.ImagerySplitDirection.LEFT;
		var splitRight = Cesium.ImagerySplitDirection.RIGHT;

		var leftLayerIndex = globeLayers.length - ( 2 * tlv.swipeLayers[ 0 ] + 1 );
		var rightLayerIndex = globeLayers.length - ( 2 * tlv.swipeLayers[ 1 ] + 1 );
		globeLayers.get( leftLayerIndex ).splitDirection = splitLeft;
		globeLayers.get( rightLayerIndex ).splitDirection = splitRight;
	}

	tlv.swipeDragStartX = 0;
	swipeSliderMove({ clientX: $( "#swipeSlider" ).offset().left });
}

var changeFrameView = changeFrame;
changeFrame = function( params ) {
	var oldLayer = tlv.layers[ tlv.currentLayer ];
	var oldMap = oldLayer.imageSpaceMap;
	var center = oldMap.getView().getCenter();

	$( '#' + oldMap.getTarget() ).hide();


	if ( $( '#swipeSelect' ).val() == 'on' ) {
		turnOffSwipe();
		changeFrameView( params );
		turnOnSwipe();
	}
	else { changeFrameView( params ); }


	if ( $( '#imageSpaceMaps' ).is( ':visible' ) ) {

		imagePointsToGround( [ center ], oldLayer, function( coordinates, layer, info ) {
			// assume that the layer switched while the AJAX call is being made
			var newLayer = tlv.layers[ tlv.currentLayer ];

			groundToImagePoints( coordinates, newLayer, function( pixels, layer ) {
				hideLoadingDialog();
				layer.imageSpaceMap.getView().setCenter( pixels[ 0 ] );

				$( '#' + tlv.layers[ tlv.currentLayer ].imageSpaceMap.getTarget() ).show();
				tlv.layers[ tlv.currentLayer ].imageSpaceMap.updateSize();
			} );
		} );
	}
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

			layer.imageSpaceMapLayer = layer[ 'imageSpace' + layerType.capitalize() ];
			layer.imageSpaceMapLayer.getSource().updateParams({ STYLES: styles });
		}
	);

	changeFrame( "rewind" );
	changeFrame( "fastForward" );
}

var createLayersView = createLayers;
createLayers = function( layer ) {
	createLayersView( layer );

	var imageHeight = layer.metadata.height;
	var imageWidth = layer.metadata.width;
	var imageExtent = [ 0, 0, imageWidth, imageHeight ];

	layer.imageSpaceImageLayer = new ol.layer.Image({
		extent: imageExtent,
		source: layer.imageSpaceImageSource,
		visible: false
	});

	layer.imageSpaceTileLayer = new ol.layer.Tile({
		extent: imageExtent,
		source: layer.imageSpaceTileSource,
		visible: true
	});
}

var createLayerSourcesView = createLayerSources;
createLayerSources = function( layer ) {
	createLayerSourcesView( layer );

	var imageHeight = layer.metadata.height;
	var fixY = function( image, src ) {
		var regexBbox = /BBOX\=([^&^#]*)/;
		var url = decodeURIComponent( src );
		var bbox = url.match( regexBbox )[ 1 ].split( ',' ).map( Number );
		var height = bbox[ 3 ] - bbox[ 1 ];
		var requestCenter = ( bbox[ 3 ] + bbox[ 1 ] ) / 2;
		var newCenter = imageHeight - requestCenter;
		var minY = newCenter - height / 2;
		var maxY = minY + height;
		var bboxOut = bbox[ 0 ] + ',' + minY + ',' + bbox[ 2 ] + ',' + maxY;
		var newUri = src.replace( regexBbox, 'BBOX=' + encodeURIComponent( bboxOut ) );
		image.getImage().src = newUri;
	};

	var imageDatabaseId = layer.metadata.id;
	layer.imageSpaceImageSource = new ol.source.ImageWMS({
		crossOrigin: connectedToLocalhost() ? 'anonymous' : undefined,
		imageLoadFunction: fixY,
		params: {
			FORMAT: 'image/jpeg',
			LAYERS: "omar:raster_entry." + imageDatabaseId,
			STYLES: layer.imageSource.getParams().STYLES,
			VERSION: "1.3.0"
		},
		url: tlv.libraries[ layer.library ].wmsUrl
	});

	layer.imageSpaceTileSource = new ol.source.TileWMS({
		crossOrigin: connectedToLocalhost() ? 'anonymous' : undefined,
		params: {
			FORMAT: 'image/jpeg',
			LAYERS: "omar:raster_entry." + imageDatabaseId,
			STYLES: layer.tileSource.getParams().STYLES,
			VERSION: "1.3.0"
		},
		tileLoadFunction: fixY,
		url: tlv.libraries[ layer.library ].wmsUrl
	});
}

var createMapControlsView = createMapControls;
createMapControls = function() {
	createMapControlsView();

	$.each( createSwipeControls(), function( i, x ) { tlv.mapControls.push( x ); } );

	$.each( tlv.layers, function( index, layer ) {
		var controls = [
			createAcquisitionDateControl(),
			createAnnotationsControl(),
			tlv.layers.length > 1 ? createDeleteControl() : null,
			createExportControl(),
			tlv.layers.length > 1 ? createFastForwardControl() : null,
			createFullScreenControl(),
			createHelpControl(),
			createImageIdControl(),
			createImagePropertiesControl(),
			createLayersControl(),
			tlv.layers.length > 1 ? createPlayStopControl() : null,
			tlv.layers.length > 1 ? createRewindControl() : null,
			createRotationTiltControl(),
			createSearchControl(),
			tlv.layers.length > 1 ? createSummaryTableControl() : null,
			createToolsControl(),
			createUserNameControl(),
			createViewControl(),
			createZoomControl()
		];
		$.each( controls, function( index, control ) {
			if ( control ) {
				layer.imageSpaceMap.addControl( control );
			}
		} );

		var northArrowControl = new ol.control.Rotate({
			render: function(mapEvent) {
				var frameState = mapEvent.frameState;
			    if ( !frameState ) return;

				var radians = frameState.viewState.rotation - ( layer.metadata.northAngle || 0 );
				var transform = "rotate(" + radians + "rad)";
				var arrow = $( '#' + layer.imageSpaceMap.getTarget() ).find( '.ol-compass' );
				arrow.css( 'msTransform', transform );
				arrow.css( 'transform', transform );
				arrow.css( 'webkitTransform', transform );

			}
		});
		layer.imageSpaceMap.addControl( northArrowControl );

		var UpIsUpControl = function() {
			var button = document.createElement( "button" );
			button.innerHTML = "U";
			button.title = "Up is Up";

			var this_ = this;
			$( button ).on( 'click', function() {
				var upAngle = layer.metadata.upAngle;
				if ( upAngle ) {
					layer.imageSpaceMap.getView().setRotation( upAngle );
				}
				else {
					displayErrorDialog( 'Woops,the up angle for this image seems to be missing!' );
 				}
			} );

			var element = document.createElement( 'div' );
			element.className = 'up-is-up-control ol-unselectable ol-control';
			element.appendChild( button );

			ol.control.Control.call( this, {
				element: element,
				target: undefined
			} );
		};
		ol.inherits( UpIsUpControl, ol.control.Control );
		layer.imageSpaceMap.addControl( new UpIsUpControl() );
	} );
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

var geoJumpView = geoJump;
geoJump = function( location ) {
	if ( $( '#viewSpaceSelect' ).val() == 'imageSpace' ) {
		convertGeospatialCoordinateFormat( location, function( coordinate ) {
			if ( coordinate ) {
				var currentLayer = tlv.layers[ tlv.currentLayer ];
				groundToImagePoints( [ coordinate ], currentLayer, function( pixels, layer ) {
					var center = pixels[ 0 ];
					center[ 1 ] = layer.metadata.height - center[ 1 ];
					layer.imageSpaceMap.getView().setCenter( center );
				} );
			}
		} );
	}
	else {
		geoJumpView( location );
	}
}

var getScreenshotMapView = getScreenshotMap;
getScreenshotMap = function( callback ) {
	if ( $( '#imageSpaceMaps' ).is( ':visible' ) ) {
		var map = tlv.layers[ tlv.currentLayer ].imageSpaceMap;
		map.once(
			"postcompose",
			function( event ) {
				var canvas = event.context.canvas;
				callback( canvas );
			}
		);
		map.renderSync();
	}
	else {
		getScreenshotMapView( callback );
	}
}

function getNorthAndUpAngles() {
	$.each( tlv.layers, function( index, layer ) {
		var metadata = layer.metadata;
		if ( typeof metadata.upAngle != 'number' || typeof metadata.northAngle != 'number' ) {
			var params = {
				entry: layer.metadata.entry_id,
				filename: layer.metadata.filename
			};
			$.ajax({
				data: $.param( params ),
				url: tlv.libraries[ layer.library ].omsUrl + '/getAngles'
			})
			.done( function( data ) {
				metadata.northAngle = data.northAngle;

				var upAngle = data.upAngle;
				metadata.upAngle = upAngle;
				if ( upAngle ) {
					layer.imageSpaceMap.getView().setRotation( upAngle );
				}
			} );
		}
	} );
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

function removeDimension() {
	$.each( tlv.layers, function( index, layer ) {
		var source = layer.mapLayer.getSource();
		var styles = source.getParams().STYLES;
		source.updateParams({
			STYLES: decodeURIComponent( styles )
		});
	});

	tlv.globe.setEnabled( false );
}

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

	if ( tlv.globe && tlv.globe.getEnabled() ) {
		for ( var index = 0; index < tlv.globe.getCesiumScene().imageryLayers.length; index++ ) {
			var layer = tlv.globe.getCesiumScene().imageryLayers.get( index );
			if ( layer.splitDirection ) {
				layer.splitDirection = Cesium.ImagerySplitDirection.NONE;
			}
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

function setupImageSpaceMaps() {
    $( '#imageSpaceMaps' ).html( '' );

    $.each( tlv.layers, function( index, layer ) {
        var div = document.createElement( 'div' );
        div.className = 'map';
        div.id = 'imageSpaceMap' + index;
        div.style.cssText = 'display: none; height: 100%';
        $( '#imageSpaceMaps' ).append( div );

        var imageDatabaseId = layer.metadata.id;
        var imageHeight = layer.metadata.height;
        var imageWidth = layer.metadata.width;
        var imageExtent = [ 0, 0, imageWidth, imageHeight ];

		if ( layer.imageSpaceMap ) { layer.imageSpaceMap.setTarget( null ); }
        layer.imageSpaceMap = new ol.Map({
			controls: ol.control.defaults(),
            target: 'imageSpaceMap' + index,
            view: new ol.View({
                center: [ imageWidth / 2, imageHeight / 2 ],
                extent: imageExtent,
                //maxResolution: Math.pow( layer.metadata.number_of_res_levels - 1, 2 ),
                //minResolution: Math.pow( 2, -6 ),
                projection: new ol.proj.Projection({
                    code: 'EPSG:9999',
                    extent: [ 0, 0, imageWidth, imageHeight ],
                    units: 'm'
                }),
                zoom: 1
            })
        });

		layer.imageSpaceMap.getViewport().addEventListener( "contextmenu", rightClick );
    } );
}

var setupTimeLapseView = setupTimeLapse;
setupTimeLapse = function() {
	setupImageSpaceMaps();

	setupTimeLapseView();

	initializeSwipeSlider();
	if ( $( "#dimensionsSelect" ).val() == 3 ) {
		addDimension();
	}
	if ( $( "#swipeSelect" ).val() == "on" ) {
		turnOnSwipe();
	}
	if ( $( '#viewSpaceSelect' ).val() == 'imageSpace' ) {
		switchToOrthoSpace(); // needed to get some map coords
		switchToImageSpace();
	}
	if ( $( "#wmsTilesSelect" ).val() == "imageLayer" ) {
		changeWmsLayerType();
	}
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

	if ( tlv.globe && tlv.globe.getEnabled() ) {
		tlv.globe.getCesiumScene().imagerySplitPosition = splitPosition;
	}
}

function swipeToggle() {
	var state = $( "#swipeSelect" ).val();
	if (state == "on") { turnOnSwipe(); }
	else { turnOffSwipe(); }
}

function switchToOrthoSpace() {
    $( '#imageSpaceMaps' ).hide();
	$( '#map' ).show();
	updateMapSize();

	displayLoadingDialog( "Synching the map view... " );
	var layer = tlv.layers[ tlv.currentLayer ];
	var center = layer.imageSpaceMap.getView().getCenter();
	var resolution = layer.imageSpaceMap.getView().getResolution();
	var size = layer.imageSpaceMap.getSize();
	var pixels = [
		[ center[ 0 ] - resolution * size[ 0 ] / 2, layer.metadata.height - center[ 1 ] - resolution * size[ 1 ] / 2 ],
		[ center[ 0 ] + resolution * size[ 0 ] / 2,	layer.metadata.height - center[ 1 ] + resolution * size[ 1 ] / 2 ]
	];

	imagePointsToGround( pixels, layer, function( coordinates, layer, info ) {
		hideLoadingDialog();

		var extent = coordinates[ 0 ].join( ',' ) + ',' + coordinates[ 1 ].join( ',' ).split( ',' );
		tlv.map.getView().fit( extent, { nearest: true } );
	} );
}

function switchToImageSpace() {
	getNorthAndUpAngles();

	var layer = tlv.layers[ tlv.currentLayer ];
	$( '#imageSpaceMaps' ).show();
	$( '#map' ).hide();
	updateMapSize();


	displayLoadingDialog( "Synching the map view... " );
	var center = tlv.map.getView().getCenter();
	var resolution = tlv.map.getView().getResolution();
	var size = tlv.map.getSize();
	var coordinates = [
		[ center[ 0 ] - resolution * size[ 0 ] / 2, center[ 1 ] - resolution * size[ 1 ] / 2 ],
		[ center[ 0 ] + resolution * size[ 0 ] / 2,	center[ 1 ] + resolution * size[ 1 ] / 2 ]
	];
	$.each( tlv.layers, function( index, layer ) {
		groundToImagePoints( coordinates, layer, function( pixels, layer ) {
			hideLoadingDialog();

			var xs = [ pixels[ 0 ][ 0 ], pixels[ 1 ][ 0 ] ];
			var ys = [
				layer.metadata.height - pixels[ 0 ][ 1 ],
				layer.metadata.height - pixels[ 1 ][ 1 ]
			];
			var extent = [
				Math.min( xs[ 0 ], xs[ 1 ] ),
				Math.min( ys[ 0 ], ys[ 1 ] ),
				Math.max( xs[ 0 ], xs[ 1 ] ),
				Math.max( ys[ 0 ], ys[ 1 ] )
			];
			$( '#' + layer.imageSpaceMap.getTarget() ).show();
			layer.imageSpaceMap.updateSize();
			layer.imageSpaceMap.getView().fit( extent, { nearest: true } );
			if ( index != tlv.currentLayer ) {
				$( '#' + layer.imageSpaceMap.getTarget() ).hide();
			}
		} );
	} );
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

var updateMapSizeView = updateMapSize;
updateMapSize = function() {
	if ( $( '#imageSpaceMaps' ).is( ':visible' ) ) {
		var windowHeight = $( window ).height();
		var bannersHeight = $( ".banner" ).height() + $( ".security-classification" ).height();
		var tileLoadProgressBarHeight = $( "#tileLoadProgressBar" ).height();
		var mapHeight = windowHeight - bannersHeight - tileLoadProgressBarHeight;
		$( '#imageSpaceMaps' ).height( mapHeight );
		$.each( tlv.layers, function( index, layer ) {
			$( '#imageSpaceMap' + index ).height( mapHeight );
			layer.imageSpaceMap.updateSize();
		} );
	}
	else {
		updateMapSizeView();
	}
}

var updateScreenTextView = updateScreenText;
updateScreenText = function() {
	updateScreenTextView();

	if ( $( "#swipeSelect" ).val() == "on" && tlv.sipwLayers ) {
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

function viewSpaceToggle() {
	var viewSpace = $( '#viewSpaceSelect' ).val();
	if ( viewSpace == "imageSpace" ) {
		switchToImageSpace();
	}
	else if ( viewSpace == "ortho" ) {
		switchToOrthoSpace();
	}
}

var zoomToFullResolutionView = zoomToFullResolution;
zoomToFullResolution = function() {
	if ( $( '#imageSpaceMaps' ).is( ':visible' ) ) {
		tlv.layers[ tlv.currentLayer ].imageSpaceMap.getView().setResolution( 1 );
	}
	else {
		zoomToFullResolutionView();
	}
}

var zoomToMaximumExtentView = zoomToMaximumExtent;
zoomToMaximumExtent = function() {
	if ( $( '#imageSpaceMaps' ).is( ':visible' ) ) {
		var layer = tlv.layers[ tlv.currentLayer ];
		var map = layer.imageSpaceMap;
		var mapSize = map.getSize();
		var pixelWidth = Math.max( Math.min( mapSize[ 0 ], mapSize[ 1 ] ), 128 );
		var size = Math.max( layer.metadata.width, layer.metadata.height );
		var level = 0;
		while (size > pixelWidth) {
			level += 1;
			size = size >> 1;
		}
		var resolution = Math.pow( 2, level );
	    map.getView().setResolution( resolution );
	}
	else {
		zoomToMaximumExtentView();
	}
}
