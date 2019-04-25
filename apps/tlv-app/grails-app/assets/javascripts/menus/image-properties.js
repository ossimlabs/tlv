var changeFrameImageProperties = changeFrame;
changeFrame = function( params ) {
	changeFrameImageProperties( params );

	syncImageProperties();
}

function getDefaultImageProperties() {
	return {
		bands: tlv.preferences.bands || 'default',
		brightness: tlv.preferences.brightness || 0,
		contrast: tlv.preferences.contrast || 1,
		hist_center: false,
		histLinearNormClip: '0,100',
		hist_op: tlv.preferences.dynamicRangeAdjustment || 'auto-minmax',
		nullPixelFlip: tlv.preferences.nullPixelFlip || true,
		resampler_filter: tlv.preferences.interpolation || 'bilinear',
		sharpen_mode: tlv.preferences.sharpenMode || 'none'
	};
}

function openImagePropertiesDialog() {
	var rgb = $( 'body' ).css( 'background-color' );
	var colors = ol.color.asArray( rgb ).splice( 0, 3 );
	$( '#imagePropertiesDiv' ).css( 'background-color', 'rgba(' + colors.join( ',' ) + ', 0.5)' );
	$( '#imagePropertiesDiv' ).show();
}

var pageLoadImageProperties = pageLoad;
pageLoad = function() {
	pageLoadImageProperties();

	var brightnessSlider = $( '#brightnessSliderInput' );
	brightnessSlider.slider({
		max: 100,
		min: -100,
		tooltip: 'hide',
		value: 0
	});
	brightnessSlider.on( 'change', function( event ) {
		$( '#brightnessValueSpan' ).html( ( event.value.newValue / 100 ).toFixed( 2 ) );
	});
	brightnessSlider.on( 'slideStop', function( event ) { updateImageProperties( true ); });

	var contrastSlider = $( '#contrastSliderInput' );
	contrastSlider.slider({
		max: 2000,
		min: 1,
		tooltip: 'hide',
		value: 100
	});
	contrastSlider.on( 'change', function( event ) {
		$( '#contrastValueSpan' ).html( ( event.value.newValue / 100 ).toFixed( 2 ) );
	});
	contrastSlider.on( 'slideStop', function( event ) { updateImageProperties( true ); });

	var dynamicRangeSlider = $( '#dynamicRangeSliderInput' );
	dynamicRangeSlider.slider({
		max: 100,
		min: 0,
		tooltip: 'hide',
		value: [ 0,100 ]
	});
	dynamicRangeSlider.on( 'change', function( event ) {
		$( '#dynamicRangeValueSpan' ).html( event.value.newValue.join( ':' ) );
	});
	dynamicRangeSlider.on( 'slideStop', function( event ) {
		$( '#dynamicRangeSelect option[value="linear"]' ).prop( 'selected', true );
		updateImageProperties( true );
	});

	var opacitySlider = $( '#opacitySliderInput' );
	opacitySlider.slider({
		max: 100,
		min: 0,
		tooltip: 'hide',
		value: 100
	});
	opacitySlider.on( 'change', function( event ) {
		var opacity = event.value.newValue / 100;
		$( '#opacityValueSpan' ).html( ( opacity ).toFixed( 2 ) );
		tlv.layers[ tlv.currentLayer ].mapLayer.setOpacity( opacity );
		tlv.layers[ tlv.currentLayer ].imageSpaceMapLayer.setOpacity( opacity );
	});
	opacitySlider.on( 'slideStop', function( event ) { updateImageProperties( false ); });
}

function resetImageProperties() {
	var styles = JSON.stringify(
		getDefaultImageProperties()
	);
	tlv.layers[ tlv.currentLayer ].mapLayer.getSource().updateParams({
		STYLES: styles
	});
	tlv.layers[ tlv.currentLayer ].imageSpaceMapLayer.getSource().updateParams({
		STYLES: styles
	});
	syncImageProperties();
	updateImageProperties( true );
}

function selectBands( selectionMethod ) {
	if ( selectionMethod == 'manual' ) { $( '#manualBandSelectTable' ).show(); }
	else { $( '#manualBandSelectTable' ).hide(); }

	updateImageProperties( true );
}

var setupMapImageProperties = setupMap;
setupMap = function() {
	setupMapImageProperties();

	tlv.map.on( 'click', function() {
		$( '#imagePropertiesDiv' ).hide();
	});
}

