<div class = "modal" id = "jobNameDialog" role = "dialog" style = "z-index: 2147483647" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Enter Job Name</h4></div>
			<div class = "modal-body">
                <input class = "form-control" id = "jobNameInput" type = "text">
			</div>
			<div class = "modal-footer">
				<button class = "btn btn-primary" data-dismiss = "modal" onclick = submitJob() type = "button">Submit</button>
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>

<g:javascript>
	$( "#jobNameDialog" ).on( "hidden.bs.modal", function ( event ) { hideDialog( "jobNameDialog" ); });
	$( "#jobNameDialog" ).on( "shown.bs.modal", function ( event ) { displayDialog( "jobNameDialog" ); });
</g:javascript>

<div class = "modal" id = "jobSearchDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog modal-lg">
 		<div class = "modal-content">
			<div class = "modal-header"><h4>Job Listing</h4></div>
			<div class = "modal-body">
				<div class = "row">
					<input class = "form-control" id  = "jobNameSearchInput" placeholder = "Search By Job Name" type = "text">
				</div>
				<table class = "table table-condensed table-striped" id = "jobListTable"></table>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
 			</div>
		</div>
	</div>
</div>

<g:javascript>
	$( "#jobSearchDialog" ).on( "hidden.bs.modal", function ( event ) { hideDialog( "jobSearchDialog" ); });
	$( "#jobSearchDialog" ).on( "shown.bs.modal", function ( event ) { displayDialog( "jobSearchDialog" ); });
	$( "#jobNameSearchInput" ).on( "input", function () { jobSearch(); });
</g:javascript>

<div class = "modal" id = "sourceSelectionDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog modal-lg">
 		<div class = "modal-content">
			<div class = "modal-header"><h4>Source Selection Table</h4></div>
			<div class = "modal-body">
				<div class = "row">
					<div class = "col-md-6">
						<div align  = "center" class = "row">Overall CE <sub>90</sub>  (m<sup>2</sup>)</div>
						<div class = "row">
							<div align = "right" class = "col-md-6">Desired:</div>
							<div class = "col-md-6">
								<input id = "desiredCeInput" style = "width: 7em" type = "number" value = "1.0">
							</div>
							<div align = "right" class = "col-md-6">Predicted:</div>
							<div class = "col-md-6">
								<span id = "predictedCeSpan">Estimated</span>
							</div>
						</div>
					</div>
					<div class = "col-md-6">
						<div align = "center" class = "row">Overall LE <sub>90</sub>  (m)</div>
						<div class = "row">
							<div align = "right" class = "col-md-6">Desired:</div>
							<div class = "col-md-6">
								<input id = "desiredLeInput" style = "width: 7em" type = "number" value = "1.0">
							</div>
						</div>
						<div class = "row">
							<div align = "right" class = "col-md-6">Predicted:</div>
							<div class = "col-md-6">
								<span id = "predictedLeSpan">Estimated</span>
							</div>
						</div>
					</div>
				</div>
				<br>
				<table class = "table table-condensed table-striped" id = "sourceSelectionTable"></table>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-primary" id = "selectImagesButton">Select</button>
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
 			</div>
		</div>
	</div>
</div>

<g:javascript>
	$( "#sourceSelectionDialog" ).on( "hidden.bs.modal", function ( event ) { hideDialog( "sourceSelectionDialog" ); });
	$( "#sourceSelectionDialog" ).on( "shown.bs.modal", function ( event ) { displayDialog( "sourceSelectionDialog" ); });
	$( "#desiredCeInput" ).on( "input", function () { getSourceSelectionCandidates(); });
	$( "#desiredLeInput" ).on( "input", function () { getSourceSelectionCandidates(); });
</g:javascript>

<div class = "modal modal-xl" id = "tiePointSelectionDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Select Tie Points</h4></div>
			<div class = "modal-body"></div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-primary" onclick = addTiePoint()>Add Tie Point</button>
				<button type = "button" class = "btn btn-primary" onclick = "$( '#jobNameDialog' ).modal( 'show' )">Complete</button>
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>

<g:javascript>
	$( "#tiePointSelectionDialog" ).on( "shown.bs.modal", function( event ) {
  		var height = $( window ).height() - 200;
  		$( this ).find( ".modal-body" ).css( "max-height", height );
	});
</g:javascript>
