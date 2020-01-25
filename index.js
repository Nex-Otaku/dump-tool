const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');


const _ = require('lodash');

const inquirer = require('inquirer');

const lib = require('./app/lib');

const credentials = require('./app/credentials');

const dump = require('./app/dump');

const printHeader = () => {
    console.log(
        chalk.yellow(
            figlet.textSync('Dump Tool', { horizontalLayout: 'full' })
        )
    );

    let remote = credentials.get();
    credentials.report(remote);
    lib.newline();
};

const selectAction = async (actions) => {
    let results = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Действия',
            choices: actions
        }
    ]);
    lib.newline();

    return results.action;
};

const mainLoop = async () => {
    let running = true;
    while (running) {
        clear();
        printHeader();

        const selectedAction = await selectAction([
            'Скачать дамп',
            'Развернуть дамп',
            'Сменить подключение',
            'Добавить подключение',
            'Сбросить настройки',
            'Выход',
        ]);
        if (selectedAction === 'Скачать дамп') {
            await dump.export();
        }
        if (selectedAction === 'Развернуть дамп') {
            await dump.import();
        }
        if (selectedAction === 'Сменить подключение') {
            await credentials.switch();
        }
        if (selectedAction === 'Добавить подключение') {
            await credentials.new();
        }
        if (selectedAction === 'Сбросить настройки') {
            credentials.clear();
        }

        if (selectedAction === 'Выход') {
            running = false;
        }

        if (running) {
            await lib.keypress();
        }
    }
};

mainLoop().then();