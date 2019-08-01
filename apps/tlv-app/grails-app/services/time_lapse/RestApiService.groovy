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

		def config = grailsApplication.config
		params.availableBaseLayers = config.baseLayers
		params.baseUrl = config.baseUrl
		params.beLookup = config.beLookup ?: null
		params.configLayers = config.layers ?: [:]
		params.demoLocation = config.demoLocation ?: null
		params.geocoderUrl = config.geocoderUrl ?: null
		params.ionAccessToken = config.ionAccessToken ?: null
		params.libraries = config.libraries

		JSON.use( "deep" ) {
			def json = preferencesService.getPreferences() as JSON
			params.preferences = new JsonSlurper().parseText( json.toString() )
		}
		params.templates = config.templates ?: [:]
		params.terrainProvider = params.terrainProvider ?: ( config.terrainProvider ?: null )
		params.reachbackUrl = config.reachbackUrl ?: null
		params.releasability = config.releasability ?: null


		return params
	}
}
