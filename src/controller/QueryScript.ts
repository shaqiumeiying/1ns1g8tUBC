import MComparison from "./MComparison";

export default class QueryScript {
	private id: string;
	private where: any;
	private options: any;

	constructor(query: any) {
		this.id = this.parseID(query);
		this.where = query["WHERE"];
		this.options = query["OPTIONS"];
	}

	private parseID(query: any): string {
		// todo: a dummy implementation
		return "id";
	}

	public getID(): string {
		return this.id;
	}

	public getWhere(): any {
		return this.where;
	}

	public getOptions(): any {
		return this.options;
	}

	public ValidateQuery(): boolean {
		if (typeof this.where !== "object" || typeof this.options !== "object") {
			return false;
		}
		if (!this.validateWhere(this.where)) {
			return false;
		}
		if (!this.validateOptions(this.options)) {
			return false;
		}
		return true;
	}

	public validateWhere(where: any): boolean | undefined {
		if (Object.keys(where).length === 0) {
			return false;
		}
		if ("AND" in where || "OR" in where) {
			return this.validateLogicComparison(where);
		}
		if ("LT" in where || "GT" in where || "EQ" in where) {
			return this.validateMComparison(where);
		}
		if ("IS" in where) {
			return this.validateSComparison(where);
		}

	}

	private validateLogicComparison(logic: any): boolean {
		return ("AND" in logic || "OR" in logic) &&
			Array.isArray(logic["AND"] || logic["OR"]) &&
			logic["AND"].every((subFilter: any) => this.validateWhere(subFilter));
	}

	private validateMComparison(mComp: any): boolean {
		const mKeyPattern = /^"[^_]+_(avg|pass|fail|audit|year)"$/;
		const mKey = mComp.getMKey();
		const mNumber = mComp.getNumber();
		return mKey in mKeyPattern && typeof mKey === "string" && typeof mNumber === "number";
	}

	private validateSComparison(sComp: any) {
		const sKeyPattern = /^"[^_]+_(dept|id|instructor|title|uuid)"$/;
		const sKey = sComp.getSKey();
		const sInputString = sComp.getInputString();
		return sKey in sKeyPattern && typeof sInputString === "string";
	}

	private validateOptions(options: any): boolean {
		return true;
	}
}
