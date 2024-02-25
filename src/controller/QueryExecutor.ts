import QueryScript from "./QueryScript";
import Sections from "./Sections";
import DataTransformer from "./DataTransformer";
import Rooms from "./Rooms";
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
	private DataTransformer: DataTransformer = new DataTransformer();

	constructor(query: any, datasets: Map<string, any[]>) {
		this.query = query;
		this.datasets = datasets;
	}

	public executeQuery(IdMain: string, WhereMain: any, OptionsMain: any, TransMain: any): Promise<InsightResult[]> {
		if (!Object.keys(this.query).includes("OPTIONS") || !Object.keys(this.query).includes("WHERE")) {
			return Promise.reject(new InsightError("no options or where"));
		}
		if (
			this.query === null ||
			this.query === undefined ||
			Object.keys(this.query).length === 0 ||
			Object.keys(this.query).length > 3 // OP, WHERE, TRANSFORMATIONS
		) {
			return Promise.reject(new InsightError("Invalid query"));
		}
		const id = IdMain;
		const where = WhereMain;
		const options = OptionsMain;
		const transformations = TransMain;
		const data = this.datasets.get(id);
		if (data === undefined) {
			return Promise.reject(new InsightError("Invalid dataset"));
		}
		let filteredData = this.executeWhere(where, data, id);
		if (transformations) {
			filteredData = this.DataTransformer.executeTransformations(transformations, filteredData, id);
		}
		const unsortedData = this.executeOptions(options, filteredData, id);
		return Promise.resolve(unsortedData);
	}


	private executeWhere(query: any, data: Sections[], id: string): Sections[] {
		const keys = Object.keys(query);
		if (keys.length === 0) {
			return data;
		}
		const filterKey = keys[0];
		const filterValue = query[filterKey];
		switch (filterKey) {
			case "GT":
			case "LT":
			case "EQ":
				return this.executeMCOMPARISON(filterKey, filterValue, data, id);
			case "IS":
				return this.executeSCOMPARISON(filterValue, data, id);
			case "AND":
				return this.executeAND(filterValue, data, id);
			case "OR":
				return this.executeOR(filterValue, data, id);
			default:
				return this.executeNEGATION(filterValue, data, id);
		}
	}

	// Todo: this implementation is not correct, test with "" and "**" not working
	private executeSCOMPARISON(filterValue: any, data: Sections[], id: string): Sections[] {
		const key = Object.keys(filterValue)[0];
		const field = key.split("_")[1];
		const value = filterValue[key];
		// Handle blank and double asterisk cases
		if (value === "") {
			return data.filter((section: Sections) => String(section[field as keyof Sections]) === "");
		} else if (value === "**") {
			return data; // return all data if filterValue is "**"
		}
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
					throw new InsightError();
			}
		});
	}

	private executeOptions(options: any, data: any, id: string): any {
		// TODO: this is not a 100% correct implementation, still not support ANYKEY in the sort yet
		let fieldsNeeded: string[] = options.COLUMNS.map((field: string) => field.split("_")[1]);
		let result: any[] = data.map((section: any) => {
			let filteredSection: any = {};
			for (let field of fieldsNeeded) {
				filteredSection[id + "_" + field] = section[field as keyof Sections];
			}
			return filteredSection;
		});
		// This sorting algorithm is referenced from:
		// https://stackoverflow.com/questions/69026033/javascript-sort-an-array-of-objects-by-field-and-sorting-direction
		if (options["ORDER"]) {
			if (typeof options["ORDER"] === "string") {
				const orderColumn = options["ORDER"];
				const [idToSort, fieldToSortBy] = orderColumn.split("_");
				result.sort((a, b) => {
					const valueA = a[idToSort + "_" + fieldToSortBy];
					const valueB = b[idToSort + "_" + fieldToSortBy];
					return valueA - valueB;
				});
			} else if (typeof options["ORDER"] === "object") {
				const orderObject = options["ORDER"];
				const direction = orderObject["dir"] === "UP" ? 1 : -1;
				const keys = orderObject["keys"];
				result.sort((a, b) => {
					for (let key of keys) {
						const [idToSort, fieldToSortBy] = key.split("_");
						const valueA = a[idToSort + "_" + fieldToSortBy];
						const valueB = b[idToSort + "_" + fieldToSortBy];
						if (valueA !== valueB) {
							return (valueA - valueB) * direction;
						}
					}
					return 0;
				});
			}
		}
		return result;
	}

	private executeAND(filterArray: any, data: Sections[], id: string): Sections[] {
		return filterArray.reduce((prevFilter: any, currentFilter: any) => {
			let keys = Object.keys(currentFilter);
			let newFilter = new Set(this.executeWhere({[keys[0]]: currentFilter[keys[0]]}, data, id));
			return prevFilter.filter((section: any) => newFilter.has(section));
		}, data);
	}

	private executeOR(filterArray: any, data: Sections[], id: string): Sections[] {
		let result: Sections[] = [];
		filterArray.forEach((filter: any) => {
			let keys = Object.keys(filter);
			let newFilter = this.executeWhere({[keys[0]]: filter[keys[0]]}, data, id);
			result.push(...newFilter);
		});
		return result;
	}

	private executeNEGATION(filter: any, data: Sections[], id: string): Sections[] {
		let result = this.executeWhere(filter, data, id);
		return data.filter((section) => !result.includes(section));
	}
}
