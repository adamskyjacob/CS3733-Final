const Pledge = require('/opt/nodejs/Pledge');
var mysql = require('/opt/node_modules/mysql');
var config = require('/opt/nodejs/config.json');

let response;
let status;

var con = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: 3306,
    database: 'PPAppSchema'
});
con.connect(function(err) {
    if (err) console.log(err.toString());
    else console.log("Connected!");
});

exports.handler = async (event) => {
    try {
        let pledge = new Pledge(event.parentProject, event.dollarAmount, event.reward, event.maxSupporters);
        status = 200;
        let insertToTable = (value) => {
            return new Promise((resolve, reject) => {
                con.query("INSERT INTO Pledges (uniqueid, reward, dollarAmount, project, maxSupporters) VALUES (?, ?, ?, ?, ?)", [pledge.generateUniqueID(), value.reward, value.dollarAmount, value.parentProject, value.maxSupporters], (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows) {
                        return resolve(rows);
                    }
                    else {
                        return reject("CreatePledgeError");
                    }
                });
            });
        };
        let rows = await insertToTable(event);

        response = {
            'statusCode': status,
            'body': rows
        };
    }
    catch (err) {
        status = 400;
        response = {
            'statusCode': status,
            'error': err
        };
    }
    return response;
};
