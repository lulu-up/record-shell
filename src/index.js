const fs = require("fs");
const path = require("path");
const process = require('process');
const inquirer = require("inquirer");
const chalk = require('chalk') // 要用4版本  5报错
const child_process = require('child_process');

const argv = process.argv;
const program = require('./init-config').program;
const commandConfig = require('./init-config').config;
const dataPath = path.join(__dirname, "../env/record-list.json")


function getShellList() {
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    return data || [];
}

function handleExec(command) {
    console.log(`
    执行:  ${chalk.green(command)}
    `)
    child_process.exec(command, function (error, stdout) {
        console.log(`${stdout}`)
        if (error !== null) {
            console.log('error: ' + error);
        }
    });
}

const optionsReg = /\[.*?\]/g;

function getShellOptions(command) {
    const arr = command.match(optionsReg) || [];
    if (arr.length) {
        return arr.map((message) => ({
            name: message, // 重名只执行一次, 因为他是参数名
            type: "input",
            message,
        }));
    } else {
        return []
    }
}

function answerOptions2Command(command, answerMap) {
    for (let key in answerMap) {
        command = command.replace(`[${key}]`, answerMap[key])
    }
    return command;
}

program
    .command(commandConfig.ls.name)
    .alias(commandConfig.ls.alias)
    .description(commandConfig.ls.description)
    .option('-a detailed') // detailed 居然是参数名
    .action(async (_, options) => {
        const shellList = getShellList();
        const choices = shellList.map(item => ({
            key: item.name,
            name: `${item.name}${options.detailed ? ': ' + item.command : ''}`,
            value: item.command
        }));

        if (choices.length === 0) {
            console.log(chalk.red(`
            您当前没有录入命令, 可使用 ${chalk.blue('rs ' + commandConfig.add.name)} 进行添加
            `))
            return
        }

        const answer = await inquirer.prompt([{
            name: "key",
            type: "rawlist",
            message: "选择要执行的命令",
            choices
        }])

        const shellOptions = getShellOptions(answer.key)

        if (shellOptions.length) {
            const answerMap = await inquirer.prompt(shellOptions)
            const command = answerOptions2Command(answer.key, answerMap)
            handleExec(command)
        } else {
            handleExec(answer.key)
        }


    })

program
    .command(commandConfig.add.name)
    .description(commandConfig.add.description)
    .action(async () => {
        const answer = await inquirer.prompt([{
            name: "name",
            type: "input",
            message: "命令名称:",
            validate: ((name) => {
                if (name !== '') return true
            })
        }, {
            name: "command",
            type: "input",
            message: "命令语句, 可采用[var]的形式传入变量:",
            validate: ((name) => {
                if (name !== '') return true
            })
        }])

        let shellList = getShellList();
        shellList = shellList.filter((item) => item.name !== answer.name);
        shellList.push({
            "name": answer.name,
            "command": answer.command
        })
        fs.writeFileSync(dataPath, JSON.stringify(shellList));

        console.log(chalk.green(`
            >>> 添加成功 <<<
            `))

    })

program
    .command(commandConfig.rm.name)
    .description(commandConfig.rm.description)
    .action(async () => {
        let shellList = getShellList();
        const choices = shellList.map((item) => ({
            key: item.name,
            name: item.name,
            value: item.name,
        }));
        const answer = await inquirer.prompt([{
            name: "names",
            type: "checkbox",
            message: `请${chalk.blue('选择')}要删除的记录`,
            choices,
            validate: ((_choices) => {
                if (_choices.length) return true
            })
        }])

        shellList = shellList.filter((item) => {
            return !answer.names.includes(item.name)
        })
        fs.writeFileSync(dataPath, JSON.stringify(shellList));

        console.log(chalk.green(`
        成功移除 ${answer.names.length} 条记录
        `))
    })

program.parse(argv)
