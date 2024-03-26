import React, { useState } from 'react';

function DatasetForm({ onAdd }) {
	const [id, setId] = useState('');
	const [file, setFile] = useState(null);
	const [feedback, setFeedback] = useState('');

	const handleFormSubmit = (event) => {
		event.preventDefault();

		if (!id || !file) {
			setFeedback('Please provide both ID and dataset.');
			return;
		}

		onAdd({ id, file });
		setId('');
		setFile(null);
		setFeedback('Dataset added successfully.');
	};

	const handleFileClick = () => {
		console.log('Choose file clicked');
	};

	return (
		<form onSubmit={handleFormSubmit}>
			<input type="text" value={id} onChange={(e) => setId(e.target.value)} placeholder="ID" required />
			<input type="file" onClick={handleFileClick} onChange={(e) => setFile(e.target.files[0])} required style={{ display: 'block', zIndex: 1 }} />
			<button type="submit">Add Dataset</button>
			{feedback && <p>{feedback}</p>}
		</form>
	);
}

export default DatasetForm;
