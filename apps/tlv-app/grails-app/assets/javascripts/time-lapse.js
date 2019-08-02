function aFeatureHasBeenSelected(feature, event) {}

function buildSummaryTable() {
    var table = $( "#timeLapseSummaryTable" )[ 0 ];

    for ( var i = table.rows.length - 1; i >= 0; i-- ) { table.deleteRow( i ); }

    var row = table.insertRow( 0 );
    $( row ).css( "white-space", "nowrap" );
    var cell = row.insertCell( row.cells.length );
    row.insertCell( row.cells.length );
    $.each(
        [ "Image ID", "Acquisition Date", "NIIRS", "Az.", "El.", "Sun Az.", "Sun El.", "Entry", "Library" ],
        function( index, value ) {
            var cell = row.insertCell( row.cells.length );
            $( cell ).append( value );
        }
    );

    $.each(
        tlv.layers,
        function( index, layer ) {
            row = table.insertRow( table.rows.length );
            $( row ).click( function() {
                changeFrame( index );
            } );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( index + 1 );

            cell = row.insertCell( row.cells.length );
            $( cell ).css( "white-space", "nowrap" );
            var downButton = "<span class = 'glyphicon glyphicon-arrow-down' title = 'Move Down'></span>";
            var upButton = "<span class = 'glyphicon glyphicon-arrow-up' title = 'Move Up'></span>";

            if ( index == 0 ) {
                $( cell ).append( "<a href = javascript:moveLayerDownInStack(" + index + ");buildSummaryTable();>" + downButton + "</a>" );
            }
            else if ( index == tlv.layers.length - 1 ) { $( cell ).append( "<a href = javascript:moveLayerUpInStack(" + index + ");buildSummaryTable();>" + upButton + "</a>" ); }
            else {
                $( cell ).append( "<a href = javascript:moveLayerUpInStack(" + index + ");buildSummaryTable();>" + upButton + "</a>" );
                $( cell ).append( "<a href = javascript:moveLayerDownInStack(" + index + ");buildSummaryTable();>" + downButton + "</a>" );
            }

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.imageId );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.acquisitionDate + "z" );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.metadata.niirs );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.metadata.azimuth_angle ? layer.metadata.azimuth_angle.toFixed( 2 ) : '' );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.metadata.grazing_angle ? layer.metadata.grazing_angle.toFixed( 2 ) : '' );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.metadata.sun_azimuth ? layer.metadata.sun_azimuth.toFixed( 2 ) : '' );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.metadata.sun_elevation ? layer.metadata.sun_elevation.toFixed( 2 ) : '' );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.metadata.entry_id );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.library );

            cell = row.insertCell( row.cells.length );
            var span = document.createElement( "span" );
            span.className = "glyphicon glyphicon-trash";

            var deleteButton = document.createElement( "button" );
            deleteButton.className = "btn btn-primary btn-xs";
            deleteButton.onclick = function() {
                deleteFrame( index );
                buildSummaryTable();
            };
            deleteButton.appendChild( span );
            $( cell ).append( deleteButton );
        }
    );
}

function calculateInitialViewBbox() {
        var bbox;
        if ( typeof tlv.bbox == "string" ) {
                var array = tlv.bbox.split( "," ).map( Number );
                bbox = { minLon: array[ 0 ], minLat: array[ 1 ], maxLon: array[ 2 ], maxLat: array[ 3 ] };
        }
        else { bbox = convertRadiusToBbox( tlv.location[ 0 ], tlv.location[ 1 ], 1000 ); }


        return [ bbox.minLon, bbox.minLat, bbox.maxLon, bbox.maxLat ];
}

function changeFrame( param ) {
	var layer = tlv.layers[ tlv.currentLayer ];
	layer.mapLayer.setOpacity( layer.keepVisible ? layer.opacity : 0 );
	layer.mapLayer.setVisible( layer.keepVisible );

	if ( param === "fastForward" ) { tlv.currentLayer = getNextFrameIndex(); }
	else if ( param === "rewind" ) { tlv.currentLayer = getPreviousFrameIndex(); }
	else if ( typeof param === "number" ) { tlv.currentLayer = param; }

	layer = tlv.layers[ tlv.currentLayer ];
	layer.mapLayer.setVisible( true );
	layer.mapLayer.setOpacity( layer.opacity );

	tlv.map.renderSync();

	updateScreenText();
	updateTileLoadingProgressBar();
}

