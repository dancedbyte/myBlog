---
title: 从零实现一个自己的 CLI
tags: CLI
categories: 前端工程化
date: 2020-09-27
index_img: /img/enj_cli.jpg
---

# 实现一个自己的 CLI
社区上有很多的脚手架工具，如 create-react-app、vue-cli 等。可以帮助我们快速的搭建开发环境，提升效率。

## CLI 原理
1. 创建动态链接库，暴露全局 cli 命令。在 package.json 中编写 bin 命令。

    ```
    # 注意 本地调试时 需执行 npm link 软链接到全局 PATH 环境中
    # #!/usr/bin/env node 在 bin/gkoa 的文件头部标注该注释，标记是 node 环境下可执行文件
    "bin": {
        "gkoa": "bin/gkoa"
    },    
    ```

2. 读取并解析命令行参数，如用户输入的文件夹名称、使用语言等。

3. 提供用户可选的配置项，与用户通过命令行进行交互。

4. 拷贝自定义模板到本地，一般拉取 github 上的写好的模版。

## 代码实战
新建 bin 目录，创建 gkoa.js。文件名需要和 package.json 中 bin 下的命令一致。

```js
#!/usr/bin/env node

const {program} = require('commander'); // 创建命令行工具
const figlet = require('figlet'); // 绘制由特殊字符组成的字体
const Printer = require('@darkobits/lolcatjs'); // 给特殊字体加颜色
const _version = require('../package.json').version; // 获取当前版本号
const inquirer = require('inquirer'); // 与用户交流，例如让用户输入文件夹名称等
const shell = require('shelljs'); // 执行命令行指令，例如 mkdir 等
const download = require('download-git-repo'); // 克隆下载github上的项目
const versionStr = figlet.textSync('gkoa');
const input = `\n \n 基于koa封装，简化路由等写法${_version} \n https://github.com/drawKing/gkoa \n ${versionStr}`;
const transformed = Printer.default.fromString(input);
const chalk = require('chalk'); // 给输出 加颜色
const ora = require('ora'); // 显示loading

program.version(transformed); // 查看 版本时 输出上面构造的特殊字体
program.option('i, init', '👴 初始化项目'); // 自定义命令

const cmdTypes = {
    init(env) {
        inquirer
            .prompt([
                {
                    type: 'text',
                    message: '① 📃请输入文件夹名称',
                    name: 'dirname', // name 是标识
                },
            ])
            .then((answers) => {
                const _pwd = shell.pwd().stdout; // 获取用户输入命令时所在的地址
                const projectPath = `${_pwd}/${answers.dirname}`;

                shell.rm('-rf', projectPath); // 先移除之前老的文件夹
                shell.mkdir(projectPath); // 再创建新的文件夹

                const template= 'direct:https://github.com/drawKing/gkoa.git'; // 项目所在地址
                const spinner = ora('💪 downloading project...'); // loading 样式
                spinner.start(); // 开始loading

                download(template, projectPath, {clone: true}, function (err) {
                    spinner.stop();
                    if (err) {
                        console.log(chalk.red('下载失败 😢'));
                    } else {
                        // 修改新创建出来的项目中，package.json 的name名
                        shell.sed(
                            '-i',
                            'g-koa',
                            answers.dirname,
                            projectPath + '/package.json'
                        );
                        console.log(chalk.green('下载成功 😍'));
                    }
                });
            })
            .catch((error) => {
                console.log(chalk.red('网络错误请重试～ ⚙️'));
            });
    },
};

program
    .usage('[cmd] <options>')
    .arguments('<cmd> [env]')
    .action(function (cmd, env) {
        const handler = cmdTypes[cmd];

        if (handler) {
            handler(env);
        } else {
            console.log(`【${chalk.green(env)}】😢${chalk.red('暂未支持')}`);
        }
    });
program.parse(process.argv); // 解析命令行输入参数
```

## 开始发布
1. 简单几行命令，不过提前要去npm注册账号。

2. 这里第一次发布会报一个错，是因为 npm 需要向你注册的邮箱发一封邮件，你需要去邮件里点下确认，邮件可能被打到了垃圾邮箱。（我找了好久才发现结果被认为是垃圾邮件 😢）

```js
npm adduser // 添加用户

npm login // 登陆

npm version patch // 升级补丁版本号 如 2.1.1 -> 2.1.2

npm version minor // 升级小版本号 如 2.1.0 -> 2.2.0

npm version major // 升级大版本号 如 2.1.0 -> 3.1.0

npm publish // 正式发布
```

## 安装体验
<img src='/img/enj_cli1.jpg' width=500 />

#### 安装
```js
npm install gkoa -g

npm init // 根据提示输入项目名称即可
```

#### 使用
1. 基于 koa 封装，通过装饰器简化路由、自定义中间件等写法。

2. 全局错误捕获机制，写入 logs 目屏幕快照 2020-09-27 下午8.46.41.png录，便于排查问题。

3. 抽离数据库配置文件，通过插件简化 sql 语句。

4. 增加 pm2 部署方式，简便快捷！ 
