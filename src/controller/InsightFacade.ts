import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightResult,
	InsightError,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";
import DatasetProcessor from "./DatasetProcessor";
import * as fs from "fs-extra";
import JSZip from "jszip";
import Sections from "./Sections";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private datasets: Map<string, any[]>;

	constructor() {
		// keep track of valid datasets
		this.datasets = new Map<string, any[]>();
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			const dp = new DatasetProcessor();
			if (id === null || id === "" || id.trim().length === 0 || id.includes("_") || id.includes(" ")) {
				reject(new InsightError("id is null or empty"));
				return;
			}
			if (id in this.findId()) {
				reject(new InsightError("id already exists"));
				return;
			}
			if (kind !== InsightDatasetKind.Sections) {
				reject(new InsightError("invalid kind"));
				return;
			}
			dp.validateDataset(id, content).then((result) => {
				this.datasets.set(id, result);
				console.log(this.datasets.values());
				let list: string[] = Array.from(this.datasets.keys());
				resolve(list);
			}).catch((err) => {
				reject(new InsightError(err));
			});
		});
	}

	public async removeDataset(id: string): Promise<string> {
		return Promise.reject(new InsightError());
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject(new InsightError());
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject(new InsightError());
	}

	public static writeFile(id: string, content: Sections[]): Promise<any> {
		let path = "processed/" + id + ".json";
		let data = JSON.stringify(content);
		return new Promise((resolve, reject) => {
			fs.writeFile(path, data, (err) => {
				if (err) {
					reject(err);
				}
				resolve("Successfully wrote the file to the disk");
			});
		});
	}

	public readFile(id: string): Promise<any> {
		let path = "processed/" + id + ".json";
		return new Promise((resolve, reject) => {
			fs.readFile(path, "utf8", (err, data: any) => {
				if (err) {
					reject(err);
				} else {
					let JsonData = JSON.parse(data);
					resolve(JsonData);
				}
			});
		});
	}

	public findId(): Promise<string[]> {
		let path = "processed/";
		return new Promise((resolve, reject) => {
			fs.readdir(path, (err, files) => {
				if (err) {
					reject(err);
				} else {
					const fileNames = files.map((file) => file.slice(0, -5));
					resolve(fileNames);
				}
			});
		});
	}

}