function deleteFrame( index ) {
    var layer = tlv.layers[ index ];
	if ( index && index != tlv.currentLayer ) {

		tlv.layers.splice( index, 1 );
		if ( tlv.currentLayer > tlv.layers.length - 1 ) { tlv.currentLayer = tlv.layers.length - 1; }
		changeFrame( "rewind" );
		changeFrame( "fastForward" );
	}
	else {
		changeFrame( "rewind" );
		var nextFrameIndex = getNextFrameIndex();
		tlv.layers.splice( nextFrameIndex, 1 );

		if ( tlv.currentLayer > tlv.layers.length - 1 ) { tlv.currentLayer = tlv.layers.length - 1; }
		changeFrame( "fastForward" );
	}
    tlv.map.removeLayer( layer.imageLayer );
    tlv.map.removeLayer( layer.tileLayer );
}

function geoJump(location) {
	var point = convertGeospatialCoordinateFormat(
		location,
		function(point) {
			if (point) { tlv.map.getView().setCenter( point ); }
		}
	);
}

function getCurrentDimension() {
	var dimension = $("#dimensionsSelect").val();


	return parseInt(dimension, 10);
}

function getMapCenterText( format ) {
    var center = tlv.map.getView().getCenter();
	var convert = new CoordinateConversion();
	var lat = center[ 1 ];
	var lon = center[ 0 ];

    switch ( format ) {
        case "dms":
            return convert.ddToDms( lat, "lat" ) + " " + convert.ddToDms( lon, "lon" );
            break;
        case "mgrs":
            return convert.ddToMgrs( lat, lon );
            break;
        default:
            return latitude.toFixed( 6 ) + ", " + longitude.toFixed( 6 );
    }
}

function getNextFrameIndex() { return tlv.currentLayer >= tlv.layers.length - 1 ? 0 : tlv.currentLayer + 1; }

function getPreviousFrameIndex() { return tlv.currentLayer <= 0 ? tlv.layers.length - 1 : tlv.currentLayer - 1; }

function getTimeToAdjacentImage( layers, layerIndex, adjacency ) {
	var layerIndex2 = null;
	if ( adjacency == "previous" && layerIndex > 0 ) { layerIndex2 = layerIndex - 1; }
	else if ( adjacency == "next" && layerIndex < layers.length - 1 ) { layerIndex2 = layerIndex + 1; }

	if ( typeof layerIndex2 == "number" ) {
		var date1 = layers[ layerIndex ].acquisitionDate;
        date1 = date1 ? new Date( Date.parse( date1.replace( /\s/, "T" ) ) ) : null;
		var date2 = layers[ layerIndex2 ].acquisitionDate;
        date2 = date2 ? new Date( Date.parse( date2.replace( /\s/, "T" ) ) ) : null;

		if ( date1 && date2 ) {
			var timeDifference = Math.abs( date2 - date1 );
			var seconds = parseInt( timeDifference / 1000 );

			var minutes = parseInt( seconds / 60 );
			if ( minutes > 0 ) { seconds -= minutes * 60; }

			var hours = parseInt( minutes / 60 );
			if ( hours > 0 ) { minutes -= hours * 60; }

			var days = parseInt( hours / 24 );
			if ( days > 0 ) { hours -= days * 24; }

			var months = parseInt( days / 30 );
			if ( months > 0 ) { days -= months * 30; }

			var years = parseInt( months / 12 );
			if ( years > 0 ) { months -= years * 12; }


			if ( years > 0 ) {
				if ( months > 0 ) { return "~" + years + "yr., " + months + " mon."; }
				else { return "~" + years + "yr."; }
			}
			else if ( months > 0 ) {
				if ( days > 0 ) { return "~" + months + "mon., " + days + "dy."; }
				else { return "~" + months + "mon."; }
			}
			else if ( days > 0 ) {
				if ( hours > 0 ) { return "~" + days + "dy., " + hours + "hr."; }
				else { return "~" + days + "dy."; }
			}
			else if ( hours > 0 ) {
				if ( minutes > 0 ) { return "~" + hours + "hr., " + minutes + "min."; }
				else { return "~" + hours + "hr."; }
			}
			else if ( minutes > 0 ) {
				if ( seconds > 0 ) { return "~" + minutes + "min., " + seconds + "sec."; }
				else { return "~" + minutes + "min."; }
			}
			else if ( seconds > 0 ) { return "~" + seconds + "sec."; }
			else { return "0 sec."; }
		}
	}
	else { return false; }
}

