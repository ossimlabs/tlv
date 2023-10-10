//= require jquery-3.5.1.js
//= require webjars/bootstrap/3.3.5/js/bootstrap.js
//= require webjars/momentjs/2.24.0/moment.js
//= require bootstrap-datetimepicker-4.15.35
//= require bootstrap-slider
//= require webjars/typeahead.js/0.11.1/dist/typeahead.bundle.min

//= require olcesium-1.35
//= require coordinate-conversion

//= require prototype
//= require page-load
//= require index
//= require time-lapse
//= require time-lapse-map
//= require time-lapse-globe
//= require map-controls
//= require menus/annotations
//= require menus/annotations-map
//= require menus/export
//= require menus/export-map
//= require menus/export-globe
//= require menus/image-properties
//= require menus/layers
//= require menus/search
//= require menus/view

//= require webjars/jszip/3.1.0/jszip.min

//= require polyfill


// ol3 overrides
/**
 * @param {ol.MapBrowserEvent} mapBrowserEvent The event to handle.
 */
ol.PluggableMap.prototype.handleMapBrowserEvent = function(mapBrowserEvent) {
  if (!this.frameState_) {
    // With no view defined, we cannot translate pixels into geographical
    // coordinates so interactions cannot be used.
    return;
  }
  this.focus_ = mapBrowserEvent.map.getView().getCenter(); //mapBrowserEvent.coordinate;
  mapBrowserEvent.frameState = this.frameState_;
  var interactionsArray = this.getInteractions().getArray();
  var i;
  if (this.dispatchEvent(mapBrowserEvent) !== false) {
    for (i = interactionsArray.length - 1; i >= 0; i--) {
      var interaction = interactionsArray[i];
      if (!interaction.getActive()) {
        continue;
      }
      var cont = interaction.handleEvent(mapBrowserEvent);
      if (!cont) {
        break;
      }
    }
  }
};
