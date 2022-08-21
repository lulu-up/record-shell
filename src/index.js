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
    // var red = "\033[31m red \033[0m";
    // console.log('111', red)

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
    .action(async (name, options) => {
        const shellList = getShellList();
        const choices = shellList.map(item => ({
            key: item.name,
            name: `${item.name}${options.detailed ? ': ' + item.command : ''}`,
            value: item.command
        }));

        if (choices.length === 0) {
            console.log(chalk.red(`
            您当前没有录入命令, 可使用 ${chalk.blue('rs add')} 进行添加
            `))
            return
        }

        const answer = await inquirer.prompt([{
            name: "key",
            type: "rawlist",
            message: "选择要执行的命令",
            choices
        }])

        // 可拆开也是个
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
    .action(async (name) => {
        const answer = await inquirer.prompt([{
            name: "name",
            type: "input",
            message: "命令名称:",
        }, {
            name: "command",
            type: "input",
            message: "命令语句, 可采用[var]的形式传入变量:",
        }])
        if (answer.command) {
            const data = getShellList();
            data.push({
                "name": answer.name,
                "command": answer.command
            })
            fs.writeFileSync(dataPath, JSON.stringify(data));

            console.log(chalk.green(`
            >>> 添加成功 <<<
            `))
        }
    })

program
    .command(commandConfig.rm.name)
    .description(commandConfig.rm.description)
    .action(async () => {
        const answer = await inquirer.prompt([{
            name: "urls",
            type: "checkbox",
            message: `请${chalk.blue('选择')}要删除的记录`,
            choices: getShellList().map((item, i) => ({
                key: item.name,
                name: item.name,
                value: i
            })),
            validate: ((r) => {
                if (r.length) return true
            })
        }])
        let data = getShellList()
        data = data.filter((_, index) => {
            return !answer.urls.includes(index)
        })
        fs.writeFileSync(dataPath, JSON.stringify(data));

        console.log(chalk.green(`
        成功移除 ${answer.urls.length} 条记录
        `))
    })

program.parse(argv)
