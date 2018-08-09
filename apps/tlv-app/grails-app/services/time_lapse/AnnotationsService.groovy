package time_lapse


import grails.transaction.Transactional


@Transactional
class AnnotationsService {


	def save( json ) {
		def annotation = new Annotation( json )
		annotation.save()

		if ( annotation.hasErrors() ) {
			annotation.errors.allErrors.each { println it }


			return [ response: false ]
		}
		else {
			return [ response: true ]
		}
	}
}
