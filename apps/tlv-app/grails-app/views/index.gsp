<!DOCTYPE html>
<html>
	<head>
		<meta charset = "utf-8">
		<meta http-equiv = "X-UA-Compatible" content = "IE=edge">
		<meta name = "viewport" content = "width=device-width, initial-scale = 1">
		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

		<title>Time Lapse Viewer (TLV)</title>
		<link href = "${createLink( action: "openSearch", controller: "home" )}" rel = "search" title = "Time Lapse Viewer" type = "application/opensearchdescription+xml">
		<link href = "${ request.contextPath }/assets/tlvicon.ico" rel = "shortcut icon" type = "image/x-icon">

		<asset:stylesheet src = "webjars/bootswatch/3.3.5+4/${ tlvParams.preferences.pageTheme }/bootstrap.min.css"/>
		<asset:stylesheet src = "index-bundle.css"/>
	</head>
	<body>
		<div class = "container-fluid">
			<g:if test = "${ tlvParams.hideSecurityBanner != 'true' }">
				<g:render plugin = "omar-security-plugin" template = "/security-classification-header"/>
			</g:if>
			<g:render template = "/banner"/>
			<g:render template = "/time-lapse"/>

			<g:render template = "/dialogs"/>
		</div>

		<g:if test = "${ grailsApplication.config.userInfo }">
			<%
				def userInfo = grailsApplication.config.userInfo
				def requestHeaderUserName = userInfo.requestHeaderUserName
				def userName = request.getHeader( requestHeaderUserName ) ?: userInfo.requestHeaderUserNameDefault
			%>
			<g:if test = "${ userName }">
				<input id = "userNameInput" type = "hidden" value = "${ userName }">
			</g:if>
		</g:if>

		<asset:javascript src = "index-bundle.js"/>
		<asset:script type = "text/javascript">
			var tlv = ${raw(tlvParams.encodeAsJSON() as String)};
			tlv.contextPath = "${request.contextPath}";
		</asset:script>
		<asset:deferredScripts/>
	</body>
</html>
