import {BrowserRouter, Routes, Route} from "react-router-dom";
import Login from "./component/Login/Login";
import ListProjectsDesigner from "./component/ListProjectsDesigner/ListProjectsDesigner";
import ListProjectsAdmin from "./component/ListProjectsAdmin/ListProjectsAdmin"
import CreateProject from "./component/CreateProject/CreateProject"
import CreatePledge from "./component/CreatePledge/CreatePledge"
import Search from "./component/Search/Search"
import ViewSupporterActivity from "./component/ViewSupporterActivity/ViewSupporterActivity"
import ViewProject from "./component/ViewProject/ViewProject"
import ViewPledge from "./component/ViewPledge/ViewPledge";
import CursedAdminRedirect from "./component/CursedAdminRedirect/CursedAdminRedirect";

//For utility's sake
export const set = (key, value) => window.sessionStorage.setItem(key, value);
export const get = (key) => window.sessionStorage.getItem(key);

//Start app
export default function App() {
	//Clear session storage for this browser
    set("userType", "");
    set("dashboard", "");
    set("currUserName", "");
    set("currUserEmail", "");
    set("currProject", "");
    set("currPledge", "");
	
	//Set up routing for the entire app
	return (
		<BrowserRouter>
			<Routes>
				<Route exact path='/' element={<Login/>}></Route>
				<Route exact path ='/view-supporter-activity' element={<ViewSupporterActivity/>}></Route>
				<Route exact path='/create-project' element={<CreateProject/>}></Route>
				<Route exact path='/list-projects-designer' element={<ListProjectsDesigner/>}></Route>
				<Route exact path='/list-projects-admin' element={<ListProjectsAdmin/>}></Route>
				<Route exact path='/create-pledge' element={<CreatePledge/>}></Route>
				<Route exact path='/search' element={<Search/>}></Route>
				<Route exact path='/view-supporter-activity' element={<ViewSupporterActivity/>}></Route>
				<Route exact path='/view-pledge' element={<ViewPledge/>}></Route>
				<Route exact path='/view-project' element={<ViewProject/>}></Route>
				<Route exact path='/cursed-admin-redirect' element={<CursedAdminRedirect/>}></Route>
			</Routes>
		</BrowserRouter>
	);
}