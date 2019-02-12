<div class = "modal" id = "annotationsDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Annotation Style</h4></div>
			<div class = "modal-body">
				<div class = "form-group">
					<label>Type</label>
					<input class = "typeahead form-control" id = "typeInput" placeholder = "Start Typing..." type = "text">
					<asset:script type = "text/javascript">
						$( "#typeInput" ).on( "input", function () {
							var ontologyUrl = "${ grailsApplication.config.ontologyUrl }";
							if ( ontologyUrl ) {
								var inputElement = $( "#typeInput" );

								inputElement.data( "ontology", null );

								var queryParams = {
									searchString: inputElement.val()
								};

								if ( tlv.ontologySearchAjax ) { tlv.ontologySearchAjax.abort(); }
								tlv.ontologySearchAjax = $.ajax({
									url: ontologyUrl + "?" + $.param( queryParams )
								})
								.always( function() {
									inputElement.typeahead( "destroy" );
								})
								.done( function( data ) {
									var types = data[ "@graph" ].map( function( type ) {
										var typeAheadReturn = {
											displayName: type.prefLabel[ "@value" ]
										};

										var keys = Object.keys( type );
										$.each(
											Object.keys( type ),
											function( index, key ) {
												if ( key.contains( "textMatchLabel" ) ) {
													typeAheadReturn.displayName += " (" + type[ key ] + ")"
												}
											}
										);

										var contextIds = type[ "@id" ].split( ":" );
										var context = data[ "@context" ][ contextIds[ 0 ] ];
										typeAheadReturn.ontology = {
											uid: context + contextIds[ 1 ],
											prefLabel: type.prefLabel,
											textMatchScore: type.textMatchScore,
											userSearchString: inputElement.val()
										};


										return typeAheadReturn;
									});

									inputElement.typeahead( null, {
										display: function( suggestion ) {
											inputElement.focus();
											return suggestion.displayName;
										},
										source: function( query, sync ) {
											inputElement.focus();
											return sync( types );
										}
									});
									inputElement.focus();
								})
								.fail( function() {
									inputElement.focus();
								});
							}
						});

						$( "#typeInput" ).on( "typeahead:select", function ( event, suggestion ) {
							$( "#typeInput" ).data( "ontology", suggestion.ontology );
						});

					</asset:script>

					<label>Username</label>
					<input class = "typeahead form-control" id = "usernameInput" placeholder = "Start Typing..." type = "text">
					<asset:script type = "text/javascript">
						var pageLoadAnnoationUsername = pageLoad;
						pageLoad = function() {
							pageLoadAnnoationUsername();

							var inputElement = $( "#usernameInput" );
							$.ajax({
								data: "property=username",
								url: tlv.contextPath + "/annotation/getDistinctValues"
							})
							.always( function() {
								inputElement.typeahead( "destroy" );
							})
							.done( function( data ) {
								var source = data;
								inputElement.typeahead( null, {
									display: function( suggestion ) {
										inputElement.focus();
										return suggestion;
									},
									source: function( query, sync ) {
										inputElement.focus();
										return sync( source );
									}
								});
								//inputElement.focus();
							})
							.fail( function() {
							});
						}
					</asset:script>


					<label>Confidence</label>
					<select class = "form-control" id = "confidenceSelect">
						<g:each in = "${[ "High", "Medium", "Low" ]}">
							<option value = "${ it.toLowerCase() }">${ it }</option>
						</g:each>
					</select>

					<hr>

					<label>Fill Color</label>
					<input class = "form-control" id = "fillColorInput" type = "color">

					<label>Fill Transparency</label>
					<input class = "form-control" id = "fillTransparencyInput" max = "1" min = "0" step = "0.1" type = "number">

					<label>Radius</label>
					<input class = "form-control" id = "radiusInput" min = "0" type = "number">

					<label>Stroke Color</label>
					<input class = "form-control" id = "strokeColorInput" type = "color">

					<label>Stroke Transparency</label>
					<input class = "form-control" id = "strokeTransparencyInput" max = "1" min = "0" step = "0.1" type = "number">

					<label>Stroke Width</label>
					<input class = "form-control" id = "strokeWidthInput" max = "100" min = "1" step = "1" type = "number">
				</div>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-primary" data-dismiss = "modal" onclick = applyAnnotationStyle()>Apply</button>
				<button type = "button" class = "btn btn-primary" data-dismiss = "modal" onclick = deleteFeature()>Delete</button>
                <button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
            </div>
		</div>
	</div>
</div>

<asset:script type = "text/javascript">
	$( "#annotationsDialog" ).on( "hidden.bs.modal", function (event) {
		hideDialog( "annotationsDialog" );
	});
	$( "#annotationsDialog" ).on( "shown.bs.modal", function (event) { displayDialog( "annotationsDialog" ); } );
</asset:script>
