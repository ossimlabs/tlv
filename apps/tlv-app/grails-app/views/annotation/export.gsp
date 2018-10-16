<!DOCTYPE html>
<html>
	<head>
		<meta charset = "utf-8">
		<meta http-equiv = "X-UA-Compatible" content = "IE=edge">
		<meta name = "viewport" content = "width=device-width, initial-scale = 1">
		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

		<title>Time Lapse Viewer (TLV)</title>
		<link href = "${ request.contextPath }/assets/tlvicon.ico" rel = "shortcut icon" type = "image/x-icon">

	</head>
	<body>
		<asset:javascript src = "application.js"/>
		<asset:javascript src = "prototype.js"/>
		<asset:script type = "text/javascript">
			var annotations = ${raw(annotations)};

			$( document ).ready( function() {
				var csvData = [];

				// gather all the keys
				var keys = [];
				$.each( annotations, function ( index, annotation ) {
						$.each( annotation, function( key, value ) {
							keys.push( key );
						});
					}
				);
				// sort and deal with commas
				keys = keys.unique().sort().map( function( element ) {
					return element.match(/,/g) ? '"' + element + '"' : element;
				});
				// csv headers
				csvData.push( keys.join( "," ) );

				// gather the metadata
				$.each(
					annotations,
					function( index, annotation ) {
						var values = [];
						$.each(
							keys,
							function(index, key) {
								var value = annotation[ key ];

								// maintain formatting for objects
								if (typeof value === "object") { value = JSON.stringify( value ); }

								// handle commas
								values.push( value.toString().match(/,/g) ? '"' + value + '"' : value );
							}
						);
						csvData.push( values.join( "," ) );
					}
				);

				// download
				var filename = "tlv_annotations_" + new Date().generateFilename() + ".csv";
				var buffer = csvData.join( "\n" );
				var blob = new Blob( [ buffer ], { "type": "text/csv;charset=utf8;" } );
				var link = document.createElement("a");
				if (link.download !== undefined) { // feature detection
					$(link).attr("href", window.URL.createObjectURL(blob));
					$(link).attr("download", filename);
					$("body").append(link);
					link.click();
				}
				else { displayErrorDialog("This browser doesn't support client-side downloading, :("); }
				link.remove();
			});
		</asset:script>
		<asset:deferredScripts/>
	</body>
</html>
