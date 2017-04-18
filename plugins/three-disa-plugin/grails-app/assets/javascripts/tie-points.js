function aTiePointHasBeenAdded( event ) {
    $.each(
        tlv[ "3disa" ].layers,
        function( index, layer ) {
            layer.map.removeInteraction( layer.drawInteraction );
            layer.vectorLayer.getSource().un( "addfeature", aTiePointHasBeenAdded );
        }
    );

    var feature = event.feature;
    var numberOfFeatures = event.target.getFeatures().length;

    var featureId = Date.parse( new Date() );
    feature.setProperties({ id: featureId });

    var style = createTiePointStyle();
    var textStyle = style.getText();
    textStyle.setText( numberOfFeatures.toString() );
    style.setText( textStyle );
    feature.setStyle( style );

    var point = feature.getGeometry().getCoordinates();
    var currentLayer = tlv[ "3disa" ].layers[ tlv[ "3disa" ].currentLayer ];
    refreshTiePointLayer( currentLayer );
    imagePointsToGround( [[ point[ 0 ], -point[ 1 ] ]], currentLayer, function( coordinates, layer ) {
        $.each(
            tlv[ "3disa" ].layers,
            function( index, layer ) {
                var source = layer.vectorLayer.getSource();
                if ( source.getFeatures().length < numberOfFeatures ) {
                    // add a point in the same spot
                    groundToImagePoints( coordinates, layer, function( pixels, layer ) {
                        var newFeature = feature.clone();

                        newFeature.setProperties({ id: featureId });

                        var geometry = new ol.geom.Point( [ pixels[ 0 ][ 0 ], -pixels[ 0 ][ 1 ] ] );
                        newFeature.setGeometry( geometry );

                        var newStyle = newFeature.getStyle();
                        var newTextStyle = newStyle.getText();
                        newTextStyle.setText( numberOfFeatures.toString() );
                        newFeature.setStyle( newStyle );

                        layer.vectorLayer.getSource().addFeature( newFeature );
                        refreshTiePointLayer( layer );
                    });
                }
            }
        );
    });
}

function addTiePoint() {
    $.each(
        tlv[ "3disa" ].layers,
        function( index, layer ) {
            // incase the user hits the button twice in a row
            layer.map.removeInteraction( layer.drawInteraction );

            layer.map.addInteraction( layer.drawInteraction );
            layer.vectorLayer.getSource().on( "addfeature", aTiePointHasBeenAdded );
        }
    );
}

function addTiePointTileLayer( index, wmsLayer ) {
    var layer = tlv[ "3disa" ].layers[ index ];
    var filename = layer.metadata.filename;
    var imageHeight = layer.metadata.height;
    var imageWidth = layer.metadata.width;

    var extent = [ 0, -imageHeight, imageWidth, 0 ];
    tlv[ "3disa" ].layers[ index ].mapLayer = new ol.layer.Tile({
        source: new ol.source.TileImage({
            tileClass: ol.source.ZoomifyTile,
            tileGrid: new ol.tilegrid.TileGrid({
                extent: extent,
                origin: ol.extent.getTopLeft( extent ),
                resolutions: calculateTileResolutions( imageHeight, imageWidth )
            }),
            tileUrlFunction: function( tileCoord, pixelRatio, projection ) {


                return tileUrlFunction( wmsLayer, tileCoord, pixelRatio, projection )
            }
        })
    });

    layer.map.addLayer( tlv[ "3disa" ].layers[ index ].mapLayer );
}

