<div class = "modal" id = "annotationsDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Annotations</h4></div>
			<div class = "modal-body">
				<g:each in = "${[
					[ label: "Circle", javascript: "drawAnnotation( 'circle' )" ],
					[ label: "Line", javascript: "drawAnnotation( 'line' )" ],
					[ label: "Point", javascript: "drawAnnotation( 'point' )" ],
					[ label: "Polygon", javascript: "drawAnnotation( 'polygon' )" ],
					[ label: "Rectangle", javascript: "drawAnnotation( 'rectangle' )" ],
					[ label: "Square", javascript: "drawAnnotation( 'square' )" ]
				]}">
					<label>${ it.label }</label>
					<button class = "btn btn-primary form-control" data-dismiss = "modal" onclick = "${ it.javascript }">
						Draw ${ it.label }
					</button>
				</g:each>

				<hr>
				<div class = "row">
					<div class = "col-md-6">
						<button class = "btn btn-primary form-control" data-dismiss = "modal" onclick = modifyAnnotationShape()>
							Modify Shape
						</button>
					</div>
					<div class = "col-md-6">
						<button class = "btn btn-primary form-control" data-dismiss = "modal" onclick = modifyAnnotationStyle()>
							Modify Style
						</button>
					</div>
				</div>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>

<div class = "modal" id = "annotationStylesDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Annotation Styles</h4></div>
			<div class = "modal-body">
				<ul class = "nav nav-tabs">
    				<g:each in = "${[ 'circle', 'line', 'point', 'polygon', 'text' ]}">
						<li>
							<a href = "#${ it }" data-toggle = "tab" onclick = 'javascript:displayDialog( "annotationStylesDialog" )'>${ it.capitalize() }</a>
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
