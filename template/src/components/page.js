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

import React, { useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';
import Head from 'next/head';
import { startAutoUpdateCheck } from '../autoupdate';
import { SplunkThemeProvider, variables } from '@splunk/themes';
import "bootstrap/dist/css/bootstrap.css";
const TITLE_SUFFIX = 'Splunk Dashboard';

const GlobalBackgroundStyle = createGlobalStyle`
    html, body {
        background-color: ${(props) => props.backgroundColor || variables.backgroundColor(props)};
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
    useEffect(() => {
        startAutoUpdateCheck();
    }, []);

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
            <SplunkThemeProvider family="enterprise" colorScheme={theme}>
                <GlobalBackgroundStyle backgroundColor={backgroundColor} />
                {children}
            </SplunkThemeProvider>
        </>
    );
}
