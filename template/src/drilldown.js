const INTERNAL_LINK_PREFIX = '/en-US/app/splunk-dashboard-app/';

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
