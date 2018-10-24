var anAnnotationHasBeenAddedMap = anAnnotationHasBeenAdded;
anAnnotationHasBeenAdded = function(event) {
	anAnnotationHasBeenAddedMap(event);

	removeInteractions();

	tlv.currentAnnotation = event.feature;
	tlv.currentAnnotation.setStyle(createDefaultStyle());

	openAnnotationsDialog();
}

function applyAnnotationStyle() {
	var feature = tlv.currentAnnotation;

	feature.setProperties({
		confidence: $( "#confidenceSelect" ).val(),
		ontology: $( "#typeInput" ).data( "ontology" ),
		type: $( "#typeInput" ).val(),
		username: $( "#usernameInput" ).val()
	});

	var fillColorHex = $("#fillColorInput").val();
	var fillColor = hexToRgb(fillColorHex);
	var fillTransparency = $("#fillTransparencyInput").val();
	var fillRgba = "rgba(" + fillColor.r + "," + fillColor.g + "," + fillColor.b + "," + fillTransparency + ")";
	var fill = new ol.style.Fill({ color: fillRgba });

	var radius = $("#radiusInput").val();

	var strokeColorHex = $("#strokeColorInput").val();
	var strokeColor = hexToRgb(strokeColorHex);
	var strokeTransparency = $("#strokeTransparencyInput").val();
	var strokeRgba = "rgba(" + strokeColor.r + "," + strokeColor.g + "," + strokeColor.b + "," + strokeTransparency + ")";
	var strokeWidth = parseInt($("#strokeWidthInput").val(), 10);
	var stroke = new ol.style.Stroke({
		color: strokeRgba,
		width: strokeWidth
	});

	var style;
	switch (feature.getGeometry().getType()) {
		case "Point":
			var image = new ol.style.Circle({
					fill: fill,
					radius: parseInt(radius, 10),
					stroke: stroke
				});
			style = new ol.style.Style({ image: image });
			break;
		case "Circle":
			var center = ol.proj.transform(feature.getGeometry().getCenter(), "EPSG:3857", "EPSG:4326");
			var geometry = calculateCircleFromRadius(center, radius);
			feature.setGeometry(geometry);
		default:
			style = new ol.style.Style({
				fill: fill,
				stroke: stroke
			});
			break;
	}
	feature.setStyle(style);

	// refresh the layer for the new style to take effect
	tlv.layers[tlv.currentLayer].annotationsLayer.setVisible(false);
	tlv.layers[tlv.currentLayer].annotationsLayer.setVisible(true);


}

function calculateCircleFromRadius(center, radius) {
	var sphere = new ol.Sphere(6378137);

	var point = [center[0], center[1]];
	var distance = 0;
	while (distance < radius) {
		point[0] += 0.000001;
		distance = sphere.haversineDistance(center, point);
	}

	var projectedPoint1 = ol.proj.transform(center, "EPSG:4326", "EPSG:3857");
	var projectedPoint2 = ol.proj.transform(point, "EPSG:4326", "EPSG:3857");
	var newRadius = Math.abs(projectedPoint2[0] - projectedPoint1[0]);
	var geometry = new ol.geom.Circle(projectedPoint1, newRadius);


	return geometry;
}

var changeFrameAnnotations = changeFrame;
changeFrame = function(param) {
	var annotationsLayer = tlv.layers[tlv.currentLayer].annotationsLayer;
	if (annotationsLayer) { annotationsLayer.setVisible(false); }

	changeFrameAnnotations(param);

	var annotationsLayer = tlv.layers[tlv.currentLayer].annotationsLayer;
	if (annotationsLayer) { annotationsLayer.setVisible(true); }

	removeInteractions();
}

function createAnnotationsLayer() {
	var source = new ol.source.Vector();
	source.on("addfeature", anAnnotationHasBeenAdded);

	var layer = tlv.layers[tlv.currentLayer];
	layer.annotationsLayer = new ol.layer.Vector({ source: source });
	tlv.map.addLayer(layer.annotationsLayer);
}

function deleteFeature() {
	var feature = tlv.currentAnnotation;
	var source = tlv.layers[tlv.currentLayer].annotationsLayer.getSource();
	source.removeFeature(feature);
}

function drawCircle() {
	tlv.drawAnnotationInteraction = new ol.interaction.Draw({
        source: tlv.layers[tlv.currentLayer].annotationsLayer.getSource(),
		type: "Circle"
	});
}

function drawLineString() {
	tlv.drawAnnotationInteraction = new ol.interaction.Draw({
        source: tlv.layers[tlv.currentLayer].annotationsLayer.getSource(),
		type: "LineString"
	});
}

function drawPoint() {
	tlv.drawAnnotationInteraction = new ol.interaction.Draw({
        source: tlv.layers[tlv.currentLayer].annotationsLayer.getSource(),
		type: "Point"
	});
}

function drawPolygon() {
	tlv.drawAnnotationInteraction = new ol.interaction.Draw({
        source: tlv.layers[tlv.currentLayer].annotationsLayer.getSource(),
		type: "Polygon"
	});
}

