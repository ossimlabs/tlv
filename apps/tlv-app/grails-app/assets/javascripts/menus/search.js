function beSearch( be ) {
	var queryParams = {
		filter: tlv.beLookup.columnName + " = '" + be + "'",
		maxFeatures: 1,
		outputFormat: "JSON",
		request: "GetFeature",
		service: "WFS",
		typeName: tlv.beLookup.typeName,
		version: "1.1.0"
	};

	return $.ajax({
		dataType: "json",
		url: tlv.beLookup.url + "?" + $.param( queryParams )
	});
}

function beginSearch() {
	$( "#searchDialog" ).modal( "hide" );

	var location = getLocation();
	var locationString = $( "#searchLocationInput" ).val();
	if ( !location && locationString != "" ) {
		var callbackFunction = function( point ) {
			if ( point ) {
				var getLocationCallback = getLocation;
				getLocation = function() { return point; }
				beginSearch();
				getLocation = getLocationCallback;
			}
			// ok so maybe the input was an image ID?
			else {
				// needs to be reset so TLV will calculate a position
				tlv.location = '';

				var searchParams = getSearchParams();
				$.each( searchParams.libraries, function( index, library ) {
					tlv.libraries[ library ].searchComplete = false;

					var data = $.param({
						filter: "title LIKE '%" + locationString + "%'",
						maxFeatures: 100,
						outputFormat: "JSON",
						request: "getFeature",
						service: "WFS",
						typeName: "omar:raster_entry",
						version: "1.1.0"
					});
					var url = tlv.libraries[ library ].wfsUrl;
					if ( tlv.libraries[ library ].wfsUrlProxy ) {
						data = "url=" + encodeURIComponent( tlv.libraries[ library ].wfsUrlProxy + "?" + data );
						url = tlv.contextPath + "/home/proxy";
					}

					$.ajax({
						data: data,
						dataType: "json",
						url: url
					})
					.always( function() {
						tlv.libraries[ library ].searchComplete = true;
					} )
					.done( function( data ) {
						if ( data.features.length ) {
							var images = [];
							$.each( data.features, function( index, feature ) {
								var metadata = feature.properties;
								metadata.footprint = feature.geometry || null;

								var acquisitionDate = "N/A";
								if ( metadata.acquisition_date ) {
									var parsedDate = Date.parse( metadata.acquisition_date.replace( "+0000", "Z" ) );
									var date = getDate( new Date( parsedDate ) );
									acquisitionDate = date.year +  "-" + date.month + "-" + date.day + " " +
										date.hour + ":" + date.minute + ":" + date.second;
								}

								images.push({
									acquisitionDate: acquisitionDate,
									imageId: processImageId( metadata ),
									library: library,
									metadata: metadata,
									numberOfBands: metadata.number_of_bands || 1
								});
							} );

							tlv.libraries[ library ].searchResults = images;

							var searchesComplete = [];
							$.each( tlv.libraries, function( index, library ) {
								searchesComplete.push( library.searchComplete );
							} );

							if ( searchesComplete.indexOf( false ) < 0 ) {
								var numberOfImages = 0;
								$.each( searchParams.libraries, function( index, library ) {
									numberOfImages += tlv.libraries[ library ].searchResults.length;
								} );
								if ( numberOfImages ) {
									processResults();
								}
								else {
									displayErrorDialog( "Sorry, we couldn't interpret that location. :(" );
								}
							}
						}
					} );
				} );
			}
		}
		var location = convertGeospatialCoordinateFormat( locationString, callbackFunction );

		// if an ajax call is needed to find the location, we don't want an erroneous error messge while we wait
		return;
	}

	var searchParams = getSearchParams();
	if ( searchParams.error ) { displayErrorDialog( searchParams.error ); }
	else {
		displayLoadingDialog( "We are searching the libraries for imagery... fingers crossed!" );

		var queryParams = {
			maxFeatures: 100,
			outputFormat: "JSON",
			request: "getFeature",
			service: "WFS",
			typeName: "omar:raster_entry",
			version: "1.1.0"
		};

		tlv.location = searchParams.location;
		$.each(
			searchParams.libraries,
 			function( index, library ) {
				tlv.libraries[ library ].searchComplete = false;

				if ( tlv.filter ) { queryParams.filter = tlv.filter; }
				else {
					var filter = '';

					var startDate = "'" + searchParams.startYear + "-" + searchParams.startMonth + "-" + searchParams.startDay + "T" + searchParams.startHour + ":" + searchParams.startMinute + ":" + searchParams.startSecond + ".000'";
					var endDate = "'" + searchParams.endYear + "-" + searchParams.endMonth + "-" + searchParams.endDay +
						"T" + searchParams.endHour + ":" + searchParams.endMinute + ":" + searchParams.endSecond + ".999'";
					filter += "((acquisition_date >= " + startDate + " AND acquisition_date <= " + endDate + ") OR acquisition_date IS NULL)";

					filter += ' AND ';
					filter += '(cloud_cover <= ' + searchParams.maxCloudCover + ' OR cloud_cover IS NULL)';

					//filter += ' AND ';
					//filter += '(entry_id = 0)';

					if ( searchParams.fsgs.length ) {
						filter += ' AND ';
						filter += "(filename LIKE '%" + searchParams.fsgs.join( "%' OR filename LIKE'%" ) + "%')";
					}

					filter += ' AND ';
					filter += 'INTERSECTS(ground_geom,POINT(' + searchParams.location.join(' ') + '))';

					filter += ' AND ';
					filter += '(niirs >= ' + searchParams.minNiirs + ' OR niirs IS NULL)';

					if ( searchParams.sensors.length ) {
						filter += ' AND ';
						filter += "(sensor_id LIKE '" + searchParams.sensors.join( "' OR sensor_id LIKE'" ) + "')";
					}

					queryParams.filter = filter;
				}

				var data = $.param( queryParams );
				var url = tlv.libraries[ library ].wfsUrl;
				if ( tlv.libraries[ library ].wfsUrlProxy ) {
					data = "url=" + encodeURIComponent( tlv.libraries[ library ].wfsUrlProxy + "?" + $.param( queryParams ) );
					url = tlv.contextPath + "/home/proxy";
				}
				$.ajax({
					data: data,
					dataType: "json",
					url: url
				})
				.done( function( data ) {
					var images = [];
					$.each(
						data.features,
						function( index, feature ) {
							var metadata = feature.properties;
							metadata.footprint = feature.geometry || null;

							var acquisitionDate = "N/A";
							if ( metadata.acquisition_date ) {
								var parsedDate = Date.parse( metadata.acquisition_date.replace( "+0000", "Z" ) );
								var date = getDate( new Date( parsedDate ) );
								acquisitionDate = date.year +  "-" + date.month + "-" + date.day + " " +
									date.hour + ":" + date.minute + ":" + date.second;
							}

							images.push({
								acquisitionDate: acquisitionDate,
								imageId: processImageId( metadata ),
								library: library,
								metadata: metadata,
								numberOfBands: metadata.number_of_bands || 1
							});
						}
					);
					tlv.libraries[ library ].searchResults = images;

					tlv.libraries[ library ].searchComplete = true;
					processResults();
				})
				.fail( function() {
					tlv.libraries[ library ].searchComplete = true;
					processResults();
				});
			}
		);
	}
}

