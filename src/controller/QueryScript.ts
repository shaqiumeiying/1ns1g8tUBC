import {parseIDFromKey, parseIDFromArray, parseIDFromObject, parseID} from "./IDParser";

export default class QueryScript {
	private id: Set<string>;
	private where: any;
	private options: any;
	private transformations: any;
	private ifTransformationsExist: boolean;
	private applykeys: Set<string>;
	private isMField: string[];
	private validFields: string[];

	constructor(query: any) {
		this.ifTransformationsExist = this.CheckIfTransformationsExist(query);
		let whereIds = parseID(query["WHERE"]);
		let optionIds = parseID(query["OPTIONS"], whereIds);
		let transformationsIds;
		if (this.ifTransformationsExist) {
			transformationsIds = parseID(query["TRANSFORMATIONS"], optionIds);
			this.transformations = query["TRANSFORMATIONS"];
		}
		this.applykeys = new Set();
		this.id = new Set([...whereIds, ...optionIds]);
		this.where = query["WHERE"];
		this.options = query["OPTIONS"];
		this.isMField = ["avg", "pass", "fail", "audit", "year"];
		this.validFields = ["avg", "pass", "fail", "audit", "year", "dept", "id", "instructor", "title", "uuid"];
	}

	private CheckIfTransformationsExist(query: any): boolean {
		return Object.keys(query).includes("TRANSFORMATIONS");
	}

	public getID(): Set<string> {
		return this.id;
	}

	public getWhere(): any {
		return this.where;
	}

	public getOptions(): any {
		return this.options;
	}

	public getTransformations(): any {
		if (this.ifTransformationsExist) {
			return this.transformations;
		}
	}

	public ValidateQuery(): boolean {
		if (
			typeof this.where !== "object" ||
			typeof this.options !== "object" ||
			(this.ifTransformationsExist && typeof this.transformations !== "object")
		) {
			return false;
		} // If WHERE or OPTIONS is not an object, return false
		if (Object.keys(this.options).length === 0) {
			return false;
		} // If WHERE or OPTIONS is empty, return false
		if (Object.keys(this.where).length > 1 || Object.keys(this.options).length > 2) {
			return false;
		} // If WHERE has more than one key or OPTIONS has more than two keys, return false
		if (this.ifTransformationsExist && Object.keys(this.transformations).length !== 2) {
			return false;
		} // If transformations has more than two keys, return false
		if (this.ifTransformationsExist) {
			if (!this.validateTransformations(this.transformations)) {
				return false;
			}
		}
		if (!this.validateWhere(this.where)) {
			return false;
		}
		if (!this.validateOptions(this.options)) {
			return false;
		}
		return true;
	}

	public validateTransformations(transformations: any): boolean {
		if (!Object.keys(transformations).includes("GROUP") || !Object.keys(transformations).includes("APPLY")) {
			return false;
		}
		for (let item of transformations["GROUP"]) {
			if (typeof item !== "string" || !item.includes("_")) {
				return false;
			}
			let field = item.split("_")[1];
			if (!this.validFields.includes(field)) {
				return false;
			}
		}
		if (!Object.keys(transformations).includes("APPLY") || !Array.isArray(transformations["APPLY"])) {
			return false;
		}
		this.applykeys.clear();
		for (let item of transformations["APPLY"]) {
			if (typeof item !== "object" || Object.keys(item).length !== 1) {
				return false;
			}
			let applykey = Object.keys(item)[0];
			if (this.applykeys.has(applykey)) {
				return false;
			}
			this.applykeys.add(applykey);
			let applyRule = item[applykey];
			if (typeof applyRule !== "object" || Object.keys(applyRule).length !== 1) {
				return false;
			}
			let applyToken = Object.keys(applyRule)[0];
			let key = applyRule[applyToken];
			if (typeof key !== "string" || !key.includes("_")) {
				return false;
			}
			let field = key.split("_")[1];
			if (!this.validFields.includes(field) || !this.isValidApplyToken(applyToken, field)) {
				return false;
			}
		}
		return true;
	}

	public validateWhere(where: any): boolean {
		if (Object.keys(where).length === 0) {
			return true;
		}
		const key = Object.keys(where)[0];
		if (key === "AND" || key === "OR") {
			if (!Array.isArray(where[key]) || where[key].length === 0) {
				return false;
			}
			for (let subCondition of where[key]) {
				if (!this.validateWhere(subCondition)) {
					return false;
				}
			}
		} else if (key === "NOT") {
			if (
				typeof where[key] !== "object" ||
				!this.validateWhere(where[key]) ||
				Object.keys(where[key]).length === 0
			) {
				console.log(where[key].length);
				return false;
			}
		} else if (key === "LT" || key === "GT" || key === "EQ") {
			return this.validateMComparison(where);
		} else if (key === "IS") {
			return this.validateSComparison(where);
		} else {
			return false;
		}
		return true;
	}

