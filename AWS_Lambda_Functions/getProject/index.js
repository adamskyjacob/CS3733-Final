var mysql = require('/opt/node_modules/mysql');
var config = require('/opt/nodejs/config.json');

let response;

var con = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: 3306,
    database: 'PPAppSchema'
});
exports.handler = async (event) => {
    let status;
    let body = {};
    try {
        let getThisProject = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Projects WHERE name=?", value.name, (error, rows) => {
                    if (error) { return reject(error); }
                    if ((rows)) {
                        body["project"] = rows[0];
                        status = 200;
                        return resolve(rows);
                    }
                    else {
                        return reject("GetProjectFailure");
                    }
                });
            });
        };
        
        let getPledges = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Pledges WHERE project=?", value.name, (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows) {
                        //Extremely cringe
                        let ids = rows.map(row => row["uniqueid"]);
                        let output = "";
                        for (let i = 0; i < ids.length; i++) {
                            output += (ids[i] + " ");
                        }
                        
                        body["pledges"] = output.substring(0, output.length - 1);
                        status = 200;
                        return resolve(rows);
                    }
                });
            });
        };
        
        let getDirectSupporters = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM DirectSupport WHERE project=?", [value.name], (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows) {
                        //Return as a string separated by newlines
                        let ids = rows.map(row => row["email"]);
                        let output = "";
                        for (let i = 0; i < ids.length; i++) {
                            output += (ids[i] + "\n");
                        }
                        
                        body["directSupporters"] = output.substring(0, output.length - 1);
                        status = 200;
                        return resolve(rows);
                    }
                });
            });
        };
        
        await getThisProject(event);
        await getPledges(event);
        await getDirectSupporters(event);
    }
    catch (err) {
        status = 400;
        console.log(err);
        body["error"] = err.toString();
    }

    response = {
        'statusCode': status,
        'body': JSON.stringify(body)
    };
    return response;
};
