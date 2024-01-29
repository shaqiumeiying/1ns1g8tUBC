export default class Sections {
	private readonly title: string;
	private readonly uuid: string;
	private readonly instructor: string;
	private readonly dept: string;
	private readonly year: number;
	private readonly avg: number;
	private readonly id: string;
	private readonly pass: number;
	private readonly fail: number;
	private readonly audit: number;
	constructor() {
		this.title = "";
		this.uuid = "";
		this.instructor = "";
		this.dept = "";
		this.year = 0;
		this.avg = 0;
		this.id = "";
		this.pass = 0;
		this.fail = 0;
		this.audit = 0;
	}
}
