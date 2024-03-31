import React from 'react';
// import { Chart, Series } from 'devextreme-react/chart';
import Sidebar from "./Sidebar";
import DatasetForm from "./DatasetForm";
import UserStory4level from "./UserStory4level";
import UserStoryArt from "./UserStoryArt";
import UserStoryCpscCore from "./UserStoryCpscCore";

function App() {
	return (
		<div className="app-container">
			<Sidebar />
			<div className="content">
				<DatasetForm/>
				<hr/>
				<UserStory4level/>
				<UserStoryArt/>
				<UserStoryCpscCore/>
				<hr/>
			</div>
		</div>
	);
}

export default App;
