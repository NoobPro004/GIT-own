const fs = require("fs");
const path = require("path");
const GitClient =  require('./git/client')
const {CatFileCommand, HashObjectCommand, LsTreeCommand, WriteTreeCommand, CommitTreeCommand} = require('./git/commands');
const { transferableAbortSignal } = require("util");
// You can use print statements as follows for debugging, they'll be visible when running tests.

const gitClient = new GitClient()
// Uncomment this block to pass the first stage
const command = process.argv[2];
//
switch (command) {
  case "init":
    createGitDirectory();
    break;
  case "cat-file":
    handleFileCommand();
    break;
  case 'hash-object':
    handleHashFileCommand();
    break;
  case 'ls-tree':
    handleLsTreeCommand();
    break;
  case 'write-tree':
    handleWriteTreeCommand();
    break;
  case 'commit-tree':
    handleCommitTreeCommand();
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}

function createGitDirectory() {
  fs.mkdirSync(path.join(process.cwd(), ".git"), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), ".git", "objects"), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), ".git", "refs"), { recursive: true });

  fs.writeFileSync(path.join(process.cwd(), ".git", "HEAD"), "ref: refs/heads/main\n");
  console.log("Initialized git directory");
}


function handleFileCommand(){
    const flag = process.argv[3]
    const commitsha = process.argv[4]

    const command = new CatFileCommand(flag,commitsha);
    gitClient.run(command)
}

function handleHashFileCommand(){
    let flag = process.argv[3]
    let filepath = process.argv[4]

    if(!filepath){
        filepath=flag
        flag=null
    }


    const hashObjectCommand = new HashObjectCommand(flag,filepath);
    gitClient.run(hashObjectCommand)

}

function handleLsTreeCommand(){
  const flag = process.argv[3]
  const commitsha = process.argv[4]

  if(!commitsha && flag=='--name-only'){
    throw new Error('SHA is required.')
  }

  if(!commitsha){
    commitsha=flag;
    flag=null;
  }

  const lsTree = LsTreeCommand(flag,commitsha)
  gitClient.run(lsTree)
}

function handleWriteTreeCommand(){
  const writeTreeCommand = WriteTreeCommand();
  gitClient.run(writeTreeCommand)
}

function handleCommitTreeCommand(){
  const treeSHA = process.argv[3];
  const commitSHA = process.argv[5];
  const commitMessage = process.argv[7];

  const command = CommitTreeCommand(treeSHA,commitSHA,commitMessage);
  gitClient.run(command)

}