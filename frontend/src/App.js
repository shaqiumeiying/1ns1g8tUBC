import React from 'react';
// import { Chart, Series } from 'devextreme-react/chart';
import Sidebar from "./Sidebar";
import DatasetForm from "./DatasetForm";
import UserStory4level from "./UserStory4level";
import UserStoryArt from "./UserStoryArt";
import UserStoryCpscCore from "./UserStoryCpscCore";

function App() {
	// const [dataSource, setDataSource] = useState([]);

	// TODO: this is a placeholder for the actual functionality
	return (
		<div className="app-container">
			<Sidebar />
			<div className="content">
				<DatasetForm />
				<hr />
				{/*<form onSubmit={handleSubmit}>*/}
				{/*	<input name="DatasetID" type="text" placeholder="Dataset ID" required />*/}
				{/*	<button type="submit">Show First User Story 1</button>*/}
				{/*</form>*/}
				{/*<Chart id="chart" dataSource={dataSource}>*/}
				{/*	<Series valueField="avg" argumentField="id" name="Course Average" type="bar" color="#ffaa66" />*/}
				{/*</Chart>*/}
				<UserStory4level />
				<UserStoryArt />
				<UserStoryCpscCore />
			</div>
		</div>
	);
}

export default App;
