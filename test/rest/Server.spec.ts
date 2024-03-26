import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";

import {expect} from "chai";
import request, {Response} from "supertest";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import fs, {readJSONSync} from "fs-extra";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";

describe("Facade D3", function () {

	let facade: InsightFacade;
	let server: Server;
	let sections: string;

	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
		server.start().then(() => {
			console.log("Server started successfully");
		}).catch((err) => {
			console.error("Failed to start server", err);
		});
	});

	after(function () {
		// Stop server here once and handle errors properly
		server.stop().then(() => {
			console.log("Server stopped successfully");
		}).catch((err) => {
			console.error("Failed to stop server", err);
		});
	});

	beforeEach(async function () {
		await clearDisk();
		server.reInitFacade();
		// might want to add some process logging here to keep track of what is going on
	});

	afterEach(async function () {
		await clearDisk();
		// might want to add some process logging here to keep track of what is going on
	});

	// Sample on how to format PUT requests
	/*
	it("PUT test for courses dataset", function () {
		try {
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});
	*/
	// The other endpoints work similarly. You should be able to find all instructions at the supertest documentation
	describe("PUT", function () {
		it("PUT test for section dataset", function ()  {
			try {
				return request("http://localhost:4321")
					.put("/dataset/simon/sections")
					.send(fs.readFileSync("test/resources/archives/top5Courses.zip"))
					.set("Content-Type", "application/x-zip-compressed")
					.then( function (res: Response)  {
						expect(res.status).to.be.equal(200);
						expect(res.body.result).to.deep.equal(["simon"]);
					})
					.catch(function (err)  {
						console.log(err);
						expect.fail();
					});
			} catch (err) {
				console.log(err);
			}
		});
		it("PUT should return 400", function ()  {
			try {
				return request("http://localhost:4321")
					.put("/dataset/simon/sections")
					.send(fs.readFileSync("test/resources/archives/invalid_no_section.zip"))
					.set("Content-Type", "application/x-zip-compressed")
					.then( function (res: Response)  {
						expect(res.status).to.be.equal(400);
					})
					.catch(function (err)  {
						expect.fail();
					});
			} catch (err) {
				console.log(err);
			}
		});
		it("GET test pass", async () =>  {
			try {
				await facade.addDataset("simon",
					await getContentFromArchives("test/resources/archives/valid_courses.zip"),
					InsightDatasetKind.Sections);
				return request("http://localhost:4321")
					.get("/datasets")
					.then( function (res: Response)  {
						expect(res.status).to.be.equal(200);
						expect(res.body.result).to.deep.equal([{id: "simon", kind: "sections", numRows: 2}]);
					})
					.catch(function (err)  {
						expect.fail();
					});
			} catch (err) {
				console.log(err);
			}
		});
		it("POST test fail", async () =>  {
			try {
				return request("http://localhost:4321")
					.post("/query")
					.send(readJSONSync("test/resources/query/invalid/invalid.json"))
					.set("Content-Type", "application/json")
					.then( function (res: Response)  {
						expect(res.status).to.be.equal(400);
					}).catch(function (err)  {
						expect.fail();
					});
			} catch (err) {
				console.log(err);
			}
		});
	});
});
