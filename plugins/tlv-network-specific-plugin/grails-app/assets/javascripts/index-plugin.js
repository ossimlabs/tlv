var convertGeospatialCoordinateFormatPlugin = convertGeospatialCoordinateFormat;
convertGeospatialCoordinateFormat = function( inputString, callbackFunction ) {
	var location = convertGeospatialCoordinateFormatPlugin( inputString );

	var bePattern = /\d{4}[a-z|\-{1}][a-z|0-9]\d{4}/i;

	if ( location ) {
		if ( callbackFunction ) { callbackFunction( location ); }
		else { return location; }
	}
	else if ( callbackFunction ) {
		displayLoadingDialog( "We're checking our maps for that location... BRB!" );
		if ( inputString.match( bePattern ) && tlv.beLookup.url ) {
			var queryParams = {
				filter: tlv.beLookup.columnName + " = '" + inputString + "'",
				maxFeatures: 1,
				outputFormat: "JSON",
				request: "GetFeature",
				service: "WFS",
				typeName: tlv.beLookup.typeName,
				version: "1.1.0"
			};

			$.ajax({
				dataType: "json",
				error: function( jqXhr, textStatus, errorThrown ) {
					hideLoadingDialog();
				},
				success: function( data ) {
					hideLoadingDialog();

					if ( data.features.length > 0 ) {
						var point = data.features[ 0 ].geometry.coordinates;
						callbackFunction( point );
					}
					else { displayErrorDialog( "We couldn't find that BE. :(" ); }
				},
				url: tlv.beLookup.url + "?" + $.param( queryParams )
			});
		}
		// assume it's a placename
		else {
			var queryParams = {
				autocomplete: true,
				autocompleteBias: "BALANCED",
				maxInterpretations: 1,
				query: inputString,
				responseIncludes: "WKT_GEOMETRY_SIMPLIFIED"
			};

			$.ajax({
				dataType: "json",
				error: function( jqXhr, textStatus, errorThrown ) {
					hideLoadingDialog();
				},
				success: function( data ) {
					hideLoadingDialog();
					if ( data.interpretations.length > 0 ) {
						var center = data.interpretations[ 0 ].feature.geometry.center;
						var point = [ center.lng, center.lat ];
						callbackFunction( point );
					}
					else { displayErrorDialog( "We couldn't find that location. :(" ); }
				},
				url: tlv.geocoderUrl + "?" + $.param( queryParams )
			});
		}
	}
	else { return false; }
}