function drawRectangle() {
	tlv.drawAnnotationInteraction = new ol.interaction.Draw({
		geometryFunction: function( coordinates, geometry ) {
			if ( !geometry ) { geometry = new ol.geom.Polygon( null ); }
			var start = coordinates[ 0 ];
			var end = coordinates[ 1 ];
			geometry.setCoordinates([[
				start,
				[ start[ 0 ], end[ 1 ] ],
				end,
				[ end[ 0 ], start[ 1 ] ],
				start
			]]);


			return geometry;
        },
		maxPoints: 2,
        source: tlv.layers[ tlv.currentLayer ].annotationsLayer.getSource(),
		type: "LineString"
	});
}

function drawSquare() {
	tlv.drawAnnotationInteraction = new ol.interaction.Draw({
		geometryFunction: ol.interaction.Draw.createRegularPolygon(4),
        source: tlv.layers[tlv.currentLayer].annotationsLayer.getSource(),
		type: "Circle"
	});
}

function drawAnnotationMap(type) {
	// create an annotations layer if one does not exist
	if (!tlv.layers[tlv.currentLayer].annotationsLayer) { createAnnotationsLayer(); }

	// create the right draw interaction
	switch (type) {
		case "circle": drawCircle(); break;
		case "line": drawLineString(); break;
		case "point": drawPoint(); break;
		case "polygon": drawPolygon(); break;
		case "rectangle": drawRectangle(); break;
		case "square": drawSquare(); break;
	}
	tlv.map.addInteraction(tlv.drawAnnotationInteraction);
}

function getCircleRadius(geometry) {
	var sphere = new ol.Sphere(6378137);
	var point1 = ol.proj.transform(geometry.getCenter(), "EPSG:3857", "EPSG:4326");
	var point2 = ol.proj.transform(geometry.getLastCoordinate(), "EPSG:3857", "EPSG:4326");
	var radius = sphere.haversineDistance(point1, point2);


	return radius;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);


	return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function modifyAnnotationsMap() {
	var layer = tlv.layers[tlv.currentLayer].annotationsLayer;
	if (layer) {
		var features = new ol.Collection(layer.getSource().getFeatures());
		if (features) {
			// allow vertices to be added and deleted
			tlv.modifyAnnotationsInteraction = new ol.interaction.Modify({
        		deleteCondition: function(event) {
          			return ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event);
        		},
				features: features
			});
    		tlv.map.addInteraction(tlv.modifyAnnotationsInteraction);

			// actually handle selecting the feature
			tlv.selectAnnotationInteraction = new ol.interaction.Select({ layers: [layer] });
			tlv.selectAnnotationInteraction.once(
				"select",
				function(event) {
					tlv.currentAnnotation = event.selected[ 0 ];
					openAnnotationsDialog();
					removeInteractions();
				}
			);
			tlv.map.addInteraction(tlv.selectAnnotationInteraction);
		}
		else { displayErrorDialog("There are no annotations here to modify. :()"); }
	}
}

function openAnnotationsDialog() {
	$("#annotationsDialog").modal("show");

	var feature = tlv.currentAnnotation;
	var style = feature.getStyle();

	var fillColor = ol.color.asArray(style.getFill().getColor());
	var radius;
	var radiusInput = $("#radiusInput");
	radiusInput.prop("disabled", false);
	radiusInput.prev().html("Radius");

	var stroke = style.getStroke();
	var strokeColor = ol.color.asArray(stroke.getColor());
  	var strokeWidth = stroke.getWidth();

	switch (feature.getGeometry().getType()) {
		case "Circle":
			radiusInput.prev().html("Radius (meters)");
			radius = getCircleRadius(feature.getGeometry());
			break;
		case "Point":
			var image = style.getImage();
			fillColor = ol.color.asArray(image.getFill().getColor());
			radius = image.getRadius();
			radiusInput.prev().html("Radius (pixels)");
			var stroke = style.getImage().getStroke();
			strokeColor = ol.color.asArray(stroke.getColor());
			strokeWidth = stroke.getWidth();
			break;
		default:
			radiusInput.prop("disabled", true);
			break;
	}

	var fillColorHex = rgbToHex(fillColor[0], fillColor[1], fillColor[2]);
	$("#fillColorInput").val(fillColorHex);
	$("#fillTransparencyInput").val(fillColor[3]);

	radiusInput.val(radius || 0);

	var strokeColorHex = rgbToHex(strokeColor[0], strokeColor[1], strokeColor[2]);
	$("#strokeColorInput").val(strokeColorHex);
	$("#strokeTransparencyInput").val(strokeColor[3]);
	$("#strokeWidthInput").val(strokeWidth);

	var properties = feature.getProperties();
	$( "#confidenceSelect option[value=" + properties.confidence + "]" ).prop( "selected", true );
	$( "#typeInput" ).val( properties.type );
	$( "#usernameInput" ).val( properties.username );
}

