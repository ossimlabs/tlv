 <div id = "imagePropertiesDiv">
	<div>
        <div style = "text-align: right">
            <button class = "btn btn-default btn-sm" onclick = resetImageProperties() title = "Reset" type = "button">
                <span class = "fa fa-undo"></span>
            </button>
            <button class = "btn btn-default btn-sm" onclick = 'javascript:$( "#imagePropertiesDiv" ).hide()' type = "button">
                <span class = "glyphicon glyphicon-remove"></span>
            </button>
        </div>
        <table class = "table">
            <tr>
                <td style="color: white; min-width:135px">Bands:</td>
                <td>
                    <select class = "form-control" id = "selectBandsMethodSelect" onchange = "selectBands( this.value )">
                        <g:each in = "${[ "default", "manual" ]}">
                            <option value = ${ it }>${ it.capitalize() }</option>
                        </g:each>
                    </select>
                    <table id = "manualBandSelectTable" style = "background: none; display: none">
                        <tr style = "text-align: center; color: white;">
                            <td>R</td>
                            <td>G</td>
                            <td>B</td>
                        </tr>
                        <tr>
                            <g:each in = "${[ "red", "green", "blue" ]}">
                                <td>
                                    <select class = "form-control" id = "${ it }GunSelect" onchange = "updateImageProperties( true )">
                                        <g:each in = "${[ 1, 2, 3, 4 ]}">
                                            <option value = ${ it }>${ it }</option>
                                        </g:each>
                                    </select>
                                </td>
                            </g:each>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="color: white;">Brightness: <span id = "brightnessValueSpan"></span></td>
                <td>
                    <input id = "brightnessSliderInput" type = "text"/>
                </td>
            </tr>
            <tr>
                <td style="color: white;">Contrast: <span id = "contrastValueSpan"></span></td>
                <td>
                    <input id = "contrastSliderInput" type = "text"/>
                </td>
            </tr>
            <tr id="dra-control">
                <td style="color: white;">DRA: <span id = "dynamicRangeValueSpan" style="color: white;"></span></td>
                <td>
                    <select class = "form-control" id = "dynamicRangeSelect" onchange = "updateImageProperties( true )">
                        <g:each in = "${[
                            [ name: "None", value: "none" ],
                            [ name: "Auto Min Max", value: "auto-minmax" ],
                            [ name: "Auto Percentile", value: "auto-percentile" ],
                            [ name: "Linear", value: "linear" ],
                            [ name: "STD 1", value: "std-stretch-1" ],
                            [ name: "STD 2", value: "std-stretch-2" ],
                            [ name: "STD 3", value: "std-stretch-3" ]
                        ]}">
                            <option value = ${ it.value }>${ it.name }</option>
                        </g:each>
                    </select>
					<div id = "DRA_slider_parent">
                    	<div id = "dynamicRangeSliderInput" type = "text"></div>
					</div>

					<div id = "DRA_midpoint_parent">
						<div id = "DRA_Midpoint" type = "text"></div>
					</div>
                </td>
            </tr>
            <tr>
                <td style="color: white;">DRA Region:</td>
                <td>
                    <select class = "form-control" id = "dynamicRangeRegionSelect" onchange = "updateImageProperties( true )">
                        <g:each in = "${[
                            [ name: "Global", value: "false" ],
                            [ name: "Viewport", value: "true" ]
                        ]}">
                            <option value = ${ it.value }>${ it.name }</option>
                        </g:each>
                    </select>
                </td>
            </tr>
            <tr>
                <td style="color: white;">Interpolation:</td>
                <td>
                    <select class = "form-control" id = "interpolationSelect" onchange = "updateImageProperties( true )">
                        <g:each in = "${[
                            "bessel",
                            "bilinear",
                            "blackman",
                            "bspline",
                            "catrom",
                            "cubic",
                            "gaussian",
                            "hamming",
                            "hermite",
                            "lanczos",
                            "magic",
                            "mitchell",
                            "nearest",
                            "quadratic",
                            "sinc"
                        ]}">
                            <option value = ${ it }>${ it.capitalize() }</option>
                        </g:each>
                    </select>
                </td>
            </tr>
            <tr>
                <td style="color: white;">Keep Visible:</td>
                <td>
                    <select class = "form-control" id = "keepVisibleSelect" onchange = "updateImageProperties( false )">
                        <g:each in = "${[
                            [ name: "No", value: false ],
                            [ name: "Yes", value: true ]
                        ]}">
                            <option value = ${ it.value }>${ it.name }</option>
                        </g:each>
                    </select>
                </td>
            </tr>
            <tr>
                <td style="color: white;">Null Pixel Flip:</td>
                <td>
                    <select class = "form-control" id = "nullPixelFlipSelect" onchange = "updateImageProperties( true )">
                        <g:each in = "${[
                            [ name: "False", value: "false" ],
                            [ name: "True", value: "true" ]
                        ]}">
                            <option value = ${ it.value }>${ it.name }</option>
                        </g:each>
                    </select>
                </td>
            </tr>
            <tr>
                <td style="color: white;">Opacity: <span id = "opacityValueSpan"></span></td>
                <td id="opacity_slider">
                    <input data-slider-id = "opacitySlider" id = "opacitySliderInput" type = "text"/>
                </td>
            </tr>
            <tr>
                <td style="color: white;">Sharpen: <span id = "sharpenValueSpan"></span></td>
                <td>
                    <input id = "sharpenSliderInput" type = "text"/>
                </td>
            </tr>
        </table>
	</div>
</div>

<asset:script type = "text/javascript">
    $( document ).ready( function() {
	   var rgb = $( 'body' ).css( 'background-color' );
	   var colors = ol.color.asArray( rgb ).splice( 0, 3 );
	   $( '#imagePropertiesDiv' ).css( 'background-color', 'rgba(' + colors.join( ',' ) + ', 0.75)' );
    } );
</asset:script>
