<g:if test = "${ grailsApplication.config.userInfo }">
	<%
		def requestHeaderUserName = grailsApplication.config.userInfo.requestHeaderUserName
		def requestHeaderUserNameDefault = grailsApplication.config.userInfo.requestHeaderUserNameDefault
		def userName = request.getHeader( requestHeaderUserName ) ?: requestHeaderUserNameDefault
	%>
	<g:if test = "${ userName }">
		<li>
			<p class = "navbar-text">
				<span class = "fa fa-user"></span>&nbsp;
				${ userName }
			</p>
		</li>
	</g:if>
</g:if>
