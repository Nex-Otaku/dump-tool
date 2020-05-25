const mysql = require('mysql2/promise');
const _ = require('lodash');
const lib = require('./lib');
const credentials = require('./credentials');

module.exports = {

    getLocalConnectionCredentials: () => {
        return {
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'root'
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

    getConnection: async (connectionCredentials) => {
        let connection = null;
        try {
            connection = await mysql.createConnection({
                host     : connectionCredentials.host,
                port: connectionCredentials.port,
                user     : connectionCredentials.username,
                password : connectionCredentials.password,
            });
            let [rows, fields] = await connection.execute('SELECT 1 + 1 AS solution');
        } catch (e) {
            console.log('Не могу подключиться: ' + credentials.getShortDsn(connectionCredentials));
            return null;
        }
        return connection;
    },

    getDatabasesList: async (connection) => {
        const [rows, fields] = await connection.execute('show databases');
        let databases = lib.extractColumn(rows, 'Database');
        // Исключаем служебную таблицу.
        return _.without(databases, 'information_schema');
    },
};