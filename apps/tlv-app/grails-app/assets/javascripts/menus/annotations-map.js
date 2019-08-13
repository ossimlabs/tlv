var anAnnotationHasBeenAddedMap = anAnnotationHasBeenAdded;
anAnnotationHasBeenAdded = function( event ) {
	anAnnotationHasBeenAddedMap( event );

	removeInteractions();

	var feature = event.feature;
	feature.setStyle( createDefaultStyle() );
	tlv.currentAnnotation = feature;

	openAnnotationStylesDialog();
}

function annotationsLayerToggle() {
	var layer = tlv.layers[ tlv.currentLayer ].annotationsLayer;
	if ( layer ) {
		layer.setVisible( !layer.getVisible() );
	}
}

function applyAnnotationStyle() {
	var circleStyle = getPolygonStyle( 'circle' );
	var lineStyle = getLineStyle();
	var pointStyle = getPointStyle();
	var polygonStyle = getPolygonStyle( 'polygon' );

	if ( tlv.currentAnnotation ) {
		var feature = tlv.currentAnnotation;
		switch ( feature.getGeometry().getType() ) {
			case 'Circle':
				feature.setStyle( circleStyle );
				var center = feature.getGeometry().getCenter();
				var radius = getRadiusStyle( 'circle' );
				var geometry = calculateCircleFromRadius( center, radius );
				feature.setGeometry( geometry );
				break;
			case 'LineString':
				feature.setStyle( lineStyle );
				break;
			case 'MultiPolygon':
			case 'Polygon':
				feature.setStyle( polygonStyle );
				break;
			case 'Point':
				feature.setStyle( pointStyle );
				break;
		}

		tlv.layers[ tlv.currentLayer ].annotationsLayer.setVisible( false );
		tlv.layers[ tlv.currentLayer ].annotationsLayer.setVisible( true );
	}
	else if ( tlv.currentAnnotationLayer ) {
		var propertyKey = $( '#text' ).find( '#textTextSelect' ).val();
		tlv.currentAnnotationLayer.setStyle( function( feature ) {
			var style;
			switch ( feature.getGeometry().getType() ) {
				case 'Circle':
					style = circleStyle;
					break;
				case 'LineString':
					style = lineStyle;
					break;
				case 'MultiPolygon':
				case 'Polygon':
					style = polygonStyle;
					break;
				case 'Point':
					style = pointStyle;
					break;
			}

			var label = feature.getProperties()[ propertyKey ];
			if ( label ) {
				if ( typeof label == "object" ) { label = 'JS Object'; }
				style.getText().setText( '' + label );
			}
			else {
				style.getText().setText( 'N/A' );
			}


			return style;
		} );

		tlv.currentAnnotationLayer.setVisible( false );
		tlv.currentAnnotationLayer.setVisible( true );
	}

	tlv.currentAnnotation = null;
	tlv.currentAnnotationLayer = null;
}

