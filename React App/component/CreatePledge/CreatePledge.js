import {Link} from "react-router-dom";
import { CREATE_PLEDGE } from '../../controller/APIResources';
import React from 'react';
import './create-pledge.css'
import {get} from "../../App";
import axios from "axios"

function CreatePledge() {
    //Hooks
    let [dollarAmount, setDollarAmount] = React.useState("");
    let [reward, setReward] = React.useState("");
    let [maxSupporters, setMaxSupporters] = React.useState("");

    //Lambdas for each hook
    const updateDollarAmount = e => { setDollarAmount(e.target.value); }
    const updateReward = e => { setReward(e.target.value); }
    const updateMaxSupporters = e => { setMaxSupporters(e.target.value); }

    /**
     * Sends a request to create the project from what is entered in the fields
     */
    const createPledge = () => {
        axios.post(CREATE_PLEDGE, {
            "reward": reward,
            "dollarAmount": dollarAmount,
            "maxSupporters": maxSupporters,
            "parentProject": get("currProject"),
        });
    }

    /**
     * Resets the global hooks in case the user tries to cancel
     */
    const resetVals = () => {
        setDollarAmount("");
        setReward("");
        setMaxSupporters("");
    }

    return (
        <>
            <div className="projectName">
                <h2>{get("currProject")}</h2>
            </div>
        
            <div className="pledge">
                <h3>Create Pledge</h3>
                <p className="p">Set Dollar Amount: 
                    <input type="number" placeholder="0.00" name="amt" onChange={e => updateDollarAmount(e)}></input>
                </p>
                <p className="p">Set Optional Reward: 
                    <input type="text" name="optReward" onChange={e => updateReward(e)}></input>
                </p>
                <p className="p">Set Max Supporters (set to 0 if there is no maximum):
                    <input type="text" name="maxSupp" onChange={e => updateMaxSupporters(e)}></input>
                </p>
                <Link to="/view-project"><button onClick={e => createPledge()}>Create Pledge</button></Link>
            </div>

            <div className="topbar">
                <b>PPPP.</b>
                <Link to={get("dashboard")}><button onClick={e => resetVals()}>My Dashboard</button></Link>
            </div>
        </>
    );
}
export default CreatePledge;