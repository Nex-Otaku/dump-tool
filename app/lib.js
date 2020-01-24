const inquirer = require('inquirer');


const Configstore = require('configstore');
const pkg = require('../package.json');
const conf = new Configstore(pkg.name);


module.exports = {
    newline: () => {
        console.log();
    },

    reportCredentials: (credentials) => {
        let shortDsn = credentials.username + '@' + credentials.host + ':' + credentials.port;
        console.log(shortDsn);
    },

    extractColumn: (arr, column) => {
        return arr.map(x => x[column])
    },

    extractFirstColumn: (arr) => {
        return arr.map(x => x[Object.keys(x)[0]]);
    },

    getAnswers: () => {
        return inquirer;
    },

    getCredentials: () => {
        return conf.get('mysql.credentials');
    },

    setCredentials: (credentials) => {
        conf.set('mysql.credentials', credentials);
    },

    clearCredentials: () => {
        conf.delete('mysql.credentials');
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