function addTiePointVectorLayer( index ) {
    var features = new ol.Collection();
    var map = tlv[ "3disa" ].layers[ index ].map;

    tlv[ "3disa" ].layers[ index ].vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({ features: features })
    });
    map.addLayer( tlv[ "3disa" ].layers[ index ].vectorLayer );
    map.on( "moveend", function( event ) { refreshTiePointLayer( tlv[ "3disa" ].layers[ index ] ); } );

    tlv[ "3disa" ].layers[ index ].drawInteraction = new ol.interaction.Draw({
        features: features,
        type: "Point"
    });

    // custom drag interaction
    var pointerInteraction = new ol.interaction.Pointer({
        handleDownEvent: function( event ) {
            var feature = event.map.forEachFeatureAtPixel( event.pixel,
                function( feature ) { return feature; }
            );
            if ( feature ) {
                this.coordinate_ = event.coordinate;
                this.feature_ = feature;
            }


            return !!feature;
        },
        handleDragEvent: function( event ) {
            var deltaX = event.coordinate[ 0 ] - this.coordinate_[ 0 ];
            var deltaY = event.coordinate[ 1 ] - this.coordinate_[ 1 ];
            this.feature_.getGeometry().translate( deltaX, deltaY );

            this.coordinate_[ 0 ] = event.coordinate[ 0 ];
            this.coordinate_[ 1 ] = event.coordinate[ 1 ];
        },
        handleMoveEvent: function( event ) {
            var feature = event.map.forEachFeatureAtPixel( event.pixel,
                function( feature ) { return feature; }
            );
            var element = event.map.getTargetElement();
            if ( feature ) { element.style.cursor = "pointer"; }
            else { element.style.cursor = ""; }
        },
        handleUpEvent: function( event ) {
            this.coordinate_ = null;
            this.feature_ = null;


            return false;
        }
    });
    map.addInteraction(pointerInteraction);

    map.getViewport().addEventListener( "contextmenu",
        function ( event ) {
            event.preventDefault();
            var pixel = [ event.layerX, event.layerY ];
            var callback = function( feature ) {
                // check for an id to make sure it's not the select faux feature
                if ( feature.getProperties().id ) { deleteTiePoint( feature ); }
            }
            map.forEachFeatureAtPixel( pixel, callback, { hitTolerance: 5 } );
        }
    );
}

function calculateTileResolutions( imageHeight, imageWidth ) {
    var tileSize = ol.DEFAULT_TILE_SIZE || 256;
    var tierSizeInTiles = [];
    while ( imageWidth > tileSize || imageHeight > tileSize ) {
        tierSizeInTiles.push([
            Math.ceil( imageWidth / tileSize ),
            Math.ceil( imageHeight / tileSize )
        ]);
        tileSize += tileSize;
    }
    tierSizeInTiles.push([1, 1]);
    tierSizeInTiles.reverse();

    var resolutions = [1];
    var tileCountUpToTier = [0];
    var i = 1, ii = tierSizeInTiles.length;
    while ( i < ii ) {
        resolutions.push( 1 << i );
        tileCountUpToTier.push(
            tierSizeInTiles[ i - 1 ][ 0 ] * tierSizeInTiles[ i - 1 ][ 1 ] + tileCountUpToTier[ i - 1 ]
        );
        i++;
    }


    return resolutions.reverse();
}

function createTiePointMap( index, image ) {
    var modalBody = $( "#tiePointSelectionDialog .modal-body" );
    var height = Math.floor( modalBody.css( "maxHeight" ).replace(/px/, "") / 2 );
    var width = modalBody.width() / 2;
    var div = document.createElement( "div" );
    div.className = "map tie-point-map";
    div.id = "tiePointMap" + index;
    div.onmouseover = function() {
        tlv[ "3disa" ].currentLayer = index; }
    div.style.height = height + "px";
    modalBody.append( div );

    // create a control to put the image ID at the top of the map
    var mapTitleDiv = document.createElement("div");
    mapTitleDiv.className = "custom-map-control";
    mapTitleDiv.innerHTML = image.imageId + "<br>" + image.acquisitionDate + "z";
    mapTitleDiv.style = "right: 0.5em; text-align: right; top: 0.5em";
    var mapTitleControl = new ol.control.Control({ element: mapTitleDiv });

    // create the map
    var maxHeight = image.metadata.height;
    var maxWidth = image.metadata.width;
    var map = new ol.Map({
        controls: ol.control.defaults().extend([ mapTitleControl ]),
        interactions: ol.interaction.defaults({
            dragPan: false,
            mouseWheelZoom: false
        }).extend([
            new ol.interaction.DragPan( { kinetic: false } )
        ]),
        logo: false,
        target: "tiePointMap" + index,
        view: new ol.View({
            center: [ maxWidth / 2, -maxHeight / 2 ],
            extent: [ 0, -maxHeight, maxWidth, 0 ],
            projection: new ol.proj.Projection({
                code: "ImageSpace",
                extent: [ 0, 0, maxWidth, maxHeight ],
                units: "pixels"
            }),
            resolution: tlv.map.getView().getResolution()
        })
    });

    map.getView().on('change:rotation', function( event ) {
        tlv[ "3disa" ].syncTiePointMapsOveride = true;
        var rotation = event.target.get( event.key );
        rotateNorthArrow( rotation, tlv[ "3disa" ].layers[ index ] );
    });

    tlv[ "3disa" ].layers[ index ].map = map;
}

