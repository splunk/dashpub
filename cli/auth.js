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

const { getPackageJson } = require('./pkgjson');
const { writeDotenv } = require('./env');
const { splunkdPassword } = require('./prompts');

async function updatePassword() {
    const pkg = await getPackageJson();
    const { user, url } = pkg.dashpub.splunkd;

    console.log(`Enter password for user ${user} at ${url}`);
    const password = await splunkdPassword(url, user);

    await writeDotenv({
        splunkdUrl: url,
        splunkdUser: user,
        splunkdPassword: password,
        splunkdToken: ""
    });

    return { username: user, password, url };
}

async function ensureAuth() {
    if (!process.env.SPLUNKD_PASSWORD && !process.env.SPLUNKD_TOKEN) {
        return await updatePassword();
    }

    const pkg = await getPackageJson();
    const { user, url } = pkg.dashpub.splunkd;
    return { username: user, url, password: process.env.SPLUNKD_PASSWORD, token: process.env.SPLUNKD_TOKEN };
}

module.exports = {
    updatePassword,
    ensureAuth,
};
