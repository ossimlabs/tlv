function changeTemplateText( element ) {
	$( element ).unbind();

	if ( $( element ).children().length > 0 ) {
		var input = $( element ).children()[ 0 ];
		var value = $( input ).val();
		$( element ).html( value );
	}
	else {
		var input = document.createElement( "input" );
		$( input ).addClass( "form-control" );
		$( input ).attr( "type", "text" );
		$( input ).css( "height", $( element ).height() );
		$( input ).css( "width", "100%" );
		$( input).val( $( element ).html() );
		$( element ).html( input );
		$( input ).focus();

		$( input ).blur( function() {
			changeTemplateText( element );
		});
	}
}

function clientFileDownload(filename, blob) {
	var link = document.createElement("a");
	if (link.download !== undefined) { // feature detection
		$(link).attr("href", window.URL.createObjectURL(blob));
		$(link).attr("download", filename);
		$("body").append(link);
		link.click();
	}
	else { displayErrorDialog("This browser doesn't support client-side downloading, :("); }
	link.remove();
}

function downloadTemplate() {
	var callback = function( mapCanvas ) {
		var canvas = document.createElement( "canvas" );
		var size = tlv.map.getSize();
		canvas.height = 1.13 * mapCanvas.height;
		canvas.width = mapCanvas.width;

		var context = canvas.getContext( "2d" );

		context.fillStyle = $( "body" ).css( "background-color" );
		context.fillRect( 0, 0, canvas.width, canvas.height );


		var headerHeight = parseInt( 0.1 * mapCanvas.height );
		var headerGradient = context.createLinearGradient( 0, 0, 0, headerHeight);
		headerGradient.addColorStop( 0, "#595454" );
		headerGradient.addColorStop( 1, "#000000" );
		context.fillStyle = headerGradient;
		context.fillRect( 0, 0, mapCanvas.width, headerHeight );


		var templateLogo = $( "#templateLogo" );
		var logoHeight = headerHeight;
		var logoWidth = headerHeight;


		var headerSecurityClassification = $( "#headerSecurityClassification" );
		var headerSecurityClassificationSize = parseFloat( headerSecurityClassification[ 0 ].style.height ) / 100 * headerHeight;
		var headerSecurityClassificationText = headerSecurityClassification.html();

		context.fillStyle = "#ADD8E6";
		context.font = headerSecurityClassificationSize + "px Arial";
		context.textAlign = "left";
		context.fillText( headerSecurityClassificationText, logoWidth, headerSecurityClassificationSize );


		var headerTitle = $( "#headerTitle" );
		var headerTitleSize = parseFloat( headerTitle[ 0 ].style.height ) / 100 * headerHeight;
		var headerTitleText = headerTitle.html();

		context.fillStyle = "yellow";
		context.font = headerTitleSize + "px Arial";
		context.textAlign = "left";
		context.fillText( headerTitleText, logoWidth, headerSecurityClassificationSize + headerTitleSize );


		var headerDescription = $( "#headerDescription" );
		var headerDescriptionSize = parseFloat( headerDescription[ 0 ].style.height ) / 100 * headerHeight;
		var headerDescriptionText = headerDescription.html();

		context.fillStyle = "white";
		context.font = headerDescriptionSize + "px Arial";
		context.textAlign = "left";
		context.fillText( headerDescriptionText, logoWidth, headerSecurityClassificationSize + headerTitleSize + headerDescriptionSize );


		context.drawImage( mapCanvas, 0, 0.1 * mapCanvas.height );


		var footerHeight = parseInt( 0.03 * mapCanvas.height );
		var footerWidth = mapCanvas.width;

		var footerGradientHeightMin = headerHeight + mapCanvas.height;
		var footerGradientHeightMax = footerGradientHeightMin + footerHeight;
		var footerGradient = context.createLinearGradient( 0, footerGradientHeightMin, 0, footerGradientHeightMax );
		footerGradient.addColorStop( 0, "#595454" );
		footerGradient.addColorStop( 1, "#000000" );
		context.fillStyle = footerGradient;
		context.fillRect( 0, headerHeight + mapCanvas.height, footerWidth, footerHeight );


		var footerSecurityClassification = $( "#footerSecurityClassification" );
		var footerSecurityClassificationSize = footerSecurityClassification.height();
		var footerSecurityClassificationText = footerSecurityClassification.html();

		context.fillStyle = "#ADD8E6";
		context.font = footerHeight + "px Arial";
		context.textAlign = "left";
		context.fillText( footerSecurityClassificationText, 0, headerHeight + mapCanvas.height + footerHeight );


		var footerLocation = $( "#footerLocation" );
		var footerLocationSize = footerLocation.height();
		var footerLocationText = footerLocation.html();

		context.fillStyle = "#ADD8E6";
		context.font = footerHeight + "px Arial";
		context.textAlign = "center";
		context.fillText( footerLocationText, mapCanvas.width / 2, headerHeight + mapCanvas.height + footerHeight );


		var footerAcquisitionDate = $( "#footerAcquisitionDate" );
		var footerAcquisitionDateSize = footerAcquisitionDate.height();
		var footerAcquisitionDateText = footerAcquisitionDate.html();

		context.fillStyle = "#ADD8E6";
		context.font = footerHeight + "px Arial";
		context.textAlign = "right";
		context.fillText( footerAcquisitionDateText, mapCanvas.width, headerHeight + mapCanvas.height + footerHeight );


		var logo = new Image();
		$( logo ).attr( "src", templateLogo.attr( "src" ) );
		$( logo ).load( function() {
			context.drawImage( logo, 0, 0, logoWidth, logoHeight );

			canvas.toBlob(function( blob ) {
				var filename = "tlv_template_" + new Date().generateFilename() + ".png";
				clientFileDownload( filename, blob );
			});
		});
	}

	if ( getCurrentDimension() == 2 ) { getScreenshotMap( callback ); }
	else { getScreenshotGlobe( callback ); }
}

