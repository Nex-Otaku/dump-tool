const fs = require('fs');
const path = require('path');

const _ = require('lodash');

module.exports = {

    getFilesWithExtension: (path, extension) => {
        let dirCont = fs.readdirSync(path);
        let pattern = '.*\.(' + extension + ')';
        let regex = new RegExp(pattern, 'ig');
        return dirCont.filter( function( elm ) {return elm.match(regex);});
    },

    getCurrentDirectoryBase: () => {
        return path.basename(process.cwd());
    },

    directoryExists: (filePath) => {
        return fs.existsSync(filePath);
    }
};