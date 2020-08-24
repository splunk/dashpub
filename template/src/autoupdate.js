import versionFile from './_version.json';

export function startAutoUpdateCheck() {
    if (versionFile.version != null && versionFile.version !== 'dev') {
        console.log('Current version is', versionFile.version);
        setInterval(performUpdateCheck, 30 * 60000);
    }
}

async function performUpdateCheck() {
    try {
        const res = await fetch('/api/version');
        const { version } = await res.json();
        if (version && version !== versionFile.version) {
            console.log('DETECTED NEW VERSION %o (current version is %o)', version, versionFile.version);
            window.location.reload();
        } else {
            console.log('Version %o is still latest', versionFile.version);
        }
    } catch (e) {
        console.error('Update check failed', e);
    }
}
