var mysql = require('/opt/node_modules/mysql');
var config = require('/opt/nodejs/config.json');

let response;
let update = false;
let pledgeValue = 0;
let totalSupps = 0;
let maxSupps = 0;
let funds = 0;
let status;
let project = "";
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
        let getSupps = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Pledges WHERE uniqueid=?", [value.pledgeid], (error, rows) => {
                    if (error) {
                        status = 400;
                        return reject(error);
                    }
                    maxSupps = rows[0].maxSupporters;
                    totalSupps = rows[0].numSupporters;
                    return resolve(rows);
                });
            });
        };
        let setPledgeValue = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Pledges WHERE uniqueid=?", [value.pledgeid], (error, rows) => {
                    if (error) {
                        status = 400;
                        return reject(error);
                    }
                    else if (rows.length > 0) {
                        status = 200;
                        project = rows[0].project;
                        pledgeValue = rows[0].dollarAmount;
                        return resolve(rows);
                    }
                    else {
                        body["error"] = "PledgeNotFoundError";
                        return reject("PledgeNotFoundError");
                    }
                });
            });
        };
        let setFunds = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Supporters WHERE email=?", [value.supporterEmail], (error, rows) => {
                    if (error) {
                        status = 400;
                        return reject(error);
                    }
                    else if (rows.length > 0) {
                        status = 200;
                        funds = rows[0].funds;
                        return resolve(rows);
                    }
                    else {
                        body["error"] = "SupporterNotFoundError";
                        return reject("SupporterNotFoundError");
                    }
                });
            });
        };
        let insertPledge = (value) => {
            return new Promise((resolve, reject) => {
                if (funds < pledgeValue) {
                    status = 400;
                    body["error"] = "InsufficientFundsError";
                    return reject("InsufficientFundsError");
                }
                else {
                    con.query("INSERT INTO PledgesClaimed (supporterEmail, pledgeid) VALUES (?, ?)", [value.supporterEmail, value.pledgeid], (error, rows) => {
                        if (error) {
                            status = 400;
                            return reject(error);
                        }
                        else {
                            update = true;
                            status = 200;
                            return resolve(rows);
                        }
                    });
                }
            });
        };
        let updateSupporters = (value) => {
            return new Promise((resolve, reject) => {
                con.query("UPDATE Supporters SET funds=? WHERE email=?", [funds - pledgeValue, value.supporterEmail], (error, rows) => {
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
        let updatePledges = (value) => {
            return new Promise((resolve, reject) => {
                con.query("UPDATE Pledges SET numSupporters=numSupporters+1 WHERE uniqueid=?", [value.pledgeid], (error, rows) => {
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
        let updateProjects = (value) => {
            return new Promise((resolve, reject) => {
                con.query("UPDATE Projects SET funding=funding+?, numSupporters = numSupporters + 1 WHERE name=?", [pledgeValue, project], (error, rows) => {
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
        let updateNumSupporters = (value) => {
            return new Promise((resolve, reject) => {
                con.query("UPDATE Projects SET numSupporters=numSupporters+1 WHERE name=?", [value.project], (error, rows) => {
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
        await getSupps(event);
        if (maxSupps > totalSupps || maxSupps == 0) {
            await setPledgeValue(event);
            await setFunds(event);
            await insertPledge(event);
            if (update) {
                await updateSupporters(event);
                await updatePledges(event);
                await updateProjects(event);
                await updateNumSupporters(event);
            }
        }
        else {
            throw new Error("TooManySupportersError");
        }
    }
    catch (err) {
        status = 400;
        console.log(err);
        body["err"] = err.toString();
    }

    response = {
        'statusCode': status,
        'body': JSON.stringify(body)
    };
    return response;
};
