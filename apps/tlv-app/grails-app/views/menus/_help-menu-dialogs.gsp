<div class = "modal" id = "aboutDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>About</h4></div>
			<div align = "center" class = "modal-body">
				<b>Release:</b> ${ grailsApplication.config.about.release } ${ grailsApplication.config.about.releaseNumber }
				<br>
				<b>Build Version:</b> <g:meta name="info.app.version"/>
				<hr>
				<b>Grails Version:</b> <g:meta name = "info.app.grailsVersion"/>
				<br>
				<b>Groovy Version:</b> ${ GroovySystem.getVersion() }
				<br>
				<b>JVM Version:</b> ${ System.getProperty('java.version') }
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>
