import {Link} from "react-router-dom";
import React from 'react';
import './view-project.css'
import {get, set} from "../../App";
import axios from "axios";
import {DELETE_PROJECT_ADMIN, DELETE_PROJECT_DESIGNER, DIRECT_SUPPORT, GET_PROJECT, LAUNCH_PROJECT_DESIGNER, LIST_PLEDGES_PROJECT} from "../../controller/APIResources";

/**
 * Checks if today is past the given deadline
 * @param {String} d the deadline, given as a string formated YYYY-MM-DD
 */
export const isPastDeadline = d => {
    //Get the current date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; //Month is zero-based, so we need to add 1 to get the correct month
    const day = now.getDate();
  
    //Pad the month and day values with leading zeros if necessary
    const paddedMonth = month.toString().padStart(2, "0");
    const paddedDay = day.toString().padStart(2, "0");
  
    //Construct the date string in the format "YYYY-MM-DD"
    let todayDate = new Date(`${year}-${paddedMonth}-${paddedDay}`);

    //Construct the rest of the info
    let deadlineDate = new Date(d);
    deadlineDate.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);
    return deadlineDate.getTime() < todayDate.getTime();
}
  
function ViewProject() {
    //Project field hooks
    let [name, setName] = React.useState("");
    let [designerName, setDesignerName] = React.useState("");
    let [story, setStory] = React.useState("");
    let [type, setType] = React.useState("");
    let [goal, setGoal] = React.useState(0);
    let [numSupporters, setNumSupporters] = React.useState(0);
    let [launched, setLaunched] = React.useState(0);
    let [deadline, setDeadline] = React.useState("");
    let [pledges, setPledges] = React.useState(""); //Represented as a string w/ spaces since react doesn't like me
    let [reachedAmount, setReachedAmount] = React.useState(0);
    let [directSupportAmount, setDirectSupportAmount] = React.useState("");
    let [congratsMessage, setCongratsMessage] = React.useState("");
    let [directSupporterList, setDirectSupporterList] = React.useState("");

    //For displaying pledge info in the buttons
    // let [reward, setReward] = React.useState("");
    // let [dollarAmount, setDollarAmount] = React.useState(0);

    //Error text
    let [projectDeleteText, setProjectDeleteText] = React.useState("");
    let [directSupportText, setDirectSupportText] = React.useState("");

    /**
     * Launches the current project
     */
    const launchProject = () => {
        axios.post(LAUNCH_PROJECT_DESIGNER, {"project": get("currProject"), "email": get("currUserEmail")}).then(r => setLaunched(1));
    }

    /**
     * Deletes the current project and resets session info (only admin and designer)
     */
    const deleteProject = () => {
        axios.post((get("userType") === "admin") ? DELETE_PROJECT_ADMIN : DELETE_PROJECT_DESIGNER, 
            {"projectName": get("currProject"), "email": get("currUserEmail")});
        set("currProject", "");
        set("currPledge", "");
        setProjectDeleteText("Project has been deleted. Use My Dashboard to return.")
    }

    /**
     * Returns an array of HTML elements to render every pledge as a button that links to view-pledge and displays
     * the correct information
     */
    const renderPledges = pledgesArr => {
        //If there are no pledges
        if (pledges === "") {
            return <p className="value">None</p>;
        }

        return (pledgesArr.map(pledge => {
            //Gather button info to display in the button text
            // axios.post(VIEW_PLEDGE_SUPP, {"pledgeid": pledge}).then(r => {
            //     let pledgeInfo = JSON.parse(r.data.body)["pledge"];
            //     setReward(pledgeInfo.reward);
            //     setDollarAmount(pledgeInfo.dollarAmount);
            // });

            //Return HTML element for the button
            return <p key={pledge} className="value">
                <Link to="/view-pledge">
                    {/* <button onClick={e => set("currPledge", pledge)}>For ${dollarAmount.toFixed(2)}: {reward}</button> */}
                    <button onClick={e => set("currPledge", pledge)}>View pledge ID: {pledge}</button>
                </Link>
            </p>
        }));
    }

    const updateDirectSupportAmount = e => { setDirectSupportAmount(e.target.value); }

    /**
     * Directly supports this project with an amount of money
     */
    const directSupport = () => {
        axios.post(DIRECT_SUPPORT, {"email": get("currUserEmail"), "project": get("currProject"), "amount": directSupportAmount}).then(r => {
            if (JSON.parse(r.data.statusCode) === 200) {
                setDirectSupportText("");
                setReachedAmount(+JSON.parse(r.data.body)["newFunding"]);
                setCongratsMessage(reachedAmount < goal ? "" : "This project has reached its goal!");
            } else {
                setDirectSupportText("Error: " + JSON.parse(r.data.body)["error"]);
            }
        });
    }

    /**
     * Updates all fields of the project when called
     */
    const updateProjectInfo = () => {
        axios.post(GET_PROJECT, {"name": get("currProject")}).then(r => {
            //Get project info
            let project = JSON.parse(r.data.body)["project"];
            setName(project["name"]);
            setDesignerName(project["designerName"]);
            setStory(project["story"]);
            setType(project["type"]);
            setGoal(project["goal"]);
            setNumSupporters(parseInt(project["numSupporters"]));
            setLaunched(parseInt(project["launched"]));
            setDeadline(project["deadline"]);
            setReachedAmount(project["funding"]);
            setCongratsMessage(reachedAmount < goal ? "" : "This project has reached its goal!");
            setDirectSupporterList(JSON.parse(r.data.body)["directSupporters"]);
            
            //Get pledge info
            axios.post(LIST_PLEDGES_PROJECT, {"project": get("currProject")}).then(r => {
                setPledges(JSON.parse(r.data.body)["pledge"]);
            });
        });
    }
    console.log("calling update info");
    updateProjectInfo(); //Have one initial call to display initial info to screen

    //Paint component
    let uType = get("userType");
    return (
        <>
            <div className="info">
                <div className="descriptionVPD">
                    <h1><u>{name}</u></h1>
                    <h5>Created by {designerName}</h5>
                    <p className="story">{story}</p>
                    {uType === "designer" && <Link to={"/create-pledge"}><button>Create Pledge</button></Link>}
                    {uType !== "supporter" && (uType === "admin" || (uType === "designer" && !launched)) &&
                        <button onClick={e => deleteProject()}>Delete Project</button>
                    }
                    <p>&nbsp;</p>
                    <p className="story">{projectDeleteText}</p>
                    {uType === "supporter" && congratsMessage === "" && !isPastDeadline(deadline) &&
                        <div>
                            <input type="number" placeholder="0.00" onChange={e => updateDirectSupportAmount(e)}></input>
                            <button onClick={e => directSupport()}>Directly Support</button>
                            <p className="value">{directSupportText}</p>
                        </div>
                    }
                    <p className="story">{congratsMessage}</p>

                    <h3 className="label">Direct Supporters: </h3>
                    <p className="value" style={{whiteSpace: "pre-wrap"}}>
                        {(directSupporterList === "") ? "None" : directSupporterList}
                    </p>
                    {/* <button onClick={e => updateProjectInfo()}>Refresh list</button> */}
                </div>

                <div className="sidebarVPD">
                    <h3 className="label">Project Type: </h3>
                    <p className="value">{type}</p>

                    <h3 className="label">Status: </h3>
                    <p className="value">{!launched ? "Unl" : "L"}aunched</p>
                    {(!launched) && <button onClick={e => launchProject()}>Launch</button>}

                    <h3 className="label">Deadline: </h3>
                    <p className="value">{deadline}</p>

                    <h3 className="label">Number of Supporters: </h3>
                    <p className="value">{numSupporters}</p>

                    <h3 className="label">Pledges: </h3>
                    <div>{renderPledges(pledges.split(" "))}</div>
                    
                    <h3>Reached/Goal:</h3>
                    <p className="value"><b>${reachedAmount.toFixed(2)}</b> reached out of <b>${goal.toFixed(2)}</b></p>
                </div>
            </div>

            <div className="topbar">
                <b>PPPP.</b>
                <Link to={get("dashboard")}><button>My Dashboard</button></Link>
            </div>
        </>
    );
}
export default ViewProject;