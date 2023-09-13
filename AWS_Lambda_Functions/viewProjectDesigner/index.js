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
        let getProjects = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Projects WHERE designerName=? AND name=?", [value.email, value.project], (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows) {
                        body["project"] = rows[0];
                        status = 200;
                        return resolve(rows);
                    }
                    else {
                        return reject("ViewProjectDesignerFailure");
                    }
                });
            });
        };
        await getProjects(event);
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
