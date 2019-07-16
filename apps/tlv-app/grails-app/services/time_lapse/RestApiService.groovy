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

		params.availableBaseLayers = grailsApplication.config.baseLayers
		params.baseUrl = grailsApplication.config.baseUrl
		params.beLookup = grailsApplication.config.beLookup ?: null
		params.configLayers = grailsApplication.config.layers ?: [:]
		params.demoLocation = grailsApplication.config.demoLocation ?: null
		params.geocoderUrl = grailsApplication.config.geocoderUrl ?: null
		params.ionAccessToken = grailsApplication.config.ionAccessToken ?: null
		params.libraries = grailsApplication.config.libraries

		JSON.use( "deep" ) {
			def json = preferencesService.getPreferences() as JSON
			params.preferences = new JsonSlurper().parseText( json.toString() )
		}
		params.templates = grailsApplication.config.templates ?: [:]
		params.terrainProvider = params.terrainProvider ?: ( grailsApplication.config.terrainProvider ?: null )
		params.reachbackUrl = grailsApplication.config.reachbackUrl ?: null
		params.releasability = grailsApplication.config.releasability


		return params
	}
}