function getDate(date) {
	var year = date.getFullYear();

	var month = date.getMonth() + 1;
	month = month < 10 ? "0" + month : month;

	var day = date.getDate();
	day = day < 10 ? "0" + day : day;

	var hour = date.getHours();
	hour = hour < 10 ? "0" + hour : hour;

	var minute = date.getMinutes();
	minute = minute < 10 ? "0" + minute : minute;

	var second = date.getSeconds();
	second = second < 10 ? "0" + second : second;


	return { day: day, hour: hour, minute: minute, month: month, second: second, year: year };
}

function getDistinctSensors() {
	var updateSensorSelect = function() {
		var sensors = [];
		$.each( tlv.libraries, function( index, library ) {
		 	sensors.push( library.sensors || [] );
		});

		var sensorSelect = $( "#searchSensorSelect" );
		sensorSelect.html( "" );
		$.each( [].concat.apply( [], sensors ).unique().sort(), function( index, sensor ) {
			sensorSelect.append( "<option value = '" + sensor + "'>" + sensor.toUpperCase() + "</option>" );
		});
	}

	$.each( tlv.libraries, function( index, library ) {
		if ( !library.sensors ) {
			$.ajax({
				data: "property=sensorId",
				url: library.stagerUrl + "/dataManager/getDistinctValues"
			})
			.done( function( data ) {
				library.sensors = data;
				updateSensorSelect();
				getDistinctSensors();
			})
			.fail( function() {
				library.sensors = [];
				updateSensorSelect();
				getDistinctSensors();
			});


			return false;
		}
	});
}

