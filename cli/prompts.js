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
            default: 'https://my.splunkserver.com:8089',

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

        const selectApps = async applist => {
            const selectedApp = await inquirer.prompt({
              type: 'list',
              name: 'apps',
              message: 'Select the app containing the dashboards you want to publish.',
              pageSize: 10,
              highlight: true,
              searchable: true,
              choices: async (selected, input) => {
                const search = (input || '').toLowerCase();
                const matching = applist.filter(d => d.name.toLowerCase().includes(search) || d.label.toLowerCase().includes(search));
                return matching.map(({ name, label }) => ({ name: `${label} [${name}]`, short: label, value: name }));
              },
              validate: selected => {
                if (selected.length > 0) {
                  return true;
                }
                throw new Error('Please select an app');
              },
            });
            return selectedApp.apps; // Corrected: Return the selected app's name
          };
          

module.exports = {
    string,
    confirm,
    splunkdUrl,
    splunkdUsername,
    splunkdPassword,
    selectDashboards,
    selectApps,
};
