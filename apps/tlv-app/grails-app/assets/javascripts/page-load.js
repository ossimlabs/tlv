function pageLoad() {
	initializeLoadingDialog();

	disableMenuButtons();

	enableKeyboardShortcuts();

	$( window ).resize( function() { updateMapSize(); } );

	$( '[data-toggle = "tooltip"]' ).tooltip();

tlv.pageLoad = true;
}

$( document ).ready( function() { pageLoad(); } );
