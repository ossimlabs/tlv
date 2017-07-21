package time_lapse


import grails.transaction.Transactional


@Transactional
class RestApiService {

	def grailsApplication


	def serviceMethod(params) {
		params.remove("action")
		params.remove("controller")

		params.availableBaseLayers = grailsApplication.config.baseLayers
		params.beLookup = grailsApplication.config.beLookup
		params.defaultLocation = grailsApplication.config.defaultLocation
		params.geocoderUrl = grailsApplication.config.geocoderUrl ?: null
		params.libraries = grailsApplication.config.libraries
		params.terrainProvider = grailsApplication.config.terrainProvider ?: null


		return params
	}
}
