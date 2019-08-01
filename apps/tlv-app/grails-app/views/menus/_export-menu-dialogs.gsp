<div class = "modal" id = "exportDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Export</h4></div>
			<div class = "modal-body">
				<g:each in = "${[
					[ label: "GIF", javascript: "exportGifCheck()" ],
					[ label: "Metadata", javascript: "exportMetadata()" ],
					[ label: "KML", javascript: "exportKml()" ],
					[ label: "Link", javascript: "exportLink()" ],
					[ label: "Powerpoint", javascript: "exportPptCheck()" ],
					[ label: "Screenshot", javascript: "exportScreenshot()" ],
					[ label: "WMS Get Capabilities", javascript: "exportWmsGetCapabilities()" ]
				]}">

					<label>${ it.label }</label>
					<button class = "btn btn-primary form-control" data-dismiss = "modal" onclick = ${ it.javascript }>
						Export ${ it.label }
					</button>
				</g:each>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>

<asset:script type = "text/javascript">
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

	function exportPptCheck() {
		// only load the files if needed
		if ( typeof PptxGenJS === "undefined" ) {
			$.ajax({
				dataType: "script",
				url: "${ assetPath( src: "ppt/ppt-bundle.js" ) }"
			})
			.done( function() {
				exportPowerpoint();
			});
		}
		else {
			exportPowerpoint();
		}
	}
</asset:script>


<div class = "modal" id = "exportLinkDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Export Link</h4></div>
			<div class = "modal-body">
				<div class = "row" >
					<div class = "col-md-12">
						<input class = "form-control" id = "exportLinkInput">
					</div>
				</div>
				<div class = "row template" id = "templateFooter"></div>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-primary" data-dismiss = "modal" onclick = downloadTemplate() >Download</button>
                <button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
            </div>
		</div>
	</div>
</div>
