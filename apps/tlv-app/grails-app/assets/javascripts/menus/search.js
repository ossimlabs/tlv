function beginSearch() {
	var searchParams = getSearchParams();
	if ( searchParams.error ) { displayErrorDialog( searchParams.error ); }
	else {
		displayLoadingDialog( "We are searching the libraries for imagery... fingers crossed!" );

		tlv.location = searchParams.location;
		$.each(
			searchParams.libraries,
 			function( index, library ) {
				tlv.libraries[ library ].searchLibrary( searchParams );
			}
		);
	}
}

function bookmarkSearchParams() {
	var url = location.origin + tlv.contextPath + "?";

	var searchParams = getSearchParams();
	if ( searchParams ) {
		if ( searchParams.error ) { displayErrorDialog( searchParams.error ); }
		else {
			var bookmarkParams = [];
			$.each(
				searchParams,
				function( i, x ) {
					if ( Array.isArray( x ) ) { bookmarkParams.push( i + "=" + x.join() ); }
					else { bookmarkParams.push( i + "=" + x ); }
				}
			);
			url += bookmarkParams.join( "&" );

			$( "#searchBookmarkHref" ).attr( "href", url );
			$( "#searchBookmarkDialog" ).modal( "show" );
		}
	}
	else { displayErrorDialog( "Uh oh, something went wrong." ); }
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

function getEndDate() {
	var date = $("#searchEndDateTimePicker").data("DateTimePicker").date().toDate();


	return getDate(date);
}

function getLocation() {
	var locationString = $("#searchLocationInput").val() != "" ? $("#searchLocationInput").val() : tlv.defaultLocation;
	var location = convertGeospatialCoordinateFormat(locationString);


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

	var libraries = getSelectedLibraries();
	if (libraries.length == 0) {
		//$( "#searchDialog" ).modal( "show" );
		return { error: "Please select a library, thanks." };
	}
	searchObject.libraries = libraries;

	var location = getLocation();
	if (!location) { return { error: "Sorry, we couldn't interpret that location. :(" }; }
	else { searchObject.location = location; }

	var maxCloudCover = $("#searchMaxCloudCoverInput").val();
	searchObject.maxCloudCover = maxCloudCover;

	var maxResults = $("#searchMaxResultsSelect").val();
	searchObject.maxResults = parseInt(maxResults);

	var minNiirs = $("#searchMinNiirsInput").val();
	searchObject.minNiirs = parseFloat(minNiirs);

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
				var checkbox = $( "#searchLibrary" + value.name.capitalize() + "Checkbox" );
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
	var endDateTimePicker = $("#searchEndDateTimePicker");
	endDateTimePicker.datetimepicker({
		format: "MM/DD/YYYY HH:mm:ss",
		keyBinds: null
	});

	// default to current date or user defined
	var endDate = new Date();
	if (tlv.endYear) { endDate.setFullYear(tlv.endYear); }
	if (tlv.endMonth) { endDate.setMonth(tlv.endMonth - 1); }
	if (tlv.endDay) { endDate.setDate(tlv.endDay); }
	if (tlv.endHour) { endDate.setHours(tlv.endHour); }
	if (tlv.endMinute) { endDate.setMinutes(tlv.endMinute); }
	if (tlv.endSecond) { endDate.setSeconds(tlv.endSecond); }
	endDateTimePicker.data("DateTimePicker").date(endDate);
}

function initializeLibraryCheckboxes() {
	if ( tlv.searchLibraries ) {
		$.each(
			tlv.searchLibraries.split( "," ),
			function( index, library ) { console.dir("#searchLibrary" + library.capitalize() + "Checkbox");
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
	if (tlv.location) {
		$("#searchLocationInput").val(tlv.location);
		$("#searchDialog").modal("hide");
		beginSearch();
	}
	else { $("#searchDialog").modal("show"); }
}

function initializeMaxCloudCoverInput() {
	var maxCloudCover = tlv.maxCloudCover ? tlv.maxCloudCover : 100;
	$("#searchMaxCloudCoverInput").val(maxCloudCover);
}

function initializeMaxResultsSelect() {
	var maxResults = tlv.maxResults ? tlv.maxResults : 10;
	$("#searchMaxResultsSelect option[value = '" + maxResults + "']").prop("selected", true);
}

function initializeMinNiirsInput() {
	var minNiirs = tlv.minNiirs ? tlv.minNiirs : 0;
	$("#searchMinNiirsInput").val(minNiirs);
}

function initializeStartDateTimePicker() {
	var startDateTimePicker = $("#searchStartDateTimePicker");
	startDateTimePicker.datetimepicker({
		format: "MM/DD/YYYY HH:mm:ss",
		keyBinds: null
	});

	// default to the beginning of the day 30 days prior to the end date
	var endDate = $("#searchEndDateTimePicker").data("DateTimePicker").date().toDate();
	var startDate = new Date(endDate - 30 * 24 * 60 * 60 * 1000);
	if (tlv.startYear) { startDate.setFullYear(tlv.startYear); }
	if (tlv.startMonth) { startDate.setMonth(tlv.startMonth - 1); }
	if (tlv.startDay) { startDate.setDate(tlv.startDay); }
	startDate.setHours(tlv.startHour ? tlv.startHour : 0);
	startDate.setMinutes(tlv.startMinute ? tlv.startMinute : 0);
	startDate.setSeconds(tlv.startSecond ? tlv.startSecond : 0);
	startDateTimePicker.data("DateTimePicker").date(startDate);
}

var pageLoadSearch = pageLoad;
pageLoad = function() {
	pageLoadSearch();
	setupSearchMenuDialog();
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
				if ( a.acquisitionDate > b.acquisitionDate ) { return 1; }
				return 0;
			});

			var maxResults = $( "#searchMaxResultsSelect" ).val();
			if ( tlv.layers.length > maxResults ) { tlv.layers.splice( maxResults ); }

			tlv.bbox = calculateInitialViewBbox();
			setupTimeLapse();
		}
		else { displayErrorDialog("Sorry, we couldn't find anything that matched your search criteria. Maybe ease up on those search constraints a bit?"); }
	}
}

function searchError() { displayErrorDialog("Uh oh, something went wrong with your search!"); }

function setupSearchMenuDialog() {
	// start with the end date since the start date's default is based on the end date
	initializeEndDateTimePicker();
	initializeStartDateTimePicker();

	initializeLibraryCheckboxes();
	initializeMinNiirsInput();
	initializeMaxCloudCoverInput();
	initializeMaxResultsSelect();

	initializeLocationInput();
}
