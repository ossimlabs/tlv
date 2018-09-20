package time_lapse


class Annotation {

    String confidence
    Date date = new Date()
    String dted
    String filename
    String geometryOrtho
    String geometryPixel
    String imageId
    String link
    Double ontology
    String type
    String username
    Boolean validated = false


    static constraints = {
        date()
        validated()
        type()
        imageId()
        ontology()
        username()
        link()
    }

    static mapping = {
        geometryOrtho index: "annotation_geometry_ortho_idx", type: "text"
        geometryPixel index: "annotation_geometry_pixel_idx", type: "text"
        link type: "text"
        type index: "annotation_type_idx"
        username index: "annotation_username_idx"
    }
}
