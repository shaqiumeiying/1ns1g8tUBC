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

	constructor(title: string, uuid: string, instructor: string,
		dept: string, year: number, avg: number,
		id: string, pass: number, fail: number, audit: number) {
		this.title = title;
		this.uuid = uuid;
		this.instructor = instructor;
		this.dept = dept;
		this.year = year;
		this.avg = avg;
		this.id = id;
		this.pass = pass;
		this.fail = fail;
		this.audit = audit;
	}

	public update(nameIt: any): any {
		const section: any = {};
		if ("Title" in nameIt) {
			section["title"] = nameIt["Title"].toString();
		}
		if ("id" in nameIt) {
			section["uuid"] = nameIt["id"].toString();
		}
		if ("Course" in nameIt) {
			section["id"] = nameIt["Course"].toString();
		}
		if ("Professor" in nameIt) {
			section["instructor"] = nameIt["Professor"].toString();
		}
		if ("Subject" in nameIt) {
			section["dept"] = nameIt["Subject"].toString();
		}
		if ("Year" in nameIt) {
			if (nameIt["Section"] === "overall") {
				section["year"] = 1900;
			} else {
				section["year"] = Number(nameIt["Year"]);
			}
		}
		if ("Avg" in nameIt) {
			section["avg"] = nameIt["Avg"];
		}
		if ("Pass" in nameIt) {
			section["pass"] = nameIt["Pass"];
		}
		if ("Fail" in nameIt) {
			section["fail"] = nameIt["Fail"];
		}
		if ("Audit" in nameIt) {
			section["audit"] = nameIt["Audit"];
		}
	}
}
