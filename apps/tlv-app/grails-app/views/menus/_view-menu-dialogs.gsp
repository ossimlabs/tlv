<div class = "modal" id = "viewDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>View</h4></div>
			<div class = "modal-body">
				<div class = "form-group">
					<label>Dimensions:</label>
					<select class = "form-control" id = "dimensionsSelect" onchange = "dimensionToggle(); $('#viewDialog').modal('hide');">
						<option value = 2>2D</option>
						<option value = 3>3D</option>
					</select>

					<label>Image Space:</label>
					<button class = "btn btn-primary form-control" onclick = "openImageSpace(); $('#viewDialog').modal('hide');">
						Open
					</button>

					<label>Swipe</label>
					<select class = "form-control" id = "swipeSelect" onchange = "swipeToggle(); $('#viewDialog').modal('hide');">
						<option value = "off">OFF</option>
						<option value = "on">ON</option>
					</select>

					<label>Terrain Wireframe</label>
					<select class = "form-control" id = "terrainWireframeSelect" onchange = "terrainWireframeToggle(); $('#viewDialog').modal('hide');">
						<option value = "off">OFF</option>
						<option value = "on">ON</option>
					</select>

					<label>WMS Tiles</label>
					<select class = "form-control" id = "wmsTilesSelect" onchange = "changeWmsLayerType(); $( '#viewDialog' ).modal( 'hide' );">
						<option value = "tileLayer">Multiple Tiles</option>
						<option value = "imageLayer">Single Tile</option>
					</select>
				</div>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>

<g:javascript>
	$( "#viewDialog" ).on( "hidden.bs.modal", function (event) { hideDialog( "viewDialog" ); } );
	$( "#viewDialog" ).on( "shown.bs.modal", function (event) { displayDialog( "viewDialog" ); } );
</g:javascript>
