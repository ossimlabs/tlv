function cleanup3Disa() {
    var map = tlv[ "3disa" ].map;
    if ( map ) { map.setTarget( null ); }
    tlv[ "3disa" ] = {};
}

var disableMenuButtons3Disa = disableMenuButtons;
disableMenuButtons = function() {
    disableMenuButtons3Disa();

    var menuButtons = $(".navbar-nav")[0].children;
    $.each(
        menuButtons,
        function( index, button ) {
            if ( $( button ).text().contains( "3DISA" ) ) { $( button ).show() }
        }
    );
}

function generateDem() {
    cleanup3Disa();
    tlv[ "3disa" ].job = { demGeneration: true };

    buildSourceSelectionTable();
    getSourceSelectionCandidates();
    $( "#sourceSelectionDialog" ).modal( "show" );

    $( "#selectImagesButton" ).unbind();
    $( "#selectImagesButton" ).click( function() {
        setupTiePointSelectionDialog();
        initializeTiePointMapViews();
    });
}

function getJobDetails( jobId ) {
    displayLoadingDialog( "Getting job details..." );
    return $.ajax({
        data: "job=" + jobId,
        dataType: "json",
        success: function( data ) { hideLoadingDialog(); },
        url: tlv.contextPath + "/threeDisa/listJobs"
    });
}

function getImageMetadata( filenames ) {
    displayLoadingDialog( "Getting metadata for the stack..." );
    var searchParams = {
        filter: "filename LIKE '" + filenames.join( "' OR filename LIKE '" ) + "'",
        location: tlv.location,
        maxResults: 100
    };
    return $.ajax({
        data: "searchParams=" + encodeURIComponent( JSON.stringify( searchParams ) ),
        dataType: "json",
        success: function(data) { hideLoadingDialog(); },
        type: "post",
        url: tlv.contextPath + "/search/searchLibrary"
    });
}

var pageLoad3Disa = pageLoad;
pageLoad = function() {
	pageLoad3Disa();

    if ( tlv[ "3disa" ] ) {
        $("#searchDialog").modal("hide");

        var json = JSON.parse( tlv[ "3disa" ] );
        getJobDetails( json.jobId ).then(
            function( data ) {
                // get the bbox and center
                tlv[ "3disa" ] = data[ 0 ];
                var bbox = tlv[ "3disa" ].bbox;
                tlv.bbox = new ol.format.WKT().readGeometry( bbox ).getExtent();

                tlv.location = [
                    ( tlv.bbox[ 0 ] + tlv.bbox[ 2 ] ) / 2,
                    ( tlv.bbox[ 1 ] + tlv.bbox[ 3 ] ) / 2
                ];

                var filenames = tlv[ "3disa" ].triangulation.images.map( function( image ) { return image.filename; } );
                getImageMetadata( filenames ).then(
                    function( data ) {

                        tlv.layers = data.layers;
                        setupTimeLapse();

                        switch( json.view ) {
                            case "tiePoints":
                                $.each(
                                        tlv[ "3disa" ].triangulation.images,
                                        function( index, image ) {
                                            tlv.layers[ index ].sensorModel = image.sensorModel;
                                        }
                                );
                                setupTiePointSelectionDialog( tlv.layers );

                                $.each(
                                    tlv[ "3disa" ].triangulation.images,
                                    function( index, image ) {
                                        var features = [];
                                        $.each(
                                            image.tiePoints,
                                            function( index, tiePoint ) {
                                                var point = new ol.geom.Point([ tiePoint.x, tiePoint.y ]);
                                                var feature = new ol.Feature( point );
                                                var style = createTiePointStyle();
                                                var textStyle = style.getText();
                                                textStyle.setText( tiePoint.label );
                                                style.setText( textStyle );
                                                feature.setStyle( style );
                                                features.push( feature );
                                            }
                                        );

                                        var layer =  $.grep( tlv[ "3disa" ].layers,
                                            function( layer ) {
                                                return layer.metadata.filename == image.filename;
                                            }
                                        )[ 0 ];
                                        layer.vectorLayer.getSource().addFeatures( features );
                                    }
                                );
                                initializeTiePointMapViews();
                                break;
                        }
                    }
                );
            }
        );
    }
    else { tlv[ "3disa" ] = {}; }
}
