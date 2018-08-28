<div class = "modal" id = "templateDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog" style = "width: 75%">
		<div class = "modal-content" style = "background: none">
			<div class = "modal-body" style = "padding: 0px">
				<div class = "row template" id = "templateHeader"></div>
				<div class = "row" style = "margin-left: 0px; margin-right: 0px;">
					<img id = "templateImage" width = "100%"/>
				</div>
				<div class = "row template" id = "templateFooter"></div>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-primary" data-dismiss = "modal" onclick = downloadTemplate() >Download</button>
                <button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
            </div>
		</div>
	</div>
</div>


<asset:script type = "text/javascript">
	$( "#templateDialog" ).on( "hidden.bs.modal", function ( event ) {
		hideDialog( "templateDialog" );
		$( ".modal-backdrop.in" ).css( "opacity", 0.5 );
	});
	$( "#templateDialog" ).on( "shown.bs.modal", function ( event ) {
		displayDialog( "templateDialog" );
		$( ".modal-backdrop.in" ).css( "opacity", 1 );
	});
</asset:script>
