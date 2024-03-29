import React from 'react';
// import { Chart, Series } from 'devextreme-react/chart';
import Sidebar from "./Sidebar";
import DatasetForm from "./DatasetForm";

function App() {
	// const [dataSource, setDataSource] = useState([]);

	// TODO: this is a placeholder for the actual functionality
	const handleSubmit = async (event) => {
	};

	return (
		<div className="app-container">
			<Sidebar />
			<div className="content">
				<DatasetForm />
				<hr />
				<form onSubmit={handleSubmit}>
					<input name="DatasetID" type="text" placeholder="Dataset ID" required />
					<button type="submit">Show First User Story 1</button>
				</form>
				{/*<Chart id="chart" dataSource={dataSource}>*/}
				{/*	<Series valueField="avg" argumentField="id" name="Course Average" type="bar" color="#ffaa66" />*/}
				{/*</Chart>*/}
			</div>
		</div>
	);
}

export default App;
