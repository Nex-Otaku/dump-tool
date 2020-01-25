const inquirer = require('inquirer');


const Configstore = require('configstore');
const pkg = require('../package.json');
const conf = new Configstore(pkg.name);

const exec = require('child-process-promise').exec;

const _ = require('lodash');

const chalk = require('chalk');

module.exports = {

    parametrize: (template, parameters) => {
        let templatePrepared = _.replace(template, new RegExp('\{(\\w+)\}', 'g'), '<%= $1 %>');
        let parametrizeFunction = _.template(templatePrepared);
        return parametrizeFunction(parameters);
    },

    shellRun: async (command) => {
        return exec(command)
            .then(function (result) {
                var stderr = result.stderr;
                if (stderr.length > 0) {
                    throw new Error(stderr);
                }
                return result.stdout;
            })
            .catch(function (err) {
                console.error('ERROR: ', err);
            });
    },

    newline: () => {
        console.log();
    },

    reportCredentials: (credentials) => {
        if (!credentials) {
            console.log(chalk.red('Не настроено подключение'));
            return;
        }
        let shortDsn = credentials.username + '@' + credentials.host + ':' + credentials.port;
        console.log(chalk.green(shortDsn));
    },

    extractColumn: (arr, column) => {
        return arr.map(x => x[column])
    },

    extractFirstColumn: (arr) => {
        return arr.map(x => x[Object.keys(x)[0]]);
    },

    getCredentials: () => {
        return conf.get('mysql.credentials');
    },

    setCredentials: (credentials) => {
        conf.set('mysql.credentials', credentials);
    },

    askCredentials: () => {
        const questions = [
            {
                name: 'host',
                type: 'input',
                message: 'Хост:',
                default: 'localhost',
                validate: function( value ) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Введите хост';
                    }
                }
            },
            {
                name: 'port',
                type: 'input',
                default: '3306',
                message: 'Порт:',
                validate: function( value ) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Введите порт';
                    }
                }
            },
            {
                name: 'username',
                type: 'input',
                message: 'Введите имя пользователя:',
                validate: function( value ) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Введите имя пользователя.';
                    }
                }
            },
            {
                name: 'password',
                type: 'password',
                message: 'Введите пароль:',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Введите пароль.';
                    }
                }
            }
        ];
        return inquirer.prompt(questions);
    },
};