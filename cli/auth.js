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
    });

    return { username: user, password, url };
}

async function ensureAuth() {
    if (!process.env.SPLUNKD_PASSWORD) {
        return await updatePassword();
    }

    const pkg = await getPackageJson();
    const { user, url } = pkg.dashpub.splunkd;
    return { username: user, url, password: process.env.SPLUNKD_PASSWORD };
}

module.exports = {
    updatePassword,
    ensureAuth,
};
