function createAcquisitionDateControl() {
	if ( tlv.hideAcquisitionDate != "true" ) {
		var div = document.createElement( "div" );
		div.className = "custom-map-control";
		div.id = "acquisitionDateDiv";
		var control = new ol.control.Control({ element: div });


		return control;
	}
	else {
		return null;
	}
}

function createAnnotationsControl() {
	var AnnotationsControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-pencil'></span>";
		button.title = "Annotations";

		var this_ = this;
		$( button ).on( 'click', function( event ) {
			$( this ).blur();
			displayDialog( 'annotationsDialog' );
		});

		var element = document.createElement( 'div' );
		element.className = 'annotations-control ol-unselectable ol-control';
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( AnnotationsControl, ol.control.Control );


	return new AnnotationsControl();
}

function createDeleteControl() {
	var DeleteControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-trash'></span>";
		button.title = "Delete Frame";

		var this_ = this;
		$( button ).on( "click", function( event ) {
			$( this ).blur();
			deleteFrame( tlv.currentLayer );
		});

		var element = document.createElement( "div" );
		element.className = "delete-control ol-unselectable ol-control";
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( DeleteControl, ol.control.Control );


	return new DeleteControl();
}

function createExportControl() {
	var ExportControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-export'></span>";
		button.title = "Export";

		var this_ = this;
		$( button ).on( 'click', function( event ) {
			$( this ).blur();
			displayDialog( 'exportDialog' );
		});

		var element = document.createElement( 'div' );
		element.className = 'export-control ol-unselectable ol-control';
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( ExportControl, ol.control.Control );


	return new ExportControl();
}

function createFastForwardControl() {
	var FastForwardControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-step-forward'></span>";
		button.title = "Fast Forward";

		var this_ = this;
		$( button ).on( "click", function( event ) {
			$( this ).blur();
			changeFrame( "fastForward" );
		});

		var element = document.createElement( "div" );
		element.className = "fast-forward-control ol-unselectable ol-control";
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( FastForwardControl, ol.control.Control );


	return new FastForwardControl();
}

function createFullScreenControl() {
	var fullScreenSpan = document.createElement( "span" );
	fullScreenSpan.className = "glyphicon glyphicon-fullscreen";
	var fullScreenControl = new ol.control.FullScreen({ label: fullScreenSpan });


	return fullScreenControl;
}

function createHelpControl() {
	var HelpControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-question-sign'></span>";
		button.title = "Help!";

		var this_ = this;
		$( button ).on( 'click', function( event ) {
			$( this ).blur();
			displayDialog( 'helpDialog' );
		});

		var element = document.createElement( 'div' );
		element.className = 'help-control ol-unselectable ol-control';
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( HelpControl, ol.control.Control );


	return new HelpControl();
}

function createImageIdControl() {
	if ( tlv.hideImageId != "true" ) {
		var imageIdOuterDiv = document.createElement( "div" );
		imageIdOuterDiv.className = "custom-map-control";
		imageIdOuterDiv.id = "imageIdOuterDiv";
		imageIdOuterDiv.style.cssText = "background-color: rgba(0, 0, 0, 0); pointer-events: none;"

		var imageIdDiv = document.createElement( "div" );
		imageIdDiv.id = "imageIdDiv";
		imageIdDiv.style.cssText = "background-color: rgba(0, 0, 0, 0.5); display: inline-block; text-align: left";
		imageIdOuterDiv.appendChild( imageIdDiv );

		var imageIdControl = new ol.control.Control({ element: imageIdOuterDiv });


		return imageIdControl;
	}
	else {
		return null;
	}
}

function createImagePropertiesControl() {
	var ImagePropertiesControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-picture'></span>";
		button.title = "Image Properties";

		var this_ = this;
		$( button ).on( 'click', function( event ) {
			$( this ).blur();
			$( '#imagePropertiesDiv' ).show();
		});

		var element = document.createElement( 'div' );
		element.className = 'image-properties-control ol-unselectable ol-control';
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( ImagePropertiesControl, ol.control.Control );


	return new ImagePropertiesControl();
}

function createLayersControl() {
	var LayersControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-menu-hamburger'></span>";
		button.title = "Layers";

		var this_ = this;
		$( button ).on( 'click', function( event ) {
			$( this ).blur();
			displayDialog( 'layersDialog' );
		});

		var element = document.createElement( 'div' );
		element.className = 'layers-control ol-unselectable ol-control';
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( LayersControl, ol.control.Control );


	return new LayersControl();
}

