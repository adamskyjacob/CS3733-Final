import React from 'react';
import axios from 'axios';
import {Navigate} from "react-router-dom";
import {LOGIN_USER, REGISTER_DESIGNER, REGISTER_SUPPORTER} from '../../controller/APIResources';
import {set} from '../../App';
import './login.css'

function Login() {
    //I hate doing this but react likes this
    const [registerName, setRegisterName] = React.useState("");
    const [registerEmail, setRegisterEmail] = React.useState("");
    const [registerPassword, setRegisterPassword] = React.useState("");
    const [loginEmail, setLoginEmail] = React.useState("");
    const [loginPassword, setLoginPassword] = React.useState("");
    const [registerError, setRegisterError] = React.useState("");
    const [loginError, setLoginError] = React.useState("");
    const [userToLogin, setUserToLogin] = React.useState("");

    //Text field lambdas
    const updateRegisterName = e => { setRegisterName(e.target.value); }
    const updateRegisterEmail = e => { setRegisterEmail(e.target.value); }
    const updateRegisterPassword = e => { setRegisterPassword(e.target.value); }
    const updateLoginEmail = e => { setLoginEmail(e.target.value); }
    const updateLoginPassword = e => { setLoginPassword(e.target.value); }

    /**
     * Determines the dashboard route location depending on the type of user
     * @param {String} userType designer, supporter, or admin
     * @returns the dashboard route for the specified user type
     */
    const getDashboardRoute = userType => {
        switch (userType) {
            case "designer": return "/list-projects-designer";
            case "supporter": return "/view-supporter-activity";
            case "admin": return "/list-projects-admin";
            default: return "/view-supporter-activity"; //Defaults to supporter
        }
    }
    
    /**
     * Registers either a designer or supporter using the name and email in the text boxes
     * @param {String} userType designer or supporter (admins cannot register)
     */
    const register = userType => {
        //Check that there's valid text in each field
        if (registerName.trim() === "" || registerEmail.trim() === "" || registerPassword.trim() === "") {
            setRegisterError("Enter a valid value for every field");
            return;
        }
        
        //All fields are entered
        let payload = JSON.stringify({
            "name": registerName,
            "email": registerEmail,
            "password": registerPassword
        });
        
        //Make request
        axios.post((userType === "supporter") ? REGISTER_SUPPORTER : REGISTER_DESIGNER, payload).then(response => {
            if (response.data.statusCode === 200) {
                //Validated, save session info and redirect
                setRegisterError("");
                set("userType", userType);
                set("dashboard", getDashboardRoute(userType));
                set("currUserName", registerName);
                set("currUserEmail", registerEmail);
                setUserToLogin(userType); //Will redirect
            } else {
                //Error
                setRegisterError("Error: " + response.data["error"]);
            }
        });
    }

    /**
     * Sends login information and verifies credentials
     * @param {String} userType designer, supporter, or admin
     */
    const login = userType => {
        //Check that there's valid text in each field
        if (loginEmail.trim() === "" || loginPassword.trim() === "") {
            setLoginError("Enter a valid value for every field");
            return;
        }
        
        //All fields are entered
        let payload = JSON.stringify({
            "type": userType,
            "email": loginEmail,
            "password": loginPassword,
        });
        
        axios.post(LOGIN_USER, payload).then(response => {
            if (response.data.statusCode === 200) {
                //Validated, save session info and redirect
                setLoginError("");
                set("userType", userType);
                set("dashboard", getDashboardRoute(userType));
                set("currUserName", JSON.parse(response.data.body)["name"]); //Lambda returns user's name
                set("currUserEmail", loginEmail);
                setUserToLogin(userType); //Will redirect
            } else {
                //Only possible error type as of now
                setLoginError("Invalid Credentials!");
            }
        });
    }

    //Paint component
    return (
        <>
            <div className="register">
                <h3><u>Register Account</u></h3>
                <a>Name: </a>
                <input type="text" name="registerName" onChange={e => updateRegisterName(e)}></input>
                <p></p>
                <a>Email: </a>
                <input type="email" name="registerEmail" onChange={e => updateRegisterEmail(e)}></input>
                <p></p>
                <a>Password: </a>
                <input type="password" name="registerPassword" onChange={e => updateRegisterPassword(e)}></input>
                <p></p>
                <button onClick={e => register("designer")}>Register as DESIGNER</button>
                <button onClick={e => register("supporter")}>Register as SUPPORTER</button>
                <p className="credentialsError">{registerError}</p>
            </div>

            <div className="login">
                <h3><u>Login</u></h3>
                <a>Email: </a>
                <input type="email" name="loginEmail" onChange={e => updateLoginEmail(e)}></input>
                <p></p>
                <a>Password: </a>
                <input type="password" name="loginPassword" onChange={e => updateLoginPassword(e)}></input>
                <p></p>
                <button onClick={e => login("designer")}>Login as DESIGNER</button>
                <button onClick={e => login("supporter")}>Login as SUPPORTER</button>
                <button onClick={e => login("admin")}>Login as ADMIN</button>
                <p className="credentialsError">{loginError}</p>
            </div>

            <div>
                {(userToLogin === "designer") && <Navigate to="/list-projects-designer"/>}
                {(userToLogin === "supporter") && <Navigate to="/view-supporter-activity"/>}
                {(userToLogin === "admin") && <Navigate to="/list-projects-admin"/>}
            </div>

            <div className="topbar">
                <b> People Powering People's Projects. Period.</b>
            </div>
        </>
    );
}
export default Login;