import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightResult,
	InsightError,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";
import DatasetProcessor from "./DatasetProcessor";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private datasetProcessor: DatasetProcessor;
	private datasets: Map<string, any[]>;
	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.datasetProcessor = new DatasetProcessor();
		this.datasets = new Map<string, any[]>();
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise<string[]>(() => {
			const dp = new DatasetProcessor();
			if (id == null || id === "" || id.trim().length === 0) {
				return Promise.reject(new InsightError("id is null or empty"));
			}
			if (this.datasets.has(id)) {
				return Promise.reject(new InsightError("id already exists"));
			}
			if (kind !== InsightDatasetKind.Sections) {
				return Promise.reject(new InsightError("invalid kind"));
			}
			// check if the first folder is courses
			// relativePath check if there is zip

			dp.validateDataset(id, content, this.datasets).then((result) => {
				this.datasets.set(id, result);
				return Promise.resolve(Array.from(this.datasets.keys()));
			}).catch((err) => {
				return Promise.reject(err);
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
}