function createMapControls() {
	tlv.mapControls = [];

	var controls = [
		createMousePositionControl(),
		// needs to be first
		createAcquisitionDateControl(),
		createAnnotationsControl(),
		createExportControl(),
		createFullScreenControl(),
		createHelpControl(),
		createImageIdControl(),
		createImagePropertiesControl(),
		createLayersControl(),
		createRotationTiltControl(),
		createSearchControl(),
		createToolsControl(),
		createUserNameControl(),
		createViewControl(),
		createZoomControl()
	];

	if ( tlv.layers.length > 1 ) {
		controls = controls.concat([
			createDeleteControl(),
			createFastForwardControl(),
			createPlayStopControl(),
			createRewindControl(),
			createSummaryTableControl()
		]);
	}

	$.each( controls, function( index, control ) {
		if ( control ) {
			tlv.mapControls.push( control );
		}
	} );
}

function createMousePositionControl() {
	if ( tlv.hideMapCoordinates != "true" ) {
		var mousePositionControl = new ol.control.MousePosition({
			coordinateFormat: function(coordinate) {
				var lat = coordinate[ 1 ];
				var lon = coordinate[ 0 ];
				var coordConvert = new CoordinateConversion();
				switch( mousePositionControl.coordinateDisplayFormat ) {
					case 0: return coordinate[ 1 ].toFixed( 6 ) + ", " + coordinate[ 0 ].toFixed( 6 ); break;
					case 1: return coordConvert.ddToDms( lat, "lat" ) + " " + coordConvert.ddToDms( lon, "lon" ); break;
					case 2: return coordConvert.ddToMgrs( lat, lon ); break;
				}
			}
		});

		switch ( tlv.preferences.coordinateFormat ) {
			case "dd": mousePositionControl.coordinateDisplayFormat = 0; break;
			case "dms": mousePositionControl.coordinateDisplayFormat = 1; break;
			case "mgrs": mousePositionControl.coordinateDisplayFormat = 2; break;
		}
		$( mousePositionControl.element ).click( function() {
			mousePositionControl.coordinateDisplayFormat++;
			if ( mousePositionControl.coordinateDisplayFormat >= 3 ) { mousePositionControl.coordinateDisplayFormat = 0; }
		});


		return mousePositionControl;
	}
	else {
		return null;
	}
}

function createPlayStopControl() {
	var PlayStopControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-play'></span>";
		button.title = "Play/Stop";

		var this_ = this;
		$( button ).on( "click", function( event ) {
			$( this ).blur();
			playStopTimeLapse( $( button ).children()[ 0 ] );
		});

		var element = document.createElement( "div" );
		element.className = "play-stop-control ol-unselectable ol-control";
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( PlayStopControl, ol.control.Control );


	return new PlayStopControl();
}

function createRewindControl() {
	var RewindControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-step-backward'></span>";
		button.title = "Rewind";

		var this_ = this;
		$( button ).on( "click", function( event ) {
			$( this ).blur();
			changeFrame( "rewind" );
		});

		var element = document.createElement( "div" );
		element.className = "rewind-control ol-unselectable ol-control";
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( RewindControl, ol.control.Control );


	return new RewindControl();
}

