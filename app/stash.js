// console.log(rows[0].solution);

//return null;
// var mysql      = require('mysql');
// var connection = mysql.createConnection({
//     host     : credentials.host,
//     port: credentials.port,
//     user     : credentials.username,
//     password : credentials.password,
// });
/*
    connection.connect();
    await connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
        console.log('Selected.');
        if (error) throw error;
        if (error) {
            inquirer.prompt([
                    {
                        type: 'expand',
                        message: 'Не удалось подключиться: ',
                        name: 'action',
                        choices: [
                            {
                                key: 'r',
                                name: 'Retry',
                                value: 'retry'
                            },
                            {
                                key: 'd',
                                name: 'Delete credentials',
                                value: 'delete'
                            },
                            {
                                key: 'x',
                                name: 'Exit',
                                value: 'exit'
                            }
                        ]
                    }
                ])
                .then(answers => {
                    console.log(answers);
                    if (answers.action === 'retry') {
                        return run();
                    }
                    if (answers.action === 'delete') {
                        lib.clearCredentials();
                    }
                });
        } else {
            console.log('The solution is: ', results[0].solution);

        }
    });
    console.log('Подключились к БД.');
    connection.end();
*/