function moveLayerDownInStack( layerIndex ) {
	var nextLayerIndex = layerIndex + 1;
	if ( nextLayerIndex < tlv.layers.length ) {
		var thisLayer = tlv.layers[ layerIndex ];
		tlv.layers[ layerIndex ] = tlv.layers[ nextLayerIndex ];
		tlv.layers[ nextLayerIndex ] = thisLayer;

        var baseLayers = Object.keys( tlv.baseLayers ).length;
        var collection = tlv.map.getLayers();
        var totalLayers = collection.getArray().length;
        var removeIndex = totalLayers - baseLayers - 2 * layerIndex;
        var imageLayerElement = collection.removeAt( removeIndex );
        var tileLayerElement = collection.removeAt( removeIndex );

        var insertIndex = totalLayers - 2 * nextLayerIndex - 2;
        collection.insertAt( insertIndex, tileLayerElement );
        collection.insertAt( insertIndex, imageLayerElement );
	}

	changeFrame( "fastForward" );
	changeFrame( "rewind" );

	if ( $( "#summaryTableDialog" ).hasClass( "in" ) ) { buildSummaryTable(); }
}

function moveLayerUpInStack( layerIndex ) {
	var previousLayerIndex = layerIndex - 1;
	if ( previousLayerIndex >= 0 ) {
		var thisLayer = tlv.layers[ layerIndex ];
		tlv.layers[ layerIndex ] = tlv.layers[ previousLayerIndex ];
		tlv.layers[ previousLayerIndex ] = thisLayer;

        var baseLayers = Object.keys( tlv.baseLayers ).length;
        var collection = tlv.map.getLayers();
        var totalLayers = collection.getArray().length;
        var removeIndex = totalLayers - baseLayers - 2 * layerIndex;
        var imageLayerElement = collection.removeAt( removeIndex );
        var tileLayerElement = collection.removeAt( removeIndex );

        var insertIndex = totalLayers - 2 * previousLayerIndex;
		collection.insertAt( insertIndex, tileLayerElement );
        collection.insertAt( insertIndex, imageLayerElement );
	}


	changeFrame( "fastForward" );
	changeFrame( "rewind" );

	if ( $( "#summaryTableDialog" ).hasClass( "in" ) ) { buildSummaryTable(); }
}

function orientDevice(event) {
	if ( getCurrentDimension() == 2 ) {
		if ( event.alpha ) { tlv.map.getView().rotate( ( 275 + event.alpha ) * Math.PI / 180 ); }
	}
	else {
		if ( event.alpha && event.beta && event.gamma ) {
            var beta = event.beta;
            if ( window.innerHeight < window.innerWidth ) {
                    beta = -event.gamma;
            }
			tlv.globe.getCesiumScene().camera.setView({
				orientation: {
					heading: ( 90 - event.alpha ) * Math.PI / 180,
					pitch: ( beta - 90 ) * Math.PI / 180
				}
			});
		}
	}
}

function orientationToggle() {
	if ($("#orientationSelect").val() == "auto") {
		if (window.DeviceOrientationEvent) { window.addEventListener("deviceorientation", orientDevice, false); }
		else {
			$("#orientationSelect").val("manual");
			displayErrorDialog("Sorry, your device doesn't support device orientation. :(");
		}
	}
	else { window.removeEventListener("deviceorientation", orientDevice, false); }
}

var pageLoadTimeLapse = pageLoad;
pageLoad = function() {
    var bannersHeight = $( ".banner" ).height() + $( ".security-classification" ).height();
    $( "#navigationMenu" ).css( "padding-top", bannersHeight );

	pageLoadTimeLapse();

	if (tlv.layers) {
		hideDialog( 'searchDialog' );
		tlv.bbox = calculateInitialViewBbox();
		setupTimeLapse();
	}

    if ( tlv.orientation == "auto" ) {
		tlv.orientation = null;
		$( "#orientationSelect" ).val( "auto" );
		orientationToggle();
	}
}

function playStopTimeLapse(button) {
	var className = button.className;

	$(button).removeClass(className);
	if (className.contains("play")) {
		playTimeLapse();
		className = className.replace("play", "stop");
	}
	else {
		stopTimeLapse();
		className = className.replace("stop", "play");
	}
	$(button).addClass(className);
}

