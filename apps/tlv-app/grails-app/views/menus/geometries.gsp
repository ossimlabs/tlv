<!DOCTYPE html>
<html>
	<head>
		<meta charset = "utf-8">
		<meta http-equiv = "X-UA-Compatible" content = "IE=edge">
		<meta name = "viewport" content = "width=device-width, initial-scale = 1">
		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

		<title>TLV Geometries</title>
		<link href = "${ request.contextPath }/assets/tlvicon.ico" rel = "shortcut icon" type = "image/x-icon">

		<asset:stylesheet src = "menus/geometries-bundle.css"/>
		<asset:javascript src = "menus/geometries-bundle.js"/>
		<asset:script type = "text/javascript">
			var tlv = ${ raw(tlvParams) };
			tlv.contextPath = "${ request.contextPath }";
		</asset:script>
		<style>
			body {
		        margin: 0px;
		        overflow: hidden;
		    }
        </style>
	</head>
	<body>
		<div id = "container"></div>
		<script>
				var camera, renderer, scene;

				$( document ).ready( function() {
					scene = new THREE.Scene();

					setupCamera();
					setupLights();
					setUpRenderer();

					var origin = new THREE.Vector3( 0, 0, 0 );
					var length = 1;

					var az = tlv.azimuth ? parseFloat( tlv.azimuth ) : null;
					var el = tlv.elevation ? parseFloat( tlv.elevation ) : null;
					var sunAz = tlv.sunAzimuth ? parseFloat( tlv.sunAzimuth ) : null;
					var sunEl = tlv.sunElevation ? parseFloat( tlv.sunElevation ) : null;
					$.each(
						[
							{
								color: "rgb( 126, 126, 126 )",
								direction: new THREE.Vector3( 1, 0, 0 ).normalize(),
								label: "E"
							},
							{
								color: "rgb( 255, 0, 0 )",
								direction: new THREE.Vector3( 0, 1, 0 ).normalize(),
 								label: "N"
							},
							{
								color: "rgb( 0, 0, 255 )",
								direction: ( az && el ) ? sphericalToXYZ( az + 90, el, 1 ).normalize() : null,
								label: "Sat."
							},
							{
								color: "rgb( 255, 255, 0 )",
								direction: ( sunAz && sunEl ) ? sphericalToXYZ( sunAz + 180, sunEl, 1 ).normalize() : null,
								label: "Sun"
							}
						],
						function ( index, arrow ) {
							if ( arrow.direction ) {
								var arrowHelper = new THREE.ArrowHelper( arrow.direction, origin, length, arrow.color );
								scene.add( arrowHelper );
								addArrowLabel( arrow.color, arrow.direction.clone().multiplyScalar( 1.125 ), arrow.label );
							}
						}
					);

					var controls = new THREE.OrbitControls( camera, renderer.domElement );

					//$( window ).resize( onWindowResize );

					animate();
				});

                function onWindowResize() {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize( window.innerWidth, window.innerHeight );
                }

				function addArrowLabel( color, position, text ) {
                    new THREE.FontLoader().load( tlv.contextPath + "/assets/helvetiker_regular.typeface.json", function ( font ) {
                        var geometry = new THREE.TextGeometry( text, {
                            font: font,
                            size: 0.125,
                            height: 0.01
                        });
                        geometry.center();console.dir(position);
                        geometry.translate( position.x, position.y, position.z );

                        var mesh = new THREE.Mesh(
                            geometry,
                            new THREE.MeshPhongMaterial({
                                color: color
                            })
                        );

                        var object = new THREE.Object3D();
                        object.add( mesh );

                        scene.add( object );

                    });
                }

				function animate() {
					requestAnimationFrame( animate );
					renderer.render( scene, camera );
				}

				function setupCamera() {
					camera = new THREE.PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 1, 1000 );
					camera.position.set( 10, 10, 10 );
					camera.lookAt( scene.position );
				}

				function setupLights() {
					$.each(
						[
							{ x:  2, y:  0, z:  0 },
							{ x:  0, y:  2, z:  0 },
							{ x: -2, y:  0, z:  0 },
							{ x:  0, y: -2, z:  0 },
							{ x:  0, y:  0, z:  2 },
							{ x:  0, y:  0, z: -2 },
						],
						function( index, position ) {
							var light = new THREE.PointLight();
							light.position.set( position.x, position.y, position.z );
							scene.add( light );
						}
					);
				}

				function setUpRenderer() {
					renderer = new THREE.WebGLRenderer( { antialias: true } );
					renderer.setPixelRatio( window.devicePixelRatio );
					renderer.setSize( window.innerWidth, window.innerHeight );
					$( "#container" ).append( renderer.domElement );
				}

                function sphericalToXYZ( azimuth, elevation, radius ) {
                        var projR = Math.cos( parseFloat( elevation ) * Math.PI / 180 );
                        var x = projR * Math.cos( ( azimuth ) * Math.PI / 180 );
                        var y = projR * Math.sin( ( azimuth )* Math.PI / 180 );
                        var z = Math.sin( elevation * Math.PI / 180 );


                        return new THREE.Vector3( x, y, z );
                }
                </script>
		<asset:deferredScripts/>
	</body>
</html>
