package time_lapse


import grails.converters.JSON


class AnnotationController {

	static scaffold = Annotation

	def annotationService


	def getDistinctValues() {
		def results = annotationService.getDistinctValues( params )


		render results.findAll { it != null } as JSON
	}

	def saveAnnotation() {
		render annotationService.save( request.JSON ) as JSON
	}

	def search() {
		render annotationService.search( params.id ) as JSON  
	}
}
