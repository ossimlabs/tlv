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

function displayDetectionLayer( databaseId ) {
	if ( !tlv.detectionLayers ) {
		tlv.detectionLayers = {};
	}

	if ( !tlv.detectionLayers[ databaseId ] ) {
		var source = new ol.source.Vector({
			format: new ol.format.GeoJSON(),
			url: 'https://s3.amazonaws.com/o2-test-data/test.geojson'//tlv.baseUrl + '/omar-ml/job/query/' + databaseId
		});

		var style = createDefaultStyle();
		tlv.detectionLayers[ databaseId ] = new ol.layer.Vector({
			declutter: true,
			source: source,
			style: function( feature ) {
				var text = feature.get( 'top_cat' );
				style.getText().setText( text );


				return style;
			}
		});

		tlv.map.addLayer( tlv.detectionLayers[ databaseId ] );
	}
	else {
		layer.setVisible( true );
	}
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

function hideDetectionLayer( databaseId ) {
	tlv.detectionLayers[ databaseId ].setVisible( false );
}

function hideSearchOriginLayer() {
	tlv.searchOriginLayer.setVisible( false );
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

	if ($("#layersCrossHairSelect").val() == "on") { refreshCrossHairLayer(); }
}
