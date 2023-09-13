import axios from 'axios';
import React from 'react';
import {Link} from "react-router-dom";
import {get,} from '../../App';
import { CREATE_PROJECT } from '../../controller/APIResources';
import './create-project.css'

function CreateProject() {
    //Hooks for the necessary fields
    let [name, setName] = React.useState("");
    let [story, setStory] = React.useState("");
    let [deadline, setDeadline] = React.useState("");
    let [goal, setGoal] = React.useState("");
    let [creationText1, setCreationText1] = React.useState("");
    let [creationText2, setCreationText2] = React.useState("");

    //Set lambdas
    const updateName = e => { setName(e.target.value); }
    const updateStory = e => { setStory(e.target.value); }
    const updateDeadline = e => { setDeadline(e.target.value); }
    const updateGoal = e => {
        if (!isNaN(+e.target.value)) {
            setGoal(e.target.value);
        }
    }

    /**
     * Sends a request to create the project from what is entered in the fields
     */
    const createProject = () => {
        setCreateText();
        let payload = {
            "name": name,
            "story": story,
            "designerName": get("currUserName"),
            "type": document.getElementById("category").value,
            "deadline": deadline,
            "goal": goal,
            "designerEmail": get("currUserEmail"),
        }
        axios.post(CREATE_PROJECT, payload);
    }

    /**
     * Resets the global hooks in case the user tries to cancel
     */
    const resetVals = () => {
        setName("");
        setStory("");
        setDeadline("");
        setGoal("");
        setCreationText1("");
        setCreationText2("");
    }

    const setCreateText = () => {
        setCreationText1("Project has been created!");
        setCreationText2("Use dashboard to return.");
    }

    return (
        <>
            <div className="projectname">
                <b className="label">Project Name:  </b>
                <input type="text" name="projectName" onChange={e => updateName(e)}></input>
            </div>

            <div className="vl"></div>

            <div className="sidebarCP">
                <strong>Set Project Deadline:</strong>
                <input type="date" name="projectDeadline" onChange={e => updateDeadline(e)}></input>
                <p></p>
                <strong>Goal: $</strong>
                <input type="text" placeholder="00.00" name="goal" min="0.01" step ="0.01" max="100000"
                    value={goal} onChange={e => updateGoal(e)}></input>
                <p></p>
                <strong>Category:</strong>
                <select name="category" id="category">
                    <option name="Music" value="Music">Music</option>
                    <option name="Film" value="Film">Film</option>
                    <option name="Game" value="Game">Game</option>
                </select>
                <p>&nbsp;</p><p>&nbsp;</p>
                <button onClick={e => createProject()}>Create Project</button>
                <p>&nbsp;</p><p>&nbsp;</p>
                <strong>{creationText1}</strong>
                <p>&nbsp;</p>
                <strong>{creationText2}</strong>
            </div>
        
            <div className="descriptionCP">
                <textarea onChange={e => updateStory(e)} name="description" placeholder="Project Story..." rows="20" col="100"></textarea>
            </div>

            <div className="topbar">
                <b>PPPP.</b>
                <Link to={get("dashboard")}><button onClick={e => resetVals()}>Dashboard</button></Link>
            </div>
        </>
    );
}
export default CreateProject;