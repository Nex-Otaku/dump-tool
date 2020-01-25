const inquirer = require('inquirer');

const Configstore = require('configstore');
const pkg = require('../package.json');
const conf = new Configstore(pkg.name);

const chalk = require('chalk');

const getShortDsn = (credentials) => {
    if (!credentials) {
        return '';
    }
    return credentials.username + '@' + credentials.host + ':' + credentials.port;
};

const addToKnownList = (credentials) => {
    let list = conf.get('mysql.credentials-list');
    if (!list) {
        list = [];
    }

    const resultList = list.filter(item => item.shortDsn !== getShortDsn(credentials));

    resultList.push({
        shortDsn: getShortDsn(credentials),
        credentials: credentials
    });

    conf.set('mysql.credentials-list', resultList);
};

module.exports = {
    clear: () => {
        conf.clear();
    },

    report: (credentials) => {
        if (!credentials) {
            console.log(chalk.red('Не настроено подключение'));
            return;
        }
        let dsn = getShortDsn(credentials);
        console.log(chalk.green(dsn));
    },

    get: () => {
        return conf.get('mysql.credentials');
    },

    set: (credentials) => {
        conf.set('mysql.credentials', credentials);
        addToKnownList(credentials);
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