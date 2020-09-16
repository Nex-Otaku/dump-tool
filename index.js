#!/usr/bin/env node

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
            choices: actions,
            pageSize: 50
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
            'Сделать копию БД',
            'Сменить подключение',
            'Добавить подключение',
            'Удалить подключение',
            'Сбросить настройки',
            'Удалить все дампы',
            'Выход',
        ]);
        if (selectedAction === 'Скачать дамп') {
            await dump.export();
        }
        if (selectedAction === 'Развернуть дамп') {
            await dump.import();
        }
        if (selectedAction === 'Сделать копию БД') {
            await dump.makeCopy();
        }
        if (selectedAction === 'Сменить подключение') {
            await credentials.switch();
        }
        if (selectedAction === 'Добавить подключение') {
            await credentials.new();
        }
        if (selectedAction === 'Удалить подключение') {
            await credentials.delete();
        }
        if (selectedAction === 'Сбросить настройки') {
            credentials.clear();
        }
        if (selectedAction === 'Удалить все дампы') {
            await dump.deleteAll();
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