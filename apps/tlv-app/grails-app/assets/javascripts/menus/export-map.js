function exportGifMap() {
	var encoder = new GIFEncoder();
	encoder.setDelay( 1000 );
	encoder.setRepeat( 0 );
	encoder.start();

	var encodeFrameMap = function() {
		displayLoadingDialog( "Getting the 411 on frame " + ( tlv.currentLayer + 1 ) + "..." );
		// give time for the loading modal to display
		setTimeout( function() {
			var callback = function( canvas ) {
				encoder.addFrame( canvas.getContext( "2d" ) );

				if ( tlv.currentLayer == tlv.layers.length - 1 ) {
					hideLoadingDialog();

					encoder.finish();
					var filename = "tlv_gif_" + new Date().generateFilename() + ".gif";
					encoder.download( filename );
				}
				else {
					changeFrame( "fastForward" );
					encodeFrameMap();
				}
			};
			getScreenshotMap( callback );
		}, 100);
	}
	changeFrame( 0 );
	encodeFrameMap();
}

function exportScreenshotMap() {
	var callback = function( canvas ) {
		canvas.toBlob(function( blob ) {
			var filename = "tlv_screenshot_" + new Date().generateFilename() + ".png";
			clientFileDownload( filename, blob );
		});
	};

	getScreenshotMap( callback );
}

function getScreenshotMap( callback ) {
	tlv.map.once(
		"postcompose",
		function( event ) {
			var canvas = event.context.canvas;
			callback( canvas );
		}
	);
	tlv.map.renderSync();
}