function playTimeLapse() {
	changeFrame("fastForward");
    if ( tlv.timeLapseAdvance ) {
        clearTimeout( tlv.timeLapseAdvance );
    }
	tlv.timeLapseAdvance = setTimeout("playTimeLapse()", 1000);
}

function reverseOrder() {
	tlv.layers.reverse();
	changeFrame('rewind');
	changeFrame('fastForward');
}

function setupTimeLapse() {
	setupMap();
	addBaseLayersToTheMap();

	if ( tlv.reverseChronological == "true" ) { tlv.layers.reverse(); }
	// add layers to the map
    tlv.layers.reverse();
	$.each( tlv.layers, function( index, layer ) {
	   layer.keepVisible = layer.keepVisible || false;
		addLayerToTheMap( layer );
	});
    //tlv.layers.reverse();
	tlv.currentLayer = 0;

    tlv.map.getView().fit( tlv.bbox, { nearest: true } );

	// register map listeners
	tlv.map.on("moveend", theMapHasMoved);
	tlv.map.on("pointermove", function(event) {
		var feature = tlv.map.forEachFeatureAtPixel(event.pixel, function(feature, layer) { return feature; });
		if (feature) { aFeatureHasBeenSelected(feature, event); }
	});

	tlv.layers[0].mapLayer.setVisible(true);
	tlv.layers[0].mapLayer.setOpacity(1);

	updateScreenText();
}

function stopTimeLapse() { clearTimeout( tlv.timeLapseAdvance ); }

function updateAcquisitionDate() {
	var acquisitionDate = tlv.layers[ tlv.currentLayer ].acquisitionDate;
	if (acquisitionDate) {
		var timeToNextImage = getTimeToAdjacentImage( tlv.layers, tlv.currentLayer, "next" );
		var timeToPreviousImage = getTimeToAdjacentImage( tlv.layers, tlv.currentLayer, "previous" );
        $( '[id=acquisitionDateDiv]' ).html(
			(timeToPreviousImage ? timeToPreviousImage + " <- " : "") +
			acquisitionDate + (acquisitionDate != "N/A" ? "z" : "") +
			(timeToNextImage ? " -> " + timeToNextImage : "")
		);
	}
	else { $( '[id=acquisitionDateDiv]' ).html( "N/A" ); }
}

function updateImageId() {
	var layer = tlv.layers[ tlv.currentLayer ];
	var libraryLabel = tlv.libraries[ layer.library ].label;
    var text = Object.keys( tlv.libraries ).length > 1 ? libraryLabel + ": " : "";

    var imageId = layer.imageId;
    if ( layer.metadata.product_id ) {
        imageId += ' (' +  layer.metadata.product_id + ')';
    }
    $( '[id=imageIdDiv]').html( text + layer.imageId );
}

function updateMapSize() {
	if ( tlv.map ) {
		var windowHeight = $( window ).height();
		var bannersHeight = $( ".banner" ).height() + $( ".security-classification" ).height();
		var tileLoadProgressBarHeight = $( "#tileLoadProgressBar" ).height();
		var mapHeight = windowHeight
			- bannersHeight
			- tileLoadProgressBarHeight;
		$( "#map" ).height( mapHeight );
		tlv.map.updateSize();
	}
}

