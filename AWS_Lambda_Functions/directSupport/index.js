var mysql = require('/opt/node_modules/mysql');
var config = require('/opt/nodejs/config.json');

let update = false;
let projExists = false;
let origFunds;
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
        let projectExists = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Projects WHERE name=?", value.project, (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows.length > 0) {
                        projExists = true;
                        return resolve(rows);
                    }
                    else {
                        return reject("FindProjectfailure");
                    }
                });
            });
        };
        let directSupport = (value) => {
            return new Promise((resolve, reject) => {
                let funds = 0;
                con.query("SELECT * FROM Supporters WHERE email=?", value.email, (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows.length > 0) {
                        funds = rows[0].funds;
                        if (value.amount > funds) {
                            return reject("InsufficientFundsError");
                        }
                        else {
                            update = true;
                        }
                        return resolve(rows);
                    }
                    else {
                        return reject("FindSupporterfailure");
                    }
                });
            });
        };
        let getOrigFunds = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Supporters WHERE email=?", value.email, (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows.length > 0) {
                        origFunds = rows[0].funds;
                        return resolve(rows);
                    }
                    else {
                        return reject("FindSupporterfailure");
                    }
                });
            });
        };
        let insertDirectSupport = (value) => {
            return new Promise((resolve, reject) => {
                con.query("INSERT INTO DirectSupport (project, email, amount, id) VALUES ('" + value.project + "', '" + value.email + "', '" + value.amount + "', '" + Math.random() * 10000000000000000 +
                    "')", (error, rows) => {
                        if (error) { return reject(error); }
                        if (rows) {
                            status = 200;
                            return resolve(rows);
                        }
                        else {
                            return reject("DirectSupportFailure");
                        }
                    });
            });
        };

        let updateFunds = (value) => {
            return new Promise((resolve, reject) => {
                con.query("UPDATE Supporters SET funds=funds-? WHERE email=?", [value.amount, value.email], (error, rows) => {
                    if (error) { return reject(error); }
                    else {
                        return resolve("FundsUpdated");
                    }
                });
            });
        };

        let updateProjectFunding = (value) => {
            return new Promise((resolve, reject) => {
                con.query("UPDATE Projects SET funding=funding+? WHERE name=?", [value.amount, value.project], (error, rows) => {
                    if (error) { return reject(error); }
                    else {
                        return resolve("FundsUpdated");
                    }
                });
            });
        };

        let updateNumSupporters = (value) => {
            return new Promise((resolve, reject) => {
                con.query("UPDATE Projects SET numSupporters=numSupporters+1 WHERE name=?",value.project, (error, rows) => {
                    if (error) { return reject(error); }
                    else {
                        return resolve("FundsUpdated");
                    }
                });
            });
        };
        await projectExists(event);
        if (projExists) {
            await getOrigFunds(event);
            await directSupport(event);
        }
        if (update) {
            await insertDirectSupport(event);
            await updateFunds(event);
            await updateProjectFunding(event);
            await updateNumSupporters(event);
            body["newFunding"] = origFunds + event.amount;
        }
    }
    catch (err) {
        status = 400;
        console.log(err);
        body["error"] = err.toString();
        response = {
            'statusCode': 400,
            'body': JSON.stringify(body)
        };
        return response;
    }

    response = {
        'statusCode': status,
        'body': JSON.stringify(body)
    };
    return response;
};
