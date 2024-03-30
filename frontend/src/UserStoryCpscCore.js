import React, { useCallback, useState } from 'react';
import { Chart, ConstantLine, Export, Label, Legend, Series, ValueAxis, VisualRange } from 'devextreme-react/chart';

function UserStoryCpscCore() {
	const [id, setId] = useState('');
	const [feedback, setFeedback] = useState('');
	const [result, setResult] = useState(null);
	const [noResult, setShowPopup] = useState(false);
	const highAverage = 80;

	const customizeText = useCallback((arg) => `${arg.valueText}`, []);


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
				setResult(data.result);
			}

		} catch (error) {
			setFeedback('Error processing query.');
			setResult(null);
		}
	};

	const customizePoint = useCallback((arg) => {
		return arg.value > highAverage ? { color: '#f17746', hoverStyle: { color: '#f17746' } } : {color: '#4caf50', hoverStyle: { color: '#4caf50' }}
	}, [highAverage]);


	const customizeLabel = useCallback((arg) => {
		return arg.value > highAverage ? { visible: true, backgroundColor: '#f17746' } :  {visible: true, backgroundColor: '#4caf50'}
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
				<button type="submit" className="submit-button" style={{marginLeft: '10px', width: '200px'}}> CPSC Core Course Advising
				</button>
				{feedback && <p style={{marginLeft: '10px'}}>{feedback}</p>}
			</form>
			{result && (
				<div>
					<h2>Overall Average of CPSC 4 Level Courses</h2>
					<Chart
						id="chart"
						dataSource={result}
						customizePoint={customizePoint}
						customizeLabel={customizeLabel}
						style={{width: '900px'}}
					>
						<Series
							valueField="overallAvg"
							argumentField={`${id}_instructor`}
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

export default UserStoryCpscCore;
