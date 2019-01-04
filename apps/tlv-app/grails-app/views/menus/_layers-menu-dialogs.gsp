<div class = "modal" id = "detectionAlgorithmsDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Detection Algorithms</h4></div>
			<div class = "modal-body">
				<div class = "form-group">
					<label>What would you like to detect?</label>
					<select class = "form-control" id = "detectionAlgorithmSelect">
						<g:each in = "${[ "airplanes", "cars", "yolo" ]}">
							<option value = "${ it }">${ it.capitalize() }</option>
						</g:each>
					</select>
				</div>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-primary" data-dismiss = "modal" onclick = "initiateDetectionAlgorithm( $('#detectionAlgorithmSelect"').val() )">Run</button>
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>

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
						<%
							def crossHairOption = tlvParams.preferences.tlvPreference.crossHairLayer
							if ( tlvParams.crossHairLayer ) {
								crossHairOption = tlvParams.crossHairLayer?.toBoolean()
							}
						%>
						<option ${ !crossHairOption ? "selected" : "" } value = "off">OFF</option>
						<option ${ crossHairOption ? "selected" : "" } value = "on">ON</option>
					</select>

					<%--<label>Detections</label>
					<div class = "row">
						<div class = "col-md-4">
							<select class = "form-control" id = "layersDetectionsSelect" onchange = detectionsLayerToggle()>
								<option value = "off">OFF</option>
								<option value = "on">ON</option>
							</select>
						</div>
						<div class = "col-md-4">
							<button class = "btn btn-primary form-control"  data-dismiss = "modal" onclick = $("#detectionAlgorithmsDialog").modal("show");>Find Detections</button>
						</div>
						<div class = "col-md-4">
							<button class = "btn btn-primary form-control">Detection Status</button>
						</div>
					</div>--%>

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
