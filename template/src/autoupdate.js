const VERSION = process.env.DASHPUB_BUILD_ID || 'dev';

export function startAutoUpdateCheck() {
    if (VERSION != null && VERSION !== 'dev') {
        console.log('Current version is', VERSION);
        setInterval(performUpdateCheck, 30 * 60000);
    }
}

async function performUpdateCheck() {
    try {
        const res = await fetch('/api/version');
        const { version } = await res.json();
        if (version && version !== VERSION) {
            console.log('DETECTED NEW VERSION %o (current version is %o)', version, VERSION);
            window.location.reload();
        } else {
            console.log('Version %o is still latest', VERSION);
        }
    } catch (e) {
        console.error('Update check failed', e);
    }
}
