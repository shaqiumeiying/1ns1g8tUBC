import Rooms from "./Rooms";
import JSZip from "jszip";
import {InsightError} from "./IInsightFacade";
import InsightFacade from "./InsightFacade";
import * as parse5 from "parse5";
import * as fs from "fs";

export default class RoomProcessor {
	private validBldgTable: any[] = [];
	private validRoomTable: any[] = [];
	public async validateRooms(id: string, content: string): Promise<Rooms[]> {
		try {
			const zip = new JSZip();
			const rawFile = await zip.loadAsync(content, {base64: true});

			// 1: Find Index.htm
			const indexHtmlContent = await this.findIndexHtml(rawFile);

			// 2: Validate Index.htm
			if (this.validateIndexHTML(indexHtmlContent)) {
				// 3: Extract valid building HTMLs
				const buildingHtmls = await this.extractValidBuildingHtmls(this.validBldgTable, rawFile);

				// 4: Extract rooms from valid building HTMLs
				const validRooms: Rooms[] = await this.extractRoomsFromBuildingHtmls(rawFile, buildingHtmls);
				// console.log(this.validBldgTable);
				// console.log(this.validRoomTable);
				// 5: GEO location???

				// 6: Store valid rooms in the dataset
				if (validRooms.length === 0) {
					return Promise.reject(new InsightError("No valid sections"));
				}
				// start pushing fragments of data into rooms datatype
				await InsightFacade.writeFile(id, validRooms);
				return Promise.resolve(validRooms);
			} else {
				return Promise.reject(new InsightError("Invalid index HTML"));
			}
		} catch (err) {
			return Promise.reject(new InsightError("Error processing dataset"));
		}
	}

	private async findIndexHtml(rawFile: JSZip): Promise<string> {
		const indexHtmlFile = rawFile.file("index.htm");
		if (!indexHtmlFile) {
			throw new InsightError("Index.htm not found");
		}
		return await indexHtmlFile.async("text");
	}

	private validateIndexHTML(indexHtmlContent: string) {
		const document = parse5.parse(indexHtmlContent);
		const buildingTable = this.findValidBuildingTable(document);
		return !!buildingTable;
	}

	private findValidBuildingTable(document: any): any | null {
		const requiredClasses = ["views-field views-field-field-building-code",
			"views-field views-field-title", "views-field views-field-field-building-address"];
		return this.findTableWithCells(document, requiredClasses);
	}

	private findTableWithCells(node: any, requiredClasses: string[]): any | null {
		if (node.childNodes && node.childNodes.length > 0) {
			for (const childNode of node.childNodes) {
				if (childNode.nodeName === "tbody" && this.hasRequiredClass(childNode, "tr", requiredClasses, 3)) {
					return this.validBldgTable = this.getTableContent(childNode);
				} else if (childNode.nodeName !== "tbody" && childNode.childNodes && childNode.childNodes.length > 0) {
					const result = this.findTableWithCells(childNode, requiredClasses);
					if (result) {
						return result;
					}
				}
			}
		}
		return null;
	}

	private hasRequiredClass(node: any, elementName: string, requiredClasses: string[],totalEntry: number): boolean {
		let validEntries = 0;

		for (const childNode of node.childNodes) {
			if (childNode.nodeName === elementName &&
				childNode.childNodes &&
				childNode.childNodes.length > 0
			) {
				Array.from(childNode.childNodes).some((cn: any) => {
					if (cn.nodeName === "td" && cn.attrs && cn.attrs[0].value) {
						if (requiredClasses.includes(cn.attrs[0].value)) {
							validEntries++;
						}
					}
					return false;
				});
				if (validEntries === totalEntry) {
					return true;
				}
			}
		}
		return false;
	}

	private getTableContent(node: any): any[] {
		const tableDocument = [];

		for (const cn of node.childNodes) {
			if (cn.nodeName === "tr") {
				tableDocument.push({
					nodeName: "tr",
					childNodes: cn.childNodes
				});
			}
		}
		return tableDocument;
	}

