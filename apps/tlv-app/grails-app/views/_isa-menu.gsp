<li>
	<a href = "javascript:void(0)" onclick = exportToISA()>3DISA</a>
</li>

<g:javascript>
    function exportToISA() {
        var form = document.createElement( "form" );
        form.action = tlv.isaUrl;
        form.method = "post";
        form.target = "_blank";
        $( "body" ).append( form );

		var view = tlv.map.getView();

		var bbox = document.createElement( "input" );
		bbox.type = "hidden";
		lbbox.name = "bbox";
		bbox.value = ol.proj.transformExtent( view.calculateExtent( tlv.map.getSize() ), "EPSG:3857", "EPSG:4326" );
		form.appendChild( bbox );

        var filenames = document.createElement( "input" );
        filenames.type = "hidden";
        filenames.name = "filenames";
        filenames.value = tlv.layers.map( function( layer ) { return layer.metadata.filename; } );
        form.appendChild( filenames );

		var location = document.createElement( "input" );
		location.type = "hidden";
		location.name = "location";
		location.value = ol.proj.transform( view.getCenter(), "EPSG:3857", "EPSG:4326" );
		form.appendChild( location );

        form.submit();
        form.remove();
    }
</g:javascript>
