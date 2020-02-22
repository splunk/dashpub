import DashboardCore from '@splunk/dashboard-core';
import React, { Suspense, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { createGlobalStyle } from 'styled-components';
import Loading from './loading';
import preset from './preset';

const GlobalBackgroundStyle = createGlobalStyle`
    html, body {
        background-color: ${props => props.backgroundColor || 'red'};
    }
`;

function updateAssetUrls(orig, { origin = window.location.origin } = {}) {
    const def = JSON.parse(JSON.stringify(orig));
    // Convert server-relative URLs to absolute URLs before rendering
    for (const viz of Object.values(def.visualizations)) {
        if (viz.type === 'viz.singlevalueicon' && viz.options.icon && viz.options.icon.startsWith('/')) {
            viz.options.icon = `${origin}${viz.options.icon}`;
        }
        if (viz.type === 'viz.img' && viz.options.src && viz.options.src.startsWith('/')) {
            viz.options.src = `${origin}${viz.options.src}`;
        }
    }
    if (
        def.layout.options.backgroundImage &&
        def.layout.options.backgroundImage.src &&
        def.layout.options.backgroundImage.src.startsWith('/')
    ) {
        def.layout.options.backgroundImage.src = `${origin}${def.layout.options.backgroundImage.src}`;
    }
    if (!def.layout.options.backgroundColor) {
        def.layout.options.backgroundColor = '#ffffff';
    }
    return def;
}

export default function Dashboard({ definition }) {
    const processedDef = useMemo(() => updateAssetUrls(definition), [definition]);
    return (
        <>
            <Helmet>
                <title>{definition.title || 'Dashboard'}</title>
            </Helmet>
            <GlobalBackgroundStyle backgroundColor={processedDef.layout.options.backgroundColor} />
            <Suspense fallback={<Loading />}>
                <DashboardCore preset={preset} definition={processedDef} mode="view" width="100vw" height="100vh" />
            </Suspense>
        </>
    );
}
