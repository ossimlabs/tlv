<li class = "dropdown navbar-button">
	<a href = "javascript:void(0)" class = "dropdown-toggle" data-toggle = "dropdown" role = "button" title = "Export">
		<span class = "glyphicon glyphicon-export"></span>
		<span class="caret"></span>
	</a>
	<ul class = "dropdown-menu">
		<li><a href = javascript:void(0) onclick = exportGifCheck()>GIF</a></li>
		<li><a href = javascript:void(0) onclick = exportMetadata()>Metadata</a></li>
		<li><a href = javascript:void(0) onclick = exportKml()>KML</a></li>
		<li><a href = javascript:void(0) onclick = exportLink()>Link</a></li>
		<li><a href = javascript:void(0) onclick = exportScreenshot()>Screenshot</a></li>
		<li><a href = javascript:void(0) onclick = "javascript:exportTemplate( 'default' )">Template</a></li>
	</ul>
</li>

<asset:script>
	function exportGifCheck() {
		// only load the files if needed
		if ( typeof GIFEncoder === "undefined" ) {
			$.ajax({
				dataType: "script",
				url: "${ assetPath( src: "gif/gif-bundle.js" ) }"
			})
			.done( function() {
				exportGif();
			});
		}
		else {
			exportGif();
		}
	}
</asset:script>
