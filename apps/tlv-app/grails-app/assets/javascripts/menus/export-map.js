function exportGifMap() {
	var encoder = new GIFEncoder();
	encoder.setDelay( 1000 );
	encoder.setRepeat( 0 );
	encoder.start();

	var encodeFrameMap = function() {
		displayLoadingDialog( "Getting the 411 on frame " + ( tlv.currentLayer + 1 ) + "..." );
		// give time for the loading modal to display
		setTimeout( function() {
			tlv.map.once( "postcompose", function( event ) {

				var context = event.context.canvas.getContext( "2d" );

				encoder.addFrame( context );

				if ( tlv.currentLayer == tlv.layers.length - 1 ) {
					hideLoadingDialog();

					encoder.finish();
					var filename = "tlv_gif_" + new Date().generateFilename() + ".gif";
					encoder.download( filename );
				}
				else {
console.dir(encoder);
					changeFrame( "fastForward" );
					encodeFrameMap();
				}
			});
			tlv.map.renderSync();
		}, 100);
	}
	changeFrame( 0 );
	encodeFrameMap();
}

function exportScreenshotMap() {
	tlv.map.once(
		"postcompose",
		function(event) {
			var canvas = event.context.canvas;
			canvas.toBlob(function(blob) {
				var filename = "tlv_screenshot_" + new Date().generateFilename() + ".png";
				clientFileDownload(filename, blob);
			});
		}
	);
	tlv.map.renderSync();
}
