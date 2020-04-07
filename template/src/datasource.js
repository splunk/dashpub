import DataSource from '@splunk/datasources/DataSource';
import DataSet from '@splunk/datasource-utils/DataSet';

async function waitForRefresh(regularInterval, backgroundInterval) {
    if (document.visibilityState == null || document.visibilityState === 'visible') {
        return new Promise(resolve => setTimeout(resolve, regularInterval));
    }
    return new Promise(resolve => {
        let done, timer;
        const cb = () => {
            if (document.visibilityState === 'visible') {
                done();
            }
        };
        document.addEventListener('visibilitychange', cb);
        done = () => {
            clearTimeout(timer);
            document.removeEventListener('visibilitychange', cb);
            resolve();
        };
        timer = setTimeout(done, backgroundInterval);
    });
}

export default class PublicDataSource extends DataSource {
    state = { type: 'init' };

    constructor(options = {}, context = {}, ...rest) {
        super(options, context);
        this.uri = options.uri;
        this.vizOptions = options.vizOptions;
        this.meta = options.meta;
    }

    request(...args) {
        return observer => {
            let aborted = false;

            (async () => {
                let initial = true;
                while (!aborted) {
                    try {
                        const res = await fetch(this.uri);
                        if (res.status > 299) {
                            throw new Error(`HTTP Status ${res.status}`);
                        }
                        const data = await res.json();
                        if (data.error) {
                            throw new Error(data.error);
                        }
                        observer.next({
                            data: DataSet.fromJSONCols(data.fields, data.columns),
                            meta: {},
                            vizOptions: this.vizOptions,
                        });
                    } catch (e) {
                        if (initial) {
                            observer.error({
                                level: 'error',
                                message: e.message || 'Unexpected error',
                            });
                        }
                        this.state = {
                            type: 'error',
                            message: e.message || 'Unexpected error',
                        };
                        observer.next({
                            data: DataSet.empty(),
                            meta: {},
                            vizOptions: this.vizOptions,
                        });
                    }
                    initial = false;
                    await waitForRefresh(30 * 1000, 600 * 1000);
                }
            })();

            return () => {
                aborted = true;
            };
        };
    }
}
