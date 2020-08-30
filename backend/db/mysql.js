require('dotenv').config();
const sql = require("mysql");

console.log(process.env.SQL_HOST);
const sqlConnection = sql.createConnection({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
});

sqlConnection.connect((err)=>{
    if (err) {
        console.log('BANG!!!!! ERROR CONNECTION ', err);
        throw err
    }
    // sqlConnection.query("CREATE DATABASE chat", function (err, result) {
    //     if (err) {
    //         console.log('BANG!!!!! ERROR CREATE DB ', err)
    //         throw err;
    //     }
    //     console.log("Database created");
    // });
    // const sql = "CREATE TABLE chat.users (name VARCHAR(255), email VARCHAR(255), password VARCHAR(255))";
    // sqlConnection.query(sql, function (err, result) {
    //     if (err) {
    //         console.log('BANG!!!!! ERROR CREATE TABLE ', err);
    //         throw err;
    //     }
    //     console.log("Table created");
    // });
})

sqlOperation = {
    register(name, email, password) {
        return new Promise( ( resolve, reject ) => {
            const sql = `INSERT INTO ${process.env.SQL_TABLE} (name, email, password) VALUES ("${name}", "${email}", "${password}");`;
            sqlConnection.query( sql, (err, result) => {
                if (err) return reject( err );
                resolve(result);
                console.log("Record inserted");
            });
        });
    },
    find(email) {
        return new Promise( (resolve, reject) => {
            const sql = `SELECT * FROM ${process.env.SQL_TABLE} WHERE email="${email}";`;
            sqlConnection.query( sql, (err, result, fields) => {
                if (err) {
                    reject( err );
                } else {
                    resolve(result[0]);
                }
            });
        });
    }
}

module.exports = sqlOperation;
