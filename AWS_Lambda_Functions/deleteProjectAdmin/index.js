var mysql = require('/opt/node_modules/mysql');
var config = require('/opt/nodejs/config.json');

let response;
let status;
let body = {};
let pledges = [];
let pledgesClaimed = [];
let directSupp = [];

var con = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: 3306,
    database: 'PPAppSchema'
});

exports.handler = async (event) => {
    try {
        let getPledges = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Pledges", (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows.length > 0) {
                        pledges = rows;
                        return resolve(rows);
                    }
                    else {
                        pledges = [];
                        return resolve([]);
                    }
                });
            });
        };

        let getPledgesClaimed = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM PledgesClaimed", (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows.length > 0) {
                        pledgesClaimed = rows;
                        return resolve(rows);
                    }
                    else {
                        pledgesClaimed = [];
                        return resolve([]);
                    }
                });
            });
        };

        let getDirectSupport = () => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM DirectSupport", (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows.length > 0) {
                        directSupp = rows;
                        return resolve(rows);
                    }
                    else {
                        directSupp = [];
                        return resolve([]);
                    }
                });
            });
        };

        let returnPledge = (value) => {
            return new Promise((resolve, reject) => {
                con.query("UPDATE Supporters SET funds=funds+? WHERE email=?", [value.amount, value.pledge.supporterEmail], (error, rows) => {
                    if (error) { return reject(error); }
                    return resolve(value.amount + "->" + value.pledge.supporterEmail);
                });
            });
        };

        let removePledge = (value) => {
            return new Promise((resolve, reject) => {
                con.query("DELETE FROM PledgesClaimed WHERE pledgeid=? AND supporterEmail=?", [value.pledgeid, value.supporterEmail], (error, rows) => {
                    if (error) { return reject(error); }
                    return resolve();
                });
                con.query("DELETE FROM Pledges WHERE uniqueid=?", value.pledgeid, (error, rows) => {
                    if (error) { return reject(error); }
                    return resolve();
                });
            });
        };

        let returnDirectSupp = (value) => {
            return new Promise((resolve, reject) => {
                con.query("UPDATE Supporters SET funds=funds+? WHERE email=?", [value.amount, value.email], (error, rows) => {
                    if (error) { return reject(error); }
                    return resolve(value.amount + "->" + value.supporterEmail);
                });
            });
        };

        let removeDirectSupp = (value) => {
            return new Promise((resolve, reject) => {
                con.query("DELETE FROM DirectSupport WHERE project=?", value, (error, rows) => {
                    if (error) { return reject(error); }
                    directSupp = rows;
                    return resolve("REMOVEDPLEDGES->" + value);
                });
            });
        };

        let removeProject = (value) => {
            return new Promise((resolve, reject) => {
                con.query("DELETE FROM Projects WHERE name=?", value, (error, rows) => {
                    if (error) { return reject(error); }
                    return resolve("REMOVEDPROJECT->" + value);
                });
            });
        };

        var dict = {};
        await getDirectSupport();
        await getPledges();
        await getPledgesClaimed();
        let directFilter = directSupp.filter(s => (event.projectName == s.project));
        let pledgeFilter = pledges.filter(s => (event.projectName == s.project));
        pledgeFilter.forEach(x => {
            dict[x.uniqueid] = x.dollarAmount;
        });
        let pledgeClaimedFilter = pledgesClaimed.filter(s => dict[s.pledgeid] != null);
        for (var pledge of pledgeClaimedFilter) {
            await returnPledge({ "pledge": pledge, "amount": dict[pledge.pledgeid] });
            await removePledge(pledge);
        }
        for (var supp of directFilter) {
            await returnDirectSupp(supp);
            await removeDirectSupp(supp.project);
        }
        await removeProject(event.projectName);
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
