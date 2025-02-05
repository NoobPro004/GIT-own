const path = require('path');
const fs = require('fs');
const zlib = require('zlib');

class LsTreeCommand{
    constructor(flag,sha){
        this.flag = flag;
        this.sha=sha;
    }

    execute(){

        const flag=this.flag;
        const sha= this.sha;
         
        const folder = sha.slice(0,2);
        const file = sha.slice(2);

        const folderpath=path.join(process.cwd(),'.git','objects',folder);
        const filepath = path.join(folderpath,file);

        if(!fs.existsSync(folderpath) || !fs.existsSync(filepath)){
            throw new Error(`Not a valid object name! ${sha}`);
        }

        const fileContent = fs.readFileSync(filepath);
        const outputBuffer = zlib.inflateSync(fileContent);
        const output = outputBuffer.toString().split("\0")[1];
        const treeContent = output.slice(1).filter((e)=>e.includes(" "));
        const names = treeContent.map((e)=>e.split(" ")[1]);
        names.foeEach((e)=> process.stdout.write(`${e}\n`));

    }
}


module.exports = LsTreeCommand; 