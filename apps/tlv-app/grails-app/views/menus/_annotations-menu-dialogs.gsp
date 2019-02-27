<div class = "modal" id = "annotationsDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Annotation Style</h4></div>
			<div class = "modal-body">
				<ul class = "nav nav-tabs">
    				<g:each in = "${[ 'circle', 'line', 'point', 'polygon', 'text' ]}">
						<li>
							<a href = "#${ it }" data-toggle = "tab" onclick = 'javascript:displayDialog( "annotationsDialog" )'>${ it.capitalize() }</a>
						</li>
					</g:each>
				</ul>
				<div class = "tab-content">
					<g:each in = "${[
						[ type: 'circle', styles: [ 'fill', 'radius', 'stroke' ] ],
						[ type: 'line', styles: [ 'stroke' ] ],
						[ type: 'point', styles: [ 'fill', 'radius', 'stroke' ] ],
						[ type: 'polygon', styles: [ 'fill', 'stroke' ] ],
						[ type: 'text', styles: [ 'text' ] ]
					]}">
						<div class = "tab-pane" id = "${ it.type }">
							<g:each in = "${ it.styles }">
								<span>
									<h3>${ it.capitalize() }</h3>
									<g:render template = "/menus/annotation_styles/${ it }"/>
								</span>
							</g:each>
						</div>
					</g:each>
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
