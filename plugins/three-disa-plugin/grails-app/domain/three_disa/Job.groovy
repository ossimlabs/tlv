package three_disa


class Job {

	String bbox
	Triangulation triangulation
	String name
	Date submitted


	static mapping = { date index: "job_submitted_idx" }
}
