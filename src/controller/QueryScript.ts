import {parseID, parseIDFromTransformations} from "./IDParser";

export default class QueryScript {
	private id: Set<string>;
	private where: any;
	private options: any;
	private transformations: any;
	private ifTransformationsExist: boolean;
	private queryFilds: Set<string> = new Set();
	private validFields: string[];
	private applykeys: Set<string>;
	private validSeFields: string[];
	private isMField: string[];
	private validRFields: string[];

	constructor(query: any) {
		this.ifTransformationsExist = this.CheckIfTransformationsExist(query);
		let whereIds = parseID(query["WHERE"]);
		let optionIds = parseID(query["OPTIONS"], whereIds);
		if (this.ifTransformationsExist) {
			this.transformations = query["TRANSFORMATIONS"];
			let transIds = parseIDFromTransformations(query["TRANSFORMATIONS"], optionIds);
			this.id = new Set([...whereIds, ...optionIds, ...transIds]);
		} else {
			this.id = new Set([...whereIds, ...optionIds]);
		}
		this.applykeys = new Set();
		this.where = query["WHERE"];
		this.options = query["OPTIONS"];
		this.isMField = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
		this.validSeFields = ["avg","pass","fail","audit","year","dept","id","instructor","title","uuid"];
		this.validRFields = ["fullname", "shortname", "number", "name", "address", "lat", "lon", "seats", "type",
			"furniture", "href"];
		this.validFields = [...(this.validSeFields), ...(this.validRFields)];
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

	private validateQueryFields(): boolean {
		let fromRFields = Array.from(this.queryFilds).some((field) => this.validRFields.includes(field));
		let fromSeFields = Array.from(this.queryFilds).some((field) => this.validSeFields.includes(field));
		// If some fields are from RFields and some fields are from SeFields, return false
		if (fromRFields && fromSeFields) {
			return false;
		}
		return true;
	}

	public ValidateQuery(): boolean {
		if (typeof this.where !== "object" || typeof this.options !== "object" ||
			(this.ifTransformationsExist && typeof this.transformations !== "object")) {
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
		if (this.ifTransformationsExist && !this.validateTransformations(this.transformations)) {
			return false;
		}
		if (this.validateWhere(this.where) && this.validateOptions(this.options)) {
			return this.validateQueryFields();
		}
		return false;
	}

	public validateTransformations(transformations: any): boolean {
		if (!Object.keys(transformations).includes("GROUP") || !Object.keys(transformations).includes("APPLY")) {
			return false;
		}
		if (!transformations["GROUP"].every((item: any) => typeof item === "string" && item.includes("_")
			&& this.validFields.includes(item.split("_")[1]))) {
			return false;
		}
		if (!Object.keys(transformations).includes("APPLY") || !Array.isArray(transformations["APPLY"])) {
			return false;
		}
		this.applykeys.clear();
		return transformations["APPLY"].every((item: any) => {
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
			if(!this.validFields.includes(field) || !this.isValidApplyToken(applyToken, field)) {
				return false;
			}
			this.queryFilds.add(field);
			return true;
		});
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
		this.queryFilds.add(field);
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
		const regex = /^(\*)?[^*]*(\*)?$/;
		if (!regex.test(string)) {
			return false;
		}
		const asteriskCount = (string.match(/\*/g) || []).length;
		if (asteriskCount > 2) {
			return false;
		}
		this.queryFilds.add(field);
		return true;
	}

	private isValidSField(field: string): boolean {
		const validFields = ["dept", "id", "instructor", "title", "uuid"
			, "fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
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
		return !(Object.keys(options).includes("ORDER") && !this.validateOrder(options["ORDER"], columns));
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
			if (this.ifTransformationsExist) {
				if (!groupKeys.has(column) && !this.applykeys.has(column)) {
					return false;
				}
			} else {
				if (!this.validFields.includes(field)) {
					return false;
				}
				this.queryFilds.add(field);
			}
		}
		return true;
	}

	private validateOrder(order: any, columns: string[]): boolean {
		if (typeof order === "string") {
			return this.validateOrderString(order, columns);
		}
		if (typeof order === "object") {
			return this.validateOrderObject(order, columns);
		}
		return false;
	}

	private validateOrderString(order: string, columns: string[]): boolean {
		if (order.includes("_")) {
			let parts = order.split("_");
			if (parts.length !== 2 || !this.validFields.includes(parts[1])) {
				return false;
			}
		}
		if (!columns.includes(order)) {
			return false;
		}
		this.queryFilds.add(order.split("_")[1]);
		return true;
	}

	private validateOrderObject(order: any, columns: string[]): boolean {
		const {dir, keys} = order;
		if (Object.keys(order).length !== 2 || (dir !== "UP" && dir !== "DOWN")) {
			return false;
		}
		if (Array.isArray(keys) && keys.length > 0) {
			for (let item of keys) {
				if (typeof item !== "string" || !columns.includes(item)) {
					return false;
				}
			}
			this.queryFilds.add(keys[0].split("_")[1]);
			return true;
		}
		return false;
	}

	private isValidApplyToken(applyToken: string, field: string): boolean {
		const validApplyTokens = ["MAX", "MIN", "AVG", "SUM", "COUNT"];
		if (!validApplyTokens.includes(applyToken)) {
			return false;
		}
		if (["MAX", "MIN", "AVG", "SUM"].includes(applyToken)) {
			return this.isMField.includes(field);
		}
		return !(["COUNT"].includes(applyToken) && !this.validFields.includes(field));
	}
}
