import React, { useCallback, useState } from 'react';
import { Chart, ConstantLine, Export, Label, Legend, Series, ValueAxis, VisualRange } from 'devextreme-react/chart';

function UserStoryArt() {
	const [feedback, setFeedback] = useState('');
	const [result, setResult] = useState(null);
	const [noResult, setShowPopup] = useState(false);
	const highAverage = 86;

	const customizeText = useCallback((arg) => `${arg.valueText}`, []);



	const handleQuery = async (event) => {

		event.preventDefault();

		const datasetId = event.target.elements[0].value;

		if (!datasetId) {
			setFeedback('ID cannot be empty.');
			return;
		}

		try {
			const query = {
				WHERE: {
					AND: [
						{
							GT: {
								[`${datasetId}_avg`]: 85
							}
						},
						{
							OR: [
								{
									IS: {
										[`${datasetId}_dept`]: "acam"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "afst"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "amne"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "anth"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "arbc"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "arbm"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "arcl"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "arth"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "asia"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "asl"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "astu"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "cdst"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "chin"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "clst"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "cnto"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "csis"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "dani"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "engl"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "fipr"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "fmst"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "fren"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "hist"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "info"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "japn"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "korn"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "law"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "ling"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "mdia"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "phil"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "psyc"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "wrds"
									}
								},
								{
									IS: {
										[`${datasetId}_dept`]: "span"
									}
								}
							]
						},
						{
							OR: [
								{
									IS: {
										[`${datasetId}_id`]: "2*"
									}
								},
								{
									IS: {
										[`${datasetId}_id`]: "1*"
									}
								}
							]
						}
					]
				},
				OPTIONS: {
					COLUMNS: [
						[`${datasetId}_dept`].toString(),
						[`${datasetId}_id`].toString(),
						"overallAvg"
					]
				},
				TRANSFORMATIONS: {
					GROUP: [
						[`${datasetId}_id`].toString(),
						[`${datasetId}_dept`].toString()
					],
					APPLY: [
						{
							overallAvg: {
								AVG: [`${datasetId}_avg`].toString()
							}
						}
					]
				}
			}


			const url = `http://localhost:4321/query`;
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(query)
			});

			const data = await response.json();
			if (data.result.length === 0) {
				setShowPopup(true);
				setFeedback('');
				setResult(null);
			} else {
				setShowPopup(false);
				setFeedback('Query successful.');
				// Add a new field that concatenates id_dept and id_id
				const resultWithConcatenatedField = data.result.map(item => ({
					...item,
					id_dept_id: `${item[`${datasetId}_dept`]} ${item[`${datasetId}_id`]}`
				}));
				setResult(resultWithConcatenatedField);
				console.log(resultWithConcatenatedField);
			}

		} catch (error) {
			setFeedback('Error processing query.');
			setResult(null);
		}
	};

	const customizePoint = useCallback((arg) => {
		return arg.value > highAverage ? { color: '#f17746', hoverStyle: { color: '#f17746' } } : null;
	}, [highAverage]);

	const customizeLabel = useCallback((arg) => {
		return arg.value > highAverage ? { visible: true, backgroundColor: '#f17746' } : null;
	}, [highAverage]);

	const PopupWindow = ({ message, onClose }) => (
		<div className="popup-window">
			<div className="popup-content">
				<p>{message}</p>
				<button onClick={onClose}>Close</button>
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
				<button type="submit" className="submit-button" style={{marginLeft: '10px', width: '150px'}}>Art Course Advising
				</button>
				{feedback && <p style={{marginLeft: '10px'}}>{feedback}</p>}
			</form>
			{result && (
				<div>
					<h2>Lower-level Arts Courses with High Average Grade</h2>
					<Chart
						id="chart"
						dataSource={result}
						customizePoint={customizePoint}
						customizeLabel={customizeLabel}
						style={{width: '900px'}}
					>
						<Series
							valueField="overallAvg"
							argumentField= "id_dept_id"
							name="Overall Average"
							type="bar"
							color="#4caf50"
						/>
						<ValueAxis maxValueMargin={0.01}>
							<VisualRange startValue={50}/>
							<Label customizeText={customizeText}/>
							<ConstantLine
								width={2}
								value={highAverage}
								color="#f17746"
								dashStyle="dash"
							>
								<Label text="High Average"/>
							</ConstantLine>
						</ValueAxis>
						<Legend visible={true}/>
						<Export enabled={true}/>
					</Chart>
				</div>
			)}
			{noResult && (
				<PopupWindow
					message="No result found."
					onClose={() => setShowPopup(false)}
				/>
			)}
		</div>
	);
}

export default UserStoryArt;
