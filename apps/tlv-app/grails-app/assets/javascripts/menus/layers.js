function configLayerToggle( key ) {
	var state = $("#layers" + key + "Select").val();
	if ( state == "on" ) { displayConfigLayer( key ); }
	else { hideConfigLayer( key ); }
}

var createMapControlsLayers = createMapControls;
createMapControls = function() {
	createMapControlsLayers();

	var overviewMapControl = new ol.control.OverviewMap();
	if ( tlv.overviewMapEnabled == "true" || tlv.preferences.tlvPreference.overviewMap ) {
		// hack
		setTimeout( function() { overviewMapControl.setCollapsed( false ); }, 1000 );
	}
	tlv.mapControls.push( overviewMapControl );
}

function crossHairLayerToggle() {
	var state = $("#layersCrossHairSelect").val();
	if (state == "on") { displayCrossHairLayer(); }
	else { hideCrossHairLayer(); }
}

function displayConfigLayer( key ) {
	var layer = tlv.configLayers[ key ];
	if ( !layer.mapLayer ) {
		var source = new ol.source.Vector({
			format: new ol.format.GeoJSON(),
			// this forces the features to reload each time
			strategy: function( extent, resolution ) {
				if ( layer.refresh && this.loadedExtentsRtree_ ) {
        			this.loadedExtentsRtree_.clear();
				}


				return [ extent ];
			},
			url: function() {
				var url = layer.url;
 				if ( layer.params ) {
					url += "?" + $.param( layer.params );
				}

				var bbox = tlv.map.getView().calculateExtent();
				url = url.replace( encodeURIComponent( "<BBOX>" ), bbox.join( "," ) );


				return url;
	        }
		});

		var style = createDefaultStyle();
		layer.mapLayer = new ol.layer.Vector({
			declutter: true,
			source: source,
			style: function( feature ) {
				// fill
				if ( layer.style && layer.style.fill ) {
					var color = layer.style.fill.color;
					if ( color ) {
						style.getFill().setColor( color );
					}
				}

				// stroke
				if ( layer.style && layer.style.stroke ) {
					var color = layer.style.stroke.color;
					if ( color ) {
						style.getStroke().setColor( color );
					}
				}

				// text
				if ( layer.style && layer.style.text ) {
					var color = layer.style.text.color;
					if ( color ) {
						style.getText().getFill().setColor( color );
					}

					var labelKey = layer.style.text.label;
					if ( labelKey ) {
						var text = feature.get( labelKey );
						if ( typeof text == "object" ) { text = JSON.stringify( text ); }
						style.getText().setText( text );
					}
				}


				return style;
			}
		});

		tlv.map.addLayer( layer.mapLayer );
	}
	else {
		layer.mapLayer.setVisible( true );
	}
}

function displayCrossHairLayer() {
	if ( !tlv.crossHairLayer ) {
		var stroke = new ol.style.Stroke({
			 color: "rgba(255, 255, 0, 1)",
			 width: 2
		});
		var style = new ol.style.Style({ stroke: stroke });

		tlv.crossHairLayer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [ new ol.Feature() ]
			}),
			style: style
		});
		tlv.map.addLayer( tlv.crossHairLayer );
	}
	else { tlv.crossHairLayer.setVisible( true ); }
	refreshCrossHairLayer();
}

function displayMosaicLayer() {
	if ( !tlv.mosaicLayer ) {
		tlv.mosaicImages = [];

		tlv.mosaicLayer = new ol.layer.Tile({
			source: new ol.source.TileWMS({
				crossOrigin: connectedToLocalhost() ? 'anonymous' : undefined,
				params: {
					FORMAT: 'image/vnd.jpeg-png',
					LAYERS: 'omar:raster_entry',
					STYLES: JSON.stringify(
						getDefaultImageProperties()
					),
					TRANSPARENT: true,
					VERSION: '1.1.1'
				},
				tileLoadFunction: function( imageTile, src ) {
					// everything starts as a blank tile
					// even tiles outside the coverage zone need to have SOMETHING
					imageTile.getImage().src = 'data:image/png,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

					var bbox = decodeURIComponent( src.match( /BBOX=([^&]*)/ )[ 1 ] );
					bbox = bbox.split( ',' ).map( function( coord ) {
						return parseFloat( coord )
					} );

					var canvas, context;
					$.each( tlv.mosaicImages, function( index, image ) {
						var geometry = new ol.format.GeoJSON().readGeometry( image.geometry );
						if ( // check to see if the tile completely fills the bbox
							geometry.intersectsCoordinate( [ bbox[ 0 ], bbox[ 1 ] ] ) &&
							geometry.intersectsCoordinate( [ bbox[ 2 ], bbox[ 1 ] ] ) &&
							geometry.intersectsCoordinate( [ bbox[ 2 ], bbox[ 3 ] ] ) &&
							geometry.intersectsCoordinate( [ bbox[ 0 ], bbox[ 3 ] ] ) &&
							index == 0
						) {
							imageTile.getImage().src = src + "&filter=in(" +  image.properties.id + ")";
							return false;
						}
						else if ( index == 0 ) {
							canvas = document.createElement( 'canvas' );
							canvas.height = 256;
							canvas.width = 256;
							context = canvas.getContext( '2d' );
						}

						if ( geometry.intersectsExtent( bbox ) ) {
							var img = new Image();
							img.crossOrigin = connectedToLocalhost() ? 'anonymous' : undefined,
							img.onload = function() {
								context.drawImage( img, 0, 0 );
								imageTile.getImage().src = canvas.toDataURL();
							}
							img.src = src + "&filter=in(" +  image.properties.id + ")";
							imageTile.getImage().src = src + "&filter=in(" +  image.properties.id + ")";
							if (
								geometry.intersectsCoordinate( [ bbox[ 0 ], bbox[ 1 ] ] ) &&
								geometry.intersectsCoordinate( [ bbox[ 2 ], bbox[ 1 ] ] ) &&
								geometry.intersectsCoordinate( [ bbox[ 2 ], bbox[ 3 ] ] ) &&
								geometry.intersectsCoordinate( [ bbox[ 0 ], bbox[ 3 ] ] )
							) {
								// the tile is filled
								return false;
							}
						}
					} );
				},
				url: tlv.libraries.o2.wmsUrl
			})
		});
		tlv.map.addLayer( tlv.mosaicLayer );
	}
	else {
		tlv.mosaicLayer.setVisible( true );
	}
	refreshMosaicLayer();
}