function exportGif() {
	if ( getCurrentDimension() == 2 ) { exportGifMap(); }
	else { exportGifGlobe(); }
}

function exportKml() {
	var layer = tlv.layers[ tlv.currentLayer ];
	var url = tlv.libraries[ layer.library ].kmlUrl;
	url += "/" + layer.metadata.id;
	window.open( url );
}

function exportMetadata() {
	var csvData = [];

	// gather all the keys
	var keys = [];
	$.each( tlv.layers, function ( index, layer ) {
			$.each( layer.metadata, function( j, y ) {
				keys.push( j );
			});
		}
	);
	// sort and deal with commas
	keys = keys.unique().sort().map( function( element ) {
		return element.match(/,/g) ? '"' + element + '"' : element;
	});
	// csv headers
	csvData.push(keys.join(","));

	// gather the metadata
	$.each(
		tlv.layers,
		function(i, x) {
			var values = [];
			$.each(
				keys,
				function(j, y) {
					var value = x.metadata[y] || "";

					// maintain formatting for objects
					if (typeof value === "object") { value = JSON.stringify(value); }

					// handle commas
					values.push(value.toString().match(/,/g) ? '"' + value + '"' : value);
				}
			);
			csvData.push(values.join(","));
		}
	);

	// download
	var filename = "tlv_metadata_" + new Date().generateFilename() + ".csv";
	var buffer = csvData.join("\n");
	var blob = new Blob([buffer], { "type": "text/csv;charset=utf8;" });
	clientFileDownload(filename, blob);
}

function exportScreenshot() {
	if (getCurrentDimension() == 2) { exportScreenshotMap(); }
	else { exportScreenshotGlobe(); }
}

function exportTemplate( templateStyle ) {
	displayLoadingDialog( "Hunting for map data, hange on..." );

 	tlv.map.once(
		"postcompose",
		function( event ) {
			var canvas = event.context.canvas;
			canvas.toBlob(function( blob ) {
				$( "#templateImage" ).load( function() {
					hideLoadingDialog();

					var imageHeight = $( "#templateImage" ).height();
 					var imageWidth = $( "#templateImage" ).width();

					var template = tlv.templates[ templateStyle ];


					$( "#templateHeader" ).width( imageWidth );
					var header  = template.header;
					var headerHeight = parseFloat( header.height ) / 100 * imageHeight;
					$( "#templateHeader" ).css( "height", headerHeight );
					$( "#templateHeader" ).css( "background", "linear-gradient(#595454, #000000)" );


					var logoDiv = document.createElement( "div" );
					$( logoDiv ).addClass( "row" );
					$( logoDiv ).addClass( "template" );
					$( "#templateHeader" ).append( logoDiv );

					var templateLogo = document.createElement( "img" );
					$( templateLogo ).addClass( "template-logo" );
					$( templateLogo ).attr( "id", "templateLogo" );
					$( templateLogo ).attr( "src", "/assets/logos/" + header.logo + ".png");
					$( logoDiv ).append( templateLogo );


					var headerTextDiv = document.createElement( "div" );
					$( headerTextDiv ).addClass( "row" );
					$( headerTextDiv ).addClass( "template" );
					$( "#templateHeader" ).append( headerTextDiv );

					$.each( header.text, function( name, attributes ) {
						var div = document.createElement( "div" );
						$( div ).addClass( "row" );
						$( div ).addClass( "template-text" );
						$( div ).attr( "id", "header" + name );
						$( div ).click( function() {
							changeTemplateText( div );
						});

						var text = attributes.defaultValue;
						try { text = eval( attributes.defaultValue ); }
						catch ( exception ) { /* do nothing */ }
						$( div ).html( text );

						$.each( attributes.style, function( key, value ) {
							$( div ).css( key, value );
						});

						$( headerTextDiv ).append( div );
					});


					$( "#templateFooter" ).width( imageWidth );
					var footer = template.footer;
					var footerHeight = parseFloat( footer.height ) / 100 * imageHeight;
					var templateFooter = $( "#templateFooter" );
					templateFooter.css( "background", "linear-gradient(#595454, #000000)" );
					templateFooter.css( "height", footerHeight );


					var columns = 1;
					if ( 12 % Object.keys( footer.text ).length == 0 ) {
						columns = 12 / Object.keys( footer.text ).length;
					}
					$.each( footer.text, function( name, attributes ) {
						var div = document.createElement( "div" );
$( div ).addClass( "template-text" );
						$( div ).addClass( "col-md-" + columns );

						$( div ).attr( "id", "footer" + name );
						$( div ).click( function() {
							changeTemplateText( div );
						});

						var text = attributes.defaultValue;
						try { text = eval( attributes.defaultValue ); }
						catch ( exception ) { /* do nothing */ }
						$( div ).html( text );

						$.each( attributes.style, function( key, value ) {
							$( div ).css( key, value );
						});

						templateFooter.append( div );
					});
				});

				var urlCreator = window.URL || window.webkitURL;
				var imageUrl = urlCreator.createObjectURL( blob );
				$( "#templateImage" ).attr( "src", imageUrl );
				$( "#templateDialog" ).modal( "show" );
			});
		}
	);
	tlv.map.renderSync();
}
