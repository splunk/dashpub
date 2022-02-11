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

const INTERNAL_LINK_PREFIX = '/en-US/app/search/';

export default class DrilldownHandler {
    constructor(options = {}) {
        this.options = options;
        this.events = Array.isArray(options.events) ? options.events : ['any'];
    }

    canHandle(event) {
        return (
            event &&
            event.type !== 'range.select' &&
            this.options &&
            !!this.options.url &&
            (this.events.includes('any') || this.events.includes(event.type))
        );
    }

    handle() {
        const { url, newTab } = this.options;

        if (url.indexOf(INTERNAL_LINK_PREFIX) === 0) {
            const dashboard = url.slice(INTERNAL_LINK_PREFIX.length);
            return Promise.resolve([
                {
                    type: 'linkTo',
                    payload: {
                        url: `/${dashboard}`,
                        newTab: newTab,
                    },
                },
            ]);
        }

        return Promise.resolve([
            {
                type: 'linkTo',
                payload: {
                    url: url,
                    newTab: newTab,
                },
            },
        ]);
    }
}