function calculateCircleFromRadius(center, radius) {
	var sphere = new ol.Sphere(6378137);

	var point = [center[0], center[1]];
	var distance = 0;
	while (distance < radius) {
		point[0] += 0.000001;
		distance = sphere.haversineDistance(center, point);
	}

	var projectedPoint1 = center;
	var projectedPoint2 = point;
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

function createAnnotationsLayer( layer ) {
	if ( !layer.annotationsLayer ) {
		var source = new ol.source.Vector();
		source.on( "addfeature", anAnnotationHasBeenAdded );

		layer.annotationsLayer = new ol.layer.Vector({
			source: source
		});
		tlv.map.addLayer( layer.annotationsLayer );
	}
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

function drawAnnotationMap( type ) {
	var layer = tlv.layers[ tlv.currentLayer ];
	createAnnotationsLayer( layer );

	// in case any are still active by chance
	removeInteractions();

	// create the right draw interaction
	switch (type) {
		case "circle": drawCircle(); break;
		case "line": drawLineString(); break;
		case "point": drawPoint(); break;
		case "polygon": drawPolygon(); break;
		case "rectangle": drawRectangle(); break;
		case "square": drawSquare(); break;
	}
	tlv.map.addInteraction( tlv.drawAnnotationInteraction );

	$( document ).on( 'keydown', escapeDrawing );
}

function escapeDrawing( event ) {
	if ( event.keyCode == 27 ) { // escape key
		$( document ).unbind( 'keydown', escapeDrawing );
		removeInteractions();
	}
}

function getCircleRadius(geometry) {
	var sphere = new ol.Sphere(6378137);
	var point1 = geometry.getCenter();
	var point2 = geometry.getLastCoordinate();
	var radius = sphere.haversineDistance(point1, point2);


	return radius;
}

function getFillStyle( styleType ) {
	var styleInput = $( '#' + styleType );
	var color = styleInput.find( '#fillColorInput' ).val();
	var rgb = hexToRgb( color );
	var opacity = $( styleInput.find( 'input[name="fillOpacitySliderInput"]' ) ).slider( 'getValue' ) / 100;


	return new ol.style.Fill({
		color: 'rgba(' + [ rgb.r, rgb.g, rgb.b ].join( ',' ) + ',' + opacity + ')'
	});
}

function getLineStyle() {
	return new ol.style.Style({
		stroke: getStrokeStyle( 'line' ),
		text: getTextStyle()
	});
}

function getPointStyle() {
	return new ol.style.Style({
		image: new ol.style.Circle({
			fill: getFillStyle( 'point' ),
			radius: getRadiusStyle( 'point' ),
			stroke: getStrokeStyle( 'point' )
		}),
		text: getTextStyle()
	});
}

function getPolygonStyle( styleType ) {
	return new ol.style.Style({
		fill: getFillStyle( styleType ),
		stroke: getStrokeStyle( styleType ),
		text: getTextStyle()
	});
}

function getRadiusStyle( styleType ) {
	return parseInt( $( '#' + styleType ).find( '#radiusInput' ).val(), 10 );
}

function getStrokeStyle( styleType ) {
	var styleInput = $( '#' + styleType );
	var color = styleInput.find( '#strokeColorInput' ).val();
	var rgb = hexToRgb( color );
	var opacity = $( styleInput.find( 'input[name="strokeOpacitySliderInput"]' ) ).slider( 'getValue' ) / 100;

	var dashLength = styleInput.find( '#strokeLineDashLengthInput' ).val();
	var dashSpacing = styleInput.find( '#strokeLineDashLengthSpacingInput' ).val();


	return new ol.style.Stroke({
		color: 'rgba(' + [ rgb.r, rgb.g, rgb.b ].join( ',' ) + ',' + opacity + ')',
		lineCap: styleInput.find( '#strokeLineCapSelect' ).val(),
		lineDash: [ dashLength, dashSpacing ],
		lineDashOffset: styleInput.find( '#strokeLineDashOffsetInput' ).val(),
		lineJoin: styleInput.find( '#strokeLineJoinSelect' ).val(),
		miterLimit: styleInput.find( '#strokeMiterLimitInput' ).val(),
		width: styleInput.find( '#strokeWidthInput' ).val()
	});
}

function getTextStyle() {
	var styleInput = $( '#text' );
	var color = styleInput.find( "h3:contains('Text')" ).parent().find( '#fillColorInput' ).val();
	var rgb = hexToRgb( color );

	var opacity = $( styleInput.find( "h3:contains('Text')" ).parent().find( 'input[name="fillOpacitySliderInput"]' ) ).slider( 'getValue' ) / 100;


	var textStyle = new ol.style.Text({
		fill: new ol.style.Fill({
			color: 'rgba(' + [ rgb.r, rgb.g, rgb.b ].join( ',' ) + ',' + opacity + ')'
		}),
		offsetX: styleInput.find( '#textOffsetXInput' ).val(),
		offsetY: styleInput.find( '#textOffsetYInput' ).val(),
		overflow: true,
	    scale: styleInput.find( '#textScaleInput' ).val(),
	    rotateWithView: styleInput.find( '#textRotateWithViewSelect' ).val() == 'true',
	    rotation: styleInput.find( '#textRotationInput' ).val(),
		textAlign: styleInput.find( '#textTextAlignSelect' ).val()
	});

	if ( tlv.currentAnnotation ) {
		textStyle.setText( styleInput.find( '#textTextInput' ).val() );
	}


	return textStyle;
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
		if ( features ) {
			// allow vertices to be added and deleted
			tlv.modifyAnnotationInteraction = new ol.interaction.Modify({
        		deleteCondition: function(event) {
          			return ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event);
        		},
				features: features
			});
    		tlv.map.addInteraction(tlv.modifyAnnotationInteraction);

			// actually handle selecting the feature
			tlv.selectClickAnnotationInteraction = new ol.interaction.Select({
				layers: [ layer ]
			});
			tlv.selectClickAnnotationInteraction.on( 'select', function( event ) {
				tlv.currentAnnotation = event.selected[ 0 ];
				var style = tlv.currentAnnotation.getProperties().style;
				tlv.currentAnnotation.setStyle( style );
				tlv.currentAnnotation.setProperties({ style: null });
				openAnnotationStylesDialog();
				removeInteractions();
			} );
			tlv.map.addInteraction( tlv.selectClickAnnotationInteraction );

			tlv.selectHoverAnnotationInteraction = new ol.interaction.Select({
				condition: ol.events.condition.pointerMove,
				layers: [ layer ]
			});
			tlv.selectHoverAnnotationInteraction.on( 'select', function( event ) {
					$.each( event.deselected, function( index, feature ) {
						var style = feature.getProperties().style;
						feature.setStyle( style );
						feature.setProperties({ style: null });
					} );

					var defaultStyle = new ol.layer.Vector().getStyleFunction();
					$.each( event.selected, function( index, feature ) {
						var style = feature.getStyle();
						feature.setProperties({ style: style });
						feature.setStyle( defaultStyle );
					} );
			} );
			tlv.map.addInteraction( tlv.selectHoverAnnotationInteraction );
		}
		else { displayErrorDialog("There are no annotations here to modify. :()"); }
	}
}

