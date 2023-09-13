var mysql = require('/opt/node_modules/mysql');
var config = require('/opt/nodejs/config.json');

function hasPast(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

let response;
let status;
let body = {};
let projects = [];
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
        let getProjects = () => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Projects", (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows.length > 0) {
                        projects = rows;
                        return resolve(rows);
                    }
                    else {
                        return reject("NoProjectsFailure");
                    }
                });
            });
        };

        let getPledges = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Pledges", (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows.length > 0) {
                        pledges = rows;
                        return resolve(rows);
                    } else{
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
                    } else{
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
                    } else{
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
                    return resolve();
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
                    return resolve();
                });
            });
        };

        let removeDirectSupp = (value) => {
            return new Promise((resolve, reject) => {
                con.query("DELETE FROM DirectSupport WHERE project=?", value, (error, rows) => {
                    if (error) { return reject(error); }
                    directSupp = rows;
                    return resolve();
                });
            });
        };

        let removeProject = (value) => {
            return new Promise((resolve, reject) => {
                con.query("DELETE FROM Projects WHERE name=?", value, (error, rows) => {
                    if (error) { return reject(error); }
                    return resolve(rows);
                });
            });
        };

        var dict = {};
        await getProjects(event);
        let projFilter = projects.filter(s => (hasPast(new Date(s.deadline)) && s.funding < s.goal)).map(x => x.name);
        console.log(projFilter);
        if (projFilter.length > 0) {
            console.log(projFilter)
            await getDirectSupport();
            await getPledges();
            await getPledgesClaimed();

            let directFilter = directSupp.filter(s => projFilter.includes(s.project));
            let pledgeFilter = pledges.filter(s => projFilter.includes(s.project));

            pledgeFilter.forEach(x => {
                dict[x.uniqueid] = x.dollarAmount;
            });

            let pledgeClaimedFilter = pledgesClaimed.filter(s => dict[s.pledgeid] != null);
            if (pledgesClaimed.length > 0) {
                for (var pledge of pledgeClaimedFilter) {
                    await returnPledge({ "pledge": pledge, "amount": dict[pledge.pledgeid] });
                    await removePledge(pledge);
                }
            }
            if (directFilter.length > 0) {
                for (var supp of directFilter) {
                    await returnDirectSupp(supp);
                    await removeDirectSupp(supp.project);
                }
            }
            for (var proj of projFilter) {
                await removeProject(proj);
            }
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
