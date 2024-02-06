export default class SComparison {
	private sKey: string;
	private inputString: string;

	constructor(sKey: string, inputString: string) {
		this.sKey = sKey;
		this.inputString = inputString;
	}

	public getSKey(): string {
		return this.sKey;
	}

	public getInputString(): string {
		return this.inputString;
	}
}
