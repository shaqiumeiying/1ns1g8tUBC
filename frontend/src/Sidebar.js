import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar() {
	const [datasets, setDatasets] = useState([]);

	const fetchDatasets = async () => {
		const response = await fetch('/datasets');
		const data = await response.json();
		setDatasets(data.result);
	};

	return (
		<div className="sidebar">
			<h2>Dataset ID  been added:</h2>
			<button onClick={fetchDatasets}>List Datasets</button>
			<ul>
				{datasets.map((dataset, index) => (
					<li key={index}>{dataset.id}</li>
				))}
			</ul>
		</div>
	);
}

export default Sidebar;
