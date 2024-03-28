import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar() {
	const [datasets, setDatasets] = useState([]);

	const fetchDatasets = async () => {
		try {
		const response = await fetch("http://localhost:4321/datasets", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			}
		});
		const data = await response.json();
		setDatasets(data.datasets);
		} catch (error) {
			console.error(`Fetch failed: ${error}`);
		}
	};

	return (
		<div className="sidebar">
			<h2>Dataset ID been added:</h2>
			<button onClick={fetchDatasets}>List Datasets</button>
			<ul>
				{datasets ? datasets.map((dataset, index) => (
					<li key={index}>{dataset.id}</li>
				)) : <p>No datasets available</p>}
			</ul>
		</div>
	);
}

export default Sidebar;
