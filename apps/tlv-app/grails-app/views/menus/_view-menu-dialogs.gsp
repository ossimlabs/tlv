<div class = "modal" id = "viewDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>View</h4></div>
			<div class = "modal-body">
				<label>Dimensions</label>
				<select class = "form-control" id = "dimensionsSelect" onchange = "hideDialog( 'viewDialog' ); dimensionToggle();">
					<%
						def dimensionsOption = tlvParams.preferences.tlvPreference.dimensions.toString()
						if ( tlvParams.dimensions ) {
							dimensionsOption = tlvParams.dimensions
						}
					%>
					<option ${ dimensionsOption == "2" ? "selected" : "" } value = 2>2D</option>
					<option ${ dimensionsOption == "3" ? "selected" : "" } value = 3>3D</option>
				</select>

				<label>Full Resolution</label>
				<button class = "btn btn-primary form-control" data-dismiss = "modal" onclick = zoomToFullResolution()>
					Adjust Zoom
				</button>

				<%--<label>Geometries</label>
				<button class = "btn btn-primary form-control" onclick = "openGeometries(); hideDialog( 'viewDialog' );">
					Open
				</button>--%>

				<label>Maximum Extent</label>
				<button class = "btn btn-primary form-control" data-dismiss = "modal" onclick = zoomToMaximumExtent()>
					Adjust Zoom
				</button>

				<label>Swipe</label>
				<select class = "form-control" id = "swipeSelect" onchange = "swipeToggle(); hideDialog( 'viewDialog' );">
					<%
						def swipeOption = tlvParams.preferences.tlvPreference.swipe
						if ( tlvParams.swipe ) {
							swipeOption = tlvParams.swipe?.toBoolean()
						}
					%>
					<option ${ !swipeOption ? "selected" : "" } value = "off">OFF</option>
					<option ${ swipeOption ? "selected" : "" } value = "on">ON</option>
				</select>

				<label>Terrain Wireframe</label>
				<select class = "form-control" id = "terrainWireframeSelect" onchange = "terrainWireframeToggle(); hideDialog( 'viewDialog' );">
					<%
						def terrainWireframeOption = tlvParams.preferences.tlvPreference.terrainWireframe
						if ( tlvParams.terrainWireframe ) {
							terrainWireframeOption = tlvParams.terrainWireframe?.toBoolean()
						}
					%>
					<option ${ !terrainWireframeOption ? "selected" : "" } value = "off">OFF</option>
					<option ${ terrainWireframeOption ? "selected" : "" } value = "on">ON</option>
				</select>

				<label>View Space</label>
				<select class = "form-control" id = "viewSpaceSelect" onchange = "viewSpaceToggle(); hideDialog( 'viewDialog' );">
					<%
						def viewSpaceOption = tlvParams.preferences.tlvPreference.viewSpace
						if ( tlvParams.viewSpace ) {
							viewSpaceOption = tlvParams.viewSpace
						}
					%>
					<option ${ viewSpaceOption == "imageSpace" ? "selected" : "" } value = "imageSpace">Image Space</option>
					<option ${ viewSpaceOption == "ortho" ? "selected" : "" } value = "ortho">Orthorectified</option>
				</select>

				<label>WMS Tiles</label>
				<select class = "form-control" id = "wmsTilesSelect" onchange = "changeWmsLayerType(); hideDialog( 'viewDialog' );">
					<%
						def wmsTilesOption = tlvParams.preferences.tlvPreference.wmsTileSchema
						if ( tlvParams.wmsTileSchema ) {
							wmsTilesOption = tlvParams.wmsTileSchema
						}
					%>
					<option ${ wmsTilesOption == "multiple" ? "selected" : "" } value = "tileLayer">Multiple Tiles</option>
					<option ${ wmsTilesOption == "single" ? "selected" : "" } value = "imageLayer">Single Tile</option>
				</select>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>

<asset:script type = "text/javascript">
	function loadCesiumJavascript() {
		return $.ajax({
			dataType: "script",
			url: "${ assetPath( src: "webjars/cesium/1.43.0/Build/Cesium/Cesium.js" ) }"
		});
	}
</asset:script>
