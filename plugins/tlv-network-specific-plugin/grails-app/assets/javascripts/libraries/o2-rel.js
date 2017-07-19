var createImageLayerSourceO2Rel = createImageLayerSource;
createImageLayerSource = function( layer ) {
	if ( layer.library == "o2-rel" ) {
			return new ol.source.TileWMS({
				crossOrigin: "anonymous",
				params: {
					FILTER: "in(" + layer.metadata.id + ")",
					FORMAT: "image/png",
					IDENTIFIER: Math.floor( Math.random() * 1000000 ),
					LAYERS: "omar:raster_entry",
					STYLES: JSON.stringify({
						bands: layer.bands || "default",
						brightness: layer.brightness || 0,
						contrast: layer.contrast || 1,
						hist_center: true,
						hist_op: layer.histOp || "auto-minmax",
						resampler_filter: layer.resamplerFilter || "bilinear",
						sharpen_mode: layer.sharpenMode || "none"
					}),
					TRANSPARENT: true,
					VERSION: "1.1.1"
				},
				url: tlv.libraries["o2-dev"].wmsUrl
			});
	}
	else { return createImageLayerSourceO2Rel( layer ); }
}

var pageLoadO2Rel = pageLoad;
pageLoad = function() {
	pageLoadO2Rel();

	tlv.libraries[ "o2-rel"].searchLibrary = function( searchParams ) {
		var library = tlv.libraries[ "o2-rel"];
		library.searchComplete = false;

		var queryParams = {
			maxResults: 100,
			outputFormat: "JSON",
			request: "getFeature",
			service: "WFS",
			typeName: "omar:raster_entry",
			version: "1.1.0"
		};
		if ( tlv.filter ) { queryParams.filter = filter; }
		else {
			var filter = "";

			var startDate = searchParams.startYear + "-" + searchParams.startMonth + "-" + searchParams.startDay + "T" + searchParams.startHour + ":" + searchParams.startMinute + ":" + searchParams.startSecond + ".000+0000"
			var endDate = searchParams.endYear + "-" + searchParams.endMonth + "-" + searchParams.endDay +
				"T" + searchParams.endHour + ":" + searchParams.endMinute + ":" + searchParams.endSecond + ".999+0000"
			filter += "((acquisition_date >= " + startDate + " AND acquisition_date <= " + endDate + ") OR acquisition_date IS NULL)";

			filter += " AND ";

			filter += "(cloud_cover <= " + searchParams.maxCloudCover + " OR cloud_cover IS NULL)";

			filter += " AND ";

			/* 1m * 1Nm / 1852m * 1min / 1Nm * 1deg / 60min */
			var deltaDegrees =  1 / 1852 / 60;
			filter += "DWITHIN(ground_geom,POINT(" + searchParams.location.join(" ") + ")," + deltaDegrees + ",meters)";

			filter += " AND ";

			filter += "(niirs >= " + searchParams.minNiirs + " OR niirs IS NULL)";

			queryParams.filter = filter;
		}

		$.ajax({
			dataType: "json",
			error: function() {
				library.searchComplete = true;
				processResults();
			},
			success: function( data ) {
				var images = []
				$.each(
					data.features,
					function( index, feature ) {
						var metadata = feature.properties;
						metadata.footprint = feature.geometry || null;

						var acquisitionDate = "N/A";
						if ( metadata.acquisition_date ) {
							var date = getDate( new Date( Date.parse( metadata.acquisition_date ) ) );
							acquisitionDate = date.year +  "-" + date.month + "-" + date.day + " " +
								date.hour + ":" + date.minute + ":" + date.second;
						}

						images.push({
							acquisitionDate: acquisitionDate,
							imageId: metadata.image_id || ( metadata.title || metadata.filename.replace( /^.*[\\\/]/, "" ) ),
							library: "o2-rel",
							metadata: metadata,
							numberOfBands: metadata.number_of_bands || 1
						});
					}
				);
				library.searchResults = images;

				library.searchComplete = true;
				processResults();
			},
			url: library.wfsUrl + "?" + $.param( queryParams )
		});
	}
}
