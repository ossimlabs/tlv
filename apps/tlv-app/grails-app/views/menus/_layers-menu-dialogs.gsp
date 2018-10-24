<div class = "modal" id = "layersDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Layers</h4></div>
			<div class = "modal-body">
				<div class = "form-group">
					<label>Base Layer</label>
					<select class = "form-control" id = "baseLayersSelect" onchange = "changeBaseLayer( this.value )">
						<option value = "">None</option>
						<g:each in = "${ grailsApplication.config.baseLayers }">
							<option value = "${ it.key }">${ it.value.name }</option>
						</g:each>
					</select>

					<label>Cross-Hair</label>
					<select class = "form-control" id = "layersCrossHairSelect" onchange = crossHairLayerToggle()>
						<option value = "off">OFF</option>
						<option value = "on">ON</option>
					</select>

					<label>Search Origin</label>
					<select class = "form-control" id = "layersSearchOriginSelect" onchange = searchOriginLayerToggle()>
						<option value = "off">OFF</option>
						<option value = "on">ON</option>
					</select>

					<label>Overview</label>
					<select class = "form-control" id = "layersOverviewSelect" onchange = overviewLayerToggle()>
						<option value = "off">OFF</option>
						<option value = "on">ON</option>
					</select>

					<g:each in = "${ grailsApplication.config.layers }">
						<label>${ it.value.label }</label>
						<select class = "form-control" id = "layers${it.key}Select" onchange = configLayerToggle("${ it.key }")>
							<option value = "off">OFF</option>
							<option value = "on">ON</option>
						</select>
					</g:each>
				</div>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>

<asset:script type = "text/javascript">
	$( "#layersDialog" ).on( "hidden.bs.modal", function (event) { hideDialog( "layersDialog" ); } );
	$( "#layersDialog" ).on( "shown.bs.modal", function (event) { displayDialog( "layersDialog" ); } );
</asset:script>
