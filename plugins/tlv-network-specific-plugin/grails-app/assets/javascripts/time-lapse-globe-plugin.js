var setupGlobePlugin = setupGlobe;
setupGlobe = function() {
	setupGlobePlugin();

	if ( tlv.terrainProvider ) {
		tlv.globe.getCesiumScene().terrainProvider = new Cesium.CesiumTerrainProvider({
			url: tlv.terrainProvider
		});
	}
}
