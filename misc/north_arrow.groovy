import java.awt.Color
import java.awt.image.BufferedImage
import java.awt.RenderingHints
import javax.imageio.ImageIO


CLEAR = new Color( 0, 0, 0, 0 )
BLACK = new Color( 0, 0, 0, 255 )
WHITE = new Color( 255, 255, 255, 255 )

BUFFER = 50
SIZE = 1000
STROKE_WIDTH = 50

def image = new BufferedImage( SIZE, SIZE, BufferedImage.TYPE_4BYTE_ABGR )
def graph = image.createGraphics()

setRenderingHints( graph )
drawBackground( graph )
drawBlackCircle( graph )
drawWhiteCircle( graph )
drawPointer( graph )
drawN( graph )
graph.dispose()
writeFile( image )


def drawBackground( graphics ) {
	graphics.setColor( CLEAR )
	graphics.fillRect( 0, 0, SIZE, SIZE )
}

def drawBlackCircle( graphics ) {
	graphics.setColor( BLACK )
	graphics.drawOval( 0, 0, SIZE, SIZE )
	graphics.fillOval( 0, 0, SIZE, SIZE )
}

def drawN( graphics ) {
	def height = ( 0.5 * getInnerDiameter() ).toInteger()
	def width = ( 0.35 * getInnerDiameter() ).toInteger()
	def bottomY = getInnerCircleY() + getInnerDiameter() / 2 + height / 2
	def topY = getInnerCircleY() + getInnerDiameter() / 2  - height / 2
	def rightX = getInnerCircleX() + getInnerDiameter() / 2 + STROKE_WIDTH / 2
	def leftX = rightX - width

	int[] x = [ 
		rightX, 
		rightX, 
		rightX - STROKE_WIDTH, 
		leftX + STROKE_WIDTH, 
		leftX + STROKE_WIDTH, 
		leftX, 
		leftX, 
		leftX + STROKE_WIDTH, 
		rightX - STROKE_WIDTH, 
		rightX - STROKE_WIDTH 
	]
	int[] y = [ 
		height - 2 * BUFFER, 
		bottomY, 
		bottomY, 
		topY + 2 * STROKE_WIDTH, 
		bottomY, 
		bottomY, 
		topY, 
		topY, 
		bottomY - 2 * STROKE_WIDTH, 
		height - 2* BUFFER 
	]
	graphics.fillPolygon( x, y, 10 )
}

def drawPointer( graphics ) {
	def height = getOuterCircleY() - 2 * BUFFER
	def width = height
	int[] x = [ SIZE / 2, SIZE / 2 + width / 2, SIZE / 2 - width / 2 ]
	int[] y = [ BUFFER, BUFFER + height, BUFFER + height ]
	graphics.setColor( WHITE )
	graphics.fillPolygon( x, y, 3 )
}

def drawWhiteCircle( graphics ) {
	def outerDiameter = getOuterDiameter()
	def outerX = getOuterCircleX()
	def outerY = getOuterCircleY()
	graphics.setColor( WHITE )
	graphics.fillOval( outerX, outerY, outerDiameter, outerDiameter )

	def innerCircleDiameter = getInnerDiameter()
	def innerX = getInnerCircleX()
	def innerY = getInnerCircleY()
	graphics.setColor( BLACK )
	graphics.fillOval( innerX, innerY, innerDiameter, innerDiameter )
}

def getInnerCircleX() {
	def x = getOuterCircleX() + STROKE_WIDTH


	return x as Integer
}

def getInnerCircleY() {
	def y = getOuterCircleY() + STROKE_WIDTH


	return y as Integer
}

def getInnerDiameter() {
	def diameter = getOuterDiameter() - 2 * STROKE_WIDTH


	return diameter as Integer
}

def getOuterDiameter() {
	def diameter = 0.66 * SIZE


	return diameter as Integer
}

def getOuterCircleX() {
	def x = ( SIZE - getOuterDiameter() ) / 2


	return x as Integer
}

def getOuterCircleY() {
	def y = SIZE - getOuterDiameter() - BUFFER


	return y as Integer
}

def setRenderingHints( graphics ) {
	def hints = new RenderingHints( RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON )
	graphics.setRenderingHints( hints )
}

def writeFile( bufferedImage ) {
	def file = new File( "north-arrow.png" )
	ImageIO.write( bufferedImage, "png", file )
}
