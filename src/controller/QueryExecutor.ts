import QueryScript from "./QueryScript";
import Sections from "./Sections";

class QueryExecutor {
	private query: any;
	private datasets: Map<string, any[]>;

	constructor(query: any, datasets: Map<string, any[]>) {
		this.query = query;
		this.datasets = datasets;
	}

	public executeQuery(): Sections[] {
		const queryScript = new QueryScript(this.query);
		if (!queryScript.ValidateQuery()) {
			return [];
		}
		const id = queryScript.getID();
		const where = queryScript.getWhere();
		const options = queryScript.getOptions();
		const data = this.datasets.get(id);
		if (data === undefined) {
			return [];
		}
		const filteredData = this.executeWhere(id, where, data);
		return this.executeOptions(options, filteredData);
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
