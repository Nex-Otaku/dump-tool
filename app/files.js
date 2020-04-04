const fs = require('fs');
const path = require('path');

const os = require('os');

const _ = require('lodash');

const getTempDirectoryName = () => {
    return 'dump-tool';
};

const getTempDirectoryPath = () => {
    const tempRoot = os.tmpdir();
    const dirName = getTempDirectoryName();
    const tempDirectoryPath = path.join(tempRoot, dirName);
    if (!directoryExists(tempDirectoryPath)) {
        fs.mkdirSync(tempDirectoryPath);
    }
    return tempDirectoryPath;
};

const getTempFilePath = (fileName) => {
    return path.join(getTempDirectoryPath(), fileName);
};

const directoryExists = (filePath) => {
    return fs.existsSync(filePath);
};

const getFilesWithRegex = (path, regex) => {
    let dirCont = fs.readdirSync(path);
    return dirCont.filter( function( elm ) {return elm.match(regex);});
};

const deleteFile = (filePath) => {
    return fs.unlinkSync(filePath);
};


module.exports = {

    getFilesWithRegex: getFilesWithRegex,

    getCurrentDirectoryBase: () => {
        return path.basename(process.cwd());
    },

    directoryExists: directoryExists,

    getTempDirectoryPath: getTempDirectoryPath,

    getTempFilePath: getTempFilePath,

    deleteFile: deleteFile
};