var setupTimeLapseImageProperties = setupTimeLapse;
setupTimeLapse = function() {
	setupTimeLapseImageProperties();

	syncImageProperties( true );
}

function syncImageProperties() {
	var layer = tlv.layers[ tlv.currentLayer ];
	var styles = JSON.parse( layer.mapLayer.getSource().getParams().STYLES );


	$.each(
		[ 'red', 'green', 'blue' ],
		function( i, x ) {
			var select = $( '#' + x + 'GunSelect' );
			select.html( '' );
			for ( var bandNumber = 1; bandNumber <= layer.numberOfBands; bandNumber++ ) {
				select.append( '<option value = ' + bandNumber + ' >' + bandNumber + '</option>' );
			}
		}
	);
	if ( styles.bands == 'default' ) {
		$( '#selectBandsMethodSelect option[value="default"]' ).prop( 'selected', true );
		$( '#manualBandSelectTable' ).hide();
	}
	else {
		$( '#selectBandsMethodSelect option[value="manual"]' ).prop( 'selected', true );
		$( '#manualBandSelectTable' ).show();
		var bands = styles.bands.split( ',' );
		$.each(
			[ 'red', 'green', 'blue' ],
			function( i, x ) {
				$( '#' + x + 'GunSelect option[value=' + bands[ i ] + ']' ).prop( 'selected', true );
			}
		);
	}

	$.each(
		[ 'brightness', 'contrast' ],
		function( i, x ) {
			$( '#' + x + 'SliderInput' ).slider( 'setValue', styles[ x ] * 100 );
			$( '#' + x + 'ValueSpan' ).html( styles[ x ] );
		}
	);
	$( '#opacitySliderInput' ).slider( 'setValue', layer.opacity * 100 );
	$( '#opacityValueSpan' ).html( layer.opacity );

	$( '#dynamicRangeSelect option[value="' + styles.hist_op + '"]' ).prop( 'selected', true );

	$( '#dynamicRangeSliderInput' ).slider( "setValue", styles.histLinearNormClip.split( ',' ).map( function( value ) {
		return parseInt( value );
	} ) );
	$( '#dynamicRangeValueSpan' ).html( styles.histLinearNormClip.replace( ',', ':' ) );

	$( '#dynamicRangeRegionSelect option[value="' + styles['hist_center'] + '"]' ).prop( 'selected', true );
	$( '#interpolationSelect option[value="' + styles.resampler_filter + '"]' ).prop( 'selected', true );
	$( '#keepVisibleSelect option[value="' + layer.keepVisible + '"]' ).prop( 'selected', true );
	$( '#nullPixelFlipSelect option[value="' + styles.nullPixelFlip + '"]' ).prop( 'selected', true );
	$( '#sharpenModeSelect option[value="' + styles.sharpen_mode + '"]' ).prop( 'selected', true );
}

function updateImageProperties( refreshMap ) {
	var layer = tlv.layers[ tlv.currentLayer ];

	layer.keepVisible = ( $( '#keepVisibleSelect' ).val() == "true" );
	layer.opacity = $( '#opacitySliderInput' ).slider( 'getValue' ) / 100;

	if ( refreshMap ) {
		var bands = $( '#selectBandsMethodSelect' ).val();
 		if ( bands != 'default' ) {
			var red = $( '#redGunSelect' ).val();
			var green = $( '#greenGunSelect' ).val();
			var blue = $( '#blueGunSelect' ).val();
			bands = [ red, green, blue ].join( ',' );
		}

		var styles = JSON.stringify({
			bands: bands,
			brightness: $( '#brightnessSliderInput' ).slider( 'getValue' ) / 100,
			contrast: $( '#contrastSliderInput' ).slider( 'getValue' ) / 100,
			hist_center: $( '#dynamicRangeRegionSelect' ).val(),
			histLinearNormClip: $( '#dynamicRangeSliderInput' ).slider( 'getValue' ).map( function( value ) {
				return value / 100;
			} ).join( ',' ),
			hist_op: $( '#dynamicRangeSelect' ).val(),
			nullPixelFlip: $( '#nullPixelFlipSelect' ).val(),
			resampler_filter: $( '#interpolationSelect' ).val(),
			sharpen_mode: $( '#sharpenModeSelect' ).val()
		});

		layer.mapLayer.getSource().updateParams({ STYLES: styles });
		layer.imageSpaceMapLayer.getSource().updateParams({ STYLES: styles });
	}
}
