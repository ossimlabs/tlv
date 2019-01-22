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

		if( request.getHeader( "content-type" ) == "application/json" ) {
			render new JSON( results )
		} else {
			respond results, model:[ annotationCount: Annotation.count() ]
		}
	}

	def imageAnnotations( String imgId ) {
		params.max = 100
		def results = Annotation.list( params ).findAll { annotation -> annotation.imageId == imgId }
		render new JSON( results )
	}

	def saveAnnotation() {
		render annotationService.save( request.JSON ) as JSON
	}

	def search() {
		render annotationService.search( params.id ) as JSON
	}
}
