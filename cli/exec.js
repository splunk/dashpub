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
