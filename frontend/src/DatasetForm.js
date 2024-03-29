import React, { useState } from 'react';
import './DatasetForm.css';
function DatasetForm({ onAdd }) {
	const [idAdd, setIdAdd] = useState('');
	const [idRemove, setIdRemove] = useState('');
	const [file, setFile] = useState(null);
	const [AddFeedback, setAddFeedback] = useState('');
	const [RemoveFeedback, setRemoveFeedback] = useState('');

	const handleAdd = async (event) => {
		event.preventDefault();

		if (!idAdd || !file) {
			setAddFeedback('Please provide both ID and dataset.');
			return;
		}

		const formData = new FormData();
		formData.append("file",file);

		try {
			const response = await fetch(`http://localhost:4321/dataset/${idAdd}/sections`, {
				method: 'PUT',
				headers: {
					"Content-Type": "application/x-zip-compressed",
				},
				body: formData,
			});

			if (response.ok) {
				console.log(response);
				setAddFeedback('Dataset added successfully.');
			} else {
				setAddFeedback('Error adding dataset.');
			}
		} catch (error) {
			setAddFeedback('Error adding dataset.');
		}

		setIdAdd('');
		setFile(null);
	};


	const handleRemove = async (event) => {
		event.preventDefault();

		if (!idRemove ) {
			setRemoveFeedback('ID cannot be empty.');
			return;
		}

		try {
			const url = `http://localhost:4321/dataset/${idRemove}`;
			const response = await fetch(url, {
				method: 'DELETE',
			});

			if (response.ok) {
				setRemoveFeedback('Dataset removed successfully.');
			} else {
				setRemoveFeedback('ID does not exist.');
			}

			setIdRemove('');

		} catch (err) {
			setRemoveFeedback('Error removing dataset.');
			console.error('Error removing dataset:', err);
		}
	};

	const handleFileClick = () => {
		console.log('Choose file clicked');
	};

	return (
		<div className="dataset-form">
			<div className="header" style={{ marginBottom: '20px' }}>
				Diana & Simon
			</div>
			<form onSubmit={handleAdd} style={{ display: 'flex', alignItems: 'center'}}>
				<input
					type="text"
					className="input-text custom-input"
					value={idAdd}
					onChange={(e) => setIdAdd(e.target.value)}
					placeholder="ID"
					required
				/>
				<div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
					<label htmlFor="file-upload" className="custom-file-upload">
						Choose File
					</label>
					<input
						id="file-upload"
						type="file"
						className="file-upload"
						accept=".zip"
						onClick={handleFileClick}
						onChange={(e) => setFile(e.target.files[0])}
						required
						style={{ display: 'none' }}
					/>
					<p style={{ marginLeft: '1px' }}>Only .zip files are allowed</p>
				</div>
				<button type="submit" className="submit-button" style={{ marginLeft: '10px', width: '80px' }}>Add</button>
				{AddFeedback && <p style={{  marginLeft: '10px'  }}>{AddFeedback}</p>}
			</form>
			<form onSubmit={handleRemove} style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
				<input
					type="text"
					className="input-text custom-input"
					value={idRemove}
					onChange={(e) => setIdRemove(e.target.value)}
					placeholder="ID"
					required
				/>
				<button type="submit" className="submit-button" style={{ marginLeft: '10px', width: '80px' }}>Remove</button>
				{RemoveFeedback && <p style={{ marginLeft: '10px' }}>{RemoveFeedback}</p>}
			</form>
		</div>
	);

}

export default DatasetForm;
