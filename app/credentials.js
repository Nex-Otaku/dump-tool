const inquirer = require('inquirer');

const Configstore = require('configstore');
const pkg = require('../package.json');
const conf = new Configstore(pkg.name);

const chalk = require('chalk');

const lib = require('./lib');

const getShortDsn = (credentials) => {
    if (!credentials) {
        return '';
    }
    
    return credentials.username + '@' + credentials.host + ':' + credentials.port;
};

const getKnownList = () => {
    let list = conf.get('mysql.credentials-list');
    if (!list) {
        list = [];
    }

    return list;
};

const addToKnownList = (credentials) => {
    let list = getKnownList();

    const resultList = list.filter(item => item.shortDsn !== getShortDsn(credentials));

    resultList.push({
        shortDsn: getShortDsn(credentials),
        credentials: credentials
    });

    conf.set('mysql.credentials-list', resultList);
};

const set = (credentials) => {
    conf.set('mysql.credentials', credentials);
    addToKnownList(credentials);
};

const ask = () => {
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
};

const report = (credentials) => {
    if (!credentials) {
        console.log(chalk.red('Не настроено подключение'));
        return;
    }

    let dsn = getShortDsn(credentials);
    console.log(chalk.green(dsn));
};

const makeNew = async () => {
    const remote = await ask();
    set(remote);
    report(remote);
    lib.newline();
    return remote;
};

const doSwitch = async () => {
    let list = getKnownList();
    if (list.length === 0) {
        console.log('Подключений нет.');
        return;
    }

    let dsnList = list.map(item => {
        return {
            name: item.shortDsn,
            value: item.credentials,
            short: item.shortDsn
        }
    });

    let results = await inquirer.prompt([
        {
            type: 'list',
            name: 'credentials',
            message: 'Подключение',
            choices: dsnList
        }
    ]);

    lib.newline();
    set(results.credentials);
};

const clear = () => {
    conf.clear();
};

const get = () => {
    return conf.get('mysql.credentials');
};

module.exports = {
    clear: clear,
    report: report,
    get: get,
    set: set,
    ask: ask,
    switch: doSwitch,
    new: makeNew
};