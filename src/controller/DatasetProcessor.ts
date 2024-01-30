import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import JSZip from "jszip";
import Sections from "./Sections";

export default class DatasetProcessor {
	private validFieldList: string[] = [
		"dept",
		"id",
		"instructor",
		"title",
		"uuid",
		"avg",
		"pass",
		"fail",
		"audit",
		"year",
	];

	public async validateDataset(id: string, content: string): Promise<Sections[]> {
		let zip = new JSZip();
		const validSections: Sections[] = [];
		return zip.loadAsync(content, {base64: true})
			.then((rawFile: any) => {
				const promises: Array<Promise<string>> = [];
				// check if root folder is courses if true then loop for each files in the courses folder
				// push into promises, else, reject
				// reference: https://stackoverflow.com/questions/54274686/how-to-wait-for-asynchronous-jszip-foreach-call-to-finish-before-running-next
				try {
					rawFile.folder("courses").forEach((relativePath: string, file: any) => {
						promises.push(file.async("text"));
					});
				} catch {
					return Promise.reject(new InsightError("No course folder"));
				}

				if (promises.length === 0) {
					return Promise.reject(new InsightError("No files in the 'courses' "));
				}
				return Promise.all(promises);
			}).then((files: any) => {
				for (let file of files) {
					if (file === "" || file === null || file === undefined) {
						continue;
					}
					try {
						const jsonResult = JSON.parse(files);
						const sections = jsonResult["result"];
						for (let section of sections) {
							const filteredSection = Sections.filtering(section);
							if(filteredSection.length === 10){
								validSections.push(filteredSection);
							}
						}
						if (validSections.length === 0) {
							return Promise.reject(new InsightError("No valid sections"));
						}
					} catch {
						return Promise.reject(new InsightError("Invalid JSON"));
					}
				}
				return Promise.resolve(validSections);// return the list of sections we filtered
			});
	}
}
