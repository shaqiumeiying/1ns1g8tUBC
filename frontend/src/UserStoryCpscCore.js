import React, { useState} from 'react';
import {
	Chart,
	CommonSeriesSettings,
	Aggregation,
	SeriesTemplate,
	ArgumentAxis,
	Label, Legend, Export, Tooltip
} from 'devextreme-react/chart';
import './UserStory.css';

function UserStoryCpscCore() {
	const [id, setId] = useState('');
	const [feedback, setFeedback] = useState('');
	const [result, setResult] = useState(null);
	const [noResult, setShowPopup] = useState(false);


	const handleQuery = async (event) => {
		event.preventDefault();

		const inputId = event.target.elements[0].value;

		if (!inputId) {
			setFeedback('ID cannot be empty.');
			return;
		}

		setId(inputId); // Set the id state variable here

		try {
			const query = {
				WHERE: {
					AND: [
						{
							OR: [
								{
									IS: {
										[`${inputId}_id`]: "310"
									}
								},
								{
									IS: {
										[`${inputId}_id`]: "313"
									}
								},
								{
									IS: {
										[`${inputId}_id`]: "320"
									}
								}
							]
						},
						{
							IS: {
								[`${inputId}_dept`]: "cpsc"
							}
						},
						{
							NOT: {
								IS: {
									[`${inputId}_instructor`]: ""
								}
							}
						}
					]
				},
				OPTIONS: {
					COLUMNS: [
						[`${inputId}_id`].toString(),
						[`${inputId}_instructor`].toString(),
						"overallAvg"
					],
					ORDER: {
						dir: "UP",
						keys: [
							[`${inputId}_id`].toString()
						]
					}
				},
				TRANSFORMATIONS: {
					GROUP: [
						[`${inputId}_id`].toString(),
						[`${inputId}_dept`].toString(),
						[`${inputId}_instructor`].toString()
					],
					APPLY: [
						{
							overallAvg: {
								AVG: [`${inputId}_avg`].toString()
							}
						}
					]
				}
			}

			const url = `http://localhost:4321/query`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(query)
			});

			const data = await response.json();
			if (data.result.length === 0) {
				setShowPopup(true);
				setFeedback('');
				setResult(null);
			} else {
				setShowPopup(false);
				setFeedback('Query successful!');
				setResult(data.result);
			}

		} catch (error) {
			setFeedback('No Such Dataset');
			setResult(null);
		}
	};


	const PopupWindow = ({message, onClose}) => (
		<div className="popup-window">
			<div className="popup-content">
				<p>{message}</p>
				<button onClick={onClose}>OK</button>
			</div>
		</div>
	);

	return (
		<div className="userstory">
			<form onSubmit={handleQuery} style={{display: 'flex', alignItems: 'center', marginTop: '20px'}}>
				<input
					type="text"
					className="input-text custom-input"
					placeholder="ID"
					required
				/>
				<button type="submit" className="submit-button" style={{marginLeft: '10px', width: '200px'}}> CPSC Core
					Course Advising
				</button>
				{feedback && <p style={{marginLeft: '10px'}}>{feedback}</p>}
			</form>
			{result && (
				<div>
					<h2>CPSC 3-level Core Course Instructors and Overall Average</h2>
					<Chart id="chart"
						   dataSource={result}
						   style={{width: '900px'}}
						   barGroupWidth={100}>
						<Legend visible={true}/>
						<Export enabled={true}/>
						<CommonSeriesSettings argumentField={`${id}_instructor`} valueField="overallAvg" type="bar">
							<Aggregation enabled={true} method="avg"></Aggregation>
						</CommonSeriesSettings>
						<SeriesTemplate nameField={`${id}_id`}></SeriesTemplate>
						<ArgumentAxis>
							<Label displayMode="rotate" alignment = "center"/>
						</ArgumentAxis>
						<Tooltip enabled={true} />
					</Chart>
				</div>
			)}
			{noResult && (
				<PopupWindow
					message="No Result Found"
					onClose={() => setShowPopup(false)}
				/>
			)}
		</div>
	);
}

export default UserStoryCpscCore;
