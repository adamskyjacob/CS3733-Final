import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { get, set } from "../../App";
import { SEARCH_PROJECTS_SUPP } from "../../controller/APIResources";
import './search.css'

function Search() {
    //Hooks
    let [results, setResults] = React.useState(null);
    let [substring, setSubstring] = React.useState("");

    const updateSubstring = e => setSubstring(e.target.value);

    /** 
     * Renders search results for a particular category and a substring of the project name or story
     * and returns all HTML elements for each project's button
     * @param {String} category the category which to search
     */
    const renderSearchResults = category => {
        axios.post(SEARCH_PROJECTS_SUPP, { "type": category, "substring": substring.trim() }).then(r => {
            let projectNames = JSON.parse(r.data.body)["projects"].map(project => project.name);

            //Kind of cringe 3am solution bc react is mean
            if (projectNames.length > 0) {
                let output = "";
                for (let n in projectNames) {
                    output += (projectNames[n] + "\t");
                }

                //Convert to array of HTML elements
                let resultsStr = output.substring(0, output.length - 1).split("\t");
                setResults(resultsStr.map(result =>
                    <p key={result}><Link to="/view-project"><button onClick={e => set("currProject", result)}>{result}</button></Link></p>
                ));
            } else {
                setResults(null);
            }
        });
    }

    //Paint component
    return (
        <>
            <div className="search">
                <h3><u>Filter Search By:</u></h3>
                <p className="text">Category:
                    <select id="category">
                        <option name="None" value="None">None Selected</option>
                        <option name="Game" value="Game">Game</option>
                        <option name="Music" value="Music">Music</option>
                        <option name="Film" value="Film">Film</option>
                    </select>
                </p>
                <p className="text">Key Word:
                    <input onChange={e => updateSubstring(e)}></input>
                </p>
                <button onClick={e => renderSearchResults(document.getElementById("category").value)}>Search</button>
                <Link to={get("dashboard")}><button>My Dashboard</button></Link>
                {(results !== null) &&
                    <div className="results">
                        <h3><u>Results:</u></h3>
                        {results}
                    </div>
                }
            </div>
            <div className="topbar">
                <b> People Powering People's Projects. Period.</b>
            </div>

        </>
    );
}
export default Search;