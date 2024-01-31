import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import JSZip from "jszip";
import Sections from "./Sections";
import InsightFacade from "./InsightFacade";

export default class DatasetProcessor {
	private insightFacade: InsightFacade;
	constructor() {
		this.insightFacade = new InsightFacade();
	}

	// eslint-disable-next-line max-lines-per-function
	public async validateDataset(id: string, content: string): Promise<Sections[]> {
		let zip = new JSZip();
		return zip.loadAsync(content, {base64: true}) .then ((rawFile: any) => {
			return new Promise((resolve, reject) => {
				const coursesFolder = rawFile.folder("courses");
				if (!coursesFolder) {
					reject (new InsightError("No courses folder"));
				} else {
					resolve(coursesFolder);
				}
			});
		}).then((coursesFolder: any) => {
			const promises: Array<Promise<string>> = [];
			coursesFolder.forEach((relativePath: string, file: any) => {
				promises.push(file.async("text"));
			});
			if (promises.length === 0) {
				return Promise.reject(new InsightError("No files in the 'courses'"));
			}
			return Promise.all(promises);
		}).then((files: any) => {
			let validSections: Sections[] = [];
			for (let file of files) {
				if (file === "" || file === null || file === undefined) {
					continue;
				}
				try {
					const jsonResult = JSON.parse(file);
					const sections = jsonResult["result"];
					for (let section of sections) {
						if (this.isValidSection(section)) {
							let validSection = new Sections(
								section["Title"], section["id"], section["Professor"], section["Subject"],
								section["Year"], section["Avg"], section["Course"], section["Pass"], section["Fail"],
								section["Audit"]
							);
							validSection.update(section);
							validSections.push(validSection);
						}
					}
				} catch {
					return Promise.reject(new InsightError("Invalid JSON"));
				}
			}
			if (validSections.length === 0) {
				return Promise.reject(new InsightError("No valid sections"));
			} else {
				return validSections;
			}
		}).then((validSections: Sections[]) => {
			return this.insightFacade.writeFile(id, validSections);
		}).catch((err) => {
			return Promise.reject(err);
		});
	}

	private isValidSection(section: any): boolean {
		return (
			"id" in section &&
			"Course" in section &&
			"Professor" in section &&
			"Subject" in section &&
			"Year" in section &&
			"Avg" in section &&
			"Pass" in section &&
			"Fail" in section &&
			"Audit" in section
		);
	}

}