function openAnnotationStylesDialog( vectorLayer ) {
	var styleTabs = $( '#annotationStylesDialog' ).find( '.nav-tabs' );
	$.each( styleTabs.children(), function( index, node ) {
		$( node ).removeClass( 'active' );
		var link = $( node ).children();
		if ( link.html() != 'Text' ) {
			$( node ).addClass( 'disabled' );
			link.attr( 'data-toggle', '' );
		}
	} );

	var stylePanes = $( '#annotationStylesDialog' ).find( '.tab-content' );
	$.each( stylePanes.children(), function( index, node ) {
		$( node ).removeClass( 'active' );
	} );

	var features = [];
	if ( vectorLayer ) {
		tlv.currentAnnotationLayer = vectorLayer;
		var geometryTypes = [];
		$.each( vectorLayer.getSource().getFeatures(), function( index, feature ) {
			// get one feature of each geometry type
			var geometryType = feature.getGeometry().getType();
			if ( geometryTypes.indexOf( geometryType ) < 0 ) {
				geometryTypes.push( geometryType );
				features.push( feature );
			}
		} );
	}
	else if ( tlv.currentAnnotation ) {
		features.push( tlv.currentAnnotation );
	}

	$.each( features, function( index, feature ) {
		var type = feature.getGeometry().getType();
		var style;
 		if ( tlv.currentAnnotationLayer ) {
			var styleFunction = tlv.currentAnnotationLayer.getStyleFunction()
			style = styleFunction( feature );
		}
		else {
			style = feature.getStyle();
		}

		switch ( type ) {
			case 'Circle':
				var radius = getCircleRadius( feature.getGeometry() );
				setRadiusStyle( 'circle', radius );
				setPolygonStyle( 'circle', style );
				if ( index == features.length - 1 ) {
					var styleTabLink = styleTabs.find( 'a:contains("Circle")' );
					styleTabLink.parent().addClass( 'active' );
					styleTabLink.parent().removeClass( 'disabled' );
					styleTabLink.attr( 'data-toggle', 'tab' );
					stylePanes.find( 'div#circle' ).addClass( 'active' );
				}
				break;
			case 'LineString':
				setLineStyle( style );
				if ( index == features.length - 1 ) {
					var styleTabLink = styleTabs.find( 'a:contains("Line")' );
					styleTabLink.parent().addClass( 'active' );
					styleTabLink.parent().removeClass( 'disabled' );
					styleTabLink.attr( 'data-toggle', 'tab' );
					stylePanes.find( 'div#line' ).addClass( 'active' );
				}
				break;
			case 'Point':
				setPointStyle( style );
				if ( index == features.length - 1 ) {
					var styleTabLink = styleTabs.find( 'a:contains("Point")' );
					styleTabLink.parent().addClass( 'active' );
					styleTabLink.parent().removeClass( 'disabled' );
					styleTabLink.attr( 'data-toggle', 'tab' );
					stylePanes.find( 'div#point' ).addClass( 'active' );
				}
				break;
			case 'MultiPolygon':
			case 'Polygon':
				setPolygonStyle( 'polygon', style );
				if ( index == features.length - 1 ) {
					var styleTabLink = styleTabs.find( 'a:contains("Polygon")' );
					styleTabLink.parent().addClass( 'active' );
					styleTabLink.parent().removeClass( 'disabled' );
					styleTabLink.attr( 'data-toggle', 'tab' );
					stylePanes.find( 'div#polygon' ).addClass( 'active' );
				}
				break;
		}
	} );

	displayDialog( 'annotationStylesDialog' );
}

