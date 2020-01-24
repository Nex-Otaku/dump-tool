require('./app/index');

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const _ = require('lodash');

// const files = require('./app/files');

clear();

console.log(
    chalk.yellow(
        figlet.textSync('Dump Tool', { horizontalLayout: 'full' })
    )
);



//const inquirer  = require('./app/inquirer');
const inquirer = require('inquirer');

// const config = require('./app/config');

const lib = require('./app/lib');


const run = async () => {
    // const credentials = await inquirer.askGithubCredentials();
    // console.log(credentials);

    // let token = github.getStoredGithubToken();
    // if (!token) {
    //     await github.setGithubCredentials();
    //     token = await github.registerNewToken();
    // }
    // console.log(token);

    let credentials = lib.getCredentials();
    if (!credentials) {
        credentials = await lib.askCredentials();
        lib.setCredentials(credentials);
    }
    lib.reportCredentials(credentials);
    lib.newline();


    // get the client
    const mysql = require('mysql2/promise');
    // create the connection
    const connection = await mysql.createConnection({
        host     : credentials.host,
        port: credentials.port,
        user     : credentials.username,
        password : credentials.password,
    });
    // query database
    let [rows, fields] = await connection.execute('SELECT 1 + 1 AS solution');



    // Выбираем БД для дампа из списка.
    [rows, fields] = await connection.execute('show databases');
    // console.log(rows[0].Database);
    let databases = lib.extractColumn(rows, 'Database');
    // Исключаем служебную таблицу.
    databases = _.without(databases, 'information_schema');
    //console.log(databases);

    let results = await inquirer.prompt([
        {
            type: 'list',
            name: 'db',
            message: 'База данных',
            choices: databases
        }
    ]);
    lib.newline();

    // console.log(results.db);
    const selectedDb = results.db;

    // Выбираем БД.
    connection.changeUser({database : selectedDb}, function(err) {
        if (err) throw err;
    });

    // Выбираем таблицу для дампа из списка.

    [rows, fields] = await connection.execute('show tables');
    connection.close();
    // console.log(rows);
    let tables = lib.extractFirstColumn(rows);
    // console.log(tables);

    results = await inquirer.prompt([
        {
            type: 'list',
            name: 'table',
            message: 'Таблица',
            choices: tables,
            pageSize: 30,
        }
    ]);
    lib.newline();

    // console.log(results.table);
    const selectedTable = results.table;

    // Выгружаем дамп с данными таблицы.
    // _.

    //mysqldump --no-create-info -u %user% -p%password% -h %host% --port %port% --single-transaction --default-character-set=utf8mb4 --hex-blob --max-allowed-packet=512000000 %db% %table% > %table%-data.sql

    let stdout = await lib.shellRun('echo hello');

    console.log(_.trim(stdout));

};



run();