<div class = "modal" id = "searchDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Search Parameters</h4></div>
			<div class = "modal-body">
				<g:if test = "${ grailsApplication.config.reachbackUrl }">
					<ul class = "nav nav-tabs">
						<li>
							<a href = "#coverageTab" data-toggle = "tab">Coverage</a>
						</li>
						<li class = "active">
							<a href = "#searchTab" data-toggle = "tab">Search</a>
						</li>
					</ul>

					<div class = "tab-content">
						<div class = "tab-pane" id = "coverageTab">
							<br>
							<div class = "row">
								<div class = "col-md-12" style = "text-align: center">
									<p>We'll search far and wide for any other imagery that meets your criteria!</p>
								</div>
							</div>
							<div class = "row">
								<div class = "col-md-12">
									<table class = "table table-condensed" style = "text-align: center">
										<tr>
											<g:each in = "${[
												[ class: "danger", text: "Not In library :(" ],
												[ class: "info", text: "In stack :D" ],
												[ class: "success", text: "In library :)" ],
												[ class: "warning", text: "Don't know :O" ]
											]}">
												<td class = "${ it.class }"><b>${ it.text }</b></td>
											</g:each>
										</tr>
									</table>
								</div>
							</div>
							<div class = "row">
								<div class = "col-md-12" id = "coverageTable"></div>
							</div>
						</div>
						<div class = "tab-pane active" id = "searchTab">
				</g:if>
						<div class = "form-group">

							<div class = "row">
								<div class = "col-md-12">
									<label>Location</label>
									<%
										def placeholder = [ "Coordinate", "Image ID" ]
										if ( params.beLookup?.url ) { placeholder = placeholder.plus( 0, "BE" ) }
										if ( params.geocoderUrl ) { placeholder.push( "Placename" ) }
									%>
									<input class = "typeahead form-control" id = "searchLocationInput" placeholder = "${ placeholder.join( ", " ) }" type = "text">
								</div>
							</div>

							<div class = "row">
								<div class = "col-md-5">
									<label>Start Date</label>
									<div class = "input-group date" id = "searchStartDateTimePicker">
										<input class = "form-control" type = "text">
										<span class="input-group-addon">
											<span class = "glyphicon glyphicon-calendar"></span>
										</span>
									</div>
								</div>
								<div class = "col-md-5">
									<label>End Date</label>
									<div class = "input-group date" id = "searchEndDateTimePicker">
										<input class = "form-control" type = "text">
										<span class="input-group-addon">
											<span class = "glyphicon glyphicon-calendar"></span>
										</span>
									</div>
								</div>
								<div class = "col-md-2">
									<label>Last Days</label>
									<input class = "form-control" id = "searchLastDaysInput" onchange = adjustLastDaysDate() type = "number">
								</div>
							</div>

							<div class = "row">
								<div class = "col-md-12">
									<label>Sensors</label>
									<div class = "input-group">
										<div class = "btn-group" data-toggle = "buttons">
											<label class = "btn btn-primary" onclick = "javascript:checkAllSensors( this )">
												<input type = "checkbox">
												ALL
											</label>
										</div>
										<div class = "btn-group" data-toggle = "buttons" id = "searchSensorDiv"></div>
									</div>
								</div>
							</div>

							<div class = "row">
								<div class = "col-md-12">
									<label>Full Spectrum GEOINT</label>
									<div class = "form-inline">
										<input class = "form-control"
											id = "searchFsgInput"
											list = "searchFsgList"
											onchange = "javascript: handleDataList( 'searchFsgInput' )"
											onkeyup = "javascript: handleDataList( 'searchFsgInput' )"
											placeholder = "Full Spectrum GEOINT">
										<datalist id = "searchFsgList"></datalist>
										<button class = "btn btn-danger" data-toggle = "button" id = "searchFsgNotCheckbox" title = "Eveyrhting but these..." type = "button">
											<span class = "glyphicon glyphicon-ban-circle"></span>
										</button>
									</div>
								</div>
							</div>

							<div class = "row">
								<div class = "col-md-4">
									<label>Min. NIIRS</label>
									<input class = "form-control" id = "searchMinNiirsInput" max = "9" min = "0" step = "0.1" type = "number">
								</div>
								<div class = "col-md-4">
									<label>Max. Cloud Cover (%)</label>
									<input class = "form-control" id = "searchMaxCloudCoverInput" max = "100" min = "0" step = "1" type = "number">
								</div>
								<div class = "col-md-4">
									<label>Max. Results</label>
									<select class = "form-control" id = "searchMaxResultsSelect">
										<g:each in = "${ [ 5, 10, 25, 50, 75, 100, 250, 500 ] }">
											<option value = ${ it }>${ it }</option>
										</g:each>
									</select>
								</div>
							</div>

							<g:if test = "${ params.libraries.size() > 1 }">
								<div class = "row">
									<div class = "col-md-12">
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
									</div>
								</div>
							</g:if>

						</div>
				<g:if test = "${ grailsApplication.config.reachbackUrl }">
						</div>
					</div>
				</g:if>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-primary pull-left" data-dismiss = "modal" onclick = demoSearch()>Demo</button>
				<button type = "button" class = "btn btn-primary" data-dismiss = "modal" onclick = beginSearch()>Search</button>
				<button type = "button" class = "btn btn-primary" data-dismiss = "modal" onclick = "javascript:displayDialog( 'helpDialog' )">
					<span class = 'glyphicon glyphicon-question-sign'></span>
				</button>
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>

<asset:script type = "text/javascript">
	$( 'a:contains("Coverage")' ).on( 'shown.bs.tab', function( event ) {
		displayDialog( 'searchDialog' );
	} );

	$( "#searchLocationInput" ).on( "input", function () {
		if ( tlv.geocoderUrl ) {
			placenameSearch( $("#searchLocationInput") );
		}
	});

	$( "#searchDialog" ).modal({
		backdrop: "static",
		keyboard: false
	});
</asset:script>