function getEndDate() {
	var date = $("#searchEndDateTimePicker").data("DateTimePicker").date().toDate();


	return getDate(date);
}

function getLocation() {
	var locationString = $( "#searchLocationInput" ).val();
	var location = convertGeospatialCoordinateFormat( locationString );


	return location;
}

function getLocationGps() {
	var callback = function(position) {
		var coordinates = [position.coords.longitude, position.coords.latitude];
		$("#searchLocationInput").val(coordinates.reverse().join(","));
	}

	getGpsLocation(callback);
}

function getSearchParams() {
	var searchObject = {};

	var endDate = getEndDate();
	searchObject.endYear = endDate.year;
	searchObject.endMonth = endDate.month;
	searchObject.endDay = endDate.day;
	searchObject.endHour = endDate.hour;
	searchObject.endMinute = endDate.minute;
	searchObject.endSecond = endDate.second;

	searchObject.filter = tlv.filter || null;

	var fsgs = $( "#searchFsgSelect" ).val();
	searchObject.fsgs = fsgs || [];

	var libraries = getSelectedLibraries();
	if (libraries.length == 0) {
		//$( "#searchDialog" ).modal( "show" );
		return { error: "Please select a library, thanks." };
	}
	searchObject.libraries = libraries;

	var location = getLocation();
	searchObject.location = location;

	var maxCloudCover = $("#searchMaxCloudCoverInput").val();
	searchObject.maxCloudCover = maxCloudCover;

	var maxResults = $("#searchMaxResultsSelect").val();
	searchObject.maxResults = parseInt(maxResults);

	var minNiirs = $("#searchMinNiirsInput").val();
	searchObject.minNiirs = parseFloat(minNiirs);

	var sensors = $( "#searchSensorSelect" ).val();
	searchObject.sensors = sensors || [];

	var startDate = getStartDate();
	searchObject.startYear = startDate.year;
	searchObject.startMonth = startDate.month;
	searchObject.startDay = startDate.day;
	searchObject.startHour = startDate.hour;
	searchObject.startMinute = startDate.minute;
	searchObject.startSecond = startDate.second;


	return searchObject;
}

function getSelectedLibraries() {
	var libraries = [];

	if ( Object.keys( tlv.libraries ).length == 1 ) {
		libraries.push( Object.keys( tlv.libraries )[ 0 ] );
	}
	else {
		$.each(
			tlv.libraries,
			function( key, value ) {
				var checkbox = $( "#searchLibrary" + key.capitalize() + "Checkbox" );
				if ( checkbox.is( ":checked" ) ) { libraries.push( key ); }
			}
		);
	}


	return libraries;
}

function getStartDate() {
	var date = $("#searchStartDateTimePicker").data("DateTimePicker").date().toDate();


	return getDate(date);
}

function initializeEndDateTimePicker() {
	// default to current date or user defined
	var endDate = new Date();
	if ( tlv.preferences.tlvPreference.endDate ) {
		endDate = new Date( Date.parse( tlv.preferences.tlvPreference.endDate ) );
	}

	endDate.setFullYear( tlv.endYear || endDate.getUTCFullYear() );
	endDate.setDate( tlv.endDay || endDate.getUTCDate() );
	endDate.setMonth( tlv.endMonth - 1  || endDate.getUTCMonth() );
	endDate.setHours(tlv.endHour  || endDate.getUTCHours() );
	endDate.setMinutes( tlv.endMinute || endDate.getUTCMinutes() );
	endDate.setSeconds( tlv.endSecond || endDate.getUTCSeconds() );

	var endDateTimePicker = $( "#searchEndDateTimePicker" );
	endDateTimePicker.datetimepicker({
		date: endDate,
		format: "MM/DD/YYYY HH:mm:ss",
		keyBinds: null
	});
}

