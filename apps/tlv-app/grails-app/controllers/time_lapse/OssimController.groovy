package time_lapse


class OssimController {


	def getHeight() {
		//def command = "ossim-info --height ${ params.latitude } ${ params.longitude }"
		//def process = command.execute()
		//def text = process.getText()
		def text = '''
Opened cell:            /data/elevation/dted/level0/e070/n70.dt0
MSL to ellipsoid delta: -9.2519998550415
Height above MSL:       51
Height above ellipsoid: 41.7480001449585
Geoid value:            -9.2519998550415
'''


		render text
	}
}
