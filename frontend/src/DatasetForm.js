import React, { useState } from 'react';
function DatasetForm({ onAdd }) {
	const [id, setId] = useState('');
	const [file, setFile] = useState(null);
	const [feedback, setFeedback] = useState('');

	const handleFormSubmit = async (event) => {
		event.preventDefault();

		if (!id || !file) {
			setFeedback('Please provide both ID and dataset.');
			return;
		}

		const formData = new FormData();
		formData.append("file",file);

		// TODO: the button handler should call the endpoint to add the dataset
		// this version is a place holder
		try {
			const response = await fetch(`http://localhost:4321/dataset/${id}/sections`, {
				method: 'PUT',
				headers: {
					"Content-Type": "application/x-zip-compressed",
				},
				body: formData,
			});

			if (response.ok) {
				console.log(response);
				setFeedback('Dataset added successfully.');
			} else {
				setFeedback('Error adding dataset.');
			}
		} catch (error) {
			setFeedback('Error adding dataset.');
		}

		setId('');
		setFile(null);
	};

	const handleFileClick = () => {
		console.log('Choose file clicked');
	};

	return (
		<div className="App">
			<div className="header">
				Diana & Simon
			</div>
			<form onSubmit={handleFormSubmit} style={{ display: 'flex', alignItems: 'center' }}>
				<input type="text" className="input-text" value={id} onChange={(e) => setId(e.target.value)}
					   placeholder="ID" required/>
				<div style={{display: 'flex', alignItems: 'center', marginLeft: '10px'}}>
					<label htmlFor="file-upload" className="custom-file-upload">
						Choose File
					</label>
					<input id="file-upload" type="file" className="file-upload" accept=".zip" onClick={handleFileClick} onChange={(e) => setFile(e.target.files[0])} required style={{ display: 'none' }} />
					<p style={{ marginLeft: '1px' }}>Only .zip files are allowed</p>
				</div>
				<button type="submit" className="submit-button" style={{marginLeft: '10px'}}>Add Dataset</button>
				{feedback && <p>{feedback}</p>}
			</form>
		</div>
	);
}

export default DatasetForm;