function createTiePointStyle() {
    return new ol.style.Style({
        image: new ol.style.Circle({
            fill: new ol.style.Fill({ color: "rgba(255, 255, 0, 0.1)" }),
            radius: 5,
            stroke: new ol.style.Stroke({
                 color: "rgba(255, 255, 0, 0.1)",
                 width: 1
            })
        }),
        stroke: new ol.style.Stroke({
             color: "rgba(255, 255, 0, 1)",
             width: 1
        }),
        text: new ol.style.Text({
            fill: new ol.style.Fill({ color: "rgba(255, 255, 0, 1)" }),
            offsetY: 20,
            textBaseline: "bottom"
        })
    });
}

function deleteTiePoint( feature ) {
    var id = feature.getProperties().id;
    $.each(
        tlv[ "3disa" ].layers,
        function( index, layer ) {
            var source = layer.vectorLayer.getSource();
            $.each(
                source.getFeatures(),
                function( index, feature ) {
                    if ( feature.getProperties().id == id ) {
                        source.removeFeature( feature );


                        return false;
                    }
                }
            );
        }
    );

    // re-label each feature according to its order
    $.each(
        tlv[ "3disa" ].layers,
        function( index, layer ) {
            var features = layer.vectorLayer.getSource().getFeatures().sort(
                function( a, b ) {
                    var aId = a.getProperties().id;
                    var bId = b.getProperties().id;


                    return  aId > bId ? 1 : ( bId > aId ? -1 : 0 );
                }
            );
            $.each(
                features,
                function( index, feature ) {
                    var style = feature.getStyle();
                    var textStyle = style.getText();
                    textStyle.setText( ( index + 1 ).toString() );
                    style.setText( textStyle );
                    feature.setStyle( style );
                }
            );
        }
    );
}

function getNorthAndUpAngles( layer ) {
    $.ajax({
        data: "entry=0&filename=" + layer.metadata.filename,
        dataType: "json",
        success: function( data ) {
            layer.northAngle = data.northAngle;
            layer.upAngle = data.upAngle;

            rotateNorthArrow( layer.northAngle, layer );
            layer.map.getView().setRotation( layer.upAngle );
        },
        url: tlv.availableResources.complete[ layer.library ].imageSpaceUrl + "/getAngles"
    });
}

function groundToImagePoints( coordinates, layer, callback ) {
    $.ajax({
        contentType: "application/json",
        data: JSON.stringify({
            "entryId": 0,
            "filename": layer.metadata.filename,
            "pointList": coordinates.map(
                function( coordinate ) { return { "lat": coordinate[1], "lon": coordinate[0] }; }
            ),
        }),
        dataType: "json",
        success: function( data ) {
            var pixels = data.data.map(
                function( point ) { return [ point.x, point.y ] }
            );
            callback( pixels, layer );
        },
        type: "post",
        url: tlv.availableResources.complete[ layer.library ].mensaUrl + "/groundToImagePoints"
    });
}

