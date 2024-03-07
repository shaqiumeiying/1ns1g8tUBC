import Sections from "./Sections";
import Rooms from "./Rooms";
import RoomProcessor from "./RoomProcessor";
import InsightFacade from "./InsightFacade";
import {InsightError} from "./IInsightFacade";
import * as http from "http";
import {GeoResponse} from "./GeoResponse";
export default class BuildingsAndRoomsParser {

	private async findBuildingInfo(validBldgTable: any[]): Promise<any[]> {
		const Buildings: any[] = [];

		// Use Promise.all to parallelize asynchronous operations
		const promises = validBldgTable.map(async (table) => {
			const building = {
				fullname: "", shortname: "", address: "", href: "", lat: -1, lon: -1, error: ""};

			for (const item of table.childNodes) {
				if (item.attrs[0].value === RoomProcessor.BldgFields[0]) {
					building.shortname = item.childNodes[0].value.trim();
				} else if (item.attrs[0].value === RoomProcessor.BldgFields[1]) {
					for (const child of item.childNodes) {
						if (child.nodeName === "a") {
							building.fullname = child.childNodes[0].value.trim();
							building.href = child.attrs[0].value.trim();
							break;
						}
					}
				} else if (item.attrs[0].value === RoomProcessor.BldgFields[2]) {
					building.address = item.childNodes[0].value.trim();
				}
			}

			try {
				// Make a GET request to the geolocation service
				const encodedAddress = encodeURIComponent(building.address);
				const geolocationUrl = `http://cs310.students.cs.ubc.ca:11316/api/v1/project_team052/${encodedAddress}`;
				const geoResponse: GeoResponse = await this.getGeolocation(geolocationUrl) as GeoResponse;

				// Check if the response contains lat and lon
				if (geoResponse.lat !== undefined && geoResponse.lon !== undefined) {
					building.lat = geoResponse.lat;
					building.lon = geoResponse.lon;
				} else {
					building.error = geoResponse.error || "Geolocation not available";
				}
			} catch (error) {
				building.error = "Error fetching geolocation";
			}

			return building;
		});

		// Wait for all promises to resolve
		Buildings.push(...await Promise.all(promises));


		return Buildings.filter((building) => building.lat !== -1 || building.lon !== -1);
	}

	private async getGeolocation(geolocationUrl: string) {
		return new Promise((resolve, reject) => {
			const request = http.get(geolocationUrl, (res) => {
				let data = "";

				res.on("data", (chunk) => {
					data += chunk;
				});

				res.on("end", () => {
					resolve(JSON.parse(data));
				});

				res.on("error", (error) => {
					reject(error);
				});
			});
		});
	}

	private findRoomInfo(validBldgTable: any[]) {
		const r: any[] = [];

		for (const table of validBldgTable) {
			const room = {
				shortname: table.shortName,
				number: "",
				name: "",
				seats: 0,
				type: "",
				furniture: ""
			};

			for (const item of table.childNodes) {

				if (item.attrs[0].value === RoomProcessor.RoomFields[0]) {
					for (const child of item.childNodes) {
						if (child.nodeName === "a") {
							room.number = child.childNodes[0].value.trim();
							break;
						}
					}
				} else if (item.attrs[0].value === RoomProcessor.RoomFields[1]) {
					room.seats = parseInt(item.childNodes[0].value.trim(), 10);
				} else if (item.attrs[0].value === RoomProcessor.RoomFields[2]) {
					room.furniture = item.childNodes[0].value.trim();
				} else if (item.attrs[0].value === RoomProcessor.RoomFields[3]) {
					room.type = item.childNodes[0].value.trim();
				}
			}
			r.push(room);
		}
		return r;
	}

	public async makeRooms(buildingTable: any[], roomTable: any[]): Promise<Rooms[]> {

		const CleanedBuildings = await this.findBuildingInfo(buildingTable);
		const CleanedRooms = await this.findRoomInfo(roomTable);
		if (CleanedBuildings.length === 0 || CleanedRooms.length === 0) {
			return Promise.reject(new InsightError("No valid building or room table found"));
		}

		const room: Rooms[] = [];

		for (const building of CleanedBuildings) {
			const matchingRooms = CleanedRooms.filter((r) => r.shortname === building.shortname);

			for (const matchingRoom of matchingRooms) {
				const combinedInfo = new Rooms(
					building.fullname,
					building.shortname,
					matchingRoom.number,
					building.shortname + "_" + matchingRoom.number,
					building.address,
					building.lat,
					building.lon,
					parseInt(matchingRoom.seats, 10),
					matchingRoom.type,
					matchingRoom.furniture,
					building.href
				);

				room.push(combinedInfo);
			}
		}
		return room;
	}
}