var pageLoadAnnotationsMap = pageLoad;
pageLoad = function() {
	pageLoadAnnotationsMap();

	$.each( $( '[name="fillOpacitySliderInput"]' ), function( index, element ) {
		$( element ).slider();
		$( element ).on( 'change', function( event ) {
			$( element ).prev().prev().html( event.value.newValue + '%' );
		});
	} );
	$.each( $( '[name="strokeOpacitySliderInput"]' ), function( index, element ) {
		$( element ).slider();
		$( element ).on( 'change', function( event ) {
			$( element ).prev().prev().html( event.value.newValue + '%' );
		});
	} );
}


function removeInteractions() {
	$.each([ 'draw', 'modify', 'selectClick', 'selectHover' ], function( index, value ) {
		var interaction = tlv[ value + 'AnnotationInteraction' ];
		// make sure there is an interaction to remove first
		if ( interaction ) {
			tlv.map.removeInteraction( interaction );
			interaction = null;
		}
	} );
}

function setFillStyle( styleType, fill ) {
	var styleInput = $( '#' + styleType );

	var color = ol.color.asArray( fill.getColor() );
	var hex = rgbToHex( color[ 0 ], color[ 1 ], color[ 2 ] );
	styleInput.find( '#fillColorInput' ).val( hex );

	var opacity = color[ 3 ] * 100;
	var opacitySlider = $( styleInput.find( 'input[name="fillOpacitySliderInput"]' ) );
	opacitySlider.slider( 'setValue', opacity );
	opacitySlider.prev().prev().html( opacity + '%' );
}

function setLineStyle( style ) {
	setStrokeStyle( 'line', style.getStroke() );
	setTextStyle( style.getText() );
}

function setPointStyle( style ) {
	setFillStyle( 'point', style.getImage().getFill() );
	setRadiusStyle( 'point', style.getImage().getRadius() );
	setStrokeStyle( 'point', style.getImage().getStroke() );
	setTextStyle( style.getText() );
}

function setPolygonStyle( styleType, style ) {
	setFillStyle( styleType, style.getFill() );
	setStrokeStyle( styleType, style.getStroke() );
	setTextStyle( style.getText() );
}

function setRadiusStyle( styleType, radius ) {
	$( '#' + styleType ).find( '#radiusInput' ).val( radius );
}

