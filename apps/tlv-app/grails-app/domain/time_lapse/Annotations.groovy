package time_lapse


class Annotation {

    String be
    String confidence
    String geometry
    String imageId
    String type
    String user


    static mapping = {
        geometry type: "text"
    }

}
