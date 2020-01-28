const CLI = require('clui');
const Spinner = CLI.Spinner;

const _ = require('lodash');

const inquirer = require('inquirer');

const lib = require('./lib');

const mysql = require('mysql2/promise');


const mysqlUtils = require('./mysql');


const files = require('./files');

const credentials = require('./credentials');

const applyDump = async () => {
    // Ищем файл по маске *.sql
    let pattern = '.*-data\.sql';
    let regex = new RegExp(pattern, 'ig');
    const dumpFiles = files.getFilesWithRegex(files.getTempDirectoryPath(), regex);

    if (dumpFiles.length === 0) {
        console.log('Дампов нет');
        return null;
    }

    // Даём выбрать файл. (Выводим, какое количество времени назад он был создан)
    let results = await inquirer.prompt([
        {
            type: 'list',
            name: 'dump',
            message: 'Файл дампа',
            choices: dumpFiles,
            pageSize: 30,
        }
    ]);
    lib.newline();

    const selectedFile = results.dump;

    // Определяем имя таблицы.
    let tableName = _.replace(selectedFile, '-data.sql', '');
    if ((tableName.length === 0) || (tableName === selectedFile)) {
        throw new Error('Не удалось извлечь название таблицы');
    }

    // Ищем соответствующие таблицы в локальной БД.
    let local = {
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: ''
    };

    const connection = await mysqlUtils.getConnection(local);

    const databases = await mysqlUtils.getDatabasesList(connection);

    let matchedDbList = [];
    for (let i = 0; i < databases.length; i++) {
        let db = databases[i];
        // console.log(db);
        await mysqlUtils.selectDb(connection, db);
        const matched = await mysqlUtils.existTable(connection, tableName);
        if (matched) {
            matchedDbList.push(db);
        }
    }

    // Выводим выбор из совпадающих БД.
    results = await inquirer.prompt([
        {
            type: 'list',
            name: 'db',
            message: 'База данных',
            choices: matchedDbList,
            pageSize: 30,
        }
    ]);
    lib.newline();

    const selectedDb = results.db;

    // Переключаемся в выбранную БД.
    await mysqlUtils.selectDb(connection, selectedDb);

    // Очищаем таблицу.
    await connection.execute(`delete from ${tableName}`);

    // Закрываем соединение.
    connection.close();

    // Разворачиваем дамп.
    const status = new Spinner('Выгружаю данные...');
    status.start();

    const passwordOption = local.password.length === 0 ? '' : ' -p {password}';
    const dumpCommand = 'mysql -u {user} -h {host} --port {port} ' + passwordOption + ' {db} < {dumpfile}';
    const dumpCommandParametrized = lib.parametrize(dumpCommand, {
        host: local.host,
        port: local.port,
        user: local.username,
        password: local.password,
        db: selectedDb,
        dumpfile: selectedFile
    });

    let dumpOutput = await lib.shellRun(dumpCommandParametrized);
    status.stop();

    if (_.trim(dumpOutput).length > 0) {
        console.log(dumpOutput);
    }

    console.log('Дамп выгружен.');
};

const dumpData = async () => {
    let remote = credentials.get();
    if (!remote) {
        remote = await credentials.new();
    }

    const connection = await mysql.createConnection({
        host     : remote.host,
        port: remote.port,
        user     : remote.username,
        password : remote.password,
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

    const dumpFileName = lib.parametrize('{table}-data.sql', {
        table: selectedTable
    });
    const dumpFilePath = files.getTempFilePath(dumpFileName);

    const dumpCommand = 'mysqldump --no-create-info -u {user} -p{password} -h {host} --port {port} --single-transaction --skip-lock-tables --default-character-set=utf8mb4 --hex-blob --max-allowed-packet=512000000 {db} {table} > {dumpFilePath}';
    const dumpCommandParametrized = lib.parametrize(dumpCommand, {
        host: remote.host,
        port: remote.port,
        user: remote.username,
        password: remote.password,
        db: selectedDb,
        table: selectedTable,
        dumpFilePath: dumpFilePath
    });

    let dumpOutput = await lib.shellRun(dumpCommandParametrized);
    status.stop();

    if (_.trim(dumpOutput).length > 0) {
        console.log(dumpOutput);
    }

    console.log('Дамп выгружен.');

    // Закрываем соединение.
    connection.close();
};

module.exports = {
    import: applyDump,
    export: dumpData,
};