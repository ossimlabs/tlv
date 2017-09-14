<ul class = "nav navbar-nav navbar-right">
	<li class = "dropdown">
		<a href = "javascript:void(0)" class = "dropdown-toggle" data-toggle = "dropdown" role = "button">
			<span class = "glyphicon glyphicon-question-sign"></span> 
			<span class="caret"></span>
		</a>
		<ul class = "dropdown-menu">
			<li><a href = javascript:void(0) onclick = '$( "#aboutDialog" ).modal( "show" )'>About</a></li>
			<g:if test = "${ grailsApplication.config.docsUrl }">
				<li><a href = "${ grailsApplication.config.docsUrl }" target = "_blank">User Guide</a></li>
			</g:if>
		</ul>
	</li>
</ul>