function createRotationTiltControl() {
	var RotationTiltControl = function() {
		var rotationInput = document.createElement( "input" );
		rotationInput.id = "rotationSliderInput";
		rotationInput.max = "360";
		rotationInput.min = "0";
		rotationInput.oninput = function( event ) {
			var degrees = $( rotationInput ).val();
			tlv.map.getView().setRotation( degrees * Math.PI / 180 );
		};
		rotationInput.step = "1";
		rotationInput.style.display = "none";
		rotationInput.style[ "vertical-algin" ] = "middle";
		rotationInput.type = "range";
		rotationInput.value = "0";

		var tiltInput = document.createElement( "input" );
		tiltInput.id = "tiltSliderInput";
		tiltInput.max = "270";
		tiltInput.min = "-90";
		tiltInput.oninput = function( event ) {
			var degrees = $( tiltInput ).val();
			tlv.globe.getCesiumScene().camera.setView({
				orientation: {
					pitch: -degrees * Math.PI / 180
				}
			});
		};

		tiltInput.step = "1";
		tiltInput.style.display = "none";
		tiltInput.style[ "vertical-algin" ] = "middle";
		tiltInput.type = "range";
		tiltInput.value = "90";

		setTimeout( function() {
			$( ".ol-rotate" ).on( "click", function( event ) {
				if ( $( rotationInput ).is( ":visible" ) || $( "#tiltInput" ).is( ":visible" ) ) {
					$( rotationInput ).fadeOut();
					$( tiltInput ).fadeOut();
				}
				else {
					$( rotationInput ).fadeIn();
					if ( $( "#dimensionsSelect" ).val() == "3" ) {
						$( tiltInput ).fadeIn();
					}
				}
			});
		}, 2000 );

		var this_ = this;

		var element = document.createElement( "div" );
		element.appendChild( tiltInput );
		element.appendChild( rotationInput );
		element.className = "rotation-tilt-control ol-unselectable ol-control";
		element.style = "background: none";


		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});


	};
	ol.inherits( RotationTiltControl, ol.control.Control );


	return new RotationTiltControl();
}

function createSearchControl() {
	var SearchControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-search'></span>";
		button.title = "Search";

		var this_ = this;
		$( button ).on( 'click', function( event ) {
			$( this ).blur();
			displayDialog( 'searchDialog' );
		});

		var element = document.createElement( 'div' );
		element.className = 'search-control ol-unselectable ol-control';
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( SearchControl, ol.control.Control );


	return new SearchControl();
}

function createSummaryTableControl() {
	var SummaryTableControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'tlvLayerCountSpan'>0/0</span>&nbsp;<span class = 'glyphicon glyphicon-list-alt'></span>";
		button.style.cssText = "width: auto";
		button.title = "Summary Table";

		var this_ = this;
		$( button ).on( "click", function( event ) {
			buildSummaryTable();
			displayDialog( 'summaryTableDialog' );
		});

		var element = document.createElement( "div" );
		element.className = "summary-table-control ol-unselectable ol-control";
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( SummaryTableControl, ol.control.Control );


	return new SummaryTableControl();
}

function createToolsControl() {
	var ToolsControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-wrench'></span>";
		button.title = "Tools";

		var this_ = this;
		$( button ).on( 'click', function( event ) {
			$( this ).blur();
			displayDialog( 'toolsDialog' );
		});

		var element = document.createElement( 'div' );
		element.className = 'tools-control ol-unselectable ol-control';
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( ToolsControl, ol.control.Control );


	return new ToolsControl();
}

function createUserNameControl() {
	var userNameInput = document.getElementById( 'userNameInput' );
	if ( userNameInput ) {
		var div = document.createElement( "div" );
		div.className = "custom-map-control user-name-control";
		div.innerHTML = userNameInput.value;
		var control = new ol.control.Control({ element: div });


		return control;
	}
	else {
		return null;
	}
}

function createViewControl() {
	var ViewControl = function() {
		var button = document.createElement( "button" );
		button.innerHTML = "<span class = 'glyphicon glyphicon-eye-open'></span>";
		button.title = "View";

		var this_ = this;
		$( button ).on( 'click', function( event ) {
			$( this ).blur();
			displayDialog( 'viewDialog' );
		});

		var element = document.createElement( 'div' );
		element.className = 'view-control ol-unselectable ol-control';
		element.appendChild( button );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( ViewControl, ol.control.Control );


	return new ViewControl();
}

function createZoomControl() {
	var Control = function() {
		var button1 = document.createElement( "button" );
		button1.innerHTML = "<span class = 'glyphicon glyphicon-resize-full'></span>";
		button1.title = "Full Resolution";

		$( button1 ).on( "click", function( event ) {
			$( this ).blur();
			zoomToFullResolution();
		});

		var button2 = document.createElement( "button" );
		button2.innerHTML = "<span class = 'glyphicon glyphicon-resize-small'></span>";
		button2.title = "Max. Extent";

		$( button2 ).on( "click", function( event ) {
			$( this ).blur();
			zoomToMaximumExtent();
		});

		var element = document.createElement( "div" );
		element.className = "ol-zoom zoom-control ol-unselectable ol-control";
		element.appendChild( button1 );
		element.appendChild( button2 );

		ol.control.Control.call( this, {
			element: element,
			target: undefined
		});
	};
	ol.inherits( Control, ol.control.Control );


	return new Control();
}
