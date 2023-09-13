import {Link} from "react-router-dom";
import React from 'react';
import axios from 'axios';
import './list-projects-designer.css'
import {get, set} from "../../App";
import {LIST_PROJECTS_DESIGNER} from "../../controller/APIResources";

function ListProjectsDesigner() {
    //Projects hook
    let [projects, setProjects] = React.useState("");

    /**
     * Returns an array of HTML elements for buttons given an array of their names
     * @param {*} buttons an array of String names for the buttons
     * @returns the mapped array of HTML elements
     */
    const generateButtons = buttons => {
        return (projects === "") ? null : (buttons.map(button => 
            <li key={button}><Link to="/view-project"><button onClick={e => set("currProject", button)}>{button}</button></Link></li>
        ));
    }

    //Get all project info
    axios.post(LIST_PROJECTS_DESIGNER, {"email": get("currUserEmail")}).then(r => {
        let projects = JSON.parse(r.data.body)["projects"].map(project => project.name);
        let str = "";
        for (let p of projects) {
            str += (p + "\t");
        }
        setProjects((str === "") ? "" : str.substring(0, str.length - 1));
    });
    
    return (
        <>
            <div className="welcome">
                <b>Welcome back {get("currUserName")}! Here are your current projects:</b>
            </div>
            <ul>{generateButtons(projects.split("\t"))}</ul>
            <div className="topbar">
                <b>PPPP.</b>
                <Link to="/create-project"><button>Create Project</button></Link>
            </div>
        </>
    );
}
export default ListProjectsDesigner;