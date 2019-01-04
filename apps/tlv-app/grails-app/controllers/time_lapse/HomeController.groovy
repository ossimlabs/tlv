package time_lapse


class HomeController {

	def annotationsService
	def openSearchService
	def restApiService


	def index() {
		def model = restApiService.serviceMethod( params )


		render(model: [ tlvParams: model ], view: "/index.gsp")
	}

	def openSearch() {
		render( contentType: "text/xml", text: openSearchService.serviceMethod() )
	}
}
