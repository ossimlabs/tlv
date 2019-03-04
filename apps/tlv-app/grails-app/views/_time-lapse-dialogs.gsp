<div class = "modal" id = "summaryTableDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog modal-xl">
 		<div class = "modal-content">
			<div class = "modal-header"><h4>Summary Table</h4></div>
			<div class = "modal-body">
				<table class = "table table-condensed table-hover table-striped" id = "timeLapseSummaryTable"></table>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
 			</div>
		</div>
	</div>
</div>

<asset:script type = "text/javascript">
	$("#summaryTableDialog").on("hidden.bs.modal", function (event) { hideDialog("summaryTableDialog"); });
	$("#summaryTableDialog").on("shown.bs.modal", function (event) { displayDialog("summaryTableDialog"); });
</asset:script>

<div class = "modal" id = "contextMenuDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Context Menu</h4></div>
			<div class = "modal-body">
				<div class = "row" style = "text-align: center"><b><i>You clicked here:</i></b></div>
				<div class = "row" id = "mouseClickDiv"></div>
				<hr>
				<div class = "row" style = "text-align: center"><b><i>Image Metadata:</i></b></div>
				<pre id = "imageMetadataPre" style = "background: none; color: #c8c8c8"></pre>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>

<asset:script type = "text/javascript">
	$( "#contextMenuDialog" ).on( "hidden.bs.modal", function (event) { hideDialog( "contextMenuDialog" ); } );
	$( "#contextMenuDialog" ).on( "shown.bs.modal", function (event) { displayDialog( "contextMenuDialog" ); } );
</asset:script>
