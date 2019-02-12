<div class = "modal" id = "aboutDialog" role = "dialog" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header">
				<asset:image height = "40" src = "logos/tlv.png"/>
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
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>
