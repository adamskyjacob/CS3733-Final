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
        let deletePledge = (value) => {
            return new Promise((resolve, reject) => {
                con.query("DELETE FROM Pledges WHERE uniqueid=? AND project=?", [value.pledgeid, value.project], (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows) {
                        status = 200 + value.pledgeid + " " + value.project;
                        return resolve(rows);
                    }
                    else {
                        return reject("DeletePledgeFailure");
                    }
                });
            });
        };
        await deletePledge(event);
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
