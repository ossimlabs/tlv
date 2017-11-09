<g:if test = "${ grailsApplication.config.banner }">
	<li>
		<p class = "navbar-text" data-placement = "left" data-toggle = "tooltip" id = "bannerText" title = "${ grailsApplication.config.bannerTooltip }" >
			${ grailsApplication.config.banner }
		</p>
	</li>
</g:if>
