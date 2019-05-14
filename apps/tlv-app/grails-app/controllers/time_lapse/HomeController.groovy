package time_lapse


import io.swagger.annotations.Api
import io.swagger.annotations.ApiImplicitParam
import io.swagger.annotations.ApiImplicitParams
import io.swagger.annotations.ApiOperation


@Api(value = "/home",
	 description = "TLV REST API"
)
class HomeController {

	def httpProxyService
	def openSearchService
	def restApiService


	def dummyRedirect() {
		def url = params.redirectUrl + '?'
		params.remove( 'action' )
		params.remove( 'controller' )
		params.remove( 'format' )
		params.remove( 'redirectUrl' )

		def urlParams = params.collect {
			key,value ->
			URLEncoder.encode( "${ key }" ) + '=' + URLEncoder.encode( "${ value }" )
		}


		redirect( url: url + urlParams.join( '&' ) )
	}

	@ApiOperation(
		httpMethod = "GET",
	    produces = 'text/html',
	    value = "Set UI features from the URL."
	)
	@ApiImplicitParams([
		@ApiImplicitParam(
			dataType = 'string',
			defaultValue = '',
			name = 'baseLayer',
			paramType = 'query',
			value = 'Sets the default base layer.'
		),
		@ApiImplicitParam(
			dataType = 'string',
			defaultValue = '',
			name = 'bbox',
			paramType = 'query',
			value = 'Sets the initial map zoom in min_lon, min_lat, max_lon, max_lat format.'
		),
		@ApiImplicitParam(
			allowableValues = '2,3',
			dataType = 'integer',
			defaultValue = '',
			name = 'dimenstions',
			paramType = 'query',
			value = 'Setting to 3 will open images in a 3D globe.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'endDay',
			paramType = 'query',
			value = 'Sets the end day in the search dialog. Default is the current day.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'endHour',
			paramType = 'query',
			value = 'Sets the end hour in the search dialog. Default is the current hour.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'endMinute',
			paramType = 'query',
			value = 'Sets the end minute in the search dialog. Default is the current minute.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'endMonth',
			paramType = 'query',
			value = 'Sets the end month in the search dialog. Default is the current month.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'endSecond',
			paramType = 'query',
			value = 'Sets the end second in the search dialog. Default is the current second.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'endYear',
			paramType = 'query',
			value = 'Sets the end year in the search dialog. Default is the current year.'
		),
		@ApiImplicitParam(
			dataType = 'string',
			defaultValue = '',
			name = 'filter',
			paramType = 'query',
			value = 'When present, all other search parameters are ignored and the value is used to search.'
		),
		@ApiImplicitParam(
			dataType = 'string',
			defaultValue = '',
			name = 'fsg',
			paramType = 'query',
			value = 'Comma separated list of Full Spectrum GEOINT products.'
		),
		@ApiImplicitParam(
			dataType = 'boolean',
			defaultValue = '',
			name = 'fsgNot',
			paramType = 'query',
			value = 'Whether or not the FSG list should be excluded from the results.'
		),
		@ApiImplicitParam(
			dataType = 'boolean',
			defaultValue = '',
			name = 'hideAcquisitionDate',
			paramType = 'query',
			value = 'Hides the acquisition date text on the map.'
		),
		@ApiImplicitParam(
			dataType = 'boolean',
			defaultValue = '',
			name = 'hideImageId',
			paramType = 'query',
			value = 'Hides the image ID text on the map.'
		),
		@ApiImplicitParam(
			dataType = 'boolean',
			defaultValue = '',
			name = 'hideMapCoordinates',
			paramType = 'query',
			value = 'Hides the map coordinate display on the map.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'lastDays',
			paramType = 'query',
			value = 'Sets the start date a certain number of days from the current date.'
		),
		@ApiImplicitParam(
			dataType = 'string',
			defaultValue = '',
			name = 'location',
			paramType = 'query',
			value = 'When defined, a search will automatically be started using the value as the input for a search location.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'maxCloudCover',
			paramType = 'query',
			value = 'Sets the maximum cloud cover in the search dialog.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'maxResults',
			paramType = 'query',
			value = 'Sets the maximum results in the search dialog.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'niirs',
			paramType = 'query',
			value = 'Sets the minimum NIIRS in the search dialog.'
		),
		@ApiImplicitParam(
			allowableValues = 'auto,manual',
			dataType = 'string',
			defaultValue = '',
			name = 'orientation',
			paramType = 'query',
			value = 'When set to auto, the map will be oriented according to the device\'s sensors.'
		),
		@ApiImplicitParam(
			dataType = 'boolean',
			defaultValue = '',
			name = 'overviewMapEnabled',
			paramType = 'query',
			value = 'Sets the visibility of the overview map.'
		),
		@ApiImplicitParam(
			dataType = 'boolean',
			defaultValue = '',
			name = 'reverseChronological',
			paramType = 'query',
			value = 'Sets whether results are displayed in chronological or reverse-chronological order.'
		),
		@ApiImplicitParam(
			dataType = 'string',
			defaultValue = '',
			name = 'searchLibraries',
			paramType = 'query',
			value = 'Comma separated list that select the libraries in the search dialog.'
		),
		@ApiImplicitParam(
			dataType = 'string',
			defaultValue = '',
			name = 'sensors',
			paramType = 'query',
			value = 'Comma separated list of sensor IDs.'
		),
		@ApiImplicitParam(
			dataType = 'boolean',
			defaultValue = '',
			name = 'sensorsNot',
			paramType = 'query',
			value = 'Whether or not to exclude the sensor list from the results.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'startDay',
			paramType = 'query',
			value = 'Sets the start day in the search dialog. Default is the whatever day it was 30 days ago.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'startHour',
			paramType = 'query',
			value = 'Sets the start hour in the search dialog.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'startMinute',
			paramType = 'query',
			value = 'Sets the start minute in the search dialog.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'startMonth',
			paramType = 'query',
			value = 'Sets the start month in the search dialog. Default is whatever month it was 30 days ago..'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'startSecond',
			paramType = 'query',
			value = 'Sets the start second in the search dialog.'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'startYear',
			paramType = 'query',
			value = 'Sets the start year in the search dialog. Default is whatever year it was 30 days ago..'
		),
		@ApiImplicitParam(
			dataType = 'integer',
			defaultValue = '',
			name = 'tilt',
			paramType = 'query',
			value = 'Sets the number of degrees to tilt the 3D view.'
		)
	])
	def index() {
		def model = restApiService.serviceMethod( params )


		render(model: [ tlvParams: model ], view: "/index.gsp")
	}

	def openSearch() {
		render( contentType: "text/xml", text: openSearchService.serviceMethod() )
	}

	def proxy() {
		def url = params.url


		render httpProxyService.serviceMethod( url )
	}
}
