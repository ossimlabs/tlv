function adjustLastDaysDate() {

	var endDate = new Date();
	var endDateTimePicker = $( '#searchEndDateTimePicker' );
	endDateTimePicker.data( 'DateTimePicker' ).destroy();

Object.getPrototypeOf($('#endDateTimePicker')).size = function() { return this.length; }; // Workaround for https://github.com/Eonasdan/bootstrap-datetimepicker/issues/1714

	endDateTimePicker.datetimepicker({
		date: endDate,
		format: 'MM/DD/YYYY HH:mm:ss',
		keyBinds: null
	});

	var days = $( '#searchLastDaysInput' ).val();
	var startDate = new Date( endDate.setDate( endDate.getDate() - days ) );
	var startDateTimePicker = $( '#searchStartDateTimePicker' );
	startDateTimePicker.data( 'DateTimePicker' ).destroy();

Object.getPrototypeOf($('#searchStartDateTimePicker')).size = function() { return this.length; }; // Workaround for https://github.com/Eonasdan/bootstrap-datetimepicker/issues/1714

	startDateTimePicker.datetimepicker({
		date: startDate,
		format: 'MM/DD/YYYY HH:mm:ss',
		keyBinds: null
	});
}

function beSearch( be ) {
	var params = {
		filter: tlv.beLookup.columnName + " = '" + be + "'",
		maxFeatures: 1,
		typeName: tlv.beLookup.typeName
	};


	return getWfs( params, tlv.beLookup.url );
}

