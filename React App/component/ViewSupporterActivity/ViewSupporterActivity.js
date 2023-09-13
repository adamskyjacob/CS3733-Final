import axios from 'axios';
import React from 'react';
import {Link} from "react-router-dom";
import {get} from '../../App';
import {ADD_FUNDS, GET_SUPPORTER_FUNDS} from '../../controller/APIResources';
import './view-supporter-activity.css'

function ViewSupporterActivity() {
    //Hooks for variable values
    let [funds, setFunds] = React.useState("");
    let [addFunds, setAddFunds] = React.useState("");

    const updateAddFunds = e => { setAddFunds(e.target.value); }

    /**
     * Adds funds to this supporter's account
     */
    const addSupporterFunds = () => {
        axios.post(ADD_FUNDS, {"supporterEmail": get("currUserEmail"), "funds": addFunds}).then(r => {
            console.log(r);
            setFunds(JSON.parse(r.data.body)["newFunds"]);
        });
    }

    //Get supporter funds into hook
    axios.post(GET_SUPPORTER_FUNDS, {"email": get("currUserEmail")}).then(r => {
        setFunds(JSON.parse(r.data.body)["funds"].toFixed(2) + "");
    });
    
    //Paint component
    return (
        <>
            <div className="sidebarVSA">
                <h2>&nbsp;</h2>
                <h1>Hi, {get("currUserName")}! Here's your dashboard info:</h1>
                <h2>Account funds</h2>
                <p className="info"><b>Current Funds: $</b>{funds}</p>
                <p className="info"><b>Add Funds: </b><input type="text" placeholder="0.00" onChange={e => updateAddFunds(e)}></input></p>
                <button onClick={e => addSupporterFunds()}>Confirm Add Funds</button>
                <p>&nbsp;</p>
                <h2>Search</h2>
                <Link to="/search"><button>Go to search</button></Link>
            </div>
            <div className="topbar">
                <b>PPPP.</b>
            </div>
        </>
    );
}
export default ViewSupporterActivity;
