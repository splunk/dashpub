const inquirer = require('inquirer');
const fetch = require('node-fetch');
const { validateAuth } = require('./splunkd');

const noValidateHttpsAgent = new (require('https').Agent)({
    rejectUnauthorized: false,
});

inquirer.registerPrompt('checkbox-plus', require('inquirer-checkbox-plus-prompt'));

const string = (prompt, opts) =>
    inquirer
        .prompt({
            name: 'value',
            message: prompt,
            ...opts,
        })
        .then(({ value }) => value);

const confirm = prompt =>
    inquirer
        .prompt({
            type: 'confirm',
            name: 'confirmed',
            message: prompt,
        })
        .then(r => r.confirmed);

const splunkdUrl = () =>
    inquirer
        .prompt({
            name: 'splunkdurl',
            message: 'Enter the splunkd URL of the splunk service you want to connect to:',
            default: 'https://localhost:8089',
            // default: 'https://my.splunkserver.com:8089',

            validate: async input => {
                if (input === 'https://my.splunkserver.com:8089') {
                    throw new Error(`Don't use the example ;)`);
                }
                let url;
                try {
                    url = new URL(input);
                } catch (e) {
                    throw new Error(`Invalid URL: ${e.message}`);
                }

                try {
                    url.pathname = '/';
                    url.search = '?output_mode=json';
                    const res = await fetch(url, {
                        method: 'GET',
                        agent: url.protocol === 'https:' ? noValidateHttpsAgent : undefined,
                    });

                    if (res.status !== 200) {
                        throw new Error(`Received unexpected response: HTTP status ${res.status}`);
                    }

                    const { generator } = await res.json().catch(() => ({}));

                    if (generator == null || generator.version == null) {
                        throw new Error('Received unexpected response, is this splunkd?');
                    }
                } catch (e) {
                    throw new Error(`Failed to connect to splunkd: ${e.message}`);
                }

                return true;
            },
        })
        .then(({ splunkdurl }) => splunkdurl);

const splunkdUsername = (defaultUser = 'admin') =>
    inquirer
        .prompt({
            name: 'username',
            message: 'Splunk user:',
            default: defaultUser,
        })
        .then(({ username }) => username);

const splunkdPassword = (url, user) =>
    inquirer
        .prompt({
            type: 'password',
            name: 'password',
            message: 'Password:',
            default: 'changeme',
            async validate(pwd) {
                try {
                    await validateAuth({ url, user, password: pwd });
                } catch (e) {
                    throw new Error(`Failed to validate password: ${e.message}`);
                }
                return true;
            },
        })
        .then(({ password }) => password);

const selectDashboards = dashboards =>
    inquirer
        .prompt({
            type: 'checkbox-plus',
            name: 'dashboards',
            message: 'Select one or more dashboards you want to publish',
            pageSize: 10,
            highlight: true,
            searchable: true,
            source: async (selected, input) => {
                const search = (input || '').toLowerCase();
                const matching = dashboards.filter(d => d.name.toLowerCase().includes(search) || d.label.toLowerCase().includes(search));
                return matching.map(({ name, label }) => ({ name: `${label} [${name}]`, short: label, value: name }));
            },
            validate: selected => {
                if (selected.length > 0) {
                    return true;
                }
                throw new Error('Please select one or more dashboards');
            },
        })
        .then(({ dashboards }) => dashboards);

module.exports = {
    string,
    confirm,
    splunkdUrl,
    splunkdUsername,
    splunkdPassword,
    selectDashboards,
};
