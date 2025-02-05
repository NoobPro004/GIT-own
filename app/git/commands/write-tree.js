const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const zlib = require('zlib');

function writeFileBlob(currentPath){
    const fileContent = fs.readFileSync(currentPath);
    const fileLength = fileContent.length;
    const header =`blob ${fileLength}\0`;
    const blob = Buffer.concat[Buffer.from(header),fileContent];
    const hash = crypto.createHash("sha1").update(blob).digest("hex");
    const folder = hash.slice(0,2);
    const file = hash.slice(2);
    const completeFolderPath  = path.join(process.cwd(),'.git','objects',folder);
    if(!fs.existsSync(completeFolderPath))fs.mkdirSync(completeFolderPath);

    const compressData = zlib.deflateSync(blob)
    fs.writeFileSync(path.join(completeFolderPath,file),compressData);

    return hash;
}


class WriteTreeCommand{
    constructor(){

    }

    execute(){

        function recursiveCreateTree(basePath){
            const dirContents = fs.readdirSync(basePath);
            const result= [];

            for(const dirContent of dirContents){
                if(dirContent.includes('.git'))continue;


                const currentPath = path.join(basePath,dirContent);
                const stat = fs.statSync(currentPath);
                if(stat.isDirectory()){
                    const sha = recursiveCreateTree(currentPath);
                    if(!!sha)result.push({"mode":"40000","basename":path.basename(currentPath),"sha":sha})
                }else if(stat.isFile()){
                    const sha = writeFileBlob(currentPath);
                    result.push({"mode":"100644","basename":path.basename(currentPath),"sha":sha})
                }

            }

            if(dirContents.length==0 || result.length==0)return null;

            const treeData = result.reduce((acc,current)=>{
                const {mode,basename,sha} = current;
                return Buffer.concat([acc,Buffer.from(`${mode} ${basename}\0`,Buffer.from(sha,'hex'))])
            },Buffer.alloc(0))

            const finaltreeData = Buffer.concat([Buffer.from(`tree ${treeData.length}\0`),treeData]);

            const hash=crypto.createHash("sha1").update(finaltreeData).digest('hex');
            const folder = hash.slice(0,2);
            const file = hash.slice(2);
            const completeFolderPath  = path.join(process.cwd(),'.git','objects',folder);
            if(!fs.existsSync(completeFolderPath))fs.mkdirSync(completeFolderPath);

            const compressData = zlib.deflateSync(finaltreeData)
            fs.writeFileSync(path.join(completeFolderPath,file),compressData);
            return hash;

        }

        const sha = recursiveCreateTree(process.cwd());
        process.stdout.write(sha)
    }
}

module.exports = WriteTreeCommand;