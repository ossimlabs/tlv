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

function exportGif() {
	if ( getCurrentDimension() == 2 ) {
		exportGifMap();
	}
	else {
		exportGifGlobe();
	}
}

function exportKml() {
	var kmlData = [];
	var kmlsDownloaded = 0;
	var kmz = new JSZip();

	$.each( tlv.layers, function( index, layer ) {
		$.ajax({
			dataType: 'text',
			url: tlv.libraries[ layer.library ].kmlUrl + '/' + layer.metadata.id
		})
		.done( function( data ) {
			kmlsDownloaded++;
			var filename = 'images/' + layer.imageId + '.kml';
			kmlData.push({
				filename: filename,
				xml: data
			});

			if ( kmlsDownloaded == tlv.layers.length ) {
				var docXml = '<?xml version="1.0" encoding="UTF-8"?>' +
					'<kml xmlns="http://www.opengis.net/kml/2.2">' +
						'<Document>' +
							'<NetworkLink><Link><href>' +
								kmlData.map( function( kml ) {
									return kml.filename;
								} ).join( '</href></Link></NetworkLink><NetworkLink><Link><href>' ) +
				         	'</href></Link></NetworkLink>' +
						'</Document>' +
					'</kml>';
				kmz.file( 'doc.kml', docXml );

				$.each( kmlData, function( index, kml ) {
					kmz.file( kml.filename, kml.xml );
				} );

				kmz.generateAsync({ type: 'blob' })
				.then( function ( blob ) {
					var filename = 'tlv_kmz_' + new Date().generateFilename() + '.kmz';
					clientFileDownload( filename, blob );
				} );
			}
		} );
	} );
}

