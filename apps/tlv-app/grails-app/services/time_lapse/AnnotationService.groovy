package time_lapse


import grails.transaction.Transactional


@Transactional
class AnnotationService {


	def getDistinctValues( params ) {
		def results = []
		switch ( params.property ) {
			case "type" :
			case "user" :
				results = Annotation.withCriteria {
					projections {
						distinct( "${ params.property }" )
					}
			}
		}


		return results
	}

	def save( json ) {
		def annotation = new Annotation( json )
		annotation.link += "&annotation=${ Annotation.count() + 1 }"
		annotation.save()

		if ( annotation.hasErrors() ) {
			annotation.errors.allErrors.each { println it }


			return [ response: false ]
		}
		else {
			return [ response: true ]
		}
	}

	def search( id ) {
		return Annotation.get( id )
	}
}
