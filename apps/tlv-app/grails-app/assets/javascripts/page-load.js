function pageLoad() {
	initializeLoadingDialog();

	disableMenuButtons();

	enableKeyboardShortcuts();

	$( window ).resize( function() { updateMapSize(); } );

	$( '[data-toggle = "tooltip"]' ).tooltip();
}

$( document ).ready( function() { pageLoad(); } );
