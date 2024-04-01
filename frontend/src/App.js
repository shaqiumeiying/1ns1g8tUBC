import React from 'react';
// import { Chart, Series } from 'devextreme-react/chart';
import Sidebar from "./Sidebar";
import DatasetForm from "./DatasetForm";
import UserStory4level from "./UserStory4level";
import UserStoryArt from "./UserStoryArt";
import UserStoryCpscCore from "./UserStoryCpscCore";
import './App.css';

function App() {
	return (
		<div className="App">
			<div className="app-container">
				<Sidebar />
				<div className="content">
					<DatasetForm/>
					<hr/>
					<div className="title">
						<h2>Insight Showcases</h2>
					</div>
					<UserStory4level/>
					<UserStoryArt/>
					<UserStoryCpscCore/>
					<hr/>
				</div>
			</div>
		</div>
	);
}

export default App;
