import React, { useCallback, useState } from 'react';
import { Chart, ConstantLine, Export, Label, Legend, Series, ValueAxis, VisualRange } from 'devextreme-react/chart';

function UserStory4level() {
	const [id, setId] = useState('');
	const [feedback, setFeedback] = useState('');
	const [result, setResult] = useState(null);
	const [noResult, setShowPopup] = useState(false);
	const highAverage = 80;

	const customizeText = useCallback((arg) => `${arg.valueText}`, []);

	const handleQuery = async (event) => {
		event.preventDefault();

		if (!id) {
			setFeedback('ID cannot be empty.');
			return;
		}

		try {
			const query = {
				WHERE: {
					AND: [
						{
							IS: {
								[`${id}_dept`]: "cpsc"
							}
						},
						{
							IS: {
								[`${id}_id`]: "4*"
							}
						},
						{
							NOT: {
								EQ: {
									[`${id}_year`]: 1900
								}
							}
						}
					]
				},
				OPTIONS: {
					COLUMNS: [
						[`${id}_dept`].toString(),
						[`${id}_id`].toString(),
						"overallAvg"
					]
				},
				TRANSFORMATIONS: {
					GROUP: [
						[`${id}_dept`].toString(),
						[`${id}_id`].toString()
					],
					APPLY: [
						{
							overallAvg: {
								AVG: [`${id}_avg`].toString()
							}
						}
					]
				}
			}

			// const query = {
			// 	WHERE: {
			// 		AND: [
			// 			{
			// 				IS: {
			// 					sections_dept: "cpsc"
			// 				}
			// 			},
			// 			{
			// 				IS: {
			// 					sections_id: "4*"
			// 				}
			// 			},
			// 			{
			// 				NOT: {
			// 					EQ: {
			// 						sections_year: 1900
			// 					}
			// 				}
			// 			}
			// 		]
			// 	},
			// 	OPTIONS: {
			// 		COLUMNS: [
			// 			"sections_dept",
			// 			"sections_id",
			// 			"overallAvg"
			// 		]
			// 	},
			// 	TRANSFORMATIONS: {
			// 		GROUP: [
			// 			"sections_dept",
			// 			"sections_id"
			// 		],
			// 			APPLY: [
			// 			{
			// 				overallAvg: {
			// 					AVG: "sections_avg"
			// 				}
			// 			}
			// 		]
			// 	}
			// }


			const url = `http://localhost:4321/query`;
			console.log(id);
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
					console.log(result);
				} else {
					setShowPopup(false);
					setFeedback('Query successful.');
					setResult(data.result);
					console.log(typeof result);
					console.log(result);
				}

		} catch (error) {
			setFeedback('Error processing query.');
			setResult(null);
			console.log("query not ok");
		}

		setId('');
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
			<form onSubmit={handleQuery} style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
				<input
					type="text"
					className="input-text custom-input"
					value={id}
					onChange={(e) => setId(e.target.value)}
					placeholder="ID"
					required
				/>
				<button type="submit" className="submit-button" style={{ marginLeft: '10px', width: '80px' }}>Generate</button>
				{feedback && <p style={{ marginLeft: '10px' }}>{feedback}</p>}
			</form>
			{result && (
				<div>
					<h2>Overall Average of CPSC 4 Level Courses</h2>
					<Chart
						id="chart"
						dataSource={result}
						customizePoint={customizePoint}
						customizeLabel={customizeLabel}
						style={{ width: '900px' }}
					>
						<Series
							valueField="overallAvg"
							argumentField={`${id}_id`}
							name="Overall Average"
							type="bar"
							color="#4caf50"
						/>
						<ValueAxis maxValueMargin={0.01}>
							<VisualRange startValue={50} />
							<Label customizeText={customizeText} />
							<ConstantLine
								width={2}
								value={highAverage}
								color="#f17746"
								dashStyle="dash"
							>
								<Label text="High Average" />
							</ConstantLine>
						</ValueAxis>
						<Legend visible={true} />
						<Export enabled={true} />
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

export default UserStory4level;
