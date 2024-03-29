import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {assert, expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives, readFileQueries} from "../TestUtil";

use(chaiAsPromised);

export interface ITestQuery {
	title: string;
	input: unknown;
	errorExpected: boolean;
	expected: any;
}

describe("InsightFacade", function () {
	let facade: IInsightFacade;
	// Below are the datasets used for Sections test
	let noSection: string;
	let noCourse: string;
	let notJson: string;
	let validCourses: string;
	let validCourses2: string;
	let noCourseFolder: string;
	let emptyJson: string;
	let oneValidCourseOneInvalidCourse: string;
	let invalidSections: string;
	let validSectionsAndInvalidSections: string;
	let notCoursesFolder: string;
	let invalidNoResultKey: string;
	let invalidJsonNotObject: string;
	let invalidFoldrInFolder: string;
	let validTwoCourses: string;
	let validOneSection: string;
	let invalidNoRankKey: string;
	let validOneSectionOneNotJson: string;
	let oneOverAllSection: string;
	let top5courses: string;
	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;
	// Below are the datasets used for Room test
	let invalidBldgNoRoomTable: string;
	let invalidBldgNotFound: string;
	let invalidMoreBldgListTable: string;
	let invalidMoreRoomTable: string;
	let invalidNoGeo: string;
	let invalidNoHref: string;
	let invalidNoIndex: string;
	let invalidRoomMissingProperty: string;
	let invalidTDCellDoesNotExist: string;
	let invalidWrongFolder: string;
	let validMoreBldgListTable: string;
	let validMoreBldgOnlyOneLinked: string;
	let validMoreRoomTable: string;
	let validOneBldg: string;
	let validRoomMoreField: string;
	let validTDCellExist: string;
	let smallTest: string;
	let campus: string;
	let indifferentfolder: string;

	let rooms: string;

	before(async function () {
		// This block runs once and loads the datasets.
		// top 3 are the ZIP files for query tests
		sections = await getContentFromArchives("pair.zip");
		top5courses = await getContentFromArchives("top5Courses.zip");
		oneOverAllSection = await getContentFromArchives("OneOverAllSection.zip");
		// Below are the ZIP files for addDataset Section tests
		noSection = await getContentFromArchives("invalid_no_section.zip");
		validCourses = await getContentFromArchives("valid_courses.zip");
		validCourses2 = await getContentFromArchives("valid_courses2.zip");
		noCourse = await getContentFromArchives("no_courses_file.zip");
		notJson = await getContentFromArchives("invalid_not_json_file.zip");
		emptyJson = await getContentFromArchives("invalid_empty_json_file.zip");
		noCourseFolder = await getContentFromArchives("invalid_do_not_course_folder.zip");
		oneValidCourseOneInvalidCourse = await getContentFromArchives("one_valid_course_one_invalid_course.zip");
		invalidSections = await getContentFromArchives("invalid_section.zip");
		validSectionsAndInvalidSections = await getContentFromArchives("valid_sections_and_invalid_sections.zip");
		notCoursesFolder = await getContentFromArchives("invalid_not_courses_folder.zip");
		invalidNoResultKey = await getContentFromArchives("invalid_no_result_key.zip");
		invalidJsonNotObject = await getContentFromArchives("invalid_json_not_object.zip");
		invalidFoldrInFolder = await getContentFromArchives("invalid_courses_folder_inside_folder.zip");
		validTwoCourses = await getContentFromArchives("valid_two_courses.zip");
		validOneSection = await getContentFromArchives("valid_one_section.zip");
		invalidNoRankKey = await getContentFromArchives("invalid_no_rank.zip");
		validOneSectionOneNotJson = await getContentFromArchives("valid_one_set_one_notJson.zip");
		// Below are the ZIP files for addDataset Room tests
		invalidBldgNoRoomTable = await getContentFromArchives("RoomInvalid_BldgNoRoomTable.zip");
		invalidBldgNotFound = await getContentFromArchives("RoomInvalid_BldgNotFound.zip");
		invalidMoreBldgListTable = await getContentFromArchives("RoomInvalid_MoreBldgListTable.zip");
		invalidMoreRoomTable = await getContentFromArchives("RoomInvalid_MoreRoomTable.zip");
		invalidNoGeo = await getContentFromArchives("RoomInvalid_NoGeo.zip");
		invalidNoHref = await getContentFromArchives("RoomInvalid_NoHref.zip");
		invalidNoIndex = await getContentFromArchives("RoomInvalid_NoIndex.zip");
		invalidRoomMissingProperty = await getContentFromArchives("RoomInvalid_RoomMissingProperty.zip");
		invalidTDCellDoesNotExist = await getContentFromArchives("RoomInvalid_TDCellDoesNotExist.zip");
		invalidWrongFolder = await getContentFromArchives("RoomInvalid_WrongFolder.zip");
		validMoreBldgListTable = await getContentFromArchives("RoomValid_MoreBldgListTable.zip");
		validMoreBldgOnlyOneLinked = await getContentFromArchives("RoomValid_MoreBldgOnlyOneLinked.zip");
		validMoreRoomTable = await getContentFromArchives("RoomValid_MoreRoomTable.zip");
		validOneBldg = await getContentFromArchives("RoomValid_OneBldg.zip");
		validRoomMoreField = await getContentFromArchives("RoomValid_RoomMoreFiled.zip");
		validTDCellExist = await getContentFromArchives("RoomValid_TDCellExist.zip");
		smallTest = await getContentFromArchives("small test.zip");
		campus = await getContentFromArchives("campus.zip");
		indifferentfolder = await getContentFromArchives("differentFolder.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		await clearDisk();
	});

	describe("AddDataset Rooms", function () {
		beforeEach(function () {
			facade = new InsightFacade();
		});
		afterEach(async function () {
			await clearDisk();
		});
		it ("should be able to add a dataset in different folder", async function () {
			try {
				const result = await facade.addDataset("edge", indifferentfolder, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["edge"]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should reject with no room table in building", async function () {
			try {
				await facade.addDataset("invalidBldgNoRoomTable", invalidBldgNoRoomTable, InsightDatasetKind.Rooms);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with an non exist building link", async function () {
			try {
				await facade.addDataset("invalidBldgNotFound", invalidBldgNotFound, InsightDatasetKind.Rooms);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with multiple building tables but all are invalid", async function () {
			try {
				await facade.addDataset("invalidMoreBldgListTable", invalidMoreBldgListTable, InsightDatasetKind.Rooms);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with multiple room tables but all are invalid", async function () {
			try {
				await facade.addDataset("invalidMoreRoomTable", invalidMoreRoomTable, InsightDatasetKind.Rooms);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with no address for building", async function () {
			try {
				await facade.addDataset("invalidNoGeo", invalidNoGeo, InsightDatasetKind.Rooms);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with no hyper links", async function () {
			try {
				await facade.addDataset("invalidNoHref", invalidNoHref, InsightDatasetKind.Rooms);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with no index.htm", async function () {
			try {
				await facade.addDataset("invalidNoIndex", invalidNoIndex, InsightDatasetKind.Rooms);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with room table missing important attributes", async function () {
			try {
				await facade.addDataset("invalidRoomMissingProperty"
					, invalidRoomMissingProperty, InsightDatasetKind.Rooms);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with room table missing have attributes but no td cell", async function () {
			try {
				await facade.addDataset("invalidTDCellDoesNotExist"
					, invalidTDCellDoesNotExist, InsightDatasetKind.Rooms);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with bldg.htm in wrong places", async function () {
			try {
				await facade.addDataset("invalidWrongFolder", invalidWrongFolder, InsightDatasetKind.Rooms);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should resolve with multiple building table with one valid in index.htm", async function () {
			try {
				const result = await facade.addDataset("validMoreBldgListTable"
					, validMoreBldgListTable, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["validMoreBldgListTable"]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should resolve with multiple building.htm exists but only one linked to index", async function () {
			try {
				const result = await facade.addDataset("validMoreBldgOnlyOneLinked"
					, validMoreBldgOnlyOneLinked, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["validMoreBldgOnlyOneLinked"]);
				const result2 = await facade.listDatasets();
				expect(result2).to.have.length(1);
				expect(result2).to.deep.equal([{
					id: "validMoreBldgOnlyOneLinked",
					kind: InsightDatasetKind.Rooms,
					numRows: 1
				}]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should resolve with multiple room table with one valid in bldg.htm", async function () {
			try {
				const result = await facade.addDataset("validMoreRoomTable"
					, validMoreRoomTable, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["validMoreRoomTable"]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should resolve with one valid building with one valid room table", async function () {
			try {
				const result = await facade.addDataset("validOneBldg", validOneBldg, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["validOneBldg"]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should resolve with valid room table with extra fields", async function () {
			try {
				const result = await facade.addDataset("validRoomMoreField"
					, validRoomMoreField, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["validRoomMoreField"]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should resolve with valid room table with td exist but empty", async function () {
			try {
				const result = await facade.addDataset("validTDCellExist"
					, validTDCellExist, InsightDatasetKind.Rooms);
				expect(result).to.deep.equal(["validTDCellExist"]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should reject small test with all invalid geo locations for building", async function () {
			try {
				const result = await facade.addDataset("validSmall"
					, smallTest, InsightDatasetKind.Rooms);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});
	});

	describe("AddDataset Sections", function () {
		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			facade = new InsightFacade();
		});

		afterEach(async function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			await clearDisk();
		});
		it("should be able to load top5courses", async function () {
			try {
				const result = await facade.addDataset("top5courses", top5courses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["top5courses"]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should reject with duplicate id -- light version", async function () {
			try {
				await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should resolve with a valid id", async function () {
			try {
				const result = await facade.addDataset("1", validOneSection, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["1"]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should reject with  an empty dataset id", async function () {
			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should be able to add a dataset with one valid section and one not json file", async function () {
			try {
				const result = await facade.addDataset(
					"validOneSectionOneNotJson",
					validOneSectionOneNotJson,
					InsightDatasetKind.Sections
				);
				expect(result).to.deep.equal(["validOneSectionOneNotJson"]);
				const result2 = await facade.listDatasets();
				expect(result2).to.have.length(1);
				expect(result2).to.deep.equal([
					{
						id: "validOneSectionOneNotJson",
						kind: InsightDatasetKind.Sections,
						numRows: 1,
					},
				]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should able to add a json file without rank key", async function () {
			try {
				const result = await facade.addDataset(
					"invalidNoRankKey",
					invalidNoRankKey,
					InsightDatasetKind.Sections
				);
				expect(result).to.deep.equal(["invalidNoRankKey"]);
				const result2 = await facade.listDatasets();
				expect(result2).to.have.length(1);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should be able to add a dataset with id :123", async function () {
			try {
				const result = await facade.addDataset("123", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["123"]);
				const result2 = await facade.listDatasets();
				expect(result2).to.have.length(1);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should able to add a dataset with two courses", async function () {
			try {
				const result = await facade.addDataset("validTwoCourses", validTwoCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validTwoCourses"]);
				expect(result).to.have.length(1);
				const result2 = await facade.listDatasets();
				expect(result2).to.have.length(1);
				expect(result2).to.deep.equal([{id: "validTwoCourses", kind: InsightDatasetKind.Sections, numRows: 4}]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should able to add a dataset with one section", async function () {
			try {
				const result = await facade.addDataset("validOneSection", validOneSection, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validOneSection"]);
				expect(result).to.have.length(1);
				const result2 = await facade.listDatasets();
				expect(result2).to.have.length(1);
				expect(result2).to.deep.equal([{id: "validOneSection", kind: InsightDatasetKind.Sections, numRows: 1}]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should reject with an invalid section", async function () {
			try {
				const result = await facade.addDataset("invalidSections", invalidSections, InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject to add an courses folder inside a folder", async function () {
			try {
				const result = await facade.addDataset(
					"invalidFolderInFolder",
					invalidFoldrInFolder,
					InsightDatasetKind.Sections
				);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with an invalid content with just empty string", async function () {
			try {
				const result = await facade.addDataset("emptyString", "", InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject an invalid id and empty content", async function () {
			try {
				const result = await facade.addDataset("", "", InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with an invalid json not object type", async function () {
			try {
				const result = await facade.addDataset(
					"invalidJsonNotObject",
					invalidJsonNotObject,
					InsightDatasetKind.Sections
				);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with an invalid no result key", async function () {
			try {
				const result = await facade.addDataset(
					"invalidNoResultKey",
					invalidNoResultKey,
					InsightDatasetKind.Sections
				);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with a zip file which is not a courses folder", async function () {
			try {
				const result = await facade.addDataset(
					"notCoursesFolder",
					notCoursesFolder,
					InsightDatasetKind.Sections
				);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with an empty dataset id", async function () {
			try {
				const result = await facade.addDataset("", validCourses, InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
				// expect result
				// for the passed
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
				// expect.fail("Should have rejected")
			}
		});

		it("should able to add a dataset with one course with valid sections and invalid sections", async function () {
			try {
				const result = await facade.addDataset(
					"validSectionsAndInvalidSections",
					validSectionsAndInvalidSections,
					InsightDatasetKind.Sections
				);
				expect(result).to.deep.equal(["validSectionsAndInvalidSections"]);
				const result2 = await facade.listDatasets();
				expect(result2).to.have.length(1);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should reject with an zip file witch is not a course", async function () {
			try {
				const result = await facade.addDataset("notCourseFolder", noCourseFolder, InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with an empty json file", async function () {
			try {
				const result = await facade.addDataset("emptyJson", emptyJson, InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with an invalid dataset with only underscore", async function () {
			try {
				const result = await facade.addDataset("_", validCourses, InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with an invalid dataset with underscore in the middle", async function () {
			try {
				const result = await facade.addDataset("valid_Courses", validCourses, InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with an invalid dataset with only whitespace", async function () {
			try {
				const result = await facade.addDataset(" ", validCourses, InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with an valid dataset with two whitespace", async function () {
			try {
				const result = await facade.addDataset("  ", validCourses, InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// test case: should fail to add dataset which is empty, nothing in zip file
		it("should reject with an invalid dataset with empty", async function () {
			try {
				const result = await facade.addDataset("validCourses", "", InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// test case: should fail to add dataset which has invalid json file -- invalid_not_json.zip
		it("should reject with an invalid dataset with invalid json file", async function () {
			try {
				const result = await facade.addDataset("notJson", notJson, InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// test case: should fail to add dataset which has empty course folder -- no_courses_file.zip
		it("should reject with an invalid dataset with empty course folder", async function () {
			try {
				const result = await facade.addDataset("noCourse", noCourse, InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// test case: should fail to add dataset which has course has no section -- invalid_no_section.zip
		it("should reject with an invalid dataset with course has no section", async function () {
			try {
				const result = await facade.addDataset("noSection", noSection, InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should be able to add a dataset with a space in the id", async function () {
			try {
				const result = await facade.addDataset("valid Courses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["valid Courses"]);
				const result2 = await facade.listDatasets();
				expect(result2).to.have.length(1);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		// test case : should fail to add dataset which has no course folder -- no_courses_file.zip
		it("should reject with an invalid dataset with no course folder", async function () {
			try {
				const result = await facade.addDataset("noCourseFolder", noCourseFolder, InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// test case: should add dataset which has valid courses
		it("should add dataset with valid courses", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses2, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses"]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		// test case: should add two datasets which have valid courses
		it("should add two datasets with valid courses", async function () {
			const id1 = "validCourses";
			const id2 = "validCourses2";
			try {
				const result = await facade.addDataset(id1, validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal([id1]);
				const result2 = await facade.addDataset(id2, validCourses2, InsightDatasetKind.Sections);
				expect(result2).to.deep.equal([id1, id2]);
				const result3 = await facade.listDatasets();
				expect(result3).to.have.length(2);
				expect(result3[0].id).to.deep.equal(id1);
				expect(result3[1].id).to.deep.equal(id2);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should be able to add a dataset with a space in the front of the id", async function () {
			try {
				const result = await facade.addDataset(" validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal([" validCourses"]);
				const result2 = await facade.listDatasets();
				expect(result2).to.have.length(1);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		// test case: should reject to add dataset which has duplicate id
		it("should reject with duplicate id", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses"]);
				const result3 = await facade.listDatasets();
				expect(result3).to.have.length(1);
				const result2 = await facade.addDataset("validCourses", validCourses2, InsightDatasetKind.Sections);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// test case using chai test: should add dataset which has valid courses and then list the dataset been loaded by listDatasets()
		it("should add dataset with valid courses and then list the dataset been loaded", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses"]);
				const result2 = await facade.listDatasets();
				expect(result2).to.have.length(1);
				expect(result2).to.deep.equal([{id: "validCourses", kind: InsightDatasetKind.Sections, numRows: 2}]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("Should reject with added with a room kind, instead of a section kind", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Rooms);
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// testcase: should be able to add two datasets with different id and then list the dataset been loaded by listDatasets()
		it("should add two datasets with valid courses and then list the dataset been loaded", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses"]);
				const result2 = await facade.addDataset("validCourses3", validCourses2, InsightDatasetKind.Sections);
				expect(result2).to.deep.equal(["validCourses", "validCourses3"]);
				const result3 = await facade.listDatasets();
				expect(result3).to.have.length(2);
				expect(result3[0].id).to.deep.equal("validCourses");
				expect(result3[1].id).to.deep.equal("validCourses3");
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should be able to add same dataset with different id and then list the dataset", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses"]);
				const result2 = await facade.addDataset("validCourses2", validCourses, InsightDatasetKind.Sections);
				expect(result2).to.deep.equal(["validCourses", "validCourses2"]);
				const result3 = await facade.listDatasets();
				expect(result3).to.have.length(2);
				expect(result3[0].id).to.deep.equal("validCourses");
				expect(result3[1].id).to.deep.equal("validCourses2");
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should be able to add a dataset with a space in the end of the id", async function () {
			try {
				const result = await facade.addDataset("validCourses ", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses "]);
				const result2 = await facade.listDatasets();
				expect(result2).to.have.length(1);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should be able to add a dataset with space in front and then remove it", async function () {
			try {
				const result = await facade.addDataset(" validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal([" validCourses"]);
				const result2 = await facade.addDataset("validCourses ", validCourses2, InsightDatasetKind.Sections);
				expect(result2).to.deep.equal([" validCourses", "validCourses "]);
				const result3 = await facade.listDatasets();
				expect(result3).to.have.length(2);
				const result4 = await facade.removeDataset(" validCourses");
				expect(result4).to.deep.equal(" validCourses");
				const result5 = await facade.listDatasets();
				expect(result5).to.have.length(1);
				const result6 = await facade.removeDataset("validCourses ");
				expect(result6).to.deep.equal("validCourses ");
				const result7 = await facade.listDatasets();
				expect(result7).to.have.length(0);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		// test case: should be able to add a dataset with valid courses and then remove the dataset
		it("should add a dataset with valid courses and then remove the dataset", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses"]);
				const result2 = await facade.removeDataset("validCourses");
				expect(result2).to.deep.equal("validCourses");
				const result3 = await facade.listDatasets();
				expect(result3).to.have.length(0);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should be able to add a dataset and then remove a dataset and then list the dataset", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses"]);
				const result2 = await facade.removeDataset("validCourses");
				expect(result2).to.deep.equal("validCourses");
				const result3 = await facade.listDatasets();
				expect(result3).to.have.length(0);
				const result4 = await facade.addDataset("validCourses", validCourses2, InsightDatasetKind.Sections);
				expect(result4).to.deep.equal(["validCourses"]);
				const result5 = await facade.listDatasets();
				expect(result5).to.have.length(1);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should add a dataset with one valid course and one invalid course", async function () {
			try {
				const result = await facade.addDataset(
					"oneValidCourseOneInvalidCourse",
					oneValidCourseOneInvalidCourse,
					InsightDatasetKind.Sections
				);
				expect(result).to.deep.equal(["oneValidCourseOneInvalidCourse"]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should able to pass this complex test", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				const result2 = await facade.addDataset("validCourses2", validCourses2, InsightDatasetKind.Sections);
				expect(result2).to.deep.equal(["validCourses", "validCourses2"]);
				const result3 = await facade.listDatasets();
				expect(result3).to.have.length(2);
				expect(result3).to.deep.equal([
					{
						id: "validCourses",
						kind: InsightDatasetKind.Sections,
						numRows: 2,
					},
					{
						id: "validCourses2",
						kind: InsightDatasetKind.Sections,
						numRows: 2,
					},
				]);
				expect(result3[0].id).to.deep.equal("validCourses");
				expect(result3[1].id).to.deep.equal("validCourses2");
				const result4 = await facade.removeDataset("validCourses");
				expect(result4).to.deep.equal("validCourses");
				const result5 = await facade.listDatasets();
				expect(result5).to.have.length(1);
				expect(result5[0].id).to.deep.equal("validCourses2");
				expect(result5).to.deep.equal([{id: "validCourses2", kind: InsightDatasetKind.Sections, numRows: 2}]);
				const result6 = await facade.removeDataset("validCourses2");
				expect(result6).to.deep.equal("validCourses2");
				const result7 = await facade.listDatasets();
				expect(result7).to.have.length(0);
				expect(result7).to.deep.equal([]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should reject move one dataset twice", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses"]);
				const result2 = await facade.removeDataset("validCourses");
				expect(result2).to.deep.equal("validCourses");
				const result3 = await facade.listDatasets();
				expect(result3).to.have.length(0);
				const result4 = await facade.removeDataset("validCourses");
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			}
		});

		// test case: should be rejected to remove a dataset which has not been added
		it("should be rejected to remove a dataset which has not been added", async function () {
			try {
				const result = await facade.removeDataset("validCourses");
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			}
		});

		it("should be reject to remove a dataset which does not matched any name", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses"]);
				const result3 = await facade.listDatasets();
				expect(result3).to.have.length(1);
				const result2 = await facade.removeDataset("validCourses2");
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			}
		});

		it("should be able to add a dataset with space in it's name and then remove it", async function () {
			try {
				const result = await facade.addDataset("valid Courses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["valid Courses"]);
				const result2 = await facade.removeDataset("valid Courses");
				expect(result2).to.deep.equal("valid Courses");
				const result3 = await facade.listDatasets();
				expect(result3).to.have.length(0);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		it("should reject to remove a dataset with invalid id -- underscore", async function () {
			try {
				const result = await facade.removeDataset("valid_Courses");
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject to remove a dataset with invalid id -- only space", async function () {
			try {
				const result = await facade.removeDataset("  ");
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject to remove a dataset with invalid id -- empty", async function () {
			try {
				const result = await facade.removeDataset("");
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should be able to remove a valid dataset with a space in the id", async function () {
			try {
				const result = await facade.addDataset("valid Courses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["valid Courses"]);
				const result2 = await facade.removeDataset("valid Courses");
				expect(result2).to.deep.equal("valid Courses");
				const result3 = await facade.listDatasets();
				expect(result3).to.have.length(0);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});

		// test case: should be rejected to remove a invalid id dataset
		it("should be rejected to remove a invalid id dataset -- space", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses"]);
				const result2 = await facade.removeDataset(" ");
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should be rejected to remove a invalid id dataset -- empty", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses"]);
				const result2 = await facade.removeDataset("");
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should be rejected to remove a invalid id dataset -- under line", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses"]);
				const result2 = await facade.removeDataset("_");
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should be rejected to remove a invalid id dataset -- underscore in the middle", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses"]);
				const result2 = await facade.removeDataset("valid_Courses");
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// test case: should be rejected to remove a dataset which has been removed
		it("should be rejected to remove a dataset which has been removed", async function () {
			try {
				const result = await facade.addDataset("validCourses", validCourses, InsightDatasetKind.Sections);
				expect(result).to.deep.equal(["validCourses"]);
				const result2 = await facade.removeDataset("validCourses");
				expect(result2).to.deep.equal("validCourses");
				const result3 = await facade.removeDataset("validCourses");
				expect.fail("Should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			}
		});

		// test case : should be able to list the dataset when there is no dataset
		it("should be able to list the dataset when there is no dataset", async function () {
			try {
				const result = await facade.listDatasets();
				expect(result).to.deep.equal([]);
			} catch (err) {
				expect.fail("Should have fulfilled");
			}
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You can and should still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", function () {
		before(async function () {
			facade = new InsightFacade();

			// FunctionAdd the datasets to InsightFacade once.
			// Will *fail* if there is a problem reading ANY dataset.
			// load datasets for the query testing
			const loadDatasetPromises = [
				await facade.addDataset("sections", sections, InsightDatasetKind.Sections),
				await facade.addDataset("top5courses", top5courses, InsightDatasetKind.Sections),
				await facade.addDataset("one overall", oneOverAllSection, InsightDatasetKind.Sections),
				await facade.addDataset("rooms", campus, InsightDatasetKind.Rooms),
			];

			try {
				await Promise.all(loadDatasetPromises);
			} catch (err) {
				throw new Error(`In PerformQuery Before hook, dataset(s) failed to be added. \n${err}`);
			}
		});

		after(async function () {
			await clearDisk();
		});

		describe("query test for debug", function () {
			it("manual check for debug", async function () {
				let result;
				const query = {
					WHERE: {
						GT: {
							sections_avg: 67
						}
					},
					OPTIONS: {
						COLUMNS: [
							"overallMax",
							"sections_dept"
						]
					},
					TRANSFORMATIONS: {
						GROUP: [
							"sections_dept"
						],
						APPLY: [
							{
								overallMax: {
									MAX: "sections_avg"
								}
							}
						]
					}
				};
				try {
					const result1 = await facade.performQuery(query);
					console.log(result1);
				} catch (err) {
					expect.fail(`Should not have thrown: ${err}`);
				}
			});
		});

		describe("valid queries", function () {
			let validQueries: ITestQuery[];
			try {
				validQueries = readFileQueries("valid");
			} catch (e: unknown) {
				expect.fail(`Failed to read one or more test queries. ${e}`);
			}

			validQueries.forEach(function (test: any) {
				it(`${test.title}`, function () {
					return facade
						.performQuery(test.input)
						.then((result) => {
							// assert.include.deep.members(result, test.expected);
							expect(result).includes.deep.members(test.expected);
						})
						.catch((err: any) => {
							assert.fail(`performQuery threw unexpected error: ${err}`);
						});
				});
			});
		});

		describe("invalid queries", function () {
			let invalidQueries: ITestQuery[];

			try {
				invalidQueries = readFileQueries("invalid");
			} catch (e: unknown) {
				expect.fail(`Failed to read one or more test queries. ${e}`);
			}

			invalidQueries.forEach(function (test: any) {
				it(`${test.title}`, function () {
					return facade
						.performQuery(test.input)
						.then((result) => {
							assert.deepEqual(result, test.expected);
						})
						.catch((err: any) => {
							if (test.expected === "ResultTooLargeError") {
								assert.instanceOf(err, ResultTooLargeError);
							} else {
								assert.instanceOf(err, InsightError);
							}
						});
				});
			});
		});
	});
});
