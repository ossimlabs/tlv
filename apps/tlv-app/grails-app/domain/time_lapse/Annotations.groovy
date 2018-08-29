package time_lapse


class Annotation {

    String confidence
    String geometryOrtho
    String geometryPixel
    String imageId
    Double ontology
    String type
    String user


    static mapping = {
        geometry type: "text"
    }

}
