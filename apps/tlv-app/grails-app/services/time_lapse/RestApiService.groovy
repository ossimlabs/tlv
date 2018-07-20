package time_lapse


import grails.transaction.Transactional


@Transactional
class RestApiService {

	def grailsApplication


	def serviceMethod(params) {
		params.remove("action")
		params.remove("controller")

		params.availableBaseLayers = grailsApplication.config.baseLayers
		params.baseUrl = grailsApplication.config.baseUrl
		params.beLookup = grailsApplication.config.beLookup
		params.geocoderUrl = grailsApplication.config.geocoderUrl ?: null
		params.imageIdFilters = grailsApplication.config.imageIdFilters ?: []
		params.libraries = grailsApplication.config.libraries
		params.terrainProvider = params.terrainProvider ?: ( grailsApplication.config.terrainProvider ?: null )


		return params
	}
}
