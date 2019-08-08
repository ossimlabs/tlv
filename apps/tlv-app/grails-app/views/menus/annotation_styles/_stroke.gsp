<div class = "row">
    <div class = "col-md-4">
        <label>Color</label>
        <input class = "form-control" id = "strokeColorInput" type = "color">
    </div>
    <div class = "col-md-4">
        <label>Opacity:</label>
        <span>0%</span>
        <input class = "form-control" data-slider-max = "100" data-slider-min = "0" data-slider-tooltip = "hide" data-slider-value = "0" name = "strokeOpacitySliderInput" style = "width: 100%" type = "text">
    </div>
    <div class = "col-md-4">
        <label>Width</label>
        <input class = "form-control" id = "strokeWidthInput" max = "100" min = "1" step = "1" type = "number">
    </div>
</div>

<div class = "row">
    <div class = "col-md-4">
        <label>Line Dash Length</label>
        <input class = "form-control" id = "strokeLineDashLengthInput" step = "1" type = "number">
    </div>
    <div class = "col-md-4">
        <label>Line Dash Spacing</label>
        <input class = "form-control" id = "strokeLineDashLengthSpacingInput" step = "1" type = "number">
    </div>
    <div class = "col-md-4">
        <label>Line Dash Offset</label>
        <input class = "form-control" id = "strokeLineDashOffsetInput" step = "1" type = "number">
    </div>
</div>

<div class = "row">
    <div class = "col-md-4">
        <label>Line Cap</label>
        <select class = "form-control" id = "strokeLineCapSelect">
            <option value = "butt">Butt</option>
            <option value = "round">Round</option>
            <option value = "square">Square</option>
        </select>
    </div>
    <div class = "col-md-4">
        <label>Line Join</label>
        <select class = "form-control" id = "strokeLineJoinSelect">
            <option value = "bevel">Bevel</option>
            <option value = "miter">Miter</option>
            <option value = "round">Round</option>
        </select>
    </div>
    <div class = "col-md-4">
        <label>Miter Limit</label>
        <input class = "form-control" id = "strokeMiterLimitInput" step = "1" type = "number">
    </div>
</div>
