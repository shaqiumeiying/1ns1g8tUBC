import {InsightError} from "./IInsightFacade";
import JSZip from "jszip";
import Sections from "./Sections";
import InsightFacade from "./InsightFacade";

export default class DatasetProcessor {
	public async validateDataset(id: string, content: string): Promise<Sections[]> {
		try {
			const zip = new JSZip();
			const rawFile = await zip.loadAsync(content, {base64: true});
			const coursesFolder = rawFile.folder("courses");
			if (!coursesFolder) {
				return Promise.reject(new InsightError("No courses folder"));
			}
			const files = await Promise.all(coursesFolder.file(/.+/).map(async (file) => file.async("text")));
			const validSections: Sections[] = [];
			for (const file of files) {
				if (file === "" || file === null || file === undefined) {/**/} else {
					const jsonResult = JSON.parse(file);
					const sections = jsonResult["result"];
					for (const section of sections) {
						if (this.isValidSection(section)) {
							const validSection = new Sections(
								section["Title"],
								section["id"],
								section["Professor"],
								section["Subject"],
								section["Year"],
								section["Avg"],
								section["Course"],
								section["Pass"],
								section["Fail"],
								section["Audit"]
							);
							validSections.push(validSection.update(section));
						}
					}
				}
			}
			if (validSections.length === 0) {
				return Promise.reject(new InsightError("No valid sections"));
			}
			await InsightFacade.writeFile(id, validSections);
			return Promise.resolve(validSections);
		} catch (err) {
			return Promise.reject(new InsightError("Error processing dataset"));
		}
	}

	private isValidSection(section: any): boolean {
		const requiredFields = [
			"Title",
			"id",
			"Course",
			"Professor",
			"Subject",
			"Year",
			"Avg",
			"Pass",
			"Fail",
			"Audit",
		];
		return requiredFields.every((field) => field in section);
	}
	//
}
