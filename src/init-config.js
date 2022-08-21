const fs = require("fs");
const path = require("path");
const program = require('commander');
const packagePath = path.join(__dirname, "../package.json")
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

const config = {
    "ls": {
        "name": 'ls [type]',
        "alias": "l",
        "description": "查看全部命令 --> 选择并执行"
    },
    "rm": {
        "name": 'rm',
        "alias": "",
        "description": "移除命令"
    },
    "add": {
        "name": 'add',
        "alias": "",
        "description": "添加命令"
    }
}

// 版本号
program.version(packageData.version)

// -h 展示
// for (let key in config) {
//     const item = config[key];
//     program.option(item.name, item.description)
// }

module.exports = {
    program,
    config
};
