package time_lapse


import grails.converters.JSON


class AnnotationController {

	static scaffold = Annotation

	def annotationService


	def export() {
		def results = Annotation.list( params ).unique { annotation -> annotation.geometryOrtho }
		def json = new JSON( results ).toString()


		render(model: [ annotations : json ], view: "/annotation/export.gsp" )
	}

	def getDistinctValues() {
		def results = annotationService.getDistinctValues( params )


		render results.findAll { it != null } as JSON
	}

	def qualityControl( Integer max ) {
		params.max = Math.min(max ?: 10, 10000)
		def results = Annotation.list( params ).unique { annotation -> annotation.geometryOrtho }


		respond results, model:[ annotationCount: Annotation.count() ], view: "quality-control.gsp"
	}

	def saveAnnotation() {
		render annotationService.save( request.JSON ) as JSON
	}

	def search() {
		render annotationService.search( params.id ) as JSON
	}
}
