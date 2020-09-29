/*
Copyright 2020 Splunk Inc. 

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const { cli } = require('cli-ux');
const chalk = require('chalk');
const execa = require('execa');

class ExecError extends Error {
    constructor(message, code, stdout, stderr) {
        super(message);
        this.code = code;
        this.stdout = stdout;
        this.stderr = stderr;
    }
}

class Secret {
    constructor(value) {
        this.value = value;
    }
}

const exec = async (cmd, args, options) => {
    try {
        const rawArgs = args.map(a => (a instanceof Secret ? a.value : a));
        const displayArgs = args.map(a => (a instanceof Secret ? '*******' : a));
        cli.action.start(`${chalk.yellow('$')} ${cmd} ${displayArgs.join(' ')}`);
        const res = await execa(cmd, rawArgs, options);
        cli.action.stop(chalk.green('OK'));
        return res;
    } catch (e) {
        cli.action.stop(chalk.red('FAILED'));
        console.error(chalk.red(e.stderr));
        const code = e.code;
        throw new ExecError(`${cmd} exited with code ${code}`, code, e.stdout, e.stderr);
    }
};

module.exports = {
    exec,
    Secret,
};
