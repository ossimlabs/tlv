function configLayerToggle( key ) {
	var state = $("#layers" + key + "Select").val();
	if ( state == "on" ) { displayConfigLayer( key ); }
	else { hideConfigLayer( key ); }
}

var createMapControlsLayers = createMapControls;
createMapControls = function() {
	createMapControlsLayers();

	var overviewMapControl = new ol.control.OverviewMap();
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
        		this.loadedExtentsRtree_.clear();


				return [ extent ];
			},
			url: function() {
				var url = layer.url;// + "?" + layer.params ? $.param( layer.params ) : "";

				var bbox = ol.proj.transformExtent( tlv.map.getView().calculateExtent(), "EPSG:3857", "EPSG:4326" );
				url = url.replace( encodeURIComponent( "<BBOX>" ), bbox.join( "," ) );


				return url;
	        }
		});

		var style = createDefaultStyle();
		layer.mapLayer = new ol.layer.Vector({
			declutter: true,
			source: source,
			style: function( feature ) {
				// text
				if ( layer.style && layer.style.text ) {
					var color = layer.style.text.color;
					if ( color ) {
						style.getText().getFill().setColor( color );
					}

					var text = layer.style.text.attribute;
					if ( text ) {
						style.getText().setText( feature.get( text ) );
					}
				}



				return [ style ];
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

function displaySearchOriginLayer() {
	if (!tlv.searchOriginLayer) {
		var point = new ol.geom.Point(tlv.location).transform("EPSG:4326", "EPSG:3857");
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
	var centerPixel = tlv.map.getPixelFromCoordinate(mapCenter);
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

function searchOriginLayerToggle() {
	var state = $("#layersSearchOriginSelect").val();
	if (state == "on") { displaySearchOriginLayer(); }
	else { hideSearchOriginLayer(); }
}

var setupTimeLapseLayers = setupTimeLapse;
setupTimeLapse = function() {
	setupTimeLapseLayers();

	tlv.crossHairLayer = null;
	var crossHairLayerSelect = $("#layersCrossHairSelect");
	if (tlv.crossHairLayerEnabled == "true" || crossHairLayerSelect.val() == "on") {
		crossHairLayerSelect.val("on");
		crossHairLayerToggle();
	}

	tlv.searchOriginLayer = null;
	var searchOriginLayerSelect = $("#layersSearchOriginSelect");
	if (tlv.searchOriginLayerEnabled == "true" || searchOriginLayerSelect.val() == "on") {
		searchOriginLayerSelect.val("on");
		searchOriginLayerToggle();
	}
}

var theMapHasMovedLayers = theMapHasMoved;
theMapHasMoved = function() {
	theMapHasMovedLayers();

	if ($("#layersCrossHairSelect").val() == "on") { refreshCrossHairLayer(); }
}
