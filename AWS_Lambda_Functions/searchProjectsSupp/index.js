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
    var projects = [];
    try {
        let getProjects = (value) => {
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM Projects WHERE launched=1", (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows) {
                        projects = rows;
                        status = 200;
                        return resolve(rows);
                    }
                    else {
                        return reject("SearchProjectsSupporterFailure");
                    }
                });
            });
        };
        await getProjects(event);
        let filter = [];
        if (projects.length > 0) {
            if (event.type === "None") {
                filter = projects.filter(s => (s.story.toLowerCase().includes(event.substring.toLowerCase()) ||
                    s.name.toLowerCase().includes(event.substring.toLowerCase())));
            }
            else {
                filter = projects.filter(s => ((s.type == event.type) && (s.story.toLowerCase().includes(event.substring.toLowerCase()) ||
                    s.name.toLowerCase().includes(event.substring.toLowerCase()))));
            }
        }
        body["projects"] = filter;
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
