import {InsightDatasetKind} from "./IInsightFacade";

export default class Rooms {
	private readonly fullName: string;
	private readonly shortName: string;
	private readonly number: string;
	private readonly name: string;
	private readonly address: string;
	private readonly lat: number;
	private readonly lon: number;
	private readonly seats: number;
	private readonly type: string;
	private readonly furniture: string;
	private readonly href: string;

	constructor(
		fullName: string,
		shortName: string,
		number: string,
		name: string,
		address: string,
		lat: number,
		lon: number,
		seats: number,
		type: string,
		furniture: string,
		href: string
	) {
		this.fullName = fullName;
		this.shortName = shortName;
		this.number = number;
		this.name = name;
		this.address = address;
		this.lat = lat;
		this.lon = lon;
		this.seats = seats;
		this.type = type;
		this.furniture = furniture;
		this.href = href;
	}

	public getKind(): InsightDatasetKind {
		return InsightDatasetKind.Rooms;
	}
}
