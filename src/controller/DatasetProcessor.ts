import {InsightError} from "./IInsightFacade";
import JSZip from "jszip";
import Sections from "./Sections";
import InsightFacade from "./InsightFacade";
import * as parse5 from "parse5";
import Rooms from "./Rooms";

export default class DatasetProcessor {
	public async validateSections(id: string, content: string): Promise<Sections[]> {
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
				if (file === "" || file === null || file === undefined) {
					/**/
				} else {
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

	public async validateRooms(id: string, content: string): Promise<Rooms[]> {
		try {
			const zip = new JSZip();
			const rawFile = await zip.loadAsync(content, {base64: true});

			// 1: Get Index.htm
			const indexHtmlContent = await this.extractIndexHtml(rawFile);

			// 2: Validate Index.htm
			if (this.validateIndexHTML(indexHtmlContent)) {

				// 3: Extract valid building HTMLs
				const buildingHtmls = await this.extractValidBuildingHtmls(rawFile);

				// 4: Extract rooms from valid building HTMLs
				const validRooms: Rooms[] = await this.extractRoomsFromBuildingHtmls(rawFile, buildingHtmls);
				// 5: GEO location???

				// 6: Store valid rooms in the dataset
				if (validRooms.length === 0) {
					return Promise.reject(new InsightError("No valid sections"));
				}
				await InsightFacade.writeFile(id, validRooms);
				return Promise.resolve(validRooms);
			} else {
				return Promise.reject(new InsightError("Invalid index HTML"));
			}
		} catch (err) {
			return Promise.reject(new InsightError("Error processing dataset"));
		}
	}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////////////////HELPER FUNCTIONS/////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	private async extractIndexHtml(rawFile: JSZip): Promise<string> {
		// TODO: Extract index htm using parse 5
		const indexHtmlFile = rawFile.file("index.htm");
		if (!indexHtmlFile) {
			throw new InsightError("Index.htm not found");
		}
		return await indexHtmlFile.async("text");
	}

	private validateIndexHTML(indexHtmlContent: string): boolean {
		// TODO: validate extracted index htm
		const document = parse5.parse(indexHtmlContent);

		// find the correct table and validate building links
		return true;
	}

	private async extractValidBuildingHtmls(rawFile: JSZip): Promise<string[]> {
		// TODO: Extract valid building HTMLs, push them to an array
		// ...
		return [];
	}

	private async extractRoomsFromBuildingHtmls(rawFile: JSZip, buildingHtmls: string[]): Promise<Rooms[]> {
		// TODO: takes a zip and array? find valid rooms and return them
		const validRooms: Rooms[] = [];
		// Loop through each valid building HTML
			// Add valid rooms to the list
		// need to call isValidRoom and extractRoomsFromBuilding
		return validRooms;
	}

	private async extractRoomsFromBuilding(rawFile: JSZip, buildingHtmlFile: string): Promise<Rooms[]> {
		// TODO: Implement the extraction for rooms from building HTML
		return [];

	}

	private isValidRoom(room: Rooms): boolean {
		// TODO: Implement the validation logic for a room
		return true;
	}

}
