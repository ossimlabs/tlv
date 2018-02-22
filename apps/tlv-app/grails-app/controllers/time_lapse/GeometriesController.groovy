package time_lapse


import groovy.json.JsonOutput


class GeometriesController {

	def restApiService


	def index() {
		def model = restApiService.serviceMethod( params )


		render(model: [ tlvParams : JsonOutput.toJson( model ) ], view: "/menus/geometries.gsp")
	}
}
