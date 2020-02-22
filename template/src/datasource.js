import DataSource from '@splunk/datasources/DataSource';
import DataSet from '@splunk/datasource-utils/DataSet';

class DataSourceManager {
    dataSources = new Set();
    subscribers = new Set();

    register = ds => {
        this.dataSources.add(ds);
    };

    unregister = ds => {
        this.dataSources.delete(ds);
    };

    subscribe = callback => {
        this.subscribers.add(callback);
        return () => {
            this.subscribers.delete(callback);
        };
    };

    trigger = () => {
        if (!this.subscribers.size) {
            return;
        }
    };
}

export const dataSourceManager = new DataSourceManager();

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
            dataSourceManager.register(this);
            let abortController = new AbortController();
            let aborted = false;

            const abort = () => {
                aborted = true;
                abortController.abort();
            };

            (async () => {
                let initial = true;
                while (!aborted) {
                    try {
                        const res = await fetch(this.uri);
                        if (res.status > 299) {
                            throw new Error(`HTTP Status ${res.status}`);
                        }
                        const data = await res.json();
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
                    await new Promise(r => setTimeout(r, 10000));
                }
            })();

            return () => {
                dataSourceManager.unregister(this);
                abort();
            };
        };
    }
}
