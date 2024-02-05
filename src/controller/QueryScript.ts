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

	private validateWhere(where: any): boolean {
		return true;
	}

	private validateOptions(options: any): boolean {
		return true;
	}
}
