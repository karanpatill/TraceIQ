const unzipper = require('unzipper');

async function readZip(zippath){
    const directory = await unzipper.Open.file(zippath);
    const files = [];
    for(const file of directory.files){
        if(file.type === 'File'){
            files.push({ path: file.path, size: file.size });
        }
    }
    return files;
}

module.exports = {readZip};