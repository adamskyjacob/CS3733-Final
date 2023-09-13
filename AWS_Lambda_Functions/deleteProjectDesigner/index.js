var mysql = require('/opt/node_modules/mysql');
var config = require('/opt/nodejs/config.json');

let response;
let status;
let body = {};
let launched = false;

var con = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: 3306,
    database: 'PPAppSchema'
});

exports.handler = async (event) => {
    try {
        let getProject = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Projects WHERE name=? and designerEmail=?", [value.projectName, value.email], (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows.length > 0) {
                        status = 200;
                        launched = (rows[0].launched == 1);
                        return resolve(rows);
                    }
                    else {
                        status = 400;
                        return reject("GetProjectFailure");
                    }
                });
            });
        };
        let deleteProjectPledges = (value) => {
            return new Promise((resolve, reject) => {
                con.query("DELETE FROM Pledges WHERE project=?", [value.projectName], (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows) {
                        status = 200;
                        return resolve(rows);
                    }
                    else {
                        return reject("DeletePledgeFailure");
                    }
                });
            });
        };

        let deleteThisProject = (value) => {
            return new Promise((resolve, reject) => {
                con.query("DELETE FROM Projects WHERE name=? AND designerEmail=?", [value.projectName, value.email], (error, rows) => {
                    if (error) { return reject(error); }
                    if ((rows)) {
                        status = 200;
                        return resolve(rows);
                    }
                    else {
                        return reject("DeleteProjectFailure");
                    }
                });
            });
        };
        await getProject(event);
        if (!launched) {
            await deleteThisProject(event);
            await deleteProjectPledges(event);
        }
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
