export function parseID(query: any, existingIds: Set<string> = new Set()): Set<string> {
	let ids: Set<string> = new Set();
	for (let key in query) {
		if (Array.isArray(query[key])) {
			ids = parseIDFromArray(query, key, existingIds, ids);
		} else if (typeof query[key] === "object" && query[key] !== null) {
			ids = parseIDFromObject(query, key, existingIds, ids);
		} else {
			ids = parseIDFromKey(key, existingIds, ids);
		}
	}
	return ids;
}

export function parseIDFromObject(query: any, key: string, existingIds: Set<string>, ids: Set<string>): Set<string> {
	let newIds = parseID(query[key], new Set([...existingIds, ...ids]));
	for (let id of newIds) {
		ids.add(id);
	}
	return ids;
}

export function parseIDFromArray(query: any, key: string, existingIds: Set<string>, ids: Set<string>): Set<string> {
	for (let item of query[key]) {
		if (typeof item === "string" && item.includes("_")) {
			let id = item.split("_")[0];
			if (!ids.has(id) && !existingIds.has(id)) {
				ids.add(id);
			}
		}
		if (typeof item === "object" && item !== null) {
			let newIds = parseID(item, new Set([...existingIds, ...ids]));
			for (let id of newIds) {
				ids.add(id);
			}
		}
	}
	return ids;
}

export function parseIDFromKey(key: string, existingIds: Set<string>, ids: Set<string>): Set<string> {
	if (key.includes("_")) {
		let id = key.split("_")[0];
		if (!ids.has(id) && !existingIds.has(id)) {
			ids.add(id);
		}
	}
	return ids;
}

export function parseIDFromTransformations(transformations: any, existingIds: Set<string>): Set<string> {
	let ids = new Set<string>();

	// Parse IDs from the GROUP field
	for (let item of transformations["GROUP"]) {
		if (typeof item === "string" && item.includes("_")) {
			let id = item.split("_")[0];
			if (!ids.has(id) && !existingIds.has(id)) {
				ids.add(id);
			}
		}
	}

	// Parse IDs from the APPLY field
	for (let item of transformations["APPLY"]) {
		for (let applyKey in item) {
			let applyRule = item[applyKey];
			for (let key in applyRule) {
				if (typeof applyRule[key] === "string" && applyRule[key].includes("_")) {
					let id = applyRule[key].split("_")[0];
					if (!ids.has(id) && !existingIds.has(id)) {
						ids.add(id);
					}
				}
			}
		}
	}

	return ids;
}
