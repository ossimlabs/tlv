function componentToHex( component ) {
    var hex = component.toString( 16 );


    return hex.length == 1 ? "0" + hex : hex;
}

function convertGeospatialCoordinateFormat(inputString, callbackFunction) {
	var bePattern = /\d{4}[a-z|\-{1}][a-z|0-9]\d{4}/i;
	var ddPattern = /(\-?\d{1,2}[.]?\d*)[\s+|,?]\s*(\-?\d{1,3}[.]?\d*)/;
	var dmsPattern = /(\d{1,2})[^\d]*(\d{2})[^\d]*(\d{2}[.]?\d*)[^\d]*\s*([n|N|s|S])[^\w]*(\d{1,3})[^\d]*(\d{2})[^d]*(\d{2}[.]?\d*)[^\d]*\s*([e|E|w|W])/;
	var mgrsPattern = /(\d{1,2})([a-zA-Z])[^\w]*([a-zA-Z])([a-zA-Z])[^\w]*(\d{5})[^\w]*(\d{5})/;

	var coordinateConversion = new CoordinateConversion();

	if (inputString.match(dmsPattern)) {
		var latitude = coordinateConversion.dmsToDd(RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$4);
		var longitude = coordinateConversion.dmsToDd(RegExp.$5, RegExp.$6, RegExp.$7, RegExp.$8);

		if (latitude && longitude) {
			latitude = parseFloat(latitude);
			longitude = parseFloat(longitude);
		}


		if (callbackFunction) { callbackFunction([longitude, latitude]); }
		else { return [longitude, latitude]; }
	}
	else if (inputString.match(ddPattern)) {
		var latitude = RegExp.$1;
		var longitude = RegExp.$2;

		if (latitude && longitude) {
			latitude = parseFloat(latitude);
			longitude = parseFloat(longitude);
		}


		if (callbackFunction) { callbackFunction([longitude, latitude]); }
		else { return [longitude, latitude]; }
	}
	else if ( inputString.match( mgrsPattern ) && inputString.trim().length < 16 ) {
		var location = coordinateConversion.mgrsToDd(RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$4, RegExp.$5, RegExp.$6);


		return convertGeospatialCoordinateFormat(location, callbackFunction);
	}
	else if ( inputString.match( bePattern ) && inputString.trim().length == 10 && tlv.beLookup.url && callbackFunction ) {
		displayLoadingDialog( "We're checking our maps for that location... BRB!" );
        beSearch( inputString )
        .always( function() {
            hideLoadingDialog();
        } )
        .done( function( data ) {
			if ( data.features.length > 0 ) {
				var point = data.features[ 0 ].geometry.coordinates;
				callbackFunction( point );
			}
			else { displayErrorDialog( "We couldn't find that BE. :(" ); }
		} );
	}
	else {
		if ( callbackFunction && tlv.geocoderUrl ) {
			displayLoadingDialog( "We're checking our maps for that location... BRB!" );
            placenameSearch( inputString )
			.always( function() {
				hideLoadingDialog();
			})
			.done( function( data ) {
                var point;
				if ( data.interpretations.length > 0 ) {
					var center = data.interpretations[ 0 ].feature.geometry.center;
					point = [ center.lng, center.lat ];

				}
                callbackFunction( point );
			} );
 		}
		else {
            return false;
        }
	}
}

function convertRadiusToBbox(x, y, radius) {
	/* radius * 1 nautical mile / 1852 meters * 1 minute latitude / 1 nautical mile * 1 deg latitude / 60 minute latitude */
	var deltaLatitude = radius / 1852 / 60;
	var deltaLongitude = radius / 1852 / 60 * Math.cos(Math.abs(y) * Math.PI / 180);


	return { maxLat: y + deltaLatitude, maxLon: x + deltaLongitude, minLat: y - deltaLatitude, minLon: x - deltaLongitude };
}

function copyTextToClipboard( text ) {
    // note this function must be called from a real button click
    var input = document.createElement( "input" );
    input.id = "text";
    input.value = text;
    input.type = "text";
    $( "body" ).append( input );

    input.select();
    document.execCommand( "copy" );

    input.remove();
}