var pageLoadAnnotation = pageLoad
pageLoad = function() {
	pageLoadAnnotation();

	if ( tlv.annotation ) {
		var applyAnnotation = function( data ) {
			if ( tlv.layers && tlv.layers.length > 0 ) {
				var geometry = new ol.format.WKT().readGeometry( data.geometryOrtho ).transform( "EPSG:4326", "EPSG:3857" );
				var feature = new ol.Feature( geometry );
				feature.setProperties({
					confidence: data.confidence,
					type: data.type,
					username: data.username
				});

				createAnnotationsLayer();
				tlv.layers[ tlv.currentLayer ].annotationsLayer.getSource().addFeature( feature );
			}
			else {
				setTimeout( function() { applyAnnotation( data ); }, 1000 );
			}
		}

		$.ajax({
			url: tlv.contextPath + "/annotation/search?id=" + tlv.annotation
		})
		.done( function( data ) {
			applyAnnotation( data );
		});
	}
}

function removeInteractions() {
	$.each(
		[tlv.drawAnnotationInteraction, tlv.modifyAnnotationsInteraction, tlv.selectAnnotationInteraction],
		function(i, x) {
			// make sure there is an interaction to remove first
			if (x) {
				tlv.map.removeInteraction(x);
				x = null;
			}
		}
	);
}

function saveAnnotations() {
	var layer = tlv.layers[ tlv.currentLayer ];
	var features = layer.annotationsLayer.getSource().getFeatures();

	var values = [].concat.apply( [], features.map( function( feature ) {


		return [
			feature.getProperties().confidence,
			feature.getProperties().type,
			feature.getProperties().username
		];
	}));
	if ( values.indexOf( "" ) > -1 ) {
		displayErrorDialog( "One or more of your annotation properties are blank." );
		return;
	}

	if ( layer.annotationsLayer ) {
		var displayData = [];

		var geometryWriter = new ol.format.WKT();
		$( "#dragoMetadata" ).html( "" );
		$.each( features, function( index, feature ) {
			var geometry = feature.getGeometry().clone().transform( "EPSG:3857", "EPSG:4326" );

			var bbox = geometry.getExtent();
			var center = ol.extent.getCenter( bbox );
			var location = document.location;
			var urlParams = {
				bbox: bbox.join( "," ),
				filter: "filename LIKE '" + layer.metadata.filename + "'",
				location: center.join( "," )
			};
			var link = location.protocol + "//" + location.host + tlv.contextPath + "?" + $.param( urlParams )

			var properties = feature.getProperties();
			if ( properties.ontology && properties.ontology.prefLabel ) {
				properties.ontology.prefLabel = JSON.stringify( properties.ontology.prefLabel );
			}
			var data = {
				confidence: properties.confidence,
				filename: layer.metadata.filename,
				geometryOrtho: geometryWriter.writeGeometry( geometry ),
				imageId: layer.imageId,
				link: link,
				ontology: properties.ontology,
				type: properties.type,
				username: properties.username
			};


			var coordinates = geometry.getCoordinates()[ 0 ];
			groundToImagePoints( coordinates, layer, function( pixels, layer ) {
				geometry.setCoordinates([ pixels ]);
				data.geometryPixel = geometryWriter.writeGeometry( geometry );

				var callback = function( dted ) {
					var dtedCellPattern = /Opened cell:\s*([^\s]*)/;
					data.dted = dted.match( dtedCellPattern ) ? RegExp.$1 : "N/A";

					$.ajax({
						contentType: "application/json",
						data: JSON.stringify( data ),
						dataType: "json",
						type: "post",
						url: tlv.contextPath + "/annotation/saveAnnotation"
					})
					.always( function() {
						hideLoadingDialog();
					})
					.done( function( json ) {
						var pre = document.createElement( "pre" );
						$( pre ).css( "background", "none" );
						$( pre ).css( "color", "#c8c8c8" );
						$( pre ).html( JSON.stringify( data, null, 2 ) );
						$( "#dragoMetadata" ).prepend( pre );

						if ( json.response ) {
							displayData.push( data );
							$( "#dragoMetadata" ).prepend( "Saved  " + displayData.length + " of " + features.length + "..." );
						}
						else {
							$( "#dragoMetadata" ).prepend( "Not Saved ..." );
						}
						displayDialog( "dragoDialog" );
					})
					.fail( function() {});
				}

				var mapCenter = tlv.map.getView().getCenter();
				getDtedHeight( mapCenter[ 1 ], mapCenter[ 0 ], callback );
			});
		});

		$( "#dragoDialog" ).modal( "show" );
		tlv.map.once(
			"postcompose",
			function( event ) {
				var canvas = event.context.canvas;
				canvas.toBlob(function( blob ) {
					var urlCreator = window.URL || window.webkitURL;
					var imageUrl = urlCreator.createObjectURL( blob );
					$( "#dragoImage" ).attr( "src", imageUrl );
				});
			}
		);
		tlv.map.renderSync();

		displayLoadingDialog( "Saving..." );
	}
}
