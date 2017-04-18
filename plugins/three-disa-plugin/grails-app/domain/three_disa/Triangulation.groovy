package three_disa


class Triangulation {

    DemGeneration demGeneration
    Date finish
    Date start
    String status


    static belongsTo = Job

    static constraints = {
        demGeneration nullable: true
        finish nullable: true
        start nullable: true
    }

    static hasMany = [ images: Image ]
}
