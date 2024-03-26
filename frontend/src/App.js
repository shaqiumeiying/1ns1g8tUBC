import React, { useState } from 'react';
import { Chart, Series } from 'devextreme-react/chart';

function App() {
	const [dataSource, setDataSource] = useState([]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		const courseId = event.target.elements.courseId.value;
		const courseDept = event.target.elements.courseDept.value;

		const response = await fetch(`/api/courses?courseId=${courseId}&courseDept=${courseDept}`);
		const data = await response.json();

		setDataSource(data);
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<input name="courseId" type="text" placeholder="Course ID" required />
				<input name="courseDept" type="text" placeholder="Course Department" required />
				<button type="submit">Submit</button>
			</form>

			<Chart id="chart" dataSource={dataSource}>
				<Series valueField="avg" argumentField="id" name="Course Average" type="bar" color="#ffaa66" />
			</Chart>
		</div>
	);
}

export default App;
