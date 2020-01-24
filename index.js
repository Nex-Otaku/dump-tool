require('./app/index');

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const files = require('./app/files');

clear();

console.log(
    chalk.yellow(
        figlet.textSync('Dump Tool', { horizontalLayout: 'full' })
    )
);



//const inquirer  = require('./app/inquirer');
const inquirer = require('inquirer');

const config = require('./app/config');

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

    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : credentials.host,
        port: credentials.port,
        user     : credentials.user,
        password : credentials.password,
    });

    connection.connect();

    connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
        //if (error) throw error;
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

    connection.end();
};



run();