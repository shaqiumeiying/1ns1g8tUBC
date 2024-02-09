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

	public executeQuery(IdfromParse: string, WhereFromMain: any, OptionsFromMain: any): Promise<InsightResult[]> {
		if (!Object.keys(this.query).includes("OPTIONS") || !Object.keys(this.query).includes("WHERE")) {
			return Promise.reject(new InsightError("no options or where"));
		}
		if (
			this.query === null ||
			this.query === undefined ||
			Object.keys(this.query).length === 0 ||
			Object.keys(this.query).length > 2
		) {
			return Promise.reject(new InsightError("Invalid query"));
		}
		const id = IdfromParse;
		const where = WhereFromMain;
		const options = OptionsFromMain;
		const data = this.datasets.get(id);
		if (data === undefined) {
			return Promise.reject(new InsightError("Invalid dataset"));
		}
		const filteredData = this.executeWhere(where, data, id);
		const unsortedData = this.executeOptions(options, filteredData,id);
		return Promise.resolve(unsortedData);
	}

	private executeWhere(queryBody: any, data: Sections[], id: string): Sections[] {
		const keys = Object.keys(queryBody);
		if (keys.length === 0) {
			return data;
		}

		const filterKey = keys[0];
		const filterValue = queryBody[filterKey];
		switch (filterKey) {
			case "EQ":
			case "GT":
			case "LT":
				return this.executeMCOMPARISON(filterKey, filterValue, data, id);
			case "AND":
				return this.executeAND(filterValue, data, id);
			case "OR":
				return this.executeOR(filterValue, data, id);
			case "NOT":
				return this.executeNEGATION(filterValue, data, id);
			case "IS":
				return this.executeSCOMPARISON(filterKey, filterValue, data, id);
			default:
				throw new Error(`Invalid filter key: ${filterKey}`);
		}
	}

	private executeSCOMPARISON(filterKey: string, filterValue: any, data: Sections[], id: string): Sections[] {
		const key = Object.keys(filterValue)[0];
		const field = key.split("_")[1];
		const value = filterValue[key];
		const regex = "^" + value.split("*").join(".*") + "$";
		const regExp = new RegExp(regex);
		return data.filter((section: Sections) => {
			return regExp.test(String(section[field as keyof Sections]));
		});
	}

	private executeMCOMPARISON(filterKey: string, filterValue: any, data: Sections[], id: string): Sections[] {
		const key = Object.keys(filterValue)[0];
		const field = key.split("_")[1];
		const value = filterValue[key];

		return data.filter((section: Sections) => {
			switch (filterKey) {
				case "EQ":
					return section[field as keyof Sections] === value;
				case "GT":
					return section[field as keyof Sections] > value;
				case "LT":
					return section[field as keyof Sections] < value;
				default:
					throw new Error(`Invalid filter key: ${filterKey}`);
			}
		});
	}

	private executeOptions(options: any, data: Sections[], id: string): any {
		let fieldsNeeded: string[] = options.COLUMNS.map((field: string) => field.split("_")[1]);
		let result: any[] = data.map((section) => {
			let filteredSection: any = {};
			for (let field of fieldsNeeded) {
				filteredSection[id + "_" + field] = section[field as keyof Sections];
			}
			return filteredSection;
		});

		if (options["ORDER"]) {
			const orderColumn = options["ORDER"];
			const [idToSort, fieldToSortBy] = orderColumn.split("_");
			result.sort((a, b) => {
				const valueA = a[idToSort + "_" + fieldToSortBy];
				const valueB = b[idToSort + "_" + fieldToSortBy];
				return valueA - valueB;
			});
		}

		return result;
	}

	private executeAND(filterArray: any, data: Sections[],id: string): Sections[] {
		let result: Sections[] = [];
		filterArray.forEach((filter: any, index: number) => {
			let keys = Object.keys(filter);
			let newFilter = this.executeWhere({[keys[0]]: filter[keys[0]]}, data, id);
			if (index === 0) {
				result = newFilter;
			} else {
				result = result.filter((section) => newFilter.includes(section));
			}
		});
		return result;
	}

	private executeOR(filterArray: any, data: Sections[], id: string): Sections[] {
		let result: Sections[] = [];
		filterArray.forEach((filter: any) => {
			let keys = Object.keys(filter);
			let newFilter = this.executeWhere({[keys[0]]: filter[keys[0]]}, data, id);
			result = result.concat(newFilter);
		});
		return result;
	}

	private executeNEGATION(filter: any, data: Sections[], id: string): Sections[] {
		let result = this.executeWhere(filter, data, id);
		return data.filter((section) => !result.includes(section));
	}
}
