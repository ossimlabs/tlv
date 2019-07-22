<g:if test = "${ grailsApplication.config.banner?.enabled }">
	<div class = "row">
		<div class = "banner" data-placement = "bottom" data-toggle = "tooltip" style = "background-color: ${ grailsApplication.config.banner.backgroundColor }; color: ${ grailsApplication.config.banner.textColor };" title = "${ grailsApplication.config.banner.description }">
			${ grailsApplication.config.banner.text }
		</div>
	</div>
</g:if>