function beginSearch() {

	var location = getLocation();
	var locationString = $( "#searchLocationInput" ).val();

	if ( !location && locationString != "" ) {
    
		var callbackFunction = function( point ) {
			if ( point ) {
				var getLocationCallback = getLocation;
				getLocation = function() { 
          return point; 
        }
				beginSearch();
				getLocation = getLocationCallback;
        
			} else { // ok so maybe the input was an image ID?

				// needs to be reset so TLV will calculate a position
				tlv.location = '';

				var searchParams = getSearchParams();
				$.each( searchParams.libraries, function( index, library ) {
					tlv.libraries[ library ].searchComplete = false;

					var params = getWfs({ filter: "title LIKE '%" + locationString + "%'" });
					var url = tlv.libraries[ library ].wfsUrl;
					if ( tlv.libraries[ library ].wfsUrlProxy ) {
						params.url = encodeURIComponent( tlv.libraries[ library ].wfsUrlProxy + "?" + $.param( params ) );
						url = tlv.contextPath + "/home/proxy";
					}
					getWfs( params, url )
					.always( function() {
						tlv.libraries[ library ].searchComplete = true;
					} )
					.done( function( data ) {
						if ( data.features.length ) {
							var images = [];
							$.each( data.features, function( index, feature ) {
								var metadata = feature.properties;
								metadata.footprint = feature.geometry || null;

								images.push({
									acquisitionDate: processAcquisitionDate( metadata.acquisition_date ),
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
								processResults();
							}
						}
						else {
							processResults();
						}
					} );
				} );
			}
		}
		convertGeospatialCoordinateFormat( locationString, callbackFunction );

		// if an ajax call is needed to find the location, we don't want an erroneous error messge while we wait
		return;
	} else if ( locationString == '' && !tlv.filter ) {
		displayErrorDialog( 'Ummm, you need to enter a location first.' );
		return;
	}
	var searchParams = getSearchParams();

  // check that location param is what we expect [lon,lat]
  if (!isLatitude(searchParams.location[1]) || !isLongitude(searchParams.location[0])){
    searchParams.inputError = true;
  }

  // added input check 
	if ( searchParams.error || searchParams.inputError ) { 
    
    if(searchParams.error) {
      searchError()
      displayErrorDialog( `${searchParams.error}` ); 
    } else {
      // display error if we have invalid input
      displayErrorDialog( `Something went wrong check search input` );
    }
    
  } else {
		displayLoadingDialog( "We are searching the libraries for imagery... fingers crossed!" );

		var queryParams = getWfs({});

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

					if ( searchParams.maxCloudCover != 100 ) {
						filter += ' AND ';
						filter += '(cloud_cover <= ' + searchParams.maxCloudCover + ' OR cloud_cover IS NULL)';
					}

					//filter += ' AND ';
					//filter += '(entry_id = 0)';

					if ( searchParams.fsgs.length ) {
						filter += ' AND ';
						if ( searchParams.fsgNot ) {
							filter += "(product_id NOT LIKE '%" +
								searchParams.fsgs.map( function( fsg ) {
									return fsg.trim();
								} ).join( "%' AND product_id NOT LIKE'%" ) + "%')";
						}
						else {
							filter += "(product_id LIKE '%" +
								searchParams.fsgs.map( function( fsg ) {
									return fsg.trim();
								} ).join( "%' OR product_id LIKE'%" ) + "%')";
						}
					}

					filter += ' AND ';
					filter += 'INTERSECTS(ground_geom,POINT(' + searchParams.location.join(' ') + '))';

					if (  searchParams.minNiirs != 0 ) {
						filter += ' AND ';
						filter += 'niirs >= ' + searchParams.minNiirs;
					}

					if ( searchParams.sensors.length ) {
						filter += ' AND ';
						filter += "(sensor_id LIKE '%" +
							searchParams.sensors.map( function( sensor ) {
								return sensor.trim();
							} ).join( "%' OR sensor_id LIKE'%" ) + "%')";
					}

					queryParams.filter = filter;

					// only do this when a filter is not supplied
					coverageSearch();
				}

				var data = getWfs( queryParams );
				var url = tlv.libraries[ library ].wfsUrl;
				if ( tlv.libraries[ library ].wfsUrlProxy ) {
					data.url = encodeURIComponent( tlv.libraries[ library ].wfsUrlProxy + "?" + $.param( data ) );
					url = tlv.contextPath + "/home/proxy";
				}

				getWfs( data, url )
				.done( function( data ) {
					var images = [];
					$.each(
						data.features,
						function( index, feature ) {
							var metadata = feature.properties;
							metadata.footprint = feature.geometry || null;

							images.push({
								acquisitionDate: processAcquisitionDate( metadata.acquisition_date ),
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

function checkAllSensors( labelElement ) {
	var checkbox = $( labelElement ).children()[ 0 ];
	var checked = !$( checkbox ).is( ':checked' );
	if ( checked ) {
		$( labelElement ).addClass( 'btn-success' );

		$.each( $( '#searchSensorDiv' ).children(), function( index, label ) {
			$( label ).removeClass( 'active btn-success' );
			$( label ).attr( 'disabled', true );
			$( label ).children().removeClass( 'active btn-success' );
			$( label ).children().attr( 'disabled', true );
		} );
	}
	else {
		$( labelElement ).removeClass( 'btn-success' );

		$.each( $( '#searchSensorDiv' ).children(), function( index, label ) {
			$( label ).removeAttr( 'disabled' );
			$( label ).removeClass( 'active' );
			$( label ).children().removeAttr( 'disabled' );
			$( label ).children().removeClass( 'active' );
		} );

	}

}

function coverageSearch() {
	$( '#coverageTable' ).html( '' );

	if ( !tlv.reachbackUrl ) {
		return;
	}

	var params = getSearchParams();
	if ( !params.location ) {
		var callbackFunction = function( point ) {
			if ( point ) {
				var getLocationCallback = getLocation;
				getLocation = function() { return point; }
				coverageSearch();
				getLocation = getLocationCallback;
			}
		};
		convertGeospatialCoordinateFormat( $( '#searchLocationInput' ).val(), callbackFunction );
		return;
	}

	var data = {
		endDate: params.endYear + '-' + params.endMonth + '-' + params.endDay + 'T' + params.endHour + ':' + params.endMinute + ':' + params.endSecond,
		maxFeatures: 100,
		niirs: params.minNiirs,
		sensors: params.sensors.join( ',' ),
		startDate: params.startYear + '-' + params.startMonth + '-' + params.startDay + 'T' + params.startHour + ':' + params.startMinute + ':' + params.startSecond
	};
	if ( tlv.map ) {
		data.bbox = tlv.map.getView().calculateExtent().join( ',' );
	}
	else {
		var bbox = convertRadiusToBbox( params.location[ 0 ], params.location[ 1 ], 1000 );
		data.bbox = [ bbox.minLon, bbox.minLat, bbox.maxLon, bbox.maxLat ].join( ',' );
	}

	$.ajax({
		data: data,
		url: tlv.reachbackUrl + '/search'
	})
	.done( function( data ) {
		if ( data.length ) {
			var table = document.createElement( 'table' );
			table.className = 'table table-condensed';

			$.each( data, function( index, feature ) {
				var row = table.insertRow( table.rows.length );
				var cell = row.insertCell( row.cells.length );

				var progress = document.createElement( 'div' );
				progress.className = 'progress';
				progress.style = 'margin-bottom: 0px; width: 100%;';
				cell.appendChild( progress );

				var progressBar = document.createElement( 'div' );
				progressBar.className = 'progress-bar progress-bar-warning';
				progressBar.innerHTML = feature.imageId || 'N/A';
				progressBar.style = 'width: 100%; white-space: nowrap';
				progress.appendChild( progressBar );

				progressBar.onclick = function() {
					orderImage( feature, row );
				}
			} );

			$( '#coverageTable' ).html( table );
			coverageStatusCheck();
		}
		else {
			$( '#coverageTable' ).html( "We couldn't find any additional coverage. :(" );
		}
	} );
}

function coverageStatusCheck() {
	$( '#coverageTable' ).find( '.progress-bar-warning' ).each( function( index, div ) {
		var progressBar = div;
		var imageId = progressBar.innerHTML;
		var params = {
			filter: "image_id LIKE '%" + imageId + "%'",
			maxFeatures: 1
		};
		var url = tlv.libraries[ Object.keys( tlv.libraries )[ 0 ] ].wfsUrl;

		getWfs( params, url )
		.done( function( data ) {
			if ( data.totalFeatures ) {
				var imageIds = tlv.layers.map( function( layer ) {
					return layer.imageId
				} );
				if ( imageIds.contains( imageId ) ) {
					progressBar.className = 'progress-bar progress-bar-info';
				}
				else {
					progressBar.className = 'progress-bar progress-bar-success';
				}

				progressBar.prepend( 'View: ' );
				progressBar.onclick = function() {
					window.open( tlv.contextPath + '?' + $.param( params ) );
				}
			}
			else {
				progressBar.className = 'progress-bar progress-bar-danger';
				progressBar.prepend( 'Order: ' );
			}
			progressBar.style.cursor = 'pointer';
		} );

		setTimeout( function() { coverageStatusCheck(); }, 1000 );


		return false;
	} );
}

function demoSearch() {
	if ( tlv.demoLocation ) {
		$( "#searchLocationInput" ).val( tlv.demoLocation );
		beginSearch();
	}
	else {
		displayLoadingDialog( "We are searching the libraries for imagery... fingers crossed!" );
		var library = Object.keys( tlv.libraries )[ 0 ];
		tlv.libraries[ library ].searchComplete = false;

		var params = {
			maxFeatures: 1
		};
		var url = tlv.libraries[ library ].wfsUrl;

		getWfs( params, url )
		.always( function() {
			tlv.libraries[ library ].searchComplete = true;
		} )
		.done( function( data ) {
			var metadata = data.features[ 0 ].properties;
			metadata.footprint = data.features[ 0 ].geometry || null;

			tlv.libraries[ library ].searchResults = [{
				acquisitionDate: processAcquisitionDate( metadata.acquisition_date ),
				imageId: processImageId( metadata ),
				library: library,
				metadata: metadata,
				numberOfBands: metadata.number_of_bands || 1
			}];

			processResults();
		} );
	}
}

function getDate(date) {
	var year = date.getUTCFullYear();

	var month = date.getUTCMonth() + 1;
	month = month < 10 ? "0" + month : month;

	var day = date.getUTCDate();
	day = day < 10 ? "0" + day : day;

	var hour = date.getUTCHours();
	hour = hour < 10 ? "0" + hour : hour;

	var minute = date.getUTCMinutes();
	minute = minute < 10 ? "0" + minute : minute;

	var second = date.getUTCSeconds();
	second = second < 10 ? "0" + second : second;


	return { day: day, hour: hour, minute: minute, month: month, second: second, year: year };
}

function getDistinctFsg() {
	var updateFsgList = function() {
		var fsgs = [];
		$.each( tlv.libraries, function( index, library ) {
		 	fsgs.push( library.fsg || [] );
		});

		var fsgList = $( "#searchFsgList" );
		fsgList.html( "" );
		$.each( [].concat.apply( [], fsgs ).unique().sort(), function( index, fsg ) {
			fsgList.append( "<option value = '" + fsg + "'></option>" );
		});
	}

	$.each( tlv.libraries, function( index, library ) {
		if ( !library.fsg ) {
			$.ajax({
				data: "property=productId",
				dataType: "json",
				url: library.stagerUrl + "/dataManager/getDistinctValues"
			})
			.done( function( data ) {
				library.fsg = data;
				updateFsgList();
				getDistinctFsg();
			})
			.fail( function() {
				library.fsg = [];
				updateFsgList();
				getDistinctFsg();
			});


			return false;
		}
	});
}

function getDistinctSensors() {
	var updateSensorSelect = function() {
		var sensors = [];
		$.each( tlv.libraries, function( index, library ) {
		 	sensors.push( library.sensors || [] );
		});

		var buttonGroup = $( '#searchSensorDiv' );
		buttonGroup.html( '' );
		$.each( [].concat.apply( [], sensors ).unique().sort(), function( index, sensor ) {
			var label = $( document.createElement( 'label' ) );
			label.addClass( 'btn btn-primary' );

			$( label ).click( function() {
				if ( !$( label ).attr( 'disabled' ) ) {
					// this after the click has been hnadled
					if ( label.hasClass( 'active' ) ) {
						label.removeClass( 'btn-success' );
					}
					else {
						label.addClass( 'btn-success' );
					}
				}
			} );

			var input = document.createElement( 'input' );
			input.type = 'checkbox';

			$( label ).append( input );
			$( label ).append( sensor );

			$( buttonGroup ).append( label );
		} );

		var selectedSensors = [];
		if ( tlv.sensors || tlv.preferences.tlvPreference.sensor ) {
			selectedSensors = ( tlv.sensors || tlv.preferences.tlvPreference.sensor )
				.split( ',' ).map( function( sensor ) {
					return  sensor.trim();
				} );

			$.each( selectedSensors, function( index, sensor ) {
				var label = buttonGroup.find( 'label:contains(' + sensor + ')' );
				label.addClass( 'active btn-success' );
			} );
		}
		else {
			var allSensorsLabel = buttonGroup.prev().children()[0];

			if ( buttonGroup.prev().children().hasClass( 'active' ) ) {
				$( allSensorsLabel ).trigger( 'click' );
				$( allSensorsLabel ).trigger( 'click' );
			}
			else {
				$( allSensorsLabel ).trigger( 'click' );
			}
		}
	}

	$.each( tlv.libraries, function( index, library ) {
		if ( !library.sensors ) {
			$.ajax({
				data: "property=sensorId",
				dataType: "json",
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

	var fsgs = $( "#searchFsgInput" ).val();
	searchObject.fsgs = fsgs ? fsgs.split( ',' ) : [];
	searchObject.fsgNot = $( "#searchFsgNotCheckbox" ).hasClass( 'active' ) ? true : false;

	var libraries = getSelectedLibraries();
	if (libraries.length == 0) {
		displayDialog( 'searchDialog' );
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

	var sensors = getSelectedSensors();
	searchObject.sensors = sensors;

	var startDate = getStartDate();
	searchObject.startYear = startDate.year;
	searchObject.startMonth = startDate.month;
	searchObject.startDay = startDate.day;
	searchObject.startHour = startDate.hour;
	searchObject.startMinute = startDate.minute;
	searchObject.startSecond = startDate.second;

  searchObject.inputError = false;
  
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

function getSelectedSensors() {
	var sensors = [];

	$.each( $( '#searchSensorDiv' ).children(), function( index, sensor ) {
		if ( $( sensor ).hasClass( 'active' ) ) {
			sensors.push( $( sensor ).text() );
		}
	} );



	return sensors;
}

function getStartDate() {
	var date = $("#searchStartDateTimePicker").data("DateTimePicker").date().toDate();


	return getDate(date);
}

function getWfs( params, url ) {
	var data = $.extend({
		maxFeatures: 100,
		outputFormat: 'JSON',
		request: 'getFeature',
		service: 'WFS',
		sortBy: 'acquisition_date+D',
		typeName: 'omar:raster_entry',
		version: '1.1.0'
	}, params );


	if ( !url ) {
		return data;
	}
	else {
		return $.ajax({
			data: $.param( data ),
			dataType: "json",
			url: url
		});
	}
}

function handleDataList( inputId ) {
	var inputElement = $( '#' + inputId );

	var dataList = inputElement.next();
	var options = inputElement.attr( "data-options" );
	// if there are no options, store them
	if ( !options ) {
		var optionsArray = [];
		$.each( dataList[ 0 ].options, function( index, option ) {
			optionsArray.push( $( option ).val() );
		} );
		inputElement.attr( "data-options",  optionsArray.join( ',' ) );
	}
	else {
		options = options.split( ',' );
	}


	var prefix = '';
	var userInput = inputElement.val().replace( /^\s+|\s+$/g, '' );
	if ( userInput != inputElement.val() ) {
		var lastCommaIndex = userInput.lastIndexOf( ',' );
		if ( lastCommaIndex != -1 ) {
			prefix = userInput.substr( 0, lastCommaIndex ) + ', ';
		}

		if ( userInput.indexOf( ',' ) > -1 ) {
			dataList.empty();
			$.each( options, function( index, option ) {
				if ( userInput.indexOf( option ) < 0 ) {
					dataList.append( '<option value="' + prefix + option +'">' );
				}
			} );
		}
	}
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
Object.getPrototypeOf($('#searchEndDateTimePicker')).size = function() { return this.length; }; // Workaround for https://github.com/Eonasdan/bootstrap-datetimepicker/issues/1714
	endDateTimePicker.datetimepicker({
		date: endDate,
		format: "MM/DD/YYYY HH:mm:ss",
		keyBinds: null
	});
}

function initializeFsgList() {
	if ( tlv.fsg || tlv.preferences.tlvPreference.fsg ) {
		var fsg = tlv.fsg || tlv.preferences.tlvPreference.fsg;
		$( '#searchFsgInput' ).val( fsg );
	}
	getDistinctFsg();
}

function initializeFsgNot() {
	if ( tlv.fsgNot == "true" ) {
		$( "#searchFsgNotCheckbox" ).trigger( "click" );
	}
}

function initializeLastDaysInput() {
	if ( tlv.lastDays ) {
		$( '#searchLastDaysInput' ).val( tlv.lastDays );
		adjustLastDaysDate();
	}
}

function initializeLibraryCheckboxes() {
	$.each( Object.keys( tlv.libraries ), function( index, library ) {
		var label = $( "#searchLibrary" + library.capitalize() + "Label" );
		label.click( function() {

			if ( !label.hasClass( 'active' ) ) {
				label.addClass( 'btn-success' );
			}
			else {
				label.removeClass( 'btn-success' );
			}
		} );
	} );

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

// checks that lat value is a valid latitude
function isLatitude(lat) {
  return isFinite(lat) && Math.abs(lat) <= 90;
}

// checks that lon value is a valid latitude
function isLongitude(lng) {
  return isFinite(lng) && Math.abs(lng) <= 180;
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

function initializeSensorList() {
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

Object.getPrototypeOf($('#startDateTimePicker')).size = function() { return this.length; }; // Workaround for https://github.com/Eonasdan/bootstrap-datetimepicker/issues/1714

	startDateTimePicker.datetimepicker({
		date: startDate,
		format: "MM/DD/YYYY HH:mm:ss",
		keyBinds: null
	});
}

function orderImage( feature, row ) {
	displayLoadingDialog( 'Ordering image...' );

	$.ajax({
		data: 'id=' + feature.id,
		dataType: "text",
		url: tlv.reachbackUrl + '/order'
	})
	.always( function() {
		hideLoadingDialog();
	} )
	.done( function( data ) {
		var progressBar = $( row ).find( '.progress-bar' )[ 0 ];
		progressBar.innerHTML = feature.imageId + ': Checking in 60 sec...';
		progressBar.onclick = null;
		progressBar.style.cursor = 'auto';

		var orderImageStatusCheck = function( feature, progressBar ) {
			var timeCheck = parseFloat( progressBar.style.width ) / 100 * 60	;
			if ( timeCheck == 0 ) {
				progressBar.innerHTML = feature.imageId + ': Checking...';
				progressBar.style.width = '100%';
				var params = { filter: "filename LIKE '%" + feature.imageId + "%' OR image_id LIKE '" + feature.imageId + "'" };
				var url = tlv.libraries.o2.wfsUrl;
				getWfs( params, url )
				.done( function( data ) {
					if ( data.features.length > 0 ) {
						$( progressBar ).addClass( 'progress-bar-success' );
						$( progressBar ).removeClass( 'progress-bar-danger' );
						progressBar.innerHTML = 'View: ' + feature.imageId;
						progressBar.style.cursor = 'pointer';
						progressBar.onclick = function() {
							window.open( tlv.contextPath + '?' + $.param( params ) );
						}
					}
					else {
						progressBar.innerHTML = feature.imageId + ': Checking in 60 sec...';
						setTimeout( function() { orderImageStatusCheck( feature, progressBar ); }, 1000 );
					}
				} );
			}
			else {
				timeCheck--;
				if ( timeCheck <= 1 ) { timeCheck = 0; }
				progressBar.innerHTML = feature.imageId + ': Checking in ' + Math.floor( timeCheck ) + ' sec...';
				progressBar.style.width = ( timeCheck / 60 * 100 ) + '%';
				setTimeout( function() { orderImageStatusCheck( feature, progressBar ); }, 1000 );
			}
		}
		orderImageStatusCheck( feature, progressBar );
	})
	.fail( function(a, b, c) { console.dir(a); console.dir(b); console.dir(c); } );
}

var pageLoadSearch = pageLoad;
var pageLoad = function() {
	pageLoadSearch();
	setupSearchMenuDialog();

	if ( tlv.location || tlv.filter || tlv.preferences.tlvPreference.location ) {
		hideDialog( 'searchDialog' );
		beginSearch();
	}
	else {
		displayDialog( 'searchDialog' );
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

function processAcquisitionDate( acquisitionDate ) {
	if ( acquisitionDate ) {
		var parsedDate = Date.parse( acquisitionDate.replace( '+0000', 'Z' ) );
		var date = getDate( new Date( parsedDate ) );


		return date.year +  '-' + date.month + '-' + date.day + ' ' + date.hour + ':' + date.minute + ':' + date.second;
	}
	else {
		return 'N/A';
	}
}

function processImageId( metadata ) {
	var imageId = metadata.image_id;
	if ( !imageId ) {
 		imageId = metadata.title || metadata.filename.replace( /^.*[\\\/]/, "" );
	}


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
				if ( a.acquisitionDate > b.acquisitionDate ) { return -1; }
				else if ( a.acquisitionDate < b.acquisitionDate ) { return 1; }

				// if the acquisiton dates are the same, sort by entry id
				else if ( a.metadata.entry_id < b.metadata.entry_id ) { return -1; }
				else if ( a.metadata.entry_id > b.metadata.entry_id ) { return 1; }


				return 0;
			});

			var maxResults = $( "#searchMaxResultsSelect" ).val();
			if ( tlv.layers.length > maxResults ) { tlv.layers.splice( maxResults ); }

			// convert the geometries into WKT
			$.each( tlv.layers, function( index, layer ) {
				var geoJson = new ol.format.GeoJSON();
				var geometry = geoJson.readGeometry( layer.metadata.footprint );
				var wkt = new ol.format.WKT().writeGeometry( geometry );
				layer.metadata.footprint = wkt;
			} );

			// if no location is provided, then just use the center of all the images
			if ( !tlv.location ) {
				var geometries = tlv.layers.map( function( layer ) {
					return new ol.format.WKT().readGeometry( layer.metadata.footprint );
				});

				var extent = new ol.geom.GeometryCollection( geometries ).getExtent();
				tlv.location = ol.extent.getCenter( extent );
				tlv.bbox = tlv.bbox || extent.join( "," );
			}

			tlv.bbox = calculateInitialViewBbox();
			setupTimeLapse();
		}
		else {
			displayDialog( 'searchDialog' );
			$( 'a:contains("Coverage")' ).trigger( 'click' );

			displayErrorDialog( "Sorry, we couldn't find anything that matched your search criteria. Maybe ease up on those search constraints a bit?" );
		}
	}
}

function searchError() {
   displayErrorDialog("Uh oh, something went wrong with your search!"); 
}

function setupSearchMenuDialog() {
	// start with the end date since the start date's default is based on the end date
	initializeEndDateTimePicker();
	initializeStartDateTimePicker();
	initializeLastDaysInput();

	initializeFsgList();
 	initializeFsgNot();
	initializeLibraryCheckboxes();
	initializeMinNiirsInput();
	initializeMaxCloudCoverInput();
	initializeMaxResultsSelect();
	initializeSensorList();

	initializeLocationInput();
}
