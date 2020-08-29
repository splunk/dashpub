export default function NoSSR({ children }) {
    return process.browser ? children : null;
}
