import React from 'react';
import axios from "axios";
import {Link} from "react-router-dom";
import {get, set} from '../../App';
import {CLAIM_PLEDGE_SUPP, DELETE_PLEDGE, GET_PROJECT, IS_PLEDGE_CLAIMED, VIEW_PLEDGE_SUPP} from "../../controller/APIResources";
import './view-pledge.css'
import { isPastDeadline } from '../ViewProject/ViewProject';

function ViewPledge() {
    //Attribute hooks
    let [ID, setID] = React.useState(0);
    let [project, setProject] = React.useState("");
    let [reward, setReward] = React.useState("");
    let [dollarAmount, setDollarAmount] = React.useState(0);
    let [numSupporters, setNumSupporters] = React.useState(0);
    let [maxSupporters, setMaxSupporters] = React.useState(0);
    let [claimText, setClaimText] = React.useState(""); //Text to SUPPORTER of pledge claim status after button click
    let [claimedTextDesigner, setClaimedTextDesigner] = React.useState(""); //Text to DESIGNER about who has claimed their pledge
    let [pledgeClaimable, setPledgeClaimable] = React.useState(false);

    /**
     * Deletes a pledge and resets session info
     * @param {String} pledge the pledge to delete
     */
    const deletePledge = () => {
        axios.post(DELETE_PLEDGE, {"pledgeid": get("currPledge"), "project": get("currProject")});
        set("currPledge", "");
        setClaimText("Pledge has been deleted. Go back using Back To Project or My Dashboard.")
    }

    /**
     * Claims a pledge
     */
    const claimPledge = () => {
        axios.post(CLAIM_PLEDGE_SUPP, {"pledgeid": get("currPledge"), "supporterEmail": get("currUserEmail")}).then(r => {
            if (JSON.parse(r.data.statusCode) === 200) {
                setClaimText("Pledge has been claimed! Go back using Back To Project or My Dashboard.");
            } else {
                setClaimText(JSON.parse(r.data.body)["err"]);
            }
        });
    }

    //Get all pledges for this project
    axios.post(VIEW_PLEDGE_SUPP, {"pledgeid": get("currPledge")}).then(r => {
        let pledge = JSON.parse(r.data.body)["pledge"];
        setID(pledge.uniqueid);
        setProject(pledge.project);
        setReward(pledge.reward);
        setDollarAmount(pledge.dollarAmount);
        setNumSupporters(pledge.numSupporters);
        setMaxSupporters(pledge.maxSupporters);
    });

    //Check if this pledge was claimed by this user
    axios.post(IS_PLEDGE_CLAIMED, {"pledgeid": get("currPledge")}).then(r => {
        let claimers = JSON.parse(r.data.body).map(obj => obj.supporterEmail);
        let claimersStr = "";
        for (let i = 0; i < claimers.length; i++) {
            claimersStr += (claimers[i] + (claimers.length > 2 ? ", " : " ") + (i == (claimers.length - 2) ? "and " : ""));
        }
        claimersStr = claimersStr.substring(0, claimersStr.length - (claimers.length > 2 ? 2 : 1));
        setClaimedTextDesigner((claimersStr !== "" ? "Claimed by supporter(s) " : "") + claimersStr);
    });
    
    //Is this pledge claimable (is the project under its goal)?
    axios.post(GET_PROJECT, {"name": get("currProject")}).then(r => {
        let project = JSON.parse(r.data.body)["project"];
        setPledgeClaimable(project.funding < project.goal);
        setPledgeClaimable(!isPastDeadline(project.deadline));
    });

    //Paint component
    return (
        <>
            <div className="body">
                <h1><u>{project}</u></h1>
                <div>
                    <p className="value"><b>Pledge ID: </b>{ID}</p>
                    <p className="value"><b>Dollar Amount: </b>${dollarAmount.toFixed(2)}</p>
                    <p className="value"><b>Num Supporters / Max Supporters: </b>{numSupporters}/{maxSupporters + (maxSupporters === 0 ? " (no max)" : "")}</p>
                    <p className="value"><b>Reward: </b>{reward}</p>
                    {(get("userType") === "designer") && <p className="value"><b>{claimedTextDesigner}</b></p>}
                    {(get("userType") !== "supporter") && <button onClick={e => deletePledge()}>Delete Pledge</button>}
                    {(get("userType") === "supporter") && pledgeClaimable &&
                        <button onClick={e => claimPledge()}>Claim Pledge</button>
                    }
                    <p className="value">&nbsp;</p>
                    <p className="value">{claimText}</p>
                </div>
            </div>
            <div className="topbar">
                <b>PPPP.</b>
                <Link to={"/view-project"}><button>Back To Project</button></Link>
                <Link to={get("dashboard")}><button>My Dashboard</button></Link>
            </div>
        </>
    );
}
export default ViewPledge;