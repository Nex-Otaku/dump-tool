const CLI = require('clui');
const Configstore = require('configstore');
// const Octokit = require('@octokit/rest');
const Spinner = CLI.Spinner;

const inquirer = require('./inquirer');
const pkg = require('../package.json');

const conf = new Configstore(pkg.name);

module.exports = {

    setDatabase: (conection, database) => {
        connection.changeUser({database : selectedDb}, function(err) {
            if (err) throw err;
        });
    },
    // getInstance: () => {
    //     return octokit;
    // },

    getStoredGithubToken: () => {
        return conf.get('github.token');
    },
};