function createDefaultStyle() {
	return new ol.style.Style({
        geometry: function( feature ) {
            var geometry = feature.getGeometry();
            if ( geometry.getType() == "MultiPolygon" ) {
                // Only render label for the widest polygon of a multipolygon
                var polygons = geometry.getPolygons();
                var widest = 0;
                for ( var i = 0, ii = polygons.length; i < ii; ++i ) {
                    var polygon = polygons[ i ];
                    var width = ol.extent.getWidth( polygon.getExtent() );
                    if ( width > widest ) {
                        widest = width;
                        geometry = polygon;
                    }
                }
            }


            return geometry;
        },
        fill: new ol.style.Fill({
            color: "rgba(255, 255, 0, 0)"
        }),
		image: new ol.style.Circle({
			fill: new ol.style.Fill({
                color: "rgba(255, 255, 0, 1)"
            }),
			radius: 5,
            stroke: new ol.style.Stroke({
                color: "rgba(255, 255, 255, 0)",
                lineCap: 'round',
                lineDash: [ 0, 0 ],
                lineDashOffset: 0,
                lineJoin: 'round',
                miterLimit: 10,
                width: 2
            })
		}),
		stroke: new ol.style.Stroke({
			color: "rgba(255, 255, 0, 1)",
            lineCap: 'round',
            lineDash: [ 0, 0 ],
            lineDashOffset: 0,
            lineJoin: 'round',
            miterLimit: 10,
            width: 2
 		}),
        text: new ol.style.Text({
            fill: new ol.style.Fill({
                color: "rgba(255, 255, 0, 1)"
            }),
            offsetX: 0,
            offsetY: 0,
    	    scale: 1,
    	    rotateWithView: true,
    	    rotation: 0
        })
	});
}

function disableMenuButtons() {
	var menuButtons = $( ".navbar-header" )[ 0 ].children;
	for ( var i = 2; i < menuButtons.length - 2; i++ ) { $( menuButtons[ i ] ).hide(); }

	var menuButtons = $( ".navbar-nav" )[ 0 ].children;
	for ( var i = 2; i < menuButtons.length - 2; i++ ) { $( menuButtons[ i ] ).hide(); }
}

function displayDialog( dialog ) {
	var header = $( "#" + dialog + " .modal-header" );
	var paddingHeight = header.offset() ? header.offset().top : 0;
	var headerHeight = header.offset() ? header.outerHeight() : 0;
	var footerHeight = $( "#" + dialog + " .modal-footer" ).outerHeight();

	var body = $( "#" + dialog + " .modal-body" );
	body.css( "max-height", "" );
	body.css( "overflow-y", "" );

	var maxBodyHeight = ( $( window ).height() - paddingHeight - headerHeight - footerHeight ) * 0.9;
	var bodyIsTooTall = body.outerHeight() > maxBodyHeight;
	body.css( "max-height", bodyIsTooTall ? maxBodyHeight : "" );
	body.css( "overflow-y", bodyIsTooTall ? "auto" : "" );
}

function displayInfoDialog( message ) {
    var infoDialog = $( "#infoDialog" );
    infoDialog.html( message );
	infoDialog.fadeIn();
    setTimeout( function() {
        if ( infoDialog.html() == message ) {
            $( "#infoDialog" ).fadeOut();
        }
    }, 5000 );
}

function displayErrorDialog( message ) {
	var messageDiv = $( '#errorDialog' ).children()[ 1 ];
	$( messageDiv ).html( message );
	$( '#errorDialog' ).show();
    setTimeout( function() { $( '#errorDialog' ).fadeOut(); }, 5000 );
}

function displayLoadingDialog(message) {
	$("#loadingDialog").modal("show");
	$("#loadingDialogMessageDiv").html(message);
}

function displayNavbar() {
	$( ".navbar" ).css( "opacity", 1 );
	if ( tlv.hideNavbar ) { clearTimeout( tlv.hideNavbar ); }
    tlv.hideNavbar = setTimeout( function() { $( ".navbar" ).css( "opacity", 0 ); }, 5000 );
}

