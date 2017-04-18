package three_disa


class Image {

    String filename
    String sensorModel


    static belongsTo = Triangulation

    static hasMany = [ tiePoints: TiePoint ]
}