function updatePqe( pixel ) {
    var options = { pqeProbabilityLevel: $( '#pqeProbabilityInput' ).val() };
    imagePointsToGround( [ pixel ], tlv.layers[ tlv.currentLayer ], options,  function( coordinates, layer, info ) {
        var pqe = info[ 0 ].pqe;

        var table = document.createElement( 'table' );
        table.className = 'table table-condensed';

        for ( var i = 0; i < 2; i++ ) {
            var row = table.insertRow( table.rows.length );
            $.each( [
                { label: 'HAE: ', value: info[ 0 ].hgt.toFixed( 2 ), units: 'm' },
                { label: 'Linear Err.', value: pqe.pqeValid ? pqe.LE.toFixed( 2 ) : 'N/A', units: 'm' },
                { label: 'Semi-Maj. Axis', value: pqe.pqeValid ? pqe.SMA.toFixed( 2 ): 'N/A', units: 'm' },
                { label: 'Semi-Min. Axis', value: pqe.pqeValid ? pqe.SMI.toFixed( 2 ) : 'N/A', units: 'm' },
                { label: 'SMA Azimuth', value: pqe.pqeValid ? pqe.AZ.toFixed( 2 ) : 'N/A', units: 'deg' }
            ], function( index, value ) {
                var cell = row.insertCell( row.cells.length );
                var html = i == 0 ? '<b>' + value.label + '</b>' : value.value + ' ' + value.units;
                cell.innerHTML = html;
            } );
        }

        for ( var i = 0; i < 2; i++ ) {
            var row = table.insertRow( table.rows.length );
            $.each( [
                { label: 'MSL: ', value: info[ 0 ].hgtMsl.toFixed( 2 ), units: 'm' },
                { label: 'Circular Err.', value: pqe.pqeValid ? pqe.CE.toFixed( 2 ) : 'N/A', units: 'm<sup>2</sup>' },
                { label: 'Projection Type', value: pqe.pqeValid ? pqe.projType : 'N/A', units: '' },
                { label: 'Surface Name', value: pqe.pqeValid ? pqe.surfaceName : 'N/A', units: '' },
                { label: 'Probability', value: '', units: '' }
            ], function( index, value ) {
                var cell = row.insertCell( row.cells.length );
                var html = i == 0 ? '<b>' + value.label + '</b>' : value.value + ' ' + value.units;
                cell.innerHTML = html;
            } );
            if ( i == 1 ) {
                var input = document.createElement( 'input' );
                input.className = 'form-control input-sm';
                input.id = 'pqeProbabilityInput';
                input.onchange = function() {
                    updatePqe( pixel );
                };
                input.step = 0.1;
                input.type = 'number';
                input.value = pqe.probabilityLevel;
                var cell = row.cells[ row.cells.length - 1 ];
                cell.appendChild( input );
            }
        }

        $( '#pqeDiv' ).html( table );
        var row = table.rows[ table.rows.length - 1 ];
        var cell = row.cells[ row.cells.length - 1 ];
        $( cell ).find( 'input' ).focus();
    } );
}

function getReleasability() {
    var releasability = null;
    try {
        releasability = eval( tlv.releasability );
    }
    catch ( exception ) { /* do nothing */ }


	return releasability || '' ;
}

// Updates the security banner to match the current image security-classification
function updateSecurityBanner() {

	var current_banner = '#currentClassification';
	var default_banner = '#defaultClassification';
    var securityClassificationBanner = $( '.security-classification' );

	var releasability = getReleasability();

	$( default_banner ).hide();
	$( current_banner ).show();

	securityClassificationBanner.removeClass( 'unclassified' );
	securityClassificationBanner.removeClass( 'secret' );
	securityClassificationBanner.removeClass( 'top-secret' );

	switch( tlv.layers[ tlv.currentLayer ].metadata.security_classification ) {
		case "U":
		case "UNCLASSIFIED":
			addStyleAndClassification( current_banner, "unclassified", releasability );
			break;
		case "S":
		case "SECRET":
			addStyleAndClassification( current_banner, "secret", releasability );
			break;
		case "TS":
		case "TOP-SECRET":
			addStyleAndClassification( current_banner, "top-secret", releasability );
			break;
		default:
			$( default_banner ).show();
			$( current_banner ).hide();
	}
}

function addStyleAndClassification( banner, classification, releasability ) {
	$( '.security-classification' ).addClass( classification );
	$( banner ).text( classification.toUpperCase() + releasability );
}

function updateScreenText() {
	updateImageId();
	updateAcquisitionDate();
	updateTlvLayerCount();
	updateSecurityBanner();
}

function updateTlvLayerCount() {
	var currentCount = tlv.currentLayer + 1;
    $( '.tlvLayerCountSpan' ).html( currentCount + '/' + tlv.layers.length );
}

function zoomToFullResolution() {
	var metadata = tlv.layers[ tlv.currentLayer ].metadata;
	var gsdX = metadata.gsdx;
	var gsdY = metadata.gsdy;
	var gsd = Math.sqrt( Math.pow( gsdX, 2 ) + Math.pow( gsdY, 2 ) );
	var resolution = gsd / 6371008.8 * 180 / Math.PI;
	tlv.map.getView().setResolution( resolution );
}

function zoomToMaximumExtent() {
	var footprint = tlv.layers[ tlv.currentLayer ].metadata.footprint;
	var polygon = new ol.format.WKT().readGeometry( footprint );
	var extent = polygon.getExtent();
	tlv.map.getView().fit( extent, { nearest: true } );
}
