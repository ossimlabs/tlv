function addBaseLayersToTheMap() {
	tlv.baseLayers = {};
	$.each(
		tlv.availableBaseLayers,
		function(i, x) {
			var source;
			switch(x.type) {
				case "wms":
					source = new ol.source.TileWMS({
						crossOrigin: connectedToLocalhost() ? 'anonymous' : undefined,
						params: {
							FORMAT: x.format || "image/jpeg",
							LAYERS: x.layers,
							STYLES: x.styles || "",
							TRANSPARENT: true,
							VERSION: x.version || "1.1.1"
						},
						urls: (x.urls) ? x.urls.split( ',' ) : []
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
						crossOrigin: connectedToLocalhost() ? 'anonymous' : undefined,
						format: "image/jpeg",
						layer: x.layer,
						matrixSet: x.matrixSet,
						projection: projection,
						style: x.style,
						tileGrid: new ol.tilegrid.WMTS({
							origin: ol.extent.getTopLeft( projectionExtent ),
							resolutions: resolutions,
							matrixIds: matrixIds
						}),
						urls: (x.urls) ? x.urls.split( ',' ) : [],
					});
					break;

				case "xyz":
					source = new ol.source.XYZ({
						crossOrigin: connectedToLocalhost() ? 'anonymous' : undefined,
						urls: (x.urls) ? x.urls.split( ',' ) : []
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
	$( '#baseLayersSelect option[value="' + layerName + '"]' ).prop( 'selected', true );
	$.each(tlv.baseLayers, function(i, x) { x.setVisible(false); });
	if (tlv.baseLayers[layerName]) {
		tlv.baseLayers[layerName].setVisible(true);
	}
}

function compassRotate(event) {
	if (event.alpha) { tlv.map.getView().rotate(event.alpha * Math.PI / 180); }
	else{ displayErrorDialog("Sorry, we couldn't get a good reading. :("); }
}

function createContextMenuContent( point ) {
	var layer = tlv.layers[ tlv.currentLayer ];

	var addGroundPoint = function( coordinate ) {
		var div = createDiv();
		var coordConvert = new CoordinateConversion();
		var latitude = coordinate[ 1 ];
		var longitude = coordinate[ 0 ];
		var dd = latitude.toFixed( 6 ) + ', ' + longitude.toFixed( 6 );
		var dms = coordConvert.ddToDms( latitude, 'lat' ) + ' ' + coordConvert.ddToDms( longitude, 'lon' );
		var mgrs = coordConvert.ddToMgrs( latitude, longitude );

		$( div ).html( dd + ' // ' + dms + ' // ' + mgrs );
		$( '#mouseClickDiv' ).append( div );
	};

	var addImagePoint = function( pixel ) {
		var div = createDiv();
		$( div ).html( 'X: ' + pixel[ 0 ].toFixed( 4 ) + ', Y: ' + pixel[ 1 ].toFixed( 4 ) );
		$( '#mouseClickDiv' ).append( div );
	};

	var createDiv = function() {
		var div = document.createElement( 'div' );
		$( div ).addClass( 'row' );
		$( div ).css( 'text-align', 'center' );


		return div;
	};

	$( '#mouseClickDiv' ).html( '' );
	if ( !$( '#imageSpaceMaps' ).is( ':visible' ) ) {
		addGroundPoint( point );

		groundToImagePoints( [ point ], layer, function( pixels, layer ) {
			addImagePoint( pixels[ 0 ] );
			updatePqe( pixels[ 0 ] );
		} );
	}
	else {
		addImagePoint( point );
		updatePqe( point );

		imagePointsToGround( [ point ], layer, function( coordinates, layer ) {
			addGroundPoint( coordinates[ 0 ] );
		} );
	}

	$("#imageMetadataPre").html( JSON.stringify( tlv.layers[tlv.currentLayer].metadata, null, 2 ) );
}

function createLayers( layer ) {
	var footprint = layer.metadata.footprint;
	var extent = footprint ? new ol.format.WKT().readGeometry( footprint ).getExtent() : undefined;

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
	var library = tlv.libraries[ layer.library ];

	var params = {
		IDENTIFIER: Math.floor( Math.random() * 1000000 ),
		TRANSPARENT: true,
		VERSION: '1.1.1'
	};

	if ( library.wmsUrlProxy ) {
		params.LAYERS = layer.metadata.index_id;
		params.FORMAT = 'image/png';
	}
	else {
		params.FILTER = 'in(' + layer.metadata.id + ')';
		params.FORMAT = 'image/vnd.jpeg-png';
		params.LAYERS = 'omar:raster_entry';
		params.STYLES = JSON.stringify(
			getDefaultImageProperties()
		);
	}

	layer.imageSource = new ol.source.ImageWMS({
		crossOrigin: ( connectedToLocalhost() || tlv.crossOrigin == true ) ? 'anonymous' : undefined,
		params: params,
		url: tlv.libraries[ layer.library ].wmsUrls.split( ',' )[ 0 ]
	});
	if ( tlv.libraries[ layer.library ].wmsUrlProxy ) {
		layer.imageSource.updateParams({ redirectUrl: tlv.libraries[ layer.library ].wmsUrlProxy });
		layer.imageSource.setUrl( tlv.contextPath + '/home/dummyRedirect' );
	}


	var extent = ol.proj.get( 'EPSG:4326' ).getExtent();
	var tileSize = tlv.tileSize ? parseInt( tlv.tileSize ) : 256;
	var startResolution = ol.extent.getWidth( extent ) / tileSize;
	var resolutions = new Array( 22 );
	for ( var i = 0; i < resolutions.length; ++i ) {
		resolutions[ i ] = startResolution / Math.pow( 2, i );
	}
	layer.tileSource = new ol.source.TileWMS({
		crossOrigin: ( connectedToLocalhost() || tlv.crossOrigin == true ) ? 'anonymous' : undefined,
		params: params,
		tileGrid: new ol.tilegrid.TileGrid({
			extent: extent,
			resolutions: resolutions,
			tileSize: [ tileSize, tileSize ]
		}),
		urls: tlv.libraries[ layer.library ].wmsUrls.split( ',' )
	});
	if ( tlv.libraries[ layer.library ].wmsUrlProxy ) {
		layer.tileSource.updateParams({ redirectUrl: tlv.libraries[ layer.library ].wmsUrlProxy });
		layer.tileSource.setUrl( tlv.contextPath + '/home/dummyRedirect' );
	}

	layer.tileSource.on("tileloadstart", function( event ) { theTileHasStartedLoadingMap( this ); });
	layer.tileSource.on("tileloadend", function( event ) { theTileHasFinishedLoadingMap( this ); });
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
		var features = event.features;
		$.each( features, function( index, feature ) {
			var style = createDefaultStyle();
			var properties = feature.getProperties();
			var keys = Object.keys( properties );
			if ( keys.length > 1 ) {
				var text = '';
				if ( keys[ 0 ] != 'geometry' ) {
					text = properties[ keys[ 0 ] ];
				}
				else {
					text = properties[ keys[ 1 ] ];
				}
				style.getText().setText( text );
			}
			feature.setStyle( style );
		} );
        var source = new ol.source.Vector({
			features: features
		});
		tlv.map.getView().fit( source.getExtent(), { nearest: true } );
		var layer = new ol.layer.Vector({
			source: source
        });
        tlv.map.addLayer( layer );
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

function getLayerIdentifier(source) {
	if (typeof source.getParams == "function") { return source.getParams().IDENTIFIER; }
	// assume an XYZ layer
	else { return source.getUrls()[0]; }
}

function measure() {
	var addLineFeature = function( geometry ) {
		var feature = new ol.Feature( geometry );
		vectorSource.addFeature( feature );


		return feature;
	};

	var addPolygonFeature = function( lineGeometry ) {
		var coordinates = lineGeometry.getCoordinates();
		coordinates.push( lineGeometry.getFirstCoordinate() )
		var polygonGeometry = new ol.geom.Polygon([ coordinates ]);
		var feature = new ol.Feature( polygonGeometry );
		vectorSource.addFeature( feature );

		var style = createDefaultStyle();
		style.getStroke().setLineDash([ 10, 10 ]);
		feature.setStyle( style );


		return feature;
	};

	var createOverlays = function( lineGeometry, polygonGeometry ) {
		$.each( [ 'line', 'polygon' ], function( index, value ) {
			var position = value == 'line' ? lineGeometry.getLastCoordinate() : polygonGeometry.getInteriorPoint().getCoordinates();

			var div = document.createElement( 'div' );
			div.className = 'tooltip-measure';
			div.innerHTML = "Calculating...";
			var overlay = new ol.Overlay({
				element: div,
				id: value + 'TooltipOverlay',
				position: position,
				positioning: 'bottom-center'
			});

			if ( $( '#imageSpaceMaps' ).is( ':visible' ) ) {
				tlv.layers[ tlv.currentLayer ].imageSpaceMap.addOverlay( overlay );
			}
			else {
				tlv.map.addOverlay( overlay );
			}
		} );
	}

	var formatLength = function( geometry ) {
		var length = ol.Sphere.getLength( geometry, {
			projection: 'EPSG:4326'
		} );

		var text = ( Math.round( length * 100 ) / 100 ) + ' ' + 'm';
		if ( length > 100 ) {
			text = ( Math.round( length / 1000 * 100 ) / 100 ) + ' ' + 'km';
		}


		return text;
	};

	var formatArea = function( geometry ) {
		var area = ol.Sphere.getArea( geometry, {
			projection: 'EPSG:4326'
		} );
		var text = ( Math.round(area * 100) / 100 ) + ' ' + 'm<sup>2</sup>';
		if ( area > 10000 ) {
			text = ( Math.round(area / 1000000 * 100 ) / 100 ) + ' ' + 'km<sup>2</sup>';
		}


		return text;
	};

	var vectorSource = new ol.source.Vector();
	var vectorLayer = new ol.layer.Vector({
		source: vectorSource,
		style: createDefaultStyle()
	});
	tlv.map.addLayer( vectorLayer );
	$.each( tlv.layers, function( index, layer ) {
		layer.imageSpaceMap.addLayer( vectorLayer );
	} );

	displayInfoDialog( 'Click to start drawing' );

	var drawStyle = createDefaultStyle();
	drawStyle.getImage().setRadius( 1 );
	$.each(
		[ tlv.map ].concat( tlv.layers.map( function( layer ) { return layer.imageSpaceMap; } ) ),
		function( index, map ) {
			var drawInteraction = new ol.interaction.Draw({
				source: vectorSource,
				style: drawStyle,
				type: 'LineString'
		  	});
		  	map.addInteraction( drawInteraction );

			drawInteraction.on( 'drawstart', function( event ) {
				displayInfoDialog( 'Click to continue drawing or double-click to finish...' );

				// create an origin point to snap to for polygons
				var feature = event.feature;
				var coordinate = feature.getGeometry().getCoordinates()[ 0 ];
				var point = new ol.geom.Point( coordinate );
				var origin = new ol.Feature( point );
				vectorSource.addFeature( origin );

				var snapInteraction = new ol.interaction.Snap({
					source: vectorSource
				});
				map.addInteraction( snapInteraction	 );
			} );

			drawInteraction.on( 'drawend', function( event ) {
				vectorSource.clear( true );

				var feature = event.feature;

				var lineGeometry = feature.getGeometry();
				addLineFeature( lineGeometry );
				var polygonGeometry = addPolygonFeature( lineGeometry ).getGeometry();

				createOverlays( lineGeometry, polygonGeometry );
				if ( $( '#imageSpaceMaps' ).is( ':visible' ) ) {
					var layer = tlv.layers[ tlv.currentLayer ];

					var linePixels = lineGeometry.getCoordinates();
					var callback = function( coordinates, layer ) {
						var geometry = new ol.geom.LineString( coordinates );

						var overlay = layer.imageSpaceMap.getOverlayById( 'lineTooltipOverlay' );
						overlay.getElement().innerHTML = formatLength( geometry );
					};
					imagePointsToGround( linePixels, layer, callback );

					var polygonPixels = polygonGeometry.getCoordinates()[ 0 ];
					var callback = function( coordinates, layer ) {
						var geometry = new ol.geom.Polygon([ coordinates ]);

						var overlay = layer.imageSpaceMap.getOverlayById( 'polygonTooltipOverlay' );
						overlay.getElement().innerHTML = formatArea( geometry );
					};
					imagePointsToGround( polygonPixels, layer, callback );
				}
				else {
					$.each( [ 'line', 'polygon' ], function( index, value ) {
						var overlay = tlv.map.getOverlayById( value + 'TooltipOverlay' );
						overlay.getElement().innerHTML = value == 'line' ? formatLength( lineGeometry ) : formatArea( polygonGeometry );
					} );
				}

				// remove draw and snap interactions
				$.each( tlv.map.getInteractions().getArray().slice( 0 ), function( index, interaction ) {
					if ( interaction instanceof ol.interaction.Draw || interaction instanceof ol.interaction.Snap ) {
						tlv.map.removeInteraction( interaction );
					}
				} );
				$.each( tlv.layers, function( index, layer ) {
					$.each( layer.imageSpaceMap.getInteractions().getArray().slice( 0 ), function( index, interaction ) {
						if ( interaction instanceof ol.interaction.Draw || interaction instanceof ol.interaction.Snap ) {
							layer.imageSpaceMap.removeInteraction( interaction );
						}
					} );
				} );

				displayInfoDialog( 'Click to clear...' );

				setTimeout( function() {
					map.once( 'click', function() {
						$.each( [ 'line', 'polygon' ], function( index, value ) {
							var overlay = map.getOverlayById( value + 'TooltipOverlay' );
							$( overlay.getElement() ).remove();
							map.removeOverlay( overlay );
						} );

						vectorSource.clear( true );
						map.removeLayer( vectorLayer );
						$.each( tlv.layers, function( index, layer ) {
							layer.imageSpaceMap.removeLayer( vectorLayer );
						} );
					} );
				}, 500 );
			} );
		}
	);
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
	displayDialog( 'contextMenuDialog' );
}

function setupMap() {
	// if a map already exists, reset it and start from scratch
	if (tlv.map) { tlv.map.setTarget( null ); }

	createMapControls();
	createMapInteractions();
	tlv.map = new ol.Map({
		controls: ol.control.defaults({
			attribution: false
		}).extend( tlv.mapControls ),
		interactions: ol.interaction.defaults({
			doubleClickZoom: false,
 			dragPan: false
		}).extend( tlv.mapInteractions ),
		logo: false,
		target: "map",
		view: new ol.View({
			projection: 'EPSG:4326'
		})
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

	// if the map extent is contained within the combined extent of all visible layers, turn off the basemap
	var geometries = tlv.layers.map( function( layer ) {
		if ( layer.mapLayer.getVisible() ) {
			return new ol.format.WKT().readGeometry( layer.metadata.footprint );
		}
	} )
	.filter( function( geometry ) {
		return geometry != null;
	} );
	var extent = new ol.geom.GeometryCollection( geometries ).getExtent();
	if ( ol.extent.containsExtent( extent, tlv.map.getView().calculateExtent() ) ) {
		$.each( tlv.baseLayers, function( index, layer ) {
			layer.setVisible( false );
		} );
	}
	else {
		changeBaseLayer( $( '#baseLayersSelect' ).val() );
	}
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
