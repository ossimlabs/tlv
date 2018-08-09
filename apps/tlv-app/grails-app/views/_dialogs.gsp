<div class = "alert alert-danger" id = "errorDialog" role = "alert">
	<button aria-label = "Close" class = "close" onclick = hideErrorDialog() type = "button">
		<span aria-hidden = "true">&times;</span>
	</button>
	<div></div>
</div>

<div class = "modal" id = "loadingDialog" role = "dialog" style = "z-index: 2147483647" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Please wait...</h4></div>
			<div class = "modal-body">
				<div id = "loadingDialogMessageDiv"></div>
				<br>
				<div class = "progress progress-striped">
					<div class = "progress-bar progress-bar-info" role = "progressbar" style = "width: 100%"></div>
				</div>
			</div>
		</div>
	</div>
</div>

<g:render template = "/time-lapse-dialogs"/>

<g:render template = "/menus/annotations-menu-dialogs"/>
<g:render template = "/menus/help-menu-dialogs"/>
<g:render template = "/menus/layers-menu-dialogs"/>
<g:render template = "/menus/search-menu-dialogs"/>
<g:render template = "/menus/time-lapse-menu-dialogs"/>
<g:render template = "/menus/view-menu-dialogs"/>

<div class = "modal" id = "dragoDialog" role = "dialog" style = "z-index: 2147483647" tabindex = "-1">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>DRAGO Info</h4></div>
			<div class = "modal-body">
				<div class = "row">
					<img size = "25%" id = "dragoImage" width = "100%"/>
				</div>
				<div class = "row">
					<pre id = "dragoMetadata" style = "background: none; color: #c8c8c8"></pre>
				</div>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>
