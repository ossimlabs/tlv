package time_lapse


import grails.converters.JSON
import grails.transaction.Transactional
import groovy.json.JsonSlurper


@Transactional
class RestApiService {

	def grailsApplication
	def preferencesService


	def serviceMethod(params) {
		params.remove("action")
		params.remove("controller")

		params.annotation = params.annotation
		params.availableBaseLayers = grailsApplication.config.baseLayers
		params.baseUrl = grailsApplication.config.baseUrl
		params.beLookup = grailsApplication.config.beLookup ?: null
		params.configLayers = grailsApplication.config.layers ?: [:]
		params.geocoderUrl = grailsApplication.config.geocoderUrl ?: null
		params.ionAccessToken = grailsApplication.config.ionAccessToken ?: null
		params.imageIdFilters = grailsApplication.config.fsg?.collect { it.value.imageIdRegExp } ?: []
		params.libraries = grailsApplication.config.libraries

		JSON.use( "deep" ) {
			def json = preferencesService.getPreferences() as JSON
			params.preferences = new JsonSlurper().parseText( json.toString() )
		}
		params.templates = grailsApplication.config.templates ?: [:]
		params.terrainProvider = params.terrainProvider ?: ( grailsApplication.config.terrainProvider ?: null )


		return params
	}
}
