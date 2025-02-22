const path = require('path')
const fs = require('fs');
const crypto = require('crypto');
const zlib = require('zlib');

class HashObjectCommand{
    constructor(flag,filepath){
        this.flag=flag;
        this.filepath=filepath;
    }

    execute(){
        const completefilepath = path.resolve(this.filepath)
        if(!fs.existsSync(completefilepath)){
            throw new Error(`could not open ${this.filepath} for reading: No such file or directory`)
        }

        const fileContent = fs.readFileSync(completefilepath);
        const fileLength = fileContent.length;
        const header = `blob ${fileLength}\0`;
        const blob = Buffer.concat([Buffer.from(header),fileContent]);
        const hash = crypto.createHash('sha1').update(blob).digest("hex");

        if(this.flag && this.flag === '-w'){
            const folder = hash.slice(0,2);
            const file = hash.slice(2);
            const completeFolderPath  = path.join(process.cwd(),'.git','objects',folder);
            if(!fs.existsSync(completeFolderPath))fs.mkdirSync(completeFolderPath);

            const compressData = zlib.deflateSync(blob)
            fs.writeFileSync(path.join(completeFolderPath,file),compressData);
        }

        process.stdout.write(hash); 
    }
}


module.exports = HashObjectCommand; 