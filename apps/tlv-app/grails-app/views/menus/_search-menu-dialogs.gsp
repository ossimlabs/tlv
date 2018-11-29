<div class = "modal" id = "searchDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Search Parameters</h4></div>
			<div class = "modal-body">
				<div class = "form-group">

					<label>Location</label>
					<div class = "input-group">
						<%
							def placeholder = [ "Coordinate" ]
							if ( params.beLookup?.url ) { placeholder = placeholder.plus( 0, "BE" ) }
							if ( params.geocoderUrl ) { placeholder.push( "Placename" ) }
						%>
  						<input class = "typeahead form-control" id = "searchLocationInput" placeholder = "${ placeholder.join( ", " ) }" type = "text">
						<span class = "input-group-btn">
							<button class = "btn btn-primary"  onclick = getLocationGps() title = "Use your GPS location" type = "button"><span class = "glyphicon glyphicon-screenshot"></span></button>
						</span>
					</div>

					<label>Start Date</label>
					<div class = "input-group date" id = "searchStartDateTimePicker">
						<input class = "form-control" type = "text">
						<span class="input-group-addon">
							<span class = "glyphicon glyphicon-calendar"></span>
						</span>
					</div>

					<label>End Date</label>
					<div class = "input-group date" id = "searchEndDateTimePicker">
						<input class = "form-control" type = "text">
						<span class="input-group-addon">
							<span class = "glyphicon glyphicon-calendar"></span>
						</span>
					</div>

					<label>Sensors</label>
					<select multiple class = "form-control" id = "searchSensorSelect"></select>

					<g:if test = "${ grailsApplication.config.fsg }">
						<label>Full Spectrum GEOINT</label>
						<select multiple class = "form-control" id = "searchFsgSelect">
						<g:each in = "${ grailsApplication.config.fsg }">
							<option value = "${ it.value.searchString }">${ it.key.toUpperCase() }</option>
						</g:each>
						</select>
					</g:if>

					<label>Min. NIIRS</label>
					<input class = "form-control" id = "searchMinNiirsInput" max = "9" min = "0" step = "0.1" type = "number">

					<label>Max. Cloud Cover (%)</label>
					<input class = "form-control" id = "searchMaxCloudCoverInput" max = "100" min = "0" step = "1" type = "number">

					<label>Max. Results</label>
					<select class = "form-control" id = "searchMaxResultsSelect">
						<g:each in = "${ [ 5, 10, 25, 50, 75, 100, 250, 500 ] }">
							<option value = ${ it }>${ it }</option>
						</g:each>
					</select>

					<g:if test = "${ params.libraries.size() > 1 }">
						<label>Libraries</label>
						<div class = "input-group">
							<div class = "btn-group" data-toggle = "buttons">
								<g:each in = "${ params.libraries }">
									<label class = "btn btn-primary" id = "searchLibrary${ it.key.capitalize() }Label">
										<input id = "searchLibrary${ it.key.capitalize() }Checkbox" type = "checkbox">
										${ it.value.label }
									</label>
								</g:each>
							</div>
						</div>
					</g:if>
				</div>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-primary" onclick = beginSearch()>Search</button>
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>

				<g:if test = "${ grailsApplication.config.docsUrl }">
					<button type = "button" class = "btn btn-primary">
						<a href = "${ grailsApplication.config.docsUrl }/tlv/docs/user-guide/tlv/#search" target = "_blank">
							<span class = "glyphicon glyphicon-question-sign"></span>
						</a>
					</button>
				</g:if>
			</div>
		</div>
	</div>
</div>

<asset:script type = "text/javascript">
	$( "#searchLocationInput" ).on( "input", function () {
		if ( tlv.geocoderUrl ) {
			placenameSearch( $("#searchLocationInput") );
		}
	});

	$( "#searchDialog" ).modal({
		backdrop: "static",
		keyboard: false
	});
	$( "#searchDialog" ).on( "hidden.bs.modal", function (event) { hideDialog( "searchDialog" ); } );
	$( "#searchDialog" ).on( "shown.bs.modal", function (event) { displayDialog( "searchDialog" ); } );
</asset:script>
