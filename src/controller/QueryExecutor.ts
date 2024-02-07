import QueryScript from "./QueryScript";
import Sections from "./Sections";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightResult,
	InsightError,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";

export default class QueryExecutor {
	private query: any;
	private datasets: Map<string, any[]>;

	constructor(query: any, datasets: Map<string, any[]>) {
		this.query = query;
		this.datasets = datasets;
	}

	public executeQuery(): Promise<Sections[]> {
		if (!Object.keys(this.query).includes("OPTIONS") || !Object.keys(this.query).includes("WHERE")) {
			return Promise.reject(new InsightError("no options or where"));
		}
		if (this.query === null || this.query === undefined ||
			Object.keys(this.query).length === 0 || Object.keys(this.query).length > 2) {
			return Promise.reject(new InsightError("Invalid query"));
		}
		const queryScript = new QueryScript(this.query);
		const ids = queryScript.getID();
		if (ids.length !== 1 || !this.datasets.has(ids[0])) {
			return Promise.reject(new InsightError("Invalid dataset"));
		}
		if (!queryScript.ValidateQuery()) {
			return Promise.reject(new InsightError("Invalid query"));
		}
		const id = ids[0];
		const where = queryScript.getWhere();
		const options = queryScript.getOptions();
		const data = this.datasets.get(id);
		if (data === undefined) {
			return Promise.reject(new InsightError("Invalid dataset"));
		}
		const filteredData = this.executeWhere(id, where, data);
		const sortedData = this.executeOptions(options, filteredData);
		return Promise.resolve(sortedData);
	}

	private executeWhere(id: string, where: any, data: Sections[]): Sections[] {
		// todo: if where is empty, return all data
		if (Object.keys(where).length === 0) {
			return data;
		}
		return [];
	}

	private executeOptions(options: any, data: Sections[]): Sections[] {
		if (Object.keys(options).length === 0) {
			return data;
		}
		return [];
	}
}
