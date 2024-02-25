// DataTransformer.ts
import Sections from "./Sections";

export default class DataTransformer {
	public executeTransformations(transformations: any, data: any, id: string): any {
		let group = transformations["GROUP"];
		let apply = transformations["APPLY"];
		const groupKeys = group.map((field: string) => field.split("_")[1]);
		let uniqueFields: string[] = [];
		apply.forEach((applyObj: any) => {
			let operationKey = Object.keys(applyObj)[0]; // e.g., 'overallAvg'
			let operationObj = applyObj[operationKey]; // e.g., { AVG: "sections_avg" }
			let operation = Object.keys(operationObj)[0]; // e.g., 'AVG'
			let field = operationObj[operation].split("_")[1]; // e.g., 'avg'
			if (!uniqueFields.includes(field)) {
				uniqueFields.push(field);
			}
		});
		let combinedFields = groupKeys.concat(uniqueFields);
		let dataToGroup: any[] = data.map((section: any) => {
			let filteredSection: any = {};
			for (let field of combinedFields) {
				filteredSection[id + "_" + field] = section[field as keyof Sections];
			}
			return filteredSection;
		});
		let groupedData = this.groupData(group, dataToGroup, id);
		console.log(groupedData);
	}

	public groupData(keys: string[], data: any[], id: string): any {
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
}
