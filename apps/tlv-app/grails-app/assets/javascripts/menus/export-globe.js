function exportGifGlobe() {
	var encoder = new GIFEncoder();
	encoder.setDelay( 1000 );
	encoder.setRepeat( 0 );
	encoder.start();

	var encodeFrameGlobe = function( event ) {
		displayLoadingDialog( "Getting the 411 on frame " + ( tlv.currentLayer + 1 ) + "..." );

		if ( event == 0 ) {
			tlv.globe.getCesiumScene().canvas.toBlob( function( blob ) {
				var urlCreator = window.URL || window.webkitURL;

				var image = new Image();
				var imageUrl = urlCreator.createObjectURL( blob );
				image.onload = function() {

					var height = image.height;
					var width = image.width;

					var canvas = document.createElement( "canvas" );
					canvas.height = height;
					canvas.width = width;

					var context = canvas.getContext( "2d" );
					context.drawImage( image, 0, 0 );

					encoder.addFrame( context );
					if ( tlv.currentLayer == tlv.layers.length - 1 ) {
						hideLoadingDialog();

						tlv.globe.getCesiumScene().globe.tileLoadProgressEvent.removeEventListener( encodeFrameGlobe );

						encoder.finish();
						var filename = "tlv_gif_" + new Date().generateFilename() + ".gif";
						encoder.download( filename );
					}
					else {
						changeFrame( "fastForward" );
					}
				}
				image.src = imageUrl;
			});
		}
	}

	changeFrame( 0 );

	tlv.globe.getCesiumScene().globe.tileLoadProgressEvent.addEventListener( encodeFrameGlobe );
	if ( tlv.layers[ tlv.currentLayer ].layerLoaded ) {
		encodeRameGlobe( 0 );
	}
}

function exportScreenshotGlobe() {
	var canvas = tlv.globe.getCesiumScene().canvas;
	canvas.toBlob(function(blob) {
		var filename = "tlv_screenshot_" + new Date().generateFilename() + ".png";
		clientFileDownload(filename, blob);
	});
}
