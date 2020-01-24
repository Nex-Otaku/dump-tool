require('./app/index');

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const CLI = require('clui');
const Spinner = CLI.Spinner;

const _ = require('lodash');

clear();

console.log(
    chalk.yellow(
        figlet.textSync('Dump Tool', { horizontalLayout: 'full' })
    )
);

const inquirer = require('inquirer');

const lib = require('./app/lib');

const run = async () => {
    let results = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Действия',
            choices: ['Скачать дамп', 'Развернуть дамп']
        }
    ]);
    lib.newline();

    const selectedAction = results.action;

    if (selectedAction === 'Скачать дамп') {
        await dumpData();
    }
    if (selectedAction === 'Развернуть дамп') {
        await applyDump();
    }
};


const files = require('./app/files');

const applyDump = async () => {
    // Ищем файл по маске *.sql
    const dumpFiles = files.getFilesWithExtension('.', 'sql');
    console.log(dumpFiles);
    // Даём выбрать файл. (Выводим, какое количество времени назад он был создан)
    // Определяем имя таблицы.
    // Ищем соответствующие таблицы в локальной БД.
    // Выводим выбор из совпадающих БД.
    // Очищаем таблицу.
    // Разворачиваем дамп.
};

const dumpData = async () => {
    let credentials = lib.getCredentials();
    if (!credentials) {
        credentials = await lib.askCredentials();
        lib.setCredentials(credentials);
    }
    lib.reportCredentials(credentials);
    lib.newline();

    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
        host     : credentials.host,
        port: credentials.port,
        user     : credentials.username,
        password : credentials.password,
    });
    let [rows, fields] = await connection.execute('SELECT 1 + 1 AS solution');

    // Выбираем БД для дампа из списка.
    [rows, fields] = await connection.execute('show databases');
    let databases = lib.extractColumn(rows, 'Database');
    // Исключаем служебную таблицу.
    databases = _.without(databases, 'information_schema');

    let results = await inquirer.prompt([
        {
            type: 'list',
            name: 'db',
            message: 'База данных',
            choices: databases
        }
    ]);
    lib.newline();

    const selectedDb = results.db;

    // Устанавливаем используемую БД в подключении.
    connection.changeUser({database : selectedDb}, function(err) {
        if (err) throw err;
    });

    // Выбираем таблицу для дампа из списка.
    [rows, fields] = await connection.execute('show tables');
    connection.close();
    let tables = lib.extractFirstColumn(rows);

    results = await inquirer.prompt([
        {
            type: 'list',
            name: 'table',
            message: 'Таблица',
            choices: tables,
            pageSize: 30,
        }
    ]);
    lib.newline();

    const selectedTable = results.table;

    // Выгружаем дамп с данными таблицы.
    const status = new Spinner('Выгружаю данные...');
    status.start();

    const dumpCommand = 'mysqldump --no-create-info -u {user} -p{password} -h {host} --port {port} --single-transaction --default-character-set=utf8mb4 --hex-blob --max-allowed-packet=512000000 {db} {table} > {table}-data.sql';
    const dumpCommandParametrized = lib.parametrize(dumpCommand, {
        host: credentials.host,
        port: credentials.port,
        user: credentials.username,
        password: credentials.password,
        db: selectedDb,
        table: selectedTable
    });

    let dumpOutput = await lib.shellRun(dumpCommandParametrized);
    status.stop();

    if (_.trim(dumpOutput).length > 0) {
        console.log(dumpOutput);
    }

    console.log('Дамп выгружен.');
};

run().then();