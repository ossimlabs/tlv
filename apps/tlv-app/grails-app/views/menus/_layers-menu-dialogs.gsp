<div class = "modal" id = "detectionJobsDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog modal-lg">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Detection Jobs</h4></div>
			<div class = "modal-body">
				<div class = "form-group">
					<table class = "table table-striped"></table>
				</div>
			</div>
			<div class = "modal-footer">
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
<%--
					<label>Detections</label>
					<div class = "row">
						<div class = "col-md-6">
							<select class = "form-control" id = "layersDetectionsSelect" onchange = detectionsLayerToggle()>
								<option value = "off">OFF</option>
								<option value = "on">ON</option>
							</select>
						</div>
						<%--<div class = "col-md-4">
							<button class = "btn btn-primary form-control"  data-dismiss = "modal" onclick = $("#detectionAlgorithmsDialog").modal("show");>Find Detections</button>
						</div>--%>
						<div class = "col-md-6">
							<button class = "btn btn-primary form-control" data-dismiss = "modal" id = "detectionStatusButton">Detection Status</button>
						</div>
						<asset:script type = "text/javascript">
							$( "#detectionStatusButton" ).click( function() {
								$( "#detectionJobsDialog" ).modal( "show" );
								//$.ajax({
								//	dataType: "json",
								//	url: "https://omar-dev.ossim.io/omar-ml/job/query/3394"
								//})
								//.done( function( data ) {
									var table = $( "#detectionJobsDialog" ).find( "table" )[ 0 ];
									var row = table.insertRow( table.rows.length );
									$.each(
										[ "Confidence", "Filename", "Non-Max. Suppression", "Status" ],
										function( index, value ) {
										var cell = row.insertCell( row.cells.length );
										$( cell ).append( "<b>" + value + "</b>" );
									} );

								//	$.each( data, function( index, value ) {
										var value = {
											confidence: 70,
											imageFilename: "05JUL17WV011300017JUL05185933-P1BS_R2C1-057094680010_01_P001",
											nms: 35
										};

										var row = table.insertRow( table.rows.length );
										var cell = row.insertCell( row.cells.length );
										$( cell ).append( value.confidence );

										var cell = row.insertCell( row.cells.length );
										$( cell ).append( value.imageFilename );

										var cell = row.insertCell( row.cells.length );
										$( cell ).append( value.nms );

										var cell = row.insertCell( row.cells.length );
										var button = document.createElement("button");
										button.className = "btn btn-success";
										button.innerHTML = "View";
										button.onclick = function() {
											configLayerToggle("countries");
										}
										$( cell ).append( button );
										//$( cell ).append( "WAITING" );
								//	} );

								//} );
							} );
						</asset:script>
					</div>
--%>
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
