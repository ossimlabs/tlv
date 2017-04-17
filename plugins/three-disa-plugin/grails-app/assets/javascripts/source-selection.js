function buildSourceSelectionTable() {
    var table = $( "#sourceSelectionTable" )[ 0 ];

    for ( var i = table.rows.length - 1; i >= 0; i-- ) { table.deleteRow( i ); }

    var row = table.insertRow( 0 );
    $( row ).css( "white-space", "nowrap" );
    $.each(
        [ "", "Use", "Image ID", "Sensor Model", "NIIRS", "Azimuth", "Graze", "CE<sub>90</sub> (m)", "LE<sub>90</sub> (m)" ],
        function( index, value ) {
            var cell = row.insertCell( row.cells.length );
            $( cell ).append( value );
        }
    );

    $.each(
        tlv.layers,
        function( index, layer ) {
            row = table.insertRow( table.rows.length );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( index + 1 );

            cell = row.insertCell( row.cells.length );
            $( cell ).append(
                "<div class = 'btn-group' id = 'use" + index + "Buttons' style = 'display: flex'>" +
                    "<button class = 'btn btn-primary' id = 'mustUse" + index + "Button' title = 'Must Use'>" +
                        "<span class = 'glyphicon glyphicon-ok-sign'></span>" +
                    "</button>" +
                    "<button class = 'btn btn-primary active' id = 'mayUse" + index + "Button' title = 'May Use'>" +
                        "<span class = 'glyphicon glyphicon-question-sign'></span>" +
                    "</button>" +
                    "<button class = 'btn btn-primary' id = 'doNotUse" + index + "Button' title = 'Do Not Use'>" +
                        "<span class = 'glyphicon glyphicon-remove-sign'></span>" +
                    "</button>" +
                "</div>"
            );
            $( "#use" + index + "Buttons button" ).click(
                function() {
                    $( this ).addClass( "active" ).siblings().removeClass( "active" );
                    $( this ).blur();
                    getSourceSelectionCandidates();
                }
            );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.imageId );

            cell = row.insertCell( row.cells.length );
            $( cell ).append(
                "<select class = 'form-control' id = 'sensorModelSelect" + index + "'>" +
                    "<option value = 'absoluteRanking'>Absolute Ranking</option>" +
                    "<option value = 'rigorous'>Rigorous</option>" +
                "</select>"
            );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.metadata.niirs );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.metadata.azimuth_angle ? layer.metadata.azimuth_angle.toFixed( 2 ) : "" );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.metadata.grazing_angle ? layer.metadata.grazing_angle.toFixed( 2 ) : "" );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.CE );
            $( cell ).attr( "id", layer.metadata.index_id + "CE" );

            cell = row.insertCell( row.cells.length );
            $( cell ).append( layer.LE );
            $( cell ).attr( "id", layer.metadata.index_id + "LE" );
        }
    );

    getErrorValues();
}

function getErrorValues() {
    var center = ol.proj.transform( tlv.map.getView().getCenter(), "EPSG:3857", "EPSG:4326" );
    $.each(
        tlv.layers,
        function( index, layer ) {
                var callback = function( pixels, layer  ) {
                    var callback2 = function( coordinates, layer, errors ) {
                        layer.CE = errors[0].CE;
                        $( "#" + layer.metadata.index_id + "CE" ).html(
                            isNaN( parseFloat( layer.CE ) ) ? "N/A" : layer.CE.toFixed( 2 )
                        );
                        layer.LE = errors[0].LE;
                        $( "#" + layer.metadata.index_id + "LE" ).html(
                            isNaN( parseFloat( layer.LE ) ) ? "N/A" : layer.LE.toFixed( 2 )
                        );
                    }
                    imagePointsToGround( pixels, layer, callback2 );
                }
                groundToImagePoints( [ center ], layer, callback );
        }
    );
}

function getSelectedImages() {
    var images = [];
    $.each(
        $( "#sourceSelectionTable tr" ),
        function( index, row ) {
            if ( $( row ).hasClass( "success" ) ) {
                var sensorModel = $( "#sensorModelSelect" + ( index - 1 ) ).val();
                tlv.layers[ index - 1 ].sensorModel = sensorModel;
                images.push( tlv.layers[ index - 1 ] );
            }
        }
    );


    return images;
}

function getSourceSelectionCandidates() {
    if ( tlv[ "3disa" ].sourceSelectionAjax ) {
        //tlv[ "3disa" ].sourceSelectionAjax.abort();
        clearTimeout( tlv[ "3disa" ].sourceSelectionAjax );
    }

    var center = ol.proj.transform( tlv.map.getView().getCenter(), "EPSG:3857", "EPSG:4326" );

    var images = [];
    $.each(
        tlv.layers,
        function( index, layer ) {
            if ( !$( "#doNotUse" + index + "Button" ).hasClass( "active" ) ) {
                var image = {
                    filename: layer.metadata.filename,
                    must_use: false
                };

                if ( $( "#mustUse" + index + "Button" ).hasClass( "active" ) ) { image.must_use = true; }

                images.push( image );
            }
        }
    );

    tlv[ "3disa" ].sourceSelectionAjax = setTimeout( function() {
/*

    $.ajax({
        data: JSON.stringify({
            service: "source_selection",
            point: {
               lat: center[1],
               lon: center[0]
            },
            Desired_accuracy: {
                ce90: $( "#desiredCeInput" ).val(),
                le90: $( "#desiredLeInput" ).val()
            },
            candidates: images
        }),
        dataType: "json",
        success: function( data ) {
            if ( !data.meets_criteria ) { displayErrorDialog( "Sorry, we couldn't meet your high standards. Try lowering the error values or include some more images." ); }
            else {
*/
                // fake response
                $( "#predictedCeSpan" ).html( Math.random().toFixed(3) );//data.predicted_accuracy.ce90 );
                $( "#predictedLeSpan" ).html( Math.random().toFixed(3) );//data.predicted_accuracy.le90 );
                var data = { images: [] };
                $.each(
                    images,
                    function( index, image ) {
                        if ( image.must_use ) { data.images.push( image.filename ); }
                        else if (Math.random() > 0.5) {
                            data.images.push( image.filename );
                        }
                    }
                );

                // reset all the rows, removing the "selected" class
                $.each( $( "#sourceSelectionTable tr" ), function( index, row ) { $( row ).removeClass( "success" ); } );

                $.each(
                    // data.images,
                    data.images,
                    function( index, filename ) {
                        var filenames = tlv.layers.map( function( image ) { return image.metadata.filename; } );
                        var imageIndex = filenames.indexOf( filename );

                        var row = $( "#sourceSelectionTable" )[ 0 ].rows[ imageIndex + 1 ];
                        $( row ).addClass( "success" );
                    }
                );
}, 2000);
/*            }
        },
        type: "post",
        url: tlv.availableResources.complete[ images[0].library ].mensaUrl + "/sourceselection"
    });
*/
}
