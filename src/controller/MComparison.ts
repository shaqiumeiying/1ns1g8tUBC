export default class MComparison {
	private mComparator: string;
	private mKey: string;
	private mNumber: number;

	constructor(mKey: string, comparator: string) {
		this.mKey = mKey;
		this.mComparator = comparator;
		this.mNumber = Number(comparator);
	}

	public getMComparator(): string {
		return this.mComparator;
	}

	public getMKey(): string {
		return this.mKey;
	}

	public getNumber(): number {
		return this.mNumber;
	}
}
