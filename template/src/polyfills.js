export const polyfillTextDecoder = () => {
    if (typeof window !== 'undefined' && typeof window.TextDecoder !== 'function') {
        return import('fast-text-encoding');
    } else {
        return Promise.resolve();
    }
};
