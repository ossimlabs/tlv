package time_lapse


import groovy.json.JsonOutput


class GeometriesController {


	def index() {
		render(model: [ tlvParams : JsonOutput.toJson( params ) ], view: "/menus/geometries.gsp")
	}
}
