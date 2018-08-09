package time_lapse


import grails.converters.JSON
import groovy.json.JsonOutput


class HomeController {

	def annotationsService
	def openSearchService
	def restApiService


	def index() {
		def model = restApiService.serviceMethod(params)


		render(model: [ tlvParams : JsonOutput.toJson( model ) ], view: "/index.gsp")
	}

	def openSearch() {
		render( contentType: "text/xml", text: openSearchService.serviceMethod() )
	}

	def saveAnnotations() {
		render annotationsService.save( request.JSON ) as JSON
	}
}
