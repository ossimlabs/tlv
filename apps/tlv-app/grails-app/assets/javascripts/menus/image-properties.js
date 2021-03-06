var changeFrameImageProperties = changeFrame;
var changeFrame = function( params ) {
	changeFrameImageProperties( params );

	syncImageProperties();
}

function getDefaultImageProperties() {
	return {
		bands: tlv.preferences.bands || 'default',
		brightness: tlv.preferences.brightness || 0,
		contrast: tlv.preferences.contrast || 0,
		histCenterTile: false,
		histLinearNormClip: '0,1',
		histOp: tlv.preferences.dynamicRangeAdjustment || 'auto-minmax',
		nullPixelFlip: tlv.preferences.nullPixelFlip || true,
		resampler_filter: tlv.preferences.interpolation || 'bilinear',
		sharpen_percent: tlv.preferences.sharpenPercent || 0,
		gamma: 1,
		histCenterClip: .5
	};
}

var DRA_min_delta = 5;
var set_ratio = .5;

function getContrastVal(value) {
	if (value < 0) {
		return ((100 + value) / 100);
	} else {
		return (1 + value / 30);
	}
}

function getGammaVal(value) {
	if (value < 0) {
		return ((100 + value) / 100);
	} else {
		return (1 + value * (3 / 100)).toFixed(3);
	}
}

