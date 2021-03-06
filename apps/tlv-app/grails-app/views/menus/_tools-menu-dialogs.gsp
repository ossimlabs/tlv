<div class = "modal" id = "toolsDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Tools</h4></div>
			<div class = "modal-body">
				<label>Geo-Jump</label>
				<div class = "input-group">
					<%
						def placeholder = [ "Coordinate" ]
						if ( params.beLookup?.url ) { placeholder = placeholder.plus( 0, "BE" ) }
						if ( params.geocoderUrl ) { placeholder.push( "Placename" ) }
					%>
					<input class = "typeahead form-control" id = "geoJumpLocationInput" placeholder = "${ placeholder.join( ", " ) }" type = "text">
					<span class = "input-group-btn">
						<button class = "btn btn-primary"  onclick = "geoJump($('#geoJumpLocationInput').val()); hideDialog( 'toolsDialog' )" type = "button">Go!</button>
					</span>
				</div>

				<label>Measure</label>
				<button class = "btn btn-primary form-control" data-dismiss = "modal" onclick = measure()>
					Length/Area
				</button>

				<label>Orientation</label>
				<select class = "form-control" id = "orientationSelect" onchange = "orientationToggle(); hideDialog( 'toolsDialog' )">
					<option value = "manual">Manual</option>
					<option value = "auto">Auto (Device)</option>
				</select>

				<label>Reverse Order</label>
				<button class = "btn btn-primary form-control" onclick = "reverseOrder(); hideDialog( 'toolsDialog' )">
					Reverse Order
				</button>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>

<asset:script type = "text/javascript">
	$( "#geoJumpLocationInput" ).on( "input", function () {
		if ( tlv.geocoderUrl ) {
			placenameSearch( $("#geoJumpLocationInput") );
		}
	});
</asset:script>