	public validateMComparison(mComparison: any): boolean {
		if (typeof mComparison !== "object" || Object.keys(mComparison).length !== 1) {
			return false;
		}
		const key = mComparison[Object.keys(mComparison)[0]];
		if (Object.keys(key).length !== 1) {
			return false;
		}
		const object = Object.keys(key)[0];
		const field = object.split("_")[1];
		const number = key[object];
		if (!this.isMField.includes(field) || typeof number !== "number") {
			return false;
		}

		return true;
	}

	public validateSComparison(sComparison: any): boolean {
		if (typeof sComparison !== "object" || Object.keys(sComparison).length !== 1) {
			return false;
		}
		const key = sComparison[Object.keys(sComparison)[0]];
		if (Object.keys(key).length !== 1) {
			return false;
		}
		const object = Object.keys(key)[0];
		const field = object.split("_")[1];
		const string = key[object];
		if (!this.isValidSField(field) || typeof string !== "string") {
			return false;
		}
		// This line of code for regex is referenced from: https://stackoverflow.com/questions/10868308/regular-expression-a-za-z0-9
		// Updated regex to allow for blank strings and strings with only asterisks
		const regex = /^(\*)?[a-zA-Z0-9]*(\*)?$/;
		if (!regex.test(string)) {
			return false;
		}
		// Check if the string value contains at most two '*' This line of code for counting asterisks is referenced from:
		// https://stackoverflow.com/questions/881085/count-the-number-of-asterisks-in-a-string
		const asteriskCount = (string.match(/\*/g) || []).length;
		if (asteriskCount > 2) {
			return false;
		}

		return true;
	}

	private isValidSField(field: string): boolean {
		const validFields = ["dept", "id", "instructor", "title", "uuid"];
		return validFields.includes(field);
	}

	public validateOptions(options: any): boolean {
		if (typeof options !== "object" || !Object.keys(options).includes("COLUMNS")) {
			return false;
		}
		// find columns for checking order
		const columns = options["COLUMNS"];
		if (!this.validateColumns(columns)) {
			return false;
		}
		if (Object.keys(options).includes("ORDER") && !this.validateOrder(options["ORDER"], columns)) {
			return false;
		}
		return true;
	}

	private validateColumns(columns: any): boolean {
		if (columns.length === 0 || !Array.isArray(columns) || !columns.every((item) => typeof item === "string")) {
			return false;
		}

		let groupKeys = new Set<string>();
		if (this.ifTransformationsExist) {
			groupKeys = new Set(this.transformations["GROUP"]);
		}

		for (let column of columns) {
			let parts = column.split("_");
			let field = parts[1];
			if (!this.validFields.includes(field)) {
				if (!groupKeys.has(column) && !this.applykeys.has(column)) {
					return false;
				}
			}
		}
		return true;
	}

	private validateOrder(order: any, columns: string[]): boolean {
		if (typeof order === "string") {
			let parts = order.split("_");
			if (parts.length !== 2) {
				return false;
			}
			let id = parts[0];
			let field = parts[1];
			if (!this.validFields.includes(field)) {
				return false;
			}
			if (!columns.includes(order)) {
				return false;
			}
			return true;
		}
		if (typeof order === "object" && "dir" in order && "keys" in order) {
			const dir = order["dir"];
			const keys = order["keys"];
			if (dir !== "UP" && dir !== "DOWN") {
				return false;
			}
			if (!Array.isArray(keys) || !keys.every((item) => typeof item === "string")) {
				return false;
			}
			for (let key of keys) {
				if (!columns.includes(key)) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	private isValidApplyToken(applyToken: string, field: string): boolean {
		const validApplyTokens = ["MAX", "MIN", "AVG", "SUM", "COUNT"];
		if (!validApplyTokens.includes(applyToken)) {
			return false;
		}
		if (["MAX", "MIN", "AVG", "SUM"].includes(applyToken) && !this.isMField.includes(field)) {
			return false;
		}
		if (["COUNT"].includes(applyToken) && !this.validFields.includes(field)) {
			return false;
		}
		return true;
	}
}