function imagePointsToGround( pixels, layer, callback ) {
    $.ajax({
        contentType: "application/json",
        data: JSON.stringify({
            "entryId": 0,
            "filename": layer.metadata.filename,
            "pointList": pixels.map(
                function( pixel ) { return { "x": pixel[0], "y": pixel[1] }; }
            ),
            "pqeEllipseAngularIncrement": 10,
            "pqeEllipsePointType" : "none",
            "pqeIncludePositionError": true,
            "pqeProbabilityLevel" : 0.9,
        }),
        dataType: "json",
        success: function( data ) {
            var coordinates = data.data.map(
                function( point ) { return [ point.lon, point.lat ]; }
            );
            var errors = data.data.map(
                function( point ) {
                    if ( point.pqe.pqeValid ) { return { CE: point.pqe.CE, LE: point.pqe.LE } }
                    else { return { CE: null, LE: null } }
                }
            );
            callback( coordinates, layer, errors );
        },
        type: "post",
        url: tlv.availableResources.complete[ layer.library ].mensaUrl + "/imagePointsToGround"
    });
}

function refreshTiePointLayer( layer ) {console.dir(layer);
    $.each(
        layer.vectorLayer.getSource().getFeatures(),
        function( index, feature ) {
            var point;

            var geometry = feature.getGeometry();
            if ( geometry.getType() == "Point" ) { point = geometry.getCoordinates(); }
            else { point = geometry.getGeometries()[ 1 ].getCoordinates(); }

            var centerPixel = layer.map.getPixelFromCoordinate( point );
            var deltaXPixel = [ centerPixel[ 0 ] + 5, centerPixel[ 1 ] ];
            var deltaYPixel = [ centerPixel[ 0 ], centerPixel[ 1 ] + 5 ];

            var deltaXPoints = layer.map.getCoordinateFromPixel( deltaXPixel )[ 0 ] - point[ 0 ];
            var deltaYPoints = layer.map.getCoordinateFromPixel( deltaYPixel )[ 1 ] - point[ 1 ];

            var horizontalLinePoints = [
                [ point[ 0 ] - deltaXPoints, point[ 1 ] ],
                [ point[ 0 ] + deltaXPoints, point[ 1 ] ]
            ];
            var verticalLinePoints = [
                [ point[ 0 ], point[ 1 ] - deltaYPoints],
                [ point[ 0 ], point[ 1 ] + deltaYPoints]
            ];
            var geometryCollection = new ol.geom.GeometryCollection([
                new ol.geom.MultiLineString( [ horizontalLinePoints, verticalLinePoints ] ),
                new ol.geom.Point( point )
            ]);
            feature.setGeometry( geometryCollection );
        }
    );
}

function rotateNorthArrow( radians, layer ) {
    if ( layer.northAngle ) { radians = radians - layer.northAngle; }
    var transform = 'rotate(' + radians + 'rad)';

    var arrow = $( "#" + layer.map.getTarget() ).find( ".ol-compass" )[ 0 ];
    $( arrow ).css('msTransform', transform);
    $( arrow ).css('transform', transform);
    $( arrow ).css('webkitTransform', transform);
}

