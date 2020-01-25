const inquirer = require('inquirer');

const Configstore = require('configstore');
const pkg = require('../package.json');
const conf = new Configstore(pkg.name);

const chalk = require('chalk');

module.exports = {
    report: (credentials) => {
        if (!credentials) {
            console.log(chalk.red('Не настроено подключение'));
            return;
        }
        let shortDsn = credentials.username + '@' + credentials.host + ':' + credentials.port;
        console.log(chalk.green(shortDsn));
    },

    get: () => {
        return conf.get('mysql.credentials');
    },

    set: (credentials) => {
        conf.set('mysql.credentials', credentials);
    },

    ask: () => {
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