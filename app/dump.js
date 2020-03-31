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
    if (connection === null) {
        return;
    }

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
    try {
        await connection.execute(`SET SESSION FOREIGN_KEY_CHECKS=0`);
        await connection.execute(`delete from ${tableName}`);
    } catch (e) {
        console.error(e);
        return;
    }

    // Закрываем соединение.
    connection.close();

    // Разворачиваем дамп.
    const status = new Spinner('Выгружаю данные...');
    status.start();

    const dumpFilePath = files.getTempFilePath(selectedFile);

    const passwordOption = local.password.length === 0 ? '' : ' -p "{password}"';
    const dumpCommand = 'mysql -u {user} -h {host} --port {port} ' + passwordOption + ' {db} < {dumpfile}';
    const dumpCommandParametrized = lib.parametrize(dumpCommand, {
        host: local.host,
        port: local.port,
        user: local.username,
        password: local.password,
        db: selectedDb,
        dumpfile: dumpFilePath
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

    const connection = await mysqlUtils.getConnection(remote);
    if (connection === null) {
        return;
    }

    // Выбираем БД для дампа из списка.
    let [rows, fields] = await connection.execute('show databases');
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

    const dumpCommand = 'mysqldump --set-gtid-purged=OFF --no-create-info -u {user} -p"{password}" -h {host} --port {port} --single-transaction --skip-lock-tables --default-character-set=utf8mb4 --hex-blob --max-allowed-packet=512000000 {db} {table} > {dumpFilePath}';
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

const makeDbCopy = async () => {
    // Выбираем локальную БД
    const connection = await mysqlUtils.getConnection(mysqlUtils.getLocalConnectionCredentials());
    if (connection === null) {
        return;
    }

    const databases = await mysqlUtils.getDatabasesList(connection);

    let results = await inquirer.prompt([
        {
            type: 'list',
            name: 'db',
            message: 'База данных',
            choices: databases,
            pageSize: 30,
        }
    ]);

    lib.newline();

    const selectedDb = results.db;

    // Вводим название новой БД
    const generatedCopyName = selectedDb + '_copy';

    results = await inquirer.prompt([
        {
            name: 'destination',
            type: 'input',
            message: 'Название копии:',
            default: generatedCopyName,
            validate: function( value ) {
                if (value.length) {
                    return true;
                } else {
                    return 'Введите имя копии БД';
                }
            }
        }]);

    const destinationDb = results.destination;

    // Удаляем БД назначения, если есть
    await connection.execute(`DROP DATABASE IF EXISTS ${destinationDb}`);

    // Создаём БД назначения
    await connection.execute(`CREATE DATABASE ${destinationDb}`);

    // Закрываем соединение.
    connection.close();

    // Создаём копию всех таблиц и данных.
    const status = new Spinner('Копирую БД...');
    status.start();

    // Копируем структуру и данные в БД назначения
    const local = mysqlUtils.getLocalConnectionCredentials();
    const passwordOption = local.password.length === 0 ? '' : ' -p "{password}"';

    const copyCommand = 'mysqldump -u {user} ' + passwordOption + ' -h {host} --port {port} --single-transaction --skip-lock-tables --default-character-set=utf8mb4 --hex-blob --max-allowed-packet=512000000 {sourceDb} | mysql -u {user} -h {host} --port {port} ' + passwordOption + ' {destinationDb}';
    const copyCommandParametrized = lib.parametrize(copyCommand, {
        host: local.host,
        port: local.port,
        user: local.username,
        password: local.password,
        sourceDb: selectedDb,
        destinationDb: destinationDb,
    });

    let output = await lib.shellRun(copyCommandParametrized);
    status.stop();

    if (_.trim(output).length > 0) {
        console.log(output);
    }

    console.log('Создана копия БД.');
};

module.exports = {
    import: applyDump,
    export: dumpData,
    makeCopy: makeDbCopy,
};