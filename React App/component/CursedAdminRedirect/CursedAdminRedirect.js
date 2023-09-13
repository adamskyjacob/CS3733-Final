import {Link} from "react-router-dom";
import {get} from "../../App";
import './cursed-admin-redirect.css'

function CursedAdminRedirect() {
    return (
        <>
            <div className="message">
                <h3>Hi.</h3>
                <h3>This is definitely a feature, not a bug.</h3>
                <h3>Just click this button to go back to the admin page with the updated projects :)</h3>
                <Link to={get("dashboard")}><button className="button">😬</button></Link>
            </div>

            <div className="topbar">
                <b>PPPP.</b>
            </div>
        </>
    );
}
export default CursedAdminRedirect;