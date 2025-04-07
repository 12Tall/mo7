import 'colors'
import { NodeSSH } from "node-ssh";

const ssh = new NodeSSH()  

await ssh.connect({
    host: "192.168.1.125",
    username: 'dev',
    password: 'dev'
})
console.log(`execute command: uptime`.blue);
let resp =await ssh.execCommand('uptime')
console.log(resp.stdout.green);
console.log(`execute command: ls`.blue);
resp =await ssh.execCommand('ls')
console.log(resp.stdout.green);
