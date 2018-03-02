function pageLoad() {
	initializeLoadingDialog();

	disableMenuButtons();

	enableKeyboardShortcuts();

	$( window ).mousemove( function() {
		displayNavbar();
	});
	displayNavbar();

	$( window ).resize( function() { updateMapSize(); } );

	$( '[data-toggle = "tooltip"]' ).tooltip();
}

$( document ).ready( function() { pageLoad(); } );
