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



const inquirer  = require('./app/inquirer');

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


    const credentials = await lib.askCredentials();
    console.log(credentials);
};



run();