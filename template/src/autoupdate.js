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

const VERSION = process.env.DASHPUB_BUILD_ID || 'dev';

export function startAutoUpdateCheck() {
    if (VERSION != null && VERSION !== 'dev') {
        console.log('Current version is', VERSION);
        setInterval(performUpdateCheck, 5 * 60000);
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
