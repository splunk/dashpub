const fetch = require('node-fetch');
const { XmlDocument } = require('xmldoc');

const splunkd = (method, path, body) => {
    return fetch(`${process.env.SPLUNKD_URL}${path}`, {
        method,
        headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.SPLUNKD_USER}:${process.env.SPLUNKD_PASSWORD}`).toString('base64')}`
        },
        body
    }).then(res => {
        if (res.status > 299) {
            throw new Error(`Splunkd responded with HTTP status ${res.status}`);
        }
        return res.json();
    });
};

const extractDashboardDefinition = xmlSrc => JSON.parse(new XmlDocument(xmlSrc).childNamed('definition').val);

const loadDashboard = (name, app) =>
    splunkd(
        'GET',
        `/servicesNS/${process.env.SPLUNKD_USER}/${encodeURIComponent(app)}/data/ui/views/${encodeURIComponent(name)}?output_mode=json`
    ).then(data => extractDashboardDefinition(data.entry[0].content['eai:data']));

module.exports = {
    splunkd,
    loadDashboard
};
