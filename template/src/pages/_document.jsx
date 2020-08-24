import Document, { Main, Head, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const sheet = new ServerStyleSheet();
        const originalRenderPage = ctx.renderPage;

        try {
            ctx.renderPage = () =>
                originalRenderPage({
                    enhanceApp: App => props => sheet.collectStyles(<App {...props} />),
                });

            const initialProps = await Document.getInitialProps(ctx);
            return {
                ...initialProps,
                styles: (
                    <>
                        {initialProps.styles}
                        {sheet.getStyleElement()}
                    </>
                ),
            };
        } finally {
            sheet.seal();
        }
    }

    render() {
        return (
            <html lang="en">
                <Head>
                    <style
                        dangerouslySetInnerHTML={{
                            __html: `
                                html,
                                body {
                                    margin: 0;
                                    padding: 0;
                                    font-family: 'Splunk Platform Sans';
                                }
                                @font-face {
                                    font-family: 'Splunk Platform Sans';
                                    src: url('/fonts/proxima-regular-webfont.woff') format('woff');
                                    font-style: normal;
                                    font-weight: normal;
                                }
                                @font-face {
                                    font-family: 'Splunk Platform Sans';
                                    src: url('/fonts/proxima-semibold-webfont.woff') format('woff');
                                    font-style: normal;
                                    font-weight: 500;
                                }
                                @font-face {
                                    font-family: 'Splunk Platform Sans';
                                    src: url('/fonts/proxima-bold-webfont.woff') format('woff');
                                    font-style: normal;
                                    font-weight: 700;
                                }
                                @font-face {
                                    font-family: 'Splunk Platform Mono';
                                    src: url('/fonts/inconsolata-regular.woff') format('woff');
                                    font-style: normal;
                                    font-weight: normal;
                                }
                                @font-face {
                                    font-family: 'Splunk Data Sans';
                                    src: url('/fonts/splunkdatasans-regular.woff2') format('woff2');
                                    font-style: normal;
                                    font-weight: normal;
                                }
                                @font-face {
                                    font-family: 'Splunk Data Sans';
                                    src: url('/fonts/splunkdatasans-semibold.woff2') format('woff2');
                                    font-style: normal;
                                    font-weight: 500;
                                }
                                @font-face {
                                    font-family: 'Splunk Data Sans';
                                    src: url('/fonts/splunkdatasans-bold.woff2') format('woff2');
                                    font-style: normal;
                                    font-weight: bold;
                                }
                    `.replace(/\s+/g, ' '),
                        }}
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        );
    }
}
