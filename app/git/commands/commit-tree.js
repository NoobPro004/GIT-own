const path = require('path')
const fs = require('fs');
const crypto = require('crypto');
const zlib = require('zlib');

class CommitTreeCommand {
    constructor(treeSHA, commitSHA, commitMessage) {
        this.treeSHA = treeSHA;
        this.commitMessage = commitMessage;
        this.commitSHA = commitSHA;
    }

    execute() {
        const commitContentBuffer = Buffer.concat([
            Buffer.from(`tree ${this.treeSHA}\n`),
            Buffer.from(`parent ${this.commitSHA}\n`),
            Buffer.from(`author Himanshu garg <himanshu.garg@gmail.com> ${Date.now()} +000\n`),
            Buffer.from(`commiter Himanshu garg <himanshu.garg@gmail.com> ${Date.now()} +000\n\n`),
            Buffer.from(`${this.commitMessage}\n`)
        ]);

        const header = `commit ${commitContentBuffer.length}\0`;
        const data = Buffer.concat([Buffer.from(header),commitContentBuffer]);

        const hash = crypto.createHash('sha1').update(data).digest("hex");
        const folder = hash.slice(0, 2);
        const file = hash.slice(2);
        const completeFolderPath = path.join(process.cwd(), '.git', 'objects', folder);
        if (!fs.existsSync(completeFolderPath)) fs.mkdirSync(completeFolderPath);

        const compressData = zlib.deflateSync(data)
        fs.writeFileSync(path.join(completeFolderPath, file), compressData);
        process.stdout.write(hash);
    }
}