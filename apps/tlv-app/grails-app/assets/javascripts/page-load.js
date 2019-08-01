function pageLoad() {
	initializeLoadingDialog();

	enableKeyboardShortcuts();

	$( window ).resize( function() { updateMapSize(); } );

	$( '[data-toggle = "tooltip"]' ).tooltip();
}

$( document ).ready( function() { pageLoad(); } );
