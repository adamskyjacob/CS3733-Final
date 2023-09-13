var mysql = require('/opt/node_modules/mysql');
var config = require('/opt/nodejs/config.json');

let response;
let status;
let body = {};

var con = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: 3306,
    database: 'PPAppSchema'
});

exports.handler = async (event) => {
    try {
        let isClaimed = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM PledgesClaimed WHERE pledgeid=?", value.pledgeid, (error, rows) => {
                    if (error) { return reject(error); } 
                    body = rows;
                    return resolve(rows);
                });
            });
        };
        await isClaimed(event);
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
