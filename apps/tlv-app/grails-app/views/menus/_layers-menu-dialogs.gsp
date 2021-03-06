<div class = "modal" id = "layersDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Layers</h4></div>
			<div class = "modal-body">
				<label>Base Layer</label>
				<select class = "form-control" id = "baseLayersSelect" onchange = "changeBaseLayer( this.value )">
					<option value = "">None</option>
					<g:each in = "${ grailsApplication.config.baseLayers }">
						<option value = "${ it.key }">${ it.value.name }</option>
					</g:each>
				</select>

				<label>Cross-Hair</label>
				<select class = "form-control" id = "layersCrossHairSelect" onchange = crossHairLayerToggle()>
					<%
						def crossHairOption = tlvParams.preferences.tlvPreference.crossHairLayer
						if ( tlvParams.crossHairLayer ) {
							crossHairOption = tlvParams.crossHairLayer?.toBoolean()
						}
					%>
					<option ${ !crossHairOption ? "selected" : "" } value = "off">OFF</option>
					<option ${ crossHairOption ? "selected" : "" } value = "on">ON</option>
				</select>

				<label>Mosaic</label>
				<select class = "form-control" id = "layersMosaicSelect" onchange = mosaicLayerToggle()>
					<option value = "off">OFF</option>
					<option value = "on">ON</option>
				</select>

				<label>Search Origin</label>
				<select class = "form-control" id = "layersSearchOriginSelect" onchange = searchOriginLayerToggle()>
					<%
						def searchOriginOption = tlvParams.preferences.tlvPreference.searchOriginLayer
						if ( tlvParams.searchOriginLayer ) {
							searchOriginOption = tlvParams.searchOriginLayer?.toBoolean()
						}
					%>
					<option ${ !searchOriginOption ? "selected" : "" } value = "off">OFF</option>
					<option ${ searchOriginOption ? "selected" : "" } value = "on">ON</option>
				</select>

				<label>Overview</label>
				<select class = "form-control" id = "layersOverviewSelect" onchange = overviewLayerToggle()>
					<option value = "off">OFF</option>
					<option value = "on">ON</option>
				</select>

				<g:each in = "${ grailsApplication.config.layers }">
					<label>${ it.value.label }</label>
					<div class = "input-group">
						<select class = "form-control" id = "layers${it.key}Select" onchange = configLayerToggle("${ it.key }")>
							<option value = "off">OFF</option>
							<option value = "on">ON</option>
						</select>
						<span class = "input-group-btn">
							<button class = "btn btn-primary" data-dismiss = "modal" onclick = 'javascript:openAnnotationsDialog( tlv.configLayers[ "${ it.key }" ].mapLayer )' title = "Adjust style" type = "button"><span class = "fa fa-sliders"></span></button>
						</span>
					</div>
				</g:each>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>
