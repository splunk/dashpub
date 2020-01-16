import DataSource from '@splunk/datasources/DataSource';
import DataSet from '@splunk/datasource-utils/DataSet';

export default class PublicDataSource extends DataSource {
    constructor(options = {}, context = {}, ...rest) {
        super(options, context);
        console.log('PublicDataSource', options, context, ...rest);
        if (!this.options.query && !this.options.sid) {
            throw Error('query string or sid is required!');
        }
        this.uri = options.uri;
        this.vizOptions = options.vizOptions;
        this.meta = options.meta;
    }

    request(...args) {
        console.log(this.uri, args);
        return observer => {
            let abortController = new AbortController();
            let aborted = false;

            const abort = () => {
                aborted = true;
                abortController.abort();
            };

            (async () => {
                while (!aborted) {
                    try {
                        const res = await fetch(this.uri);
                        if (res.status > 299) {
                            throw new Error(`HTTP Status ${res.status}`);
                        }
                        const data = await res.json();
                        console.log(data);
                        observer.next({
                            data: DataSet.fromJSONCols(data.fields, data.columns),
                            meta: {},
                            vizOptions: this.vizOptions
                        });
                    } catch (e) {
                        observer.error({
                            level: 'error',
                            message: e.message || 'Unexpected error'
                        });
                    }
                    await new Promise(r => setTimeout(r, 10000));
                }
            })();

            return () => {
                console.log('Terminating datasource subscription for', this.uri);
                abort();
            };
        };
    }
}