function displaySearchOriginLayer() {
	if (!tlv.searchOriginLayer) {
		var point = new ol.geom.Point( tlv.location );
		var feature = new ol.Feature(point);

		var fill = new ol.style.Fill({ color: "rgba(255, 255, 0, 1)"});
		var circle = new ol.style.Circle({
			fill: fill,
			radius: 5
		});
		var text = new ol.style.Text({
			fill: fill,
			font: "10px sans-serif",
			offsetY: 13,
			text: "Search Origin"
		});
		var style = new ol.style.Style({
			image: circle,
			text: text
		});

		tlv.searchOriginLayer = new ol.layer.Vector({
			source: new ol.source.Vector({ features: [feature] }),
			style: style
		});
		tlv.map.addLayer(tlv.searchOriginLayer);
	}
	else { tlv.searchOriginLayer.setVisible(true); }
}

function hideConfigLayer( key ) {
	tlv.configLayers[ key ].mapLayer.setVisible( false );
}

function hideCrossHairLayer() {
	tlv.crossHairLayer.setVisible( false );
}

function hideMosaicLayer() {
	tlv.mosaicLayer.setVisible( false );
}

function hideSearchOriginLayer() {
	tlv.searchOriginLayer.setVisible( false );
}

function mosaicLayerToggle() {
	var state = $("#layersMosaicSelect").val();
	if (state == "on") { displayMosaicLayer(); }
	else { hideMosaicLayer(); }
}

function overviewLayerToggle() {
	$.each(
		tlv.map.getControls().getArray(), function( index, control ) {
			if ( control instanceof ol.control.OverviewMap ) {
				var state = $( "#layersOverviewSelect").val();
				control.setCollapsed( state );
			}
		}
	);
}

function refreshCrossHairLayer() {
	var mapCenter = tlv.map.getView().getCenter();
	var centerPixel = tlv.map.getPixelFromCoordinate( mapCenter );
	if ( centerPixel ) {
		var deltaXPixel = [centerPixel[0] + 10, centerPixel[1]];

		var maxXPoint = new ol.geom.Point( tlv.map.getCoordinateFromPixel( deltaXPixel ) );
		var minXPoint = maxXPoint.clone();
		minXPoint.rotate( Math.PI, mapCenter );
		var horizontalLine = new ol.geom.LineString([
			minXPoint.getCoordinates(),
			maxXPoint.getCoordinates()
		]);

		var verticalLine = horizontalLine.clone();
		verticalLine.rotate( Math.PI / 2, mapCenter );

		var geometryCollection = new ol.geom.GeometryCollection([
			horizontalLine,
			verticalLine
		]);
		tlv.crossHairLayer.getSource().getFeatures()[0].setGeometry( geometryCollection );
	}
}

function refreshMosaicLayer() {


	var bbox = tlv.map.getView().calculateExtent();
	var param = { filter: 'BBOX(ground_geom,' + bbox.join( ',' ) + ')' };
	getWfs( param, tlv.libraries.o2.wfsUrl )
	.done( function( data ) {
		tlv.mosaicImages = data.features.sort( function( a, b ) {
			if ( a.properties.acquisition_date > b.properties.acquisition_date ) { return -1; }
			else if ( a.properties.acquisition_date < b.properties.acquisition_date ) { return 1; }

			// if the acquisiton dates are the same, sort by entry id
			else if ( a.properties.entry_id < b.properties.entry_id ) { return -1; }
			else if ( a.properties.entry_id > b.properties.entry_id ) { return 1; }


			return 0;
		});

		tlv.mosaicLayer.getSource().updateParams({ IDENTIFIER: Math.random() });
	} );
}

function searchOriginLayerToggle() {
	var state = $("#layersSearchOriginSelect").val();
	if (state == "on") { displaySearchOriginLayer(); }
	else { hideSearchOriginLayer(); }
}

var setupTimeLapseLayers = setupTimeLapse;
setupTimeLapse = function() {
	setupTimeLapseLayers();

	tlv.crossHairLayer = null;
	var crossHairLayerSelect = $( "#layersCrossHairSelect" );
	if ( crossHairLayerSelect.val() == "on" ) {
		crossHairLayerSelect.val("on");
		crossHairLayerToggle();
	}

	tlv.searchOriginLayer = null;
	var searchOriginLayerSelect = $( "#layersSearchOriginSelect" );
	if ( searchOriginLayerSelect.val() == "on" ) {
		searchOriginLayerSelect.val("on");
		searchOriginLayerToggle();
	}
}

var theMapHasMovedLayers = theMapHasMoved;
theMapHasMoved = function() {
	theMapHasMovedLayers();

	if ( $( '#layersCrossHairSelect' ).val() == 'on' ) { refreshCrossHairLayer(); }
	if ( $( '#layersMosaicSelect' ).val() == 'on' ) { refreshMosaicLayer(); }
}
