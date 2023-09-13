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
        let getPledges = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Pledges WHERE project=?", value.project, (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows) {
                        let ids = rows.map(row => row["uniqueid"]);
                        let output = "";
                        for (let i = 0; i < ids.length; i++) {
                            output += (ids[i] + " ");
                        }
                        
                        body["pledge"] = output.substring(0, output.length - 1);
                        status = 200;
                        return resolve(rows);
                    }
                    else {
                        return reject("ListPledgesFailure");
                    }
                });
            });
        };
        await getPledges(event);
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
