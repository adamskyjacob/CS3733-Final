import {Link} from "react-router-dom";
import React from 'react';
import './list-projects-admin.css'
import {get, set} from "../../App";
import axios from "axios";
import {Navigate} from "react-router-dom";
import {LIST_PROJECTS_ADMIN, REAP_PROJECTS_ADMIN} from "../../controller/APIResources";

function ListProjectsAdmin() {
    //Hook for all projects
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
    
    /**
     * Sends an API request to reap all projects past their deadlines. 
    */
    const reapProjects = () => {
        axios.post(REAP_PROJECTS_ADMIN, {});
        //TODO figure out how to update projects dynamically
    }

    //Get all project info on the website and display it for the admin
    axios.post(LIST_PROJECTS_ADMIN, {"email": get("currUserEmail")}).then(r => {
        let projects = JSON.parse(r.data.body)["projects"].map(project => project.name);
        let str = "";
        for (let p of projects) {
            str += (p + " ");
        }
        setProjects((str === "") ? "" : str.substring(0, str.length - 1));
    });
    
    //Paint component
    return (
        <>
            <h2 className="dashboardLabel">Hello, Superior Admin. You may now wreak havoc on the website.</h2>
            <h3 className="dashboardLabel"><u></u></h3>
            <div className="lists">
                <Link to="/cursed-admin-redirect">
                    <button onClick={e => reapProjects()}>Reap projects</button>
                </Link>
                <section>
                    <nav>
                        <h4><u>All Projects:</u></h4>
                        <ul>{generateButtons(projects.split(" "))}</ul>
                    </nav>
                </section>
            </div>

            <div className="topbar">
                <b>PPPP. </b>
            </div>
        </>
    );
}
export default ListProjectsAdmin;