package time_lapse


import grails.transaction.Transactional


@Transactional
class AnnotationService {


	def getDistinctValues( params ) {
		def results = []
		switch ( params.property ) {
			case "type" :
			case "username" :
				results = Annotation.withCriteria {
					projections {
						distinct( "${ params.property }" )
					}
			}
		}


		return results
	}

	def save( json ) {
		//def ontology = json.ontology ? new Ontology( json.ontology ) : null
		//json.ontology = ontology

		def annotation = new Annotation( json )
		annotation.save()

		def id = annotation.id
		annotation.link += "&annotation=${ id }"
		annotation.save()


		if ( annotation.hasErrors() ) {
			println json
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

	def updateValidation( params ) {
		def annotation = search( params.id )
		annotation.validation = params.validation
		annotation.save()
	}
}
