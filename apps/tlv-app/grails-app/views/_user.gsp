<g:if test = "${ grailsApplication.config.userInfo }">
	<%
		def requestHeaderUserName = grailsApplication.config.userInfo.requestHeaderUserName
		def requestHeaderUserNameDefault = grailsApplication.config.userInfo.requestHeaderUserNameDefault
		def userName = request.getHeader( requestHeaderUserName ) ?: requestHeaderUserNameDefault
	%>
	<g:if test = "${ userName }">
		<li class = "dropdown navbar-button">
			<a href = "javascript:void(0)" class = "dropdown-toggle" data-toggle = "dropdown" role = "button">
					<span class = "fa fa-user"></span>&nbsp;
					${ userName }
					<span class = "caret"></span>
			</a>
			<ul class = "dropdown-menu">
				<li><a href = "${ request.contextPath }/preferences" target = "_blank">Preferences</a></li>
			</ul>
		</li>
	</g:if>
</g:if>