function initializeFsgSelect() {
	if ( tlv.fsg ) {
		var fsgSelect = $( "#searchFsgSelect" );
		if ( fsgSelect ) {
			$.each( tlv.fsg.split( "," ), function( index, fsg ) {
				$( "#searchFsgSelect option:contains('" + fsg + "')" ).prop("selected", true);
			});
		}
	}
}

function initializeLibraryCheckboxes() {
	if ( tlv.searchLibraries ) {
		$.each(
			tlv.searchLibraries.split( "," ),
			function( index, library ) {
				var checkbox = $( "#searchLibrary" + library.capitalize() + "Checkbox" );
				checkbox.trigger( "click" );
			}
		);
	}
	else if ( Object.keys( tlv.libraries ).length > 1 ) {
		var checkbox = $( "#searchLibrary" + Object.keys( tlv.libraries )[ 0 ].capitalize() + "Checkbox" );
		checkbox.trigger( "click" );
	}
}

function initializeLocationInput() {
	var location = "";
	location = tlv.preferences.tlvPreference.location || location;
	location = tlv.location || location;
	$( "#searchLocationInput" ).val( location );
}

function initializeMaxCloudCoverInput() {
	var maxCloudCover = 100;
	maxCloudCover = tlv.preferences.tlvPreference.maxCloudCover || maxCloudCover;
	maxCloudCover = tlv.maxCloudCover || maxCloudCover;
	$( "#searchMaxCloudCoverInput" ).val( maxCloudCover );
}

function initializeMaxResultsSelect() {
	var maxResults = 10;
	maxResults = tlv.preferences.tlvPreference.maxResults || maxResults;
	maxResults = tlv.maxResults || maxResults;
	$("#searchMaxResultsSelect option[value = '" + maxResults + "']").prop("selected", true);
}

function initializeMinNiirsInput() {
	var minNiirs = 0;
	minNiirs = tlv.preferences.tlvPreference.minNiirs || minNiirs;
	minNiirs = tlv.minNiirs || minNiirs;
	$( "#searchMinNiirsInput" ).val( minNiirs );
}

function initializeSensorSelect() {
	if ( tlv.sensors || tlv.preferences.tlvPreference.sensor ) {
		var sensors = ( tlv.sensors || tlv.preferences.tlvPreference.sensor ).split( "," );
		var getDistinctSensorsInit = getDistinctSensors;
		getDistinctSensors = function() {
			getDistinctSensorsInit();
			$.each( sensors, function( index, sensor ) {
				$( "#searchSensorSelect option[value='" + sensor + "']" ).prop( "selected", true );
			});
		}
	}
	getDistinctSensors();
}

function initializeStartDateTimePicker() {
	// default to the beginning of the day 30 days prior to the end date
	var endDate = $( "#searchEndDateTimePicker" ).data( "DateTimePicker" ).date().toDate();
	var startDate = new Date( endDate - 30 * 24 * 60 * 60 * 1000 );
	if ( tlv.preferences.tlvPreference.startDate ) {
		startDate = new Date( Date.parse( tlv.preferences.tlvPreference.startDate ) );
	}

	if (tlv.startYear) { startDate.setFullYear(tlv.startYear); }
	if (tlv.startDay) { startDate.setDate(tlv.startDay); }
	if (tlv.startMonth) { startDate.setMonth(tlv.startMonth - 1); }
	startDate.setHours(tlv.startHour ? tlv.startHour : 0);
	startDate.setMinutes(tlv.startMinute ? tlv.startMinute : 0);
	startDate.setSeconds(tlv.startSecond ? tlv.startSecond : 0);

	var startDateTimePicker = $( "#searchStartDateTimePicker" );
	startDateTimePicker.datetimepicker({
		date: startDate,
		format: "MM/DD/YYYY HH:mm:ss",
		keyBinds: null
	});
}