function exportLink() {
	var location = document.location;
	var url = location.protocol + "//" + location.host + ( tlv.contextPath || "" );

	var ids = tlv.layers.map( function( layer ) {


		return layer.metadata.id;
	});
	var params = {
		bbox: tlv.map.getView().calculateExtent().join( "," ),
		filter: "in(" + ids.join( ") OR in(" ) + ")",
		location: tlv.map.getView().getCenter().reverse().join( "," )
	};

	$( '#exportLinkInput' ).val( url + "?" + $.param( params ) );
	$( '#exportLinkDialog' ).modal( 'show' );
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

function exportPowerpoint() {
	var callback = function( canvas ) {
		var template = tlv.templates.default;

		var pptx = new PptxGenJS();
		var slide = pptx.addNewSlide();

		var slideSize = {
			height: { in: 5.625, px: 405 },
			width: { in: 10, px: 720 }
		};

		var footerHeight = slideSize.height.in * parseFloat( template.footer.height ) / 100;
		var headerHeight = slideSize.height.in * parseFloat( template.header.height ) / 100;
		var padding = 0.02; // percent

		slide.addShape( pptx.shapes.RECTANGLE, {
			fill: '595454',
			h: headerHeight,
			w: slideSize.width.in,
			x: 0,
			y: 0
		} );

		slide.addImage({
			path: tlv.contextPath + "/assets/logos/" + template.header.logo,
			h: headerHeight - 2 * headerHeight * padding,
			w: headerHeight - 2 * headerHeight * padding,
			x: headerHeight * padding,
			y: headerHeight * padding
		});

		var textY = 0;
		$.each( template.header.text, function( name, attributes ) {
			var text = attributes.defaultValue;
			try { text = eval( attributes.defaultValue ); }
			catch ( exception ) { /* do nothing */ }

			var textHeight = parseFloat( attributes.style.height ) / 100 * headerHeight;
			slide.addText( text, $.extend( attributes.style, {
				fontSize: textHeight / slideSize.height.in * slideSize.height.px - 2 * textHeight / slideSize.height.in * slideSize.height.px * padding,
				h: parseFloat( attributes.style.height ) / 100 * headerHeight,
				valign: 'middle',
				w: slideSize.width.in - headerHeight * 2,
				x: headerHeight,
				y: textY
			} ) );
			textY += textHeight;
		} );

		var northArrow = new Image();
		northArrow.src = tlv.contextPath + '/assets/logos/' + template.header.northArrow;
		northArrow.onload = function() {
			var canvas = document.createElement( 'canvas' );
			var context = canvas.getContext( '2d' );

			var size = headerHeight / slideSize.height.in * slideSize.height.px * ( 1 - padding );
			canvas.height = size;
			canvas.width = size;
			context.translate( size / 2, size / 2 );
			context.rotate( tlv.map.getView().getRotation() );
			context.drawImage( northArrow, -size / 2, -size / 2, size, size );

			slide.addImage({
				data: canvas.toDataURL(),
				h: headerHeight - 2 * headerHeight * padding,
				w: headerHeight - 2 * headerHeight * padding,
				x: slideSize.width.in - headerHeight + headerHeight * padding,
				y: headerHeight * padding
			});

			pptx.save( 'tlv_pptx_' + new Date().generateFilename() + '.pptx');
		};

		var imageSizeRatio = tlv.map.getSize()[ 0 ] / tlv.map.getSize()[ 1 ];
		var slideSizeRatio = slideSize.width.px / slideSize.height.px;
		var imageHeight, imageWidth;
		if ( imageSizeRatio <= slideSizeRatio ) {
			imageHeight = slideSize.height.in - headerHeight - footerHeight;
			imageWidth = slideSize.height.px / tlv.map.getSize()[ 1 ] * tlv.map.getSize()[ 0 ] / slideSize.width.px * slideSize.width.in ;
		}
		else {
			imageHeight = slideSize.width.px / tlv.map.getSize()[ 0 ] * tlv.map.getSize()[ 1 ] / slideSize.height.px * slideSize.height.in ;
			imageWidth = slideSize.width.in;
		}

		slide.addImage({
			data: canvas.toDataURL(),
			h: imageHeight,
			w: imageWidth,
			x: imageSizeRatio <= slideSizeRatio ? ( slideSize.width.in - imageWidth ) / 2 : 0,
			y: imageSizeRatio <= slideSizeRatio ? headerHeight : headerHeight + ( slideSize.height.in - headerHeight - footerHeight - imageHeight ) / 2
		});

		slide.addShape( pptx.shapes.RECTANGLE, {
			fill: '595454',
			h: footerHeight,
			w: slideSize.width.in,
			x: 0,
			y: slideSize.height.in - footerHeight
		} );

		var columnCount = 0;
		var columnSize = slideSize.width.in / Object.keys( template.footer.text ).length;
		$.each( template.footer.text, function( name, attributes ) {
			var text = attributes.defaultValue;
			try { text = eval( attributes.defaultValue ); }
			catch ( exception ) { /* do nothing */ }

			slide.addText( text, $.extend( attributes.style, {
				fontSize: footerHeight / slideSize.height.in * slideSize.height.px - 2 * footerHeight / slideSize.height.in * slideSize.height.px * padding,
				h: footerHeight - 2 * footerHeight * padding,
				valign: 'middle',
				w: columnSize - 2 * columnSize * padding,
				x: columnSize * columnCount + columnSize * padding,
				y: slideSize.height.in - footerHeight + footerHeight * padding
			} ) );
			columnCount++;
		} );
	};

	if ( getCurrentDimension() == 2 ) {
		getScreenshotMap( callback );
	}
	else {
		getScreenshotGlobe( callback );
	}
}

function exportScreenshot() {
	if (getCurrentDimension() == 2) { exportScreenshotMap(); }
	else { exportScreenshotGlobe(); }
}

function exportWmsGetCapabilities() {
	var layer = tlv.layers[ tlv.currentLayer ];
	var url = tlv.libraries[ layer.library ].wfsUrl;
 	var params = {
		filter: 'in(' + layer.metadata.id + ')',
		outputFormat: 'WMS130',
		request: 'GetFeature',
		service: 'WFS',
		typeName: 'omar:raster_entry',
		version: '1.1.0'
	};

	$( '#exportLinkInput' ).val( url + '?' + $.param( params ) );
	$( '#exportLinkDialog' ).modal( 'show' );
}
