package time_lapse


import grails.converters.JSON


class AnnotationController {

	static scaffold = Annotation

	def annotationService


	def getDistinctValues() {
		def results = annotationService.getDistinctValues( params )


		render results.findAll { it != null } as JSON
	}

	def index( Integer max ) {
		params.max = Math.min(max ?: 10, 100)
		def results = Annotation.list( params ).unique { annotation -> annotation.geometryOrtho }


		respond results, model:[ annotationCount: Annotation.count() ]
	}

	def saveAnnotation() {
		render annotationService.save( request.JSON ) as JSON
	}

	def search() {
		render annotationService.search( params.id ) as JSON
	}
}
