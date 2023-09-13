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
con.connect(function(err) {
    if (err) console.log(err.toString());
});

exports.handler = async (event, context, callback) => {
    try {
        let name = String(event.name);
        if (!name.slice().trim()) {
            status = 400;
            body["error"] = "EmptyNameError";
            response = {
                'statusCode': status,
                'body': JSON.stringify(body)
            };
            return response;
        }
        else {
            status = 200;
            var sql = "INSERT INTO Projects (name, story, designerName, type, deadline, goal, designerEmail) VALUES ('" + event.name.toString() + "', '" + event.story.toString() + "', '" + event.designerName.toString() + "', '" + event.type.toString() + "', '" + event.deadline.toString() + "', '" + event.goal.toString() + "', '" + event.designerEmail.toString() + "')";
            let insertToTable = (value) => {
                return new Promise((resolve, reject) => {
                    con.query(sql, [value], (error, rows) => {
                        if (error) { return reject(error); }
                        if (rows) {
                            return resolve(rows);
                        }
                        else {
                            return reject("CreateProjectFailure");
                        }
                    });
                });
            };
            await insertToTable(event);
        }
    }
    catch (err) {
        status = 400;
        response = {
            'statusCode': status,
            'error' : "DuplicateProjectError"
        };
        return response;
    }
    response = {
        'statusCode': status
    };
    return response;
};