function setupTiePointSelectionDialog( selectedImages ) {
    if ( !selectedImages ) { selectedImages = getSelectedImages() };
    if ( selectedImages.length < 2 ) {
        displayErrorDialog( "It takes at least two images to Tango." );
        return;
    }

    $( "#sourceSelectionDialog" ).modal( "hide" );
    $( "#tiePointSelectionDialog" ).modal( "show" );

    $( "#tiePointSelectionDialog .modal-body" ).html("");
    tlv[ "3disa" ].layers = [];
    tlv[ "3disa" ].currentLayer = 0;

    $.each(
        selectedImages,
        function( index, layer ) {
            tlv[ "3disa" ].layers.push({
                acquisitionDate: layer.acquisitionDate,
                imageId: layer.imageId,
                library: layer.library,
                metadata: layer.metadata,
                sensorModel: layer.sensorModel,
                synching: 0
            });

            var filename = layer.metadata.filename;
            var imageHeight = layer.metadata.height;
            var imageWidth = layer.metadata.width;

            createTiePointMap( index, tlv[ "3disa" ].layers[ index ] );

            addTiePointTileLayer( index, layer );
            addTiePointVectorLayer( index );

            getNorthAndUpAngles( tlv[ "3disa" ].layers[ index ] );
        }
    );

    var view = tlv.map.getView();
    var center = ol.proj.transform( view.getCenter(), "EPSG:3857", "EPSG:4326" );
    var extent = ol.proj.transformExtent( view.calculateExtent( tlv.map.getSize() ), "EPSG:3857", "EPSG:4326" );
    var coordinates = [ center, extent.slice( 0, 2 ), extent.slice( 2, 4 ) ];
    groundToImagePoints( coordinates, tlv[ "3disa" ].layers[ 0 ], function( pixels, layer ) {
        var view = layer.map.getView();
        var center = [ pixels[ 0 ][ 0 ], -pixels[ 0 ][ 1 ] ];
        view.setCenter( center );

        var extent = [ pixels[ 1 ][ 0 ], -pixels[ 1 ][ 1 ], pixels[ 2 ][ 0 ], -pixels[ 2 ][ 1 ] ];
        view.fit( extent, layer.map.getSize(), { nearest: true } );

        syncTiePointMaps( { map: layer.map } );
    });
}

function syncTiePointMaps( event ) {
    // during rotation, don't sync the maps
    if ( tlv[ "3disa" ].syncTiePointMapsOveride == true ) {
        tlv[ "3disa" ].syncTiePointMapsOveride = false;
        return;
    }

    // determine which layer is trying to by synched
    var currentLayer;
    $.each(
        tlv[ "3disa" ].layers,
        function( index, layer ) {
            if ( layer.map.getTarget() == event.map.getTarget() ) { currentLayer = layer; }
            layer.map.un( "moveend", syncTiePointMaps );
        }
    );

    var view = currentLayer.map.getView();
    var rotation = view.getRotation();
    view.setRotation( 0 );

    var center = view.getCenter();
    var extent = view.calculateExtent( currentLayer.map.getSize() );
    var coordinates = [
        [ center[ 0 ], -center[ 1 ] ],
        [ extent[ 0 ], -extent[ 1 ] ],
        [ extent[ 2 ], -extent[ 3 ] ]
    ];
    view.setRotation( rotation );

    imagePointsToGround( coordinates, currentLayer, function( coordinates, layer ) {
        $.each(
            tlv[ "3disa" ].layers,
            function( index, layer ) {
                groundToImagePoints( coordinates, layer, function( pixels, layer ) {
                    var view = layer.map.getView();
                    var center = [ pixels[ 0 ], -pixels[ 1 ] ];
                    view.setCenter( center );
                    var rotation = view.getRotation();
                    view.setRotation( 0 );
                    var extent = [ pixels[ 1 ][ 0 ], -pixels[ 1 ][ 1 ], pixels[ 2 ][ 0 ], -pixels[ 2 ][ 1 ] ];
                    view.fit( extent, layer.map.getSize(), { nearest: true } );

                    view.setRotation( rotation );
                    setTimeout( function() { layer.map.on( "moveend", syncTiePointMaps ); }, 100 );
                });
            }
        );
    });
}

function tileUrlFunction( image, tileCoord, pixelRatio, projection ) {
    if ( !tileCoord ) { return undefined; }
    else {
        var styles = JSON.parse( image.mapLayer.getSource().getParams().STYLES );
        var params = [
            "bands=" + styles.bands,
            "brightness=" + styles.brightness,
            "contrast=" + styles.contrast,
            "entry=0&",
            "filename=" + image.metadata.filename,
            "format=jpeg&",
            "histCenterTile=" + styles[ "hist_center" ],
            "histOp=" + styles.hist_op,
            "resamplerFilter=" + styles.resampler_filter,
            "sharpenMOde=" + styles.sharpen_mode,
            "x=" + tileCoord[1],
            "y=" + ( -tileCoord[2] - 1 ),
            "z=" + tileCoord[0]
        ];


        return tlv.availableResources.complete[ image.library ].imageSpaceUrl + "/getTile?" + params.join( "&" );
    }
}
