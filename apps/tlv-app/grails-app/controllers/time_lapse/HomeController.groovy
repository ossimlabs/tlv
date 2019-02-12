package time_lapse


class HomeController {

	def httpProxyService
	def openSearchService
	def restApiService


	def dummyRedirect() {
		def url = params.redirectUrl + '?'
		params.remove( 'action' )
		params.remove( 'controller' )
		params.remove( 'format' )
		params.remove( 'redirectUrl' )

		def urlParams = params.collect {
			key,value ->
			URLEncoder.encode( "${ key }" ) + '=' + URLEncoder.encode( "${ value }" )
		}


		redirect( url: url + urlParams.join( '&' ) )
	}

	def index() {
		def model = restApiService.serviceMethod( params )


		render(model: [ tlvParams: model ], view: "/index.gsp")
	}

	def openSearch() {
		render( contentType: "text/xml", text: openSearchService.serviceMethod() )
	}

	def proxy() {
		def url = params.url


		render httpProxyService.serviceMethod( url )
	}
}