function setStrokeStyle( styleType, stroke ) {
	var styleInput = $( '#' + styleType );

	var color = ol.color.asArray( stroke.getColor() );
	var hex = rgbToHex( color[ 0 ], color[ 1 ], color[ 2 ] );
	styleInput.find( '#strokeColorInput' ).val( hex );

	var opacity = color[ 3 ] * 100;
	var opacitySlider = $( styleInput.find( 'input[name="strokeOpacitySliderInput"]' ) );
	opacitySlider.slider( 'setValue', opacity );
	opacitySlider.prev().prev().html( opacity + '%' );

	var lineCap = stroke.getLineCap();
	styleInput.find( "#strokeLineCapSelect option[value='" + lineCap + "']" ).prop( 'selected', true );

	var lineDash = stroke.getLineDash();
	styleInput.find( '#strokeLineDashLengthInput' ).val( lineDash[ 0 ] );
	styleInput.find( '#strokeLineDashLengthSpacingInput' ).val( lineDash[ 1 ] );

	var lineDashOffset = stroke.getLineDashOffset();
	styleInput.find( '#strokeLineDashOffsetInput' ).val( lineDashOffset );

	var lineJoin = stroke.getLineJoin();
	styleInput.find( "#strokeLineJoinSelect option[value='" + lineJoin + "']" ).prop( 'selected', true );

	var miterLimit = stroke.getMiterLimit();
	styleInput.find( '#strokeMiterLimitInput' ).val( miterLimit );

	var width = stroke.getWidth();
	styleInput.find( '#strokeWidthInput' ).val( width );
}

function setTextStyle( text ) {
	var styleInput = $( '#text' );

	var color = ol.color.asArray( text.getFill().getColor() );
	var hex = rgbToHex( color[ 0 ], color[ 1 ], color[ 2 ] );
	styleInput.find( "h3:contains('Text')" ).parent().find( '#fillColorInput' ).val( hex );

	var opacity = color[ 3 ] * 100;
	var opacitySlider = $( styleInput.find( "h3:contains('Text')" ).parent().find( 'input[name="fillOpacitySliderInput"]' ) );
	opacitySlider.slider( 'setValue', opacity );
	opacitySlider.prev().prev().html( opacity + '%' );

	var offsetX = text.getOffsetX();
	styleInput.find( '#textOffsetXInput' ).val( offsetX );

	var offsetY = text.getOffsetY();
	styleInput.find( '#textOffsetYInput' ).val( offsetY );

	var scale = text.getScale();
	styleInput.find( '#textScaleInput' ).val( scale );

	var rotateWithView = text.getRotateWithView();
	styleInput.find( "#textRotateWithViewSelect option[value='" + rotateWithView + "']" ).prop( 'selected', true );

	var rotation = text.getRotation();
 	styleInput.find( '#textRotationInput' ).val( rotation );

	var textInput = styleInput.find( '#textTextInput' );
	textInput.val( '' );
	var textSelect = styleInput.find( '#textTextSelect' );
	textSelect.html( '' );
	if ( tlv.currentAnnotation ) {
		textInput.val( text.getText() );

		textInput.prop( 'disabled', false );
		textSelect.prop( 'disabled', true );
	}
	else if ( tlv.currentAnnotationLayer ) {
		var propertyKey;
		var propertyKeys = [];
		$.each( tlv.currentAnnotationLayer.getSource().getFeatures(), function( index, feature ) {

			var properties = feature.getProperties();
			propertyKeys = propertyKeys.concat( Object.keys( properties ) );
			propertyKeys = propertyKeys.unique();

			// find out which key equals the text value
			if ( !propertyKey && Object.values( properties ).indexOf( text.getText() ) > -1 ) {
				$.each( properties, function( key, value ) {
					if ( properties[ key ] == text.getText() ) {
						propertyKey = key;


						return false;
					}
				} );
			}
		} );

		$.each( propertyKeys, function( index, value ) {
			var selected = value == propertyKey ? 'selected' : '';
			textSelect.append( '<option ' + selected + ' value = "' + value + '">' + value + '</option>' );
		} );

		textInput.prop( 'disabled', true );
		textSelect.prop( 'disabled', false );
	}

	var textAlign = text.getTextAlign();
	styleInput.find( "#textTextAlignSelect option[value='" + textAlign + "']" ).prop( 'selected', true );
}
