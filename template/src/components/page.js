import React from 'react';
import { createGlobalStyle } from 'styled-components';
import Head from 'next/head';
import ThemeProvider, { baseThemeVar } from '../theme';

const TITLE_SUFFIX = 'Splunk Dashboard';

const THEME_MAP = {
    light: 'enterprise',
    dark: 'enterpriseDark',
};

const GlobalBackgroundStyle = createGlobalStyle`
    html, body {
        background-color: ${(props) => props.backgroundColor || baseThemeVar('backgroundColor')(props)};
    }
`;

const fullUrl = (baseUrl, path) => {
    if (!baseUrl) {
        return path;
    }
    const u = new URL(baseUrl);
    u.pathname = path;
    return u.href;
};

export default function Page({
    title,
    description,
    theme = 'light',
    backgroundColor,
    imageUrl,
    imageSize = { width: 700, height: 340 },
    path,
    baseUrl,
    children,
}) {
    return (
        <>
            <Head>
                <title>
                    {title} - {TITLE_SUFFIX}
                </title>
                {description && <meta name="description" content={description} />}
                <meta name="author" content="Splunk" />
                <meta property="og:title" content={`${title} - ${TITLE_SUFFIX}`} />
                {description && <meta property="og:description" content={description} />}
                {imageUrl != null && baseUrl != null && (
                    <>
                        <meta property="og:image" content={fullUrl(baseUrl, imageUrl)} />
                        <meta property="og:image:width" content={imageSize.width} />
                        <meta property="og:image:height" content={imageSize.height} />
                    </>
                )}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${title} - ${TITLE_SUFFIX}`} />
                <meta name="twitter:creator" content="@Splunk" />
                {imageUrl != null && baseUrl != null && (
                    <>
                        <meta property="twitter:image" content={fullUrl(baseUrl, imageUrl)} />
                    </>
                )}
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <ThemeProvider themeName={THEME_MAP[theme]}>
                <GlobalBackgroundStyle backgroundColor={backgroundColor} />
                {children}
            </ThemeProvider>
        </>
    );
}
