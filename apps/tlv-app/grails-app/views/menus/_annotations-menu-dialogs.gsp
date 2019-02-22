<div class = "modal" id = "annotationsDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Annotation Style</h4></div>
			<div class = "modal-body">
				<div class = "row">
					<div class = "col-md-4">
						<label>Fill Color</label>
						<input class = "form-control" id = "fillColorInput" type = "color">
					</div>
					<div class = "col-md-4">
						<label>Fill Transparency</label>
						<input class = "form-control" id = "fillTransparencyInput" max = "1" min = "0" step = "0.1" type = "number">
					</div>
					<div class = "col-md-4">
						<label>Radius</label>
						<input class = "form-control" id = "radiusInput" min = "0" type = "number">
					</div>
				</div>
				<div class = "row">
					<div class = "col-md-4">
						<label>Stroke Color</label>
						<input class = "form-control" id = "strokeColorInput" type = "color">
					</div>
					<div class = "col-md-4">
						<label>Stroke Transparency</label>
						<input class = "form-control" id = "strokeTransparencyInput" max = "1" min = "0" step = "0.1" type = "number">
					</div>
					<div class = "col-md-4">
						<label>Stroke Width</label>
						<input class = "form-control" id = "strokeWidthInput" max = "100" min = "1" step = "1" type = "number">
					</div>
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
