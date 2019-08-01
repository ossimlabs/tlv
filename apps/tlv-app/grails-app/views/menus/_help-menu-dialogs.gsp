<div class = "modal" id = "helpDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header">
				<h4>
					<asset:image height = "40" src = "logos/tlv.png"/>
					Help!
				</h4>
			</div>
			<div align = "center" class = "modal-body">
				<%
					def contactEmail = grailsApplication.config.about?.contactEmail
				%>
				<g:if test = "${ contactEmail }">
					<b>Contact: </b> <a href = "mailto:${ contactEmail }">${ contactEmail }</a>
					<hr>
				</g:if>

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
				<g:if test = "${ grailsApplication.config.docsUrl }">
					<a class = "btn btn-primary" href = "${ grailsApplication.config.docsUrl }" target = "_blank">User Guide</a>
				</g:if>
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>