	private async extractValidBuildingHtmls(validBldgTable: any[], rawFile: JSZip): Promise<string[]> {
		const validBuildingHtmls: string[] = [];
		for (const table of validBldgTable) {
			for (const cn of table.childNodes) {
				if (cn.nodeName === "td" &&
					cn.attrs[0].value === "views-field views-field-title") {
					const anchorElement: any = Array.from(cn.childNodes)
						.find((childNode: any) => childNode.nodeName === "a");

					if (anchorElement && anchorElement.attrs && anchorElement.attrs.length > 0) {
						const hrefAttribute = anchorElement.attrs.find((attr: any) => attr.name === "href");

						if (hrefAttribute && hrefAttribute.value) {
							// Extract the content between "./campus/discover/buildings-and-classrooms/" and ".htm"
							const match = hrefAttribute
								.value.match(/\/campus\/discover\/buildings-and-classrooms\/(.*?).htm/);

							if (match && match[1]) {
								const extractedPart = match[1];
								validBuildingHtmls.push(extractedPart);
							}
						}
					}
				}
			}
		}
		return this.isValidBldgHtml(validBuildingHtmls, rawFile);
	}

	private async isValidBldgHtml(html: string[],rawFile: JSZip): Promise<string[]> {
		const directoryPath = "campus/discover/buildings-and-classrooms";

		try {
			const allFiles = await Promise.all(html.map(async (fileName) => {
				const fileExists = await rawFile.file(`${directoryPath}/${fileName}.htm`) !== null;
				return fileExists ? fileName : null;
			}));

			const validFiles = allFiles.filter((fileName) => fileName !== null) as string[];
			// console.log(validFiles);

			if (validFiles.length > 0) {
				return validFiles;
			} else {
				return Promise.reject("No HTML files");
			}
		} catch (err) {
			return Promise.reject("Error checking file existence");
		}
	}

	private async extractRoomsFromBuildingHtmls(rawFile: JSZip, buildingHtmls: string[]): Promise<any[]> {
		const validRooms: Rooms[] = [];
		const path = "campus/discover/buildings-and-classrooms/";
		const promises = buildingHtmls.map(async (shortName) => {
			const filePath = `${path}${shortName}.htm`; // push b into each room tr
			const fileEntry = rawFile.file(filePath);
			if (fileEntry) {
				const buildingHtmlContent = await fileEntry.async("text");
				const document = parse5.parse(buildingHtmlContent);
				const roomTable = this.findValidRoomTable(document, shortName);

				if (roomTable) {
					return roomTable;
				} else {
					throw new Error(`Valid room table not found for ${filePath}`);
				}
			} else {
				throw new Error(`File entry not found for ${filePath}`);
			}
		});
		try {
			const results = await Promise.all(promises);
			validRooms.push(...results.flat().filter((room) => room !== null));
			// console.log(validRooms);
			return this.validRoomTable = validRooms;
		} catch (err) {
			return Promise.reject(err);
		}
	}

	private findValidRoomTable(document: any, shortName: string): any | null {
		const requiredClasses = ["views-field views-field-field-room-number",
			"views-field views-field-field-room-capacity", "views-field views-field-field-room-furniture",
			"views-field views-field-field-room-type"];
		return this.findRoomTableWithCells(document, requiredClasses, shortName);
	}

	private findRoomTableWithCells(node: any, requiredClasses: string[], shortName: string): any | null {
		if (node.childNodes && node.childNodes.length > 0) {
			for (const childNode of node.childNodes) {
				if (childNode.nodeName === "tbody" && this.hasRequiredClass(childNode, "tr", requiredClasses, 4)) {
					return this.validRoomTable = this.getRoomTableContent(childNode, shortName);
				} else if (childNode.nodeName !== "tbody" && childNode.childNodes && childNode.childNodes.length > 0) {
					const result = this.findRoomTableWithCells(childNode, requiredClasses, shortName);
					if (result) {
						return result;
					}
				}
			}
		}
		return null;
	}

	private getRoomTableContent(node: any, shortName: string): any[] {
		const tableDocument = [];

		for (const cn of node.childNodes) {
			if (cn.nodeName === "tr") {
				tableDocument.push({
					nodeName: "tr",
					shortName: shortName,
					childNodes: cn.childNodes
				});
			}
		}
		return tableDocument;
	}

	private isValidRoom(room: Rooms): boolean {
		return true;
	}

}
