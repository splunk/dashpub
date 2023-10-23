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

const fetch = require('node-fetch');
const { XmlDocument } = require('xmldoc');

const noValidateHttpsAgent = new (require('https').Agent)({
    rejectUnauthorized: false,
});

const qs = obj =>
    Object.entries(obj)
        .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
        .join('&');

const splunkd = (
    method,
    path,
    { body, url = process.env.SPLUNKD_URL, username = process.env.SPLUNKD_USER, password = process.env.SPLUNKD_PASSWORD } = {}
) => {
    return fetch(`${url}${path}`, {
        method,
        headers: {
            Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        },
        body,
        agent: url.startsWith('https:') ? noValidateHttpsAgent : undefined,
    }).then(async res => {
        if (res.status > 299) {
            const msg = await extractErrorMessage(res, `Splunkd responded with HTTP status ${res.status} requesting ${path}`);
            throw new Error(msg);
        }
        return res.json();
    });
};

async function extractErrorMessage(response, defaultMsg) {
    if (response.status === 404) {
        return defaultMsg;
    }
    try {
        const json = await response.json();
        console.log(json);
    } catch (e) {
        // ignore
    }
    return defaultMsg;
}

const extractDashboardDefinition = xmlSrc => {
    const doc = new XmlDocument(xmlSrc);
    const def = JSON.parse(doc.childNamed('definition').val);
    const theme = doc.attr['theme'];
    return theme ? { ...def, theme } : def;
};

const loadDashboard = (
    name,
    app,
    { url = process.env.SPLUNKD_URL, username = process.env.SPLUNKD_USER, password = process.env.SPLUNKD_PASSWORD } = {}
) =>
    splunkd('GET', `/servicesNS/-/${encodeURIComponent(app)}/data/ui/views/${encodeURIComponent(name)}?output_mode=json`, {
        url,
        username,
        password,
    }).then(data => extractDashboardDefinition(data.entry[0].content['eai:data']));

const listDashboards = async (
    app,
    { url = process.env.SPLUNKD_URL, username = process.env.SPLUNKD_USER, password = process.env.SPLUNKD_PASSWORD } = {}
) => {
    const res = await splunkd(
        'GET',
        `/servicesNS/-/${encodeURIComponent(app)}/data/ui/views?${qs({
            output_mode: 'json',
            count: 0,
            offset: 0,
            search: `(isDashboard=1 AND isVisible=1 AND (version=2 OR version=1))`,
        })}`,
        {
            url,
            username,
            password,
        }
    );

    return res.entry
        .filter(entry => entry.acl.app === app)
        .map(entry => ({
            name: entry.name,
            label: entry.content.label,
        }));
};

const listApps = async (
    { url = process.env.SPLUNKD_URL, username = process.env.SPLUNKD_USER, password = process.env.SPLUNKD_PASSWORD } = {}
) => {
    const res = await splunkd(
        'GET',
        `/servicesNS/${encodeURIComponent(username)}/-/apps/local?${qs({
            output_mode: 'json',
            /* search: `(isDashboard=1 AND isVisible=1 AND (version=2 OR version=1))`, */
        })}`,
        {
            url,
            username,
            password,
        }
    );

    return res.entry
        /*.filter(entry => entry.content.disabled == '0')*/
        .map(entry => ({
            name: entry.name,
            label: entry.content.label,
        }));
};


async function validateAuth({ url, user, password }) {
    try {
        await splunkd('GET', '/services/server/info', { url, username: user, password });
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = {
    splunkd,
    loadDashboard,
    listDashboards,
    listApps,
    validateAuth,
    qs,
};
