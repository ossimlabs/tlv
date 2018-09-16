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
    String user
    Boolean validated = false


    static constraints = {
        date()
        validated()
        type( nullable: true )
        imageId()
        ontology( nullable: true )
        user( nullable: true )
        link()

        dted( nullable: true )
    }

    static mapping = {
        geometryOrtho index: "annotation_geometry_ortho_idx", type: "text"
        geometryPixel index: "annotation_geometry_pixel_idx", type: "text"
        link type: "text"
        type index: "annotation_type_idx"
        user index: "annotation_user_idx"
    }
}
