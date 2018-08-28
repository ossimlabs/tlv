function changeTemplateText( element ) {
	$( element ).unbind();

	if ( $( element ).children().length > 0 ) {
		var input = $( element ).children()[ 0 ];
		var color = $( element ).children()[ 1 ];
		var value = $( input ).val();
		$( element ).css( "color", $( color ).val() );
		$( element ).html( value );
	}
	else {
		var textInput = document.createElement( "input" );
		$( textInput ).addClass( "form-control" );
		$( textInput ).attr( "type", "text" );
		$( textInput ).css( "display", "inline-block" );
		$( textInput ).css( "height", $( element ).height() );
		$( textInput ).css( "padding", 0 );
		$( textInput ).css( "vertical-align", "middle" );
		$( textInput ).css( "width", $( element ).width() - 2 * $( element ).height() );
		$( textInput).val( $( element ).html() );
		$( element ).html( textInput );
		$( textInput ).focus();

		var colorInput = document.createElement( "input" );
		$( colorInput ).addClass( "form-control" );
		$( colorInput ).addClass( "template-color-input" );
		$( colorInput ).attr( "type", "color" );
		$( colorInput ).attr( "value", $( element )[ 0 ].style.color );
		$( colorInput ).css( "height", $( element ).height() );
		$( colorInput ).css( "width", $( element ).height() );
		$( element ).append( colorInput );

		var button = document.createElement( "button" );
		$( button ).addClass( "btn" );
		$( button ).addClass( "btn-primary" );
		$( button ).addClass( "form-control" );
		$( button ).addClass( "template-text-edit-button" );
		$( button ).css( "height", $( element ).height() );
		$( button ).css( "width", $( element ).height() );
		var span = document.createElement( "span" );
		$( span ).addClass( "glyphicon glyphicon-ok" );
		$( button ).html( span );
		$( element ).append( button );

		$( button ).click( function() {
			changeTemplateText( element );

			setTimeout( function() {
				$( element ).click( function() {
					changeTemplateText( element );
				});
			}, 100 );
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

function downloadTemplate( templateStyle ) {
	templateStyle = "default";

	var callback = function( mapCanvas ) {
		var template = tlv.templates[ templateStyle ];

		var canvas = document.createElement( "canvas" );
		var size = tlv.map.getSize();
		canvas.height = ( parseFloat( template.header.height ) / 100 + parseFloat( template.footer.height ) /100 + 1 ) * mapCanvas.height;
		canvas.width = mapCanvas.width;

		var context = canvas.getContext( "2d" );

		context.fillStyle = $( "body" ).css( "background-color" );
		context.fillRect( 0, 0, canvas.width, canvas.height );


		var header = template.header;
		var headerHeight = parseFloat( header.height ) / 100 * mapCanvas.height;
		var headerWidth = canvas.width;
		var headerGradient = context.createLinearGradient( 0, 0, 0, headerHeight);
		headerGradient.addColorStop( 0, "#595454" );
		headerGradient.addColorStop( 1, "#000000" );
		context.fillStyle = headerGradient;
		context.fillRect( 0, 0, mapCanvas.width, headerHeight );


		// the logo goes next but must be loaded at the end


		var textY = 0;
		$.each( header.text, function( name, attributes ) {
			var div = $( "#header" + name );
			var text = div.html();
			var size = parseFloat( attributes.style.height ) / 100 * headerHeight;

			context.fillStyle = div.css( "color" );
			context.font = size + "px Arial";
			context.textAlign = div.css( "text-align" ) || "center";
			context.textBaseline = "bottom";

			textY += size;
			context.fillText( text, headerHeight, textY );
		});


		// the north arrow goes next but must be loaded at the end


		// map image
		context.drawImage( mapCanvas, 0, 0.1 * mapCanvas.height );


		// footer
		var footer = template.footer;
		var footerHeight = parseFloat( footer.height ) / 100 * mapCanvas.height;

		var footerGradientHeightMin = headerHeight + mapCanvas.height;
		var footerGradientHeightMax = footerGradientHeightMin + footerHeight;
		var footerGradient = context.createLinearGradient( 0, footerGradientHeightMin, 0, footerGradientHeightMax );
		footerGradient.addColorStop( 0, "#595454" );
		footerGradient.addColorStop( 1, "#000000" );
		context.fillStyle = footerGradient;
		context.fillRect( 0, headerHeight + mapCanvas.height, mapCanvas.width, footerHeight );


		var columnSize = mapCanvas.width / Object.keys( footer.text ).length;
		var textX = 0;
		$.each( footer.text, function( name, attributes ) {
			var div = $( "#footer" + name );
			var text = div.html();

			context.fillStyle = div.css( "color" );
			context.font = footerHeight + "px Arial";
			context.textAlign = div.css( "text-align" ) || "center";
			context.textBaseline = "bottom";

			var textXCursor = textX;
			switch ( context.textAlign ) {
				case "center":
					textXCursor += columnSize / 2;
					break;
				case "right":
					textXCursor += columnSize;
					break;
			}

			context.fillText( text, textXCursor, headerHeight + mapCanvas.height + footerHeight );
			textX += mapCanvas.width / Object.keys( footer.text ).length;
		});


		var templateLogo = $( "#templateLogo" );
		var logo = new Image();
		$( logo ).attr( "src", templateLogo.attr( "src" ) );
		$( logo ).load( function() {
			var paddingSize = parseFloat( templateLogo.css( "padding" ) ) / 100 * headerHeight;
			var logoHeight = headerHeight -  2 * paddingSize;
			var logoWidth = headerHeight - 2 * paddingSize;
			context.drawImage( logo, paddingSize, paddingSize, logoWidth, logoHeight );

			var templateNorthArrow = $( "#templateNorthArrow" );
			var northArrow = new Image();
			$( northArrow ).attr( "src", templateNorthArrow.attr( "src" ) );
			$( northArrow ).load( function() {
				var paddingSize = parseFloat( templateNorthArrow.css( "padding" ) ) / 100 * headerHeight;
				var northArrowSize = headerHeight -  2 * paddingSize;

				var translateX = headerWidth - paddingSize - northArrowSize / 2;
				var translateY = paddingSize + northArrowSize / 2;
				context.translate( translateX, translateY );
				context.rotate( tlv.map.getView().getRotation() );
				context.drawImage( northArrow, -northArrowSize / 2, -northArrowSize / 2, northArrowSize, northArrowSize );

				canvas.toBlob(function( blob ) {
					var filename = "tlv_template_" + new Date().generateFilename() + ".png";
					clientFileDownload( filename, blob );
				});
			});
		});
	}

	if ( getCurrentDimension() == 2 ) {
		getScreenshotMap( callback );
	}
	else {
		getScreenshotGlobe( callback );
	}
}

function exportGif() {
	if ( getCurrentDimension() == 2 ) {
		exportGifMap();
	}
	else {
		exportGifGlobe();
	}
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

	var callback = function( canvas ) {
		canvas.toBlob(function( blob ) {
			$( "#templateImage" ).load( function() {
				hideLoadingDialog();

				var imageHeight = $( "#templateImage" ).height();
 				var imageWidth = $( "#templateImage" ).width();

				var template = tlv.templates[ templateStyle ];

				// header
				$( "#templateHeader" ).html( " " );
				$( "#templateHeader" ).width( imageWidth );
				var header  = template.header;
				var headerHeight = parseFloat( header.height ) / 100 * imageHeight;
				$( "#templateHeader" ).css( "height", headerHeight );
				$( "#templateHeader" ).css( "background", "linear-gradient(#595454, #000000)" );

				// logo
				var logoDiv = document.createElement( "div" );
				$( logoDiv ).addClass( "row" );
				$( logoDiv ).addClass( "template" );
				$( "#templateHeader" ).append( logoDiv );

				var templateLogo = document.createElement( "img" );
				$( templateLogo ).addClass( "template-logo" );
				$( templateLogo ).attr( "id", "templateLogo" );
				$( templateLogo ).attr( "src", "/assets/logos/" + header.logo );
				$( logoDiv ).append( templateLogo );

				// header text
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
					$( div ).css( "font-size", $( div ).height() - 1 );
				});

				// north arrow
				var northArrowContainer = document.createElement( "div" );
				$( northArrowContainer ).addClass( "row" );
				$( northArrowContainer ).addClass( "template" );
				$( northArrowContainer ).css( "text-align", "right" );
				var width = $( "#templateHeader" ).width() - $( "#templateHeader" ).height() - $( headerTextDiv ).width();
				$( northArrowContainer ).css( "width", width );
				$( "#templateHeader" ).append( northArrowContainer );

				var northArrowDiv = document.createElement( "div" );
				$( northArrowDiv ).addClass( "template" );
				$( northArrowDiv ).css( "width", $( northArrowContainer ).height() );
				$( northArrowContainer ).append( northArrowDiv );

				var templateNorthArrow = document.createElement( "img" );
				$( templateNorthArrow ).addClass( "template-logo" );
				$( templateNorthArrow ).attr( "id", "templateNorthArrow" );
				$( templateNorthArrow ).attr( "src", "/assets/logos/" + header.northArrow );
				var rotation = tlv.map.getView().getRotation() * 180 / Math.PI;
				$( templateNorthArrow ).css( "transform", "rotate(" + rotation + "deg)" );
				$( northArrowDiv ).append( templateNorthArrow );

				// footer
				$( "#templateFooter" ).html( "" );
				$( "#templateFooter" ).width( imageWidth );
				var footer = template.footer;
				var footerHeight = parseFloat( footer.height ) / 100 * imageHeight;
				var templateFooter = $( "#templateFooter" );
				templateFooter.css( "background", "linear-gradient(#595454, #000000)" );
				templateFooter.css( "height", footerHeight );

				// footer text
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
					$( div ).css( "font-size", $( div ).height() - 1 );
				});
			});

			var urlCreator = window.URL || window.webkitURL;
			var imageUrl = urlCreator.createObjectURL( blob );
			$( "#templateImage" ).attr( "src", imageUrl );
			$( "#templateDialog" ).modal( "show" );
		});
	}

	if ( getCurrentDimension() == 2 ) {
		getScreenshotMap( callback );
	}
	else {
		getScreenshotGlobe( callback );
	}
}