var pageLoadSearch = pageLoad;
pageLoad = function() {
	pageLoadSearch();
	setupSearchMenuDialog();

	if ( tlv.location || tlv.filter || tlv.preferences.tlvPreference.location ) {
		beginSearch();
	}
	else {
		$( "#searchDialog" ).modal( "show" );
	}
}

function placenameSearch( input ) {
	var queryParams = {
		autocomplete: true,
		autocompleteBias: "BALANCED",
		maxInterpretations: 10,
		query: input.val ? input.val() : input,
		responseIncludes: "WKT_GEOMETRY_SIMPLIFIED"
	};

    return $.ajax({
		dataType: 'json',
		url: tlv.geocoderUrl + "?" + $.param( queryParams )
	})
	.always( function() {
		if ( input.val ) {
			input.typeahead( "destroy" );
		}
	})
	.done( function( data ) {
		if ( input.val ) {
			var places = data.interpretations.map( function( place ) {
				return { displayName: place.feature.displayName };
			});

			input.typeahead( null, {
				display: function( suggestion ) {
					input.focus();
					return suggestion.displayName;
				},
				source: function( query, sync ) {
					input.focus();
					return sync( places );
				}
			});
			input.focus();
		}
	})
	.fail( function() {
		if ( input.val ) {
			input.focus();
		}
	});
}

function processImageId( metadata ) {
	var imageId = metadata.image_id;
	if ( !imageId ) {
 		imageId = metadata.title || metadata.filename.replace( /^.*[\\\/]/, "" );
	}

	$.each(
		tlv.imageIdFilters,	function( index, filter ) {
			if ( metadata.filename.match( filter ) ) {
				imageId += RegExp.$1;
			}
		}
	);


	return imageId;
}

function processResults() {
	// ensure that all libraries have been searched
	var searchesComplete = [];
	$.each(
		tlv.libraries,
		function( key, library ) {
			searchesComplete.push( library.searchComplete );
		}
	);

	if ( searchesComplete.indexOf( false ) > -1 ) { return; }
	else {
		hideLoadingDialog();

		var searchResults = [];
		$.each(
			tlv.libraries,
			function( key, library ) {
				searchResults = searchResults.concat( library.searchResults || [] );
			}
		);
		if ( searchResults.length > 0 ) {
			tlv.layers = searchResults.sort( function( a, b ) {
				if ( a.acquisitionDate < b.acquisitionDate ) { return -1; }
				else if ( a.acquisitionDate > b.acquisitionDate ) { return 1; }

				// if the acquisiton dates are the same, sort by entry id
				else if ( a.metadata.entry_id < b.metadata.entry_id ) { return -1; }
				else if ( a.metadata.entry_id > b.metadata.entry_id ) { return 1; }


				return 0;
			});

			var maxResults = $( "#searchMaxResultsSelect" ).val();
			if ( tlv.layers.length > maxResults ) { tlv.layers.splice( maxResults ); }

			// if no location is provided, then just use the center of all the images
			if ( !tlv.location ) {
				var geometries = tlv.layers.map( function( layer ) {
					return new ol.format.GeoJSON().readGeometry( layer.metadata.footprint );
				});

				var extent = new ol.geom.GeometryCollection( geometries ).getExtent();
				tlv.location = ol.extent.getCenter( extent );

				tlv.bbox = tlv.bbox || extent.join( "," );
			}

			tlv.bbox = calculateInitialViewBbox();
			setupTimeLapse();
		}
		else {
			$( "#searchDialog" ).modal( "show" );

			displayErrorDialog("Sorry, we couldn't find anything that matched your search criteria. Maybe ease up on those search constraints a bit?");
		}
	}
}

function searchError() { displayErrorDialog("Uh oh, something went wrong with your search!"); }

function setupSearchMenuDialog() {
	// start with the end date since the start date's default is based on the end date
	initializeEndDateTimePicker();
	initializeStartDateTimePicker();

	initializeFsgSelect();
	initializeLibraryCheckboxes();
	initializeMinNiirsInput();
	initializeMaxCloudCoverInput();
	initializeMaxResultsSelect();
	initializeSensorSelect();

	initializeLocationInput();
}
