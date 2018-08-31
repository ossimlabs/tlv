package time_lapse


class Annotation {

    String confidence
    Date date = new Date()
    String geometryOrtho
    String geometryPixel
    String imageId
    Double ontology
    String type
    String user
    Boolean validated = false


    static mapping = {
        geometryOrtho index: "annotation_geometry_ortho_idx"
        geometryPixel index: "annotation_geometry_pixel_idx"
        imageId index: "annotation_image_id_idx"
        type index: "annotation_type_idx"
        user index: "annotation_user_idx"
    }
}
