<!DOCTYPE html>
<html>
    <head>
        <meta charset = "utf-8">
		<meta http-equiv = "X-UA-Compatible" content = "IE=edge">
		<meta name = "viewport" content = "width=device-width, initial-scale = 1">
		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

        <asset:stylesheet src = "annotation-quality-control-bundle.css"/>
    </head>
    <body>
        <div class = "container-fluid">
            <g:render plugin = "omar-security-plugin" template = "/security-classification-header"/>
            <h1 style = "text-align: center">Annotation Quality Control</h1>

            <div class = "row" style = "text-align: center">
                <ul class="pagination">
                    <g:paginate total="${annotationCount ?: 0}" />
                </ul>
                <asset:script type = "text/javascript">
                    $( '.pagination' ).find( 'a' ).wrap( '<li></li>' );
                    $( '.pagination' ).find( 'span' ).wrap( '<li class = "active"></li>' );
                </asset:script>
            </div>
            <g:each in = "${ annotationList }">
                <div class = "row">
                    <div class = "col-md-4">
                        <table class = "table">
                            <tr>
                                <td style = "text-align: right">Confidence:</td>
                                <td>${ it.confidence }</td>
                            </tr>
                            <tr>
                                <td style = "text-align: right">Date:</td>
                                <td>${ it.date }</td>
                            </tr>
                            <tr>
                                <td style = "text-align: right">Image ID:</td>
                                <td>${ it.imageId }</td>
                            </tr>
                            <tr>
                                <td style = "text-align: right">Type:</td>
                                <td>${ it.type }</td>
                            </tr>
                            <tr>
                                <td style = "text-align: right">View:</td>
                                <td>
                                    <a href = "${ it.link }" target = "_blank">Click Here</a>
                                </td>
                            </tr>
                            <tr>
                                <td style = "text-align: right">User:</td>
                                <td>${ it.username }</td>
                            </tr>
                            <tr>
                                <td style = "text-align: right">Validation:</td>
                                <td>
                                    <button class = "btn btn-success" onclick = 'javascript:updateValidation( ${ it.id }, "approved" )'>
                                        <span class = "glyphicon glyphicon-ok"></span>
                                        Approve
                                    </button>
                                    <button class = "btn btn-info" onclick = goToNextAnnotation()>
                                        <span class = "glyphicon glyphicon-repeat"></span>
                                        Skip
                                    </button>
                                    <button class = "btn btn-danger" onclick = 'javascript:updateValidation( ${ it.id }, "declined" )'>
                                        <span class = "glyphicon glyphicon-remove"></span>
                                        Decline
                                    </button>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div class = "col-md-8">
                        <div class = "embed-responsive embed-responsive-16by9">
                            <iframe class = "embed-responsive-item" src = "${ it.link }&hideAcquisitionDate=true&hideImageId=true&hideMapCoordinates=true&hideSecurityBanner=true"></iframe>
                        </div>
                    </div>
                </div>
            </g:each>
        </div>

        <asset:javascript src = "/annotation-quality-control-bundle.js"/>
        <asset:script type = "text/javascript">
            function goToNextAnnotation() {
                var href = $( 'a:contains("Next")' )[ 0 ].href;
                window.location.href = href;
            }

            function updateValidation( id, validation ) {
                var params = {
                    id: id,
                    validation: validation
                };
                $.ajax({
                    url: '${ request.contextPath }/annotation/updateValidation?' + $.param( params )
                })
                .always( function() {
                    goToNextAnnotation();
                } );
            }
        </asset:script>
        <asset:deferredScripts/>
    </body>
</html>