var pageLoadImageProperties = pageLoad;
var pageLoad = function() {
	pageLoadImageProperties();

	var brightnessSlider = $( '#brightnessSliderInput' );
	brightnessSlider.slider({
		max: 100,
		min: -100,
		tooltip: 'hide',
		value: 0
	});
	brightnessSlider.on( 'change', function( event ) {
		$( '#brightnessValueSpan' ).html( ( event.value.newValue ) );
	});
	brightnessSlider.on( 'slideStop', function( event ) { updateImageProperties( true ); });

	var contrastSlider = $( '#contrastSliderInput' );
	contrastSlider.slider({
		max: 100,
		min: -100,
		tooltip: 'hide',
		value: 0
	});

	contrastSlider.on( 'change', function( event ) {
		$( '#contrastValueSpan' ).html( ( event.value.newValue ) );
	});
	contrastSlider.on( 'slideStop', function( event ) { updateImageProperties( true ); });

	var gammaSlider = $( '#gammaSliderInput' );
	gammaSlider.slider({
		max: 100,
		min: -100,
		tooltip: 'hide',
		value: 1
	});

	gammaSlider.on( 'change', function( event ) {
		$( '#gammaValueSpan' ).html( ( event.value.newValue ) );
	});
	gammaSlider.on( 'slideStop', function( event ) { updateImageProperties( true ); });

	var DRA_Midpoint_slider = $('#DRA_Midpoint');
	DRA_Midpoint_slider.slider({
		max: 100,
		min: 0,
		tooltip: 'hide',
		value: 50
	});

	DRA_Midpoint_slider.on( 'slideStop', function( event ) {
		updateImageProperties( true );
	});

	var dynamicRangeSlider = $( '#dynamicRangeSliderInput' );
	dynamicRangeSlider.slider({
		range: true,
		max: 100,
		min: 0,
		tooltip: 'hide',
		value: [ 0,100 ]
	});

	DRA_Midpoint_slider.on( 'change', function( event ) {
		var midpoint = DRA_Midpoint_slider.slider("getValue");
		var min = dynamicRangeSlider.slider("getValue")[0];
		var max = dynamicRangeSlider.slider("getValue")[1];

		// Prevent max slider from passing midpoint
		if (max - midpoint < DRA_min_delta) {
			DRA_Midpoint_slider.slider("setValue", max - DRA_min_delta);
		}

		// Prevent min slider from passing midpoint
		if (midpoint - min < DRA_min_delta) {
			DRA_Midpoint_slider.slider("setValue", min + DRA_min_delta);
		}

		midpoint = DRA_Midpoint_slider.slider("getValue");

		set_ratio = getRatio(midpoint, min, max);

		$( '#dynamicRangeValueSpan' ).html( min + ":" + max + '<br>Mid: ' + set_ratio.toFixed( 2 ) );
	});

	function getRatio(mid, min, max) {
		return (mid - min) / (max - min);
	}

	var valid_min;
	var valid_max;
	var valid_delta = 50;

	dynamicRangeSlider.on( 'change', function( event ) {
		var midpoint = DRA_Midpoint_slider.slider("getValue");
		var min = dynamicRangeSlider.slider("getValue")[0];
		var max = dynamicRangeSlider.slider("getValue")[1];
		var test_delta = (max - min) * set_ratio;
		// Prevent max slider from passing midpoint
		if ((max - midpoint < DRA_min_delta || midpoint - min < DRA_min_delta) && test_delta <= valid_delta) {
			dynamicRangeSlider.slider("setValue", [valid_min, valid_max]);
		} else {
			valid_min = min;
			valid_max = max;
			valid_delta = (max - min) * set_ratio;
		}

		event.value.newValue[0] = valid_min;
		event.value.newValue[1] = valid_max;

		min = dynamicRangeSlider.slider("getValue")[0];
		max = dynamicRangeSlider.slider("getValue")[1];

		var delta = (max - min) * set_ratio;

		DRA_Midpoint_slider.slider("setValue", min + delta);

		$( '#dynamicRangeValueSpan' ).html( event.value.newValue.join( ':' ) + '<br>Mid: ' + set_ratio.toFixed( 2 ) );
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

	var sharpenSlider = $( '#sharpenSliderInput' );
	sharpenSlider.slider({
		max: 100,
		min: 0,
		tooltip: 'hide',
		value: 0
	});
	sharpenSlider.on( 'change', function( event ) {
		$( '#sharpenValueSpan' ).html( ( event.value.newValue / 100 ).toFixed( 1 ) );
	});
	sharpenSlider.on( 'slideStop', function( event ) { updateImageProperties( true ); });
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
var setupMap = function() {
	setupMapImageProperties();

	tlv.map.on( 'click', function() {
		$( '#imagePropertiesDiv' ).hide();
	});
}

var setupTimeLapseImageProperties = setupTimeLapse;
var setupTimeLapse = function() {
	setupTimeLapseImageProperties();

	syncImageProperties();
}

function syncImageProperties() {
	var layer = tlv.layers[ tlv.currentLayer ];

	var format = layer.mapLayer.getSource().getParams().FORMAT;
	$( '#formatSelect option[value="' + format + '"]' ).prop( 'selected', true );


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

	$( '#contrastSliderInput' ).slider( 'setValue', 0 );
	$( '#contrastValueSpan' ).html( 0 );

	$( '#gammaSliderInput' ).slider( 'setValue', 0 );
	$( '#gammaValueSpan' ).html( 0 );

	$.each(
		[ 'brightness' ],
		function( i, x ) {
			$( '#' + x + 'SliderInput' ).slider( 'setValue', styles[ x ] * 100 );
			$( '#' + x + 'ValueSpan' ).html( styles[ x ] );
		}
	);
	$( '#opacitySliderInput' ).slider( 'setValue', layer.opacity * 100 );
	$( '#opacityValueSpan' ).html( layer.opacity.toFixed(2) );

	$( '#dynamicRangeSelect option[value="' + styles.histOp + '"]' ).prop( 'selected', true );
	$('#DRA_Midpoint').slider("setValue", 50);
	set_ratio = .5;
	$( '#dynamicRangeSliderInput' ).slider( "setValue", styles.histLinearNormClip.split( ',' ).map( function( value ) {
		return parseInt( value * 100);
	} ) );
	$( '#dynamicRangeValueSpan' ).html( '0:100' + '<br>Mid: ' + set_ratio.toFixed( 2 ) );

	$( '#dynamicRangeRegionSelect option[value="' + styles['histCenterTile'] + '"]' ).prop( 'selected', true );
	$( '#interpolationSelect option[value="' + styles.resampler_filter + '"]' ).prop( 'selected', true );
	$( '#keepVisibleSelect option[value="' + layer.keepVisible + '"]' ).prop( 'selected', true );
	$( '#nullPixelFlipSelect option[value="' + styles.nullPixelFlip + '"]' ).prop( 'selected', true );

	$( '#sharpenSliderInput' ).slider( 'setValue', styles.sharpen_percent * 100 );
	$( '#sharpenValueSpan' ).html( styles.sharpen_percent.toFixed(1) );
}

function updateImageProperties( refreshMap ) {
	var layer = tlv.layers[ tlv.currentLayer ];

	layer.mapLayer.getSource().updateParams({ FORMAT: $( '#formatSelect' ).val() });
	layer.imageSpaceMapLayer.getSource().updateParams({ FORMAT: $( '#formatSelect' ).val() });

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
			contrast: getContrastVal($( '#contrastSliderInput' ).slider( 'getValue' )),
			histCenterTile: $( '#dynamicRangeRegionSelect' ).val(),
			histLinearNormClip: $( '#dynamicRangeSliderInput' ).slider( 'getValue' ).map( function( value ) {
				return value / 100;
			} ).join( ',' ),
			histOp: $( '#dynamicRangeSelect' ).val(),
			nullPixelFlip: $( '#nullPixelFlipSelect' ).val(),
			resampler_filter: $( '#interpolationSelect' ).val(),
			sharpen_percent: $( '#sharpenSliderInput' ).slider( 'getValue' ) / 100,
			gamma: getGammaVal(-$( '#gammaSliderInput' ).slider( 'getValue')),
			histCenterClip: set_ratio
		});

		layer.mapLayer.getSource().updateParams({ STYLES: styles });
		layer.imageSpaceMapLayer.getSource().updateParams({ STYLES: styles });
	}
}
