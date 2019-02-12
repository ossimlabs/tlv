<li class = "dropdown navbar-button">
	<a href = "javascript:void(0)" class = "dropdown-toggle" data-toggle = "dropdown" role = "button" title = "Annotations">
		<span class = "glyphicon glyphicon-pencil"></span>
		<span class = "caret"></span>
	</a>
	<ul class = "dropdown-menu">
		<li><a href = javascript:void(0) onclick = annotationsLayerToggle()>Toggle Visibility</a></li>
		<li class = "divider" role = "seperator"></li>
		<li><a href = javascript:void(0) onclick = "drawAnnotation( 'circle' )">Circle</a></li>
		<li><a href = javascript:void(0) onclick = "drawAnnotation( 'line' )">Line</a></li>
		<li><a href = javascript:void(0) onclick = "drawAnnotation( 'point' )">Point</a></li>
		<li><a href = javascript:void(0) onclick = "drawAnnotation( 'polygon' )">Polygon</a></li>
		<li><a href = javascript:void(0) onclick = "drawAnnotation( 'rectangle' )">Rectangle</a></li>
		<li><a href = javascript:void(0) onclick = "drawAnnotation( 'square' )">Square</a></li>
		<li class = "divider" role = "seperator"></li>
		<li><a href = javascript:void(0) onclick = modifyAnnotations()>Modify</a></li>
		<li class = "divider" role = "seperator"></li>
		<li><a href = javascript:void(0) onclick = saveAnnotations()>Save</a></li>
	</ul>
</li>
