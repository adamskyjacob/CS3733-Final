var mysql = require('/opt/node_modules/mysql');
var config = require('/opt/nodejs/config.json');

let response;
let funds = 0;
let status;

var con = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: 3306,
    database: 'PPAppSchema'
});

exports.handler = async (event) => {
    try {
        let setFunds = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Supporters WHERE email=?", value.supporterEmail, (error, rows) => {
                    if (error) {
                        status = 400;
                        return reject(error);
                    }
                    else if (rows.length > 0) {
                        status = 200;
                        funds = parseFloat(rows[0].funds);
                        return resolve(rows);
                    }
                    else {
                        return reject("SupporterNotFoundError");
                    }
                });
            });
        };
        let updateFunds = (value) => {
            return new Promise((resolve, reject) => {
                con.query("UPDATE Supporters SET funds=funds+? WHERE email=?", [parseFloat(value.funds), value.supporterEmail], (error, rows) => {
                    if (error) {
                        status = 400;
                        return reject(error);
                    }
                    else {
                        status = 200;
                        return resolve(rows);
                    }
                });
            });
        };
        await setFunds(event);
        await updateFunds(event);
    }
    catch (err) {
        status = 400;
        console.log(err);
    }

    response = {
        'statusCode': status,
        'body': JSON.stringify({ "newFunds": String(funds + parseFloat(event.funds)) })
    };
    return response;
};
