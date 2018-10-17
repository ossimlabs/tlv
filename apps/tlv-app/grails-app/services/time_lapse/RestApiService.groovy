package time_lapse


import grails.transaction.Transactional


@Transactional
class RestApiService {

	def grailsApplication


	def serviceMethod(params) {
		params.remove("action")
		params.remove("controller")

		params.annotation = params.annotation
		params.availableBaseLayers = grailsApplication.config.baseLayers
		params.baseUrl = grailsApplication.config.baseUrl
		params.beLookup = grailsApplication.config.beLookup ?: null
		params.geocoderUrl = grailsApplication.config.geocoderUrl ?: null
		params.ionAccessToken = grailsApplication.config.ionAccessToken ?: null
		params.imageIdFilters = grailsApplication.config.imageIdFilters ?: []
		params.libraries = grailsApplication.config.libraries
		params.templates = grailsApplication.config.templates ?: [:]
		params.terrainProvider = params.terrainProvider ?: ( grailsApplication.config.terrainProvider ?: null )


		return params
	}
}
