require('./app/index');

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

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

    console.log(credentials);


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
    // console.log(rows[0].solution);

    //return null;
    // var mysql      = require('mysql');
    // var connection = mysql.createConnection({
    //     host     : credentials.host,
    //     port: credentials.port,
    //     user     : credentials.username,
    //     password : credentials.password,
    // });
/*
    connection.connect();
    await connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
        console.log('Selected.');
        if (error) throw error;
        if (error) {
            inquirer.prompt([
                    {
                        type: 'expand',
                        message: 'Не удалось подключиться: ',
                        name: 'action',
                        choices: [
                            {
                                key: 'r',
                                name: 'Retry',
                                value: 'retry'
                            },
                            {
                                key: 'd',
                                name: 'Delete credentials',
                                value: 'delete'
                            },
                            {
                                key: 'x',
                                name: 'Exit',
                                value: 'exit'
                            }
                        ]
                    }
                ])
                .then(answers => {
                    console.log(answers);
                    if (answers.action === 'retry') {
                        return run();
                    }
                    if (answers.action === 'delete') {
                        lib.clearCredentials();
                    }
                });
        } else {
            console.log('The solution is: ', results[0].solution);

        }
    });
    console.log('Подключились к БД.');
    connection.end();
*/



    // Выбираем БД для дампа из списка.
    [rows, fields] = await connection.execute('show databases');
    // console.log(rows[0].Database);
    let databases = lib.extractColumn(rows, 'Database');
    console.log(databases);



    // Выбираем таблицу для дампа из списка.

    connection.close();
};



run();