const fs = require('fs');
const path = require('path');

const _ = require('lodash');

module.exports = {

    getFilesWithRegex: (path, regex) => {
        let dirCont = fs.readdirSync(path);
        return dirCont.filter( function( elm ) {return elm.match(regex);});
    },

    getCurrentDirectoryBase: () => {
        return path.basename(process.cwd());
    },

    directoryExists: (filePath) => {
        return fs.existsSync(filePath);
    }
};