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
    if (err) {
        console.log(err.toString());
    }
});

exports.handler = async (event, context, callback) => {
    try {
        status = 200;
        let insertToTable = (value) => {
            return new Promise((resolve, reject) => {
                con.query("INSERT INTO Designers (email, name, password) VALUES ('" + value.email.toString() + "', '" + value.name.toString() + "', '" + value.password.toString() + "')", [value], (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows) {
                        body["name"] = String(event.name);
                        return resolve(rows);
                    }
                    else {
                        return reject("RegisterDesignerFailure");
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
            'error' : "EmailInUseError"
        };
    }
    return response;
};
