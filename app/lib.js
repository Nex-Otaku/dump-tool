const exec = require('child-process-promise').exec;

const _ = require('lodash');

const pressAnyKey = require('press-any-key');



module.exports = {

    parametrize: (template, parameters) => {
        let templatePrepared = _.replace(template, new RegExp('\{(\\w+)\}', 'g'), '<%= $1 %>');
        let parametrizeFunction = _.template(templatePrepared);
        return parametrizeFunction(parameters);
    },

    shellRun: async (command) => {
        return exec(command)
            .then(function (result) {
                var stderr = result.stderr;
                if (stderr.length > 0) {
                    throw new Error(stderr);
                }
                return result.stdout;
            })
            .catch(function (err) {
                console.error('ERROR: ', err);
            });
    },

    newline: () => {
        console.log();
    },

    extractColumn: (arr, column) => {
        return arr.map(x => x[column])
    },

    extractFirstColumn: (arr) => {
        return arr.map(x => x[Object.keys(x)[0]]);
    },

    keypress: async () => {
        console.log();
        return pressAnyKey('Нажмите любую клавишу...');
    }
};