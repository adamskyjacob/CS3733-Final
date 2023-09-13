var mysql = require('/opt/node_modules/mysql');
var config = require('/opt/nodejs/config.json');

let status;

var con = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: 3306,
    database: 'PPAppSchema'
});

exports.handler = async (event) => {
    let body = {};
    let loginUser = (value) => {
        return new Promise((resolve, reject) => {
            var type;
            switch(value.type) {
                case "admin":
                    type = "Admin";
                    break;
                case "designer":
                    type = "Designers";
                    break;
                case "supporter":
                    type = "Supporters";
                    break;
                default:
                    return reject("InvalidLoginType");
            }
            
            con.query("SELECT * FROM " + type + " WHERE email=?", value.email, (error, rows) => {
                if (error) {
                    status = 400;
                    return reject(error);
                }
                if (rows) {
                    if (rows.length == 0){
                        status = 400;
                        return reject("InvalidUsernameFailure");
                    }
                    else if (rows[0].password === event.password) {
                        body["name"] = (type === "admin") ? "admin" : rows[0].name;
                        status = 200;
                        return resolve(rows);
                    }
                    else {
                        status = 400;
                        return reject("IncorrectCredentialsFailure");
                    }
                }
                else {
                    status = 400;
                    return reject("LoginUserFailure");
                }
            });
        });
    };
    await loginUser(event);

    return {
        'statusCode': status,
        'body': JSON.stringify(body)
    };
};
