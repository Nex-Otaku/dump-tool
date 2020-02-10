const mysql = require('mysql2/promise');
const _ = require('lodash');
const lib = require('./lib');

module.exports = {

    getLocalConnectionCredentials: () => {
        return {
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: ''
        };
    },

    selectDb: async (connection, databaseName) => {
        connection.changeUser({database : databaseName}, function(err) {
            if (err) throw err;
        });
    },

    existTable: async (connection, tableName) => {
        const [rows, fields] = await connection.execute('show tables like \'' + tableName + '\'');
        let tables = lib.extractFirstColumn(rows);
        return tables.length > 0;
    },

    getTables: async (connection) => {

    },

    getConnection: async (credentials) => {
        const connection = await mysql.createConnection({
            host     : credentials.host,
            port: credentials.port,
            user     : credentials.username,
            password : credentials.password,
        });
        let [rows, fields] = await connection.execute('SELECT 1 + 1 AS solution');
        return connection;
    },

    getDatabasesList: async (connection) => {
        const [rows, fields] = await connection.execute('show databases');
        let databases = lib.extractColumn(rows, 'Database');
        // Исключаем служебную таблицу.
        return _.without(databases, 'information_schema');
    },
};