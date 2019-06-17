<g:render template = "/menus/annotation_styles/fill"/>

<div class = "row">
    <div class = "col-md-4">
        <label>Offset X</label>
        <input class = "form-control" id = "textOffsetXInput" step = "1" type = "number">
    </div>
    <div class = "col-md-4">
        <label>Offset Y</label>
        <input class = "form-control" id = "textOffsetYInput" step = "1" type = "number">
    </div>
    <div class = "col-md-4">
        <label>Sacle</label>
        <input class = "form-control" id = "textScaleInput" step = "0.1" type = "number">
    </div>
</div>

<div class = "row">
    <div class = "col-md-4">
        <label>Rotate With View</label>
        <select class = "form-control" id = "textRotateWithViewSelect">
            <option vlaue = "flase">No</option>
            <option value = "true">Yes</option>
        </select>
    </div>
    <div class = "col-md-4">
        <label>Rotation</label>
        <input class = "form-control" id = "textRotationInput" type = "number">
    </div>
    <div class = "col-md-4">
        <label>Text Align</label>
        <select class = "form-control" id = "textTextAlignSelect">
            <option value = "left">Left</option>
            <option value = "right">Right</option>
            <option value = "center">Center</option>
            <option value = "end">End</option>
            <option value = "start">Start</option>
        </select>
    </div>
</div>

<div class = "row">
    <div class = "col-md-12">
        <label>Text</label>
        <input class = "form-control" id = "textTextInput" type = "text">
    </div>
</div>

<div class = "row">
    <div class = "col-md-12">
        <label>Label</label>
        <select class = "form-control" id = "textTextSelect"></select>
    </div>
</div>