function enableMenuButtons() {
	var menuButtons = $(".navbar-header")[0].children;
	for (var i = 1; i < menuButtons.length - 1; i++) { $(menuButtons[i]).show(); }

	var menuButtons = $(".navbar-nav")[0].children;
	for (var i = 1; i < menuButtons.length; i++) { $(menuButtons[i]).show(); }
}

function enableKeyboardShortcuts() {
	$( document ).on( "keydown", function( event ) {
		// only if a modal is not open
		if ( !$( ".modal-backdrop" ).is( ":visible" ) ) {

			var keyCode = event.keyCode;
			switch( keyCode ) {
				// space bar
				case 32: $( "button[title='Play/Stop']" ).trigger( "click" ); break;
				// left arrow key
				case 37:
                    if ( event.shiftKey ) {
                        var degrees = tlv.map.getView().getRotation() * 180 / Math.PI - 1;
                        tlv.map.getView().setRotation( degrees * Math.PI / 180 );
                    }
                    else {
                        changeFrame( "rewind" );
                    }
                    break;
                // up arrow key
                case 38: tlv.map.getView().setZoom( tlv.map.getView().getZoom() + 1 );
				// right arrow key
				case 39:
                    if ( event.shiftKey ) {
                        var degrees = tlv.map.getView().getRotation() * 180 / Math.PI + 1;
                        tlv.map.getView().setRotation( degrees * Math.PI / 180 );
                    }
                    else {
                        changeFrame( "fastForward" );
                    }
                    break;
                // down arrow key
                case 40: tlv.map.getView().setZoom( tlv.map.getView().getZoom() - 1 );
				// delete key
				case 46: deleteFrame(  tlv.currentLayer ); break;
			}
		}
	});
}

function groundToImagePoints( coordinates, layer, callback ) {
    return $.ajax({
        contentType: 'application/json',
        data: JSON.stringify({
            'entryId': layer.metadata.entry_id || 0,
            'filename': layer.metadata.filename,
            'pointList': coordinates.map( function( coordinate ) {
				return { 'lat': coordinate[ 1 ], 'lon': coordinate[0] };
			}),
        }),
        dataType: 'json',
        type: "post",
        url: tlv.libraries[ layer.library ].mensaUrl + "/groundToImagePoints"
    })
    .done( function( data ) {
        var pixels = data.data.map(
            function( point ) { return [ point.x, point.y ] }
        );
        callback( pixels, layer, data.data );
    } );
}

function hideDialog(dialog) {
	var dialogBody = $("#" + dialog + " .modal-body");
	dialogBody.css("max-height", "");
	dialogBody.css("overflow-y", "");
}

function hideErrorDialog() { $("#errorDialog").hide(); }

function hideLoadingDialog() { $("#loadingDialog").modal("hide"); }

function imagePointsToGround( pixels, layer, options, callback ) {
    if ( typeof options == 'function' ) {
        callback = options;
    }

    return $.ajax({
        contentType: 'application/json',
        data: JSON.stringify({
            'entryId': 0,
            'filename': layer.metadata.filename,
            'pointList': pixels.map( function( pixel ) {
                return { 'x': pixel[ 0 ], 'y': pixel[ 1 ] };
            } ),
            'pqeEllipseAngularIncrement': 10,
            'pqeEllipsePointType' : 'array',
            'pqeIncludePositionError': true,
            'pqeProbabilityLevel' : options.pqeProbabilityLevel || 0.9,
        }),
        type: 'post',
        url: tlv.libraries[ layer.library ].mensaUrl + '/imagePointsToGround'
    })
    .done( function( data ) {
        var coordinates = data.data.map(
            function( point ) { return [ point.lon, point.lat ]; }
        );
        callback( coordinates, layer, data.data );
    } );
}

function initializeLoadingDialog() {
	$("#loadingDialog").modal({
		keyboard: false,
		show: false
	});
}

function rgbToHex( red, green, blue ) {
	return "#" + componentToHex( red ) + componentToHex( green ) + componentToHex( blue );
}
