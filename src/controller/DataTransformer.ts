import Sections from "./Sections";
import {InsightResult} from "./IInsightFacade";

export default class DataTransformer {
	private groupKeys: string[];
	private uniqueFields: string[];
	private combinedFields: string[];
	private operationName: string[];
	private operationKeys: string[];
	private NumberFileds: string[];

	constructor() {
		this.groupKeys = [];
		this.uniqueFields = [];
		this.combinedFields = [];
		this.operationName = [];
		this.operationKeys = [];
		this.NumberFileds = ["lat", "lon", "seats", "avg", "pass", "fail", "audit", "year"];
	}

	public executeTransformations(transformations: any, data: any, id: string): any {
		let group = transformations["GROUP"];
		let apply = transformations["APPLY"];
		this.groupKeys = group.map((field: string) => field.split("_")[1]);
		apply.forEach((applyObj: any) => {
			let operationKey = Object.keys(applyObj)[0]; // e.g., 'overallAvg'
			this.operationName.push(operationKey);
			let operationObj = applyObj[operationKey]; // e.g., { AVG: "sections_avg" }
			let operation = Object.keys(operationObj)[0]; // e.g., 'AVG'
			this.operationKeys.push(operation);
			let field = operationObj[operation].split("_")[1]; // e.g., 'avg'
			// if (!this.uniqueFields.includes(field)) {
			// 	this.uniqueFields.push(field);
			// }
			this.uniqueFields.push(field);
		});
		this.combinedFields = this.groupKeys.concat(this.uniqueFields);
		let dataToGroup: any[] = data.map((section: any) => {
			let filteredSection: any = {};
			for (let field of this.combinedFields) {
				filteredSection[field] = section[field as keyof Sections];
			}
			return filteredSection;
		});
		let groupedData = this.groupData(this.groupKeys, dataToGroup, id);
		let result = this.applyData(apply, groupedData, id);
		return result;
	}

	private groupData(keys: string[], data: any[], id: string): any {
		const groupeData: {[key: string]: any[]} = {};
		for (const item of data) {
			const key = keys.map((column) => item[column]);
			const keyString = key.join("_");
			if (!(keyString in groupeData)) {
				groupeData[keyString] = [];
			}
			groupeData[keyString].push(item);
		}
		return groupeData;
	}

	private applyData(apply: any, groupedData: any, id: string): InsightResult[] {
		let result: InsightResult[] = [];
		for (let groupKey in groupedData) {
			let group = groupedData[groupKey];
			let resultObj: any = {};
			// Add group keys and their values to the result object
			let groupKeysValues = groupKey.split("_");
			for (let i = 0; i < this.groupKeys.length; i++) {
				if (this.NumberFileds.includes(this.groupKeys[i])) {
					resultObj[this.groupKeys[i]] = Number(groupKeysValues[i]);
				} else {
					resultObj[this.groupKeys[i]] = groupKeysValues[i];
				}
			}
			// Apply operations to the group
			for (let i = 0; i < this.operationKeys.length; i++) {
				let operation = this.operationKeys[i];
				let operationName = this.operationName[i];
				let field = this.uniqueFields[i];
				let values = group.map((item: any) => item[field]);
				let calculatedValue;
				switch (operation) {
					case "AVG":
						calculatedValue = Number(
							(values.reduce((a: number, b: number) => a + b, 0) / values.length).toFixed(2)
						);
						break;
					case "MIN":
						calculatedValue = Math.min(...values);
						break;
					// Add more cases here for other operations
					case "MAX":
						calculatedValue = Math.max(...values);
						break;
					case "COUNT":
						calculatedValue = new Set(values).size;
						break;
					case "SUM":
						calculatedValue = Number(values.reduce((a: number, b: number) => a + b, 0).toFixed(2));
						break;
				}
				resultObj[operationName] = calculatedValue;
			}
			result.push(resultObj);
		}
		return result;
	}
}
