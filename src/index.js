import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Helmet } from 'react-helmet';
import DashboardCore from '@splunk/dashboard-core';
import definition from './definition.json';
import preset from './preset';
import { GlobalStyle, DashboardWrapper } from './styles.js';
import ThemeProvider from './theme';

function processDefinition(def) {
    // Convert server-relative URLs to absolute URLs before rendering
    for (const viz of Object.values(def.visualizations)) {
        if (viz.type === 'viz.singlevalueicon' && viz.options.icon.startsWith('/')) {
            viz.options.icon = `${window.location.origin}${viz.options.icon}`;
        }
        if (viz.type === 'viz.img' && viz.options.src.startsWith('/')) {
            viz.options.src = `${window.location.origin}${viz.options.src}`;
        }
    }
    if (def.layout.options.backgroundImage && def.layout.options.backgroundImage.src.startsWith('/')) {
        def.layout.options.backgroundImage.src = `${window.location.origin}${def.layout.options.backgroundImage.src}`;
    }
    return def;
}

ReactDOM.render(
    <ThemeProvider>
        <GlobalStyle />
        <Helmet>
            <title>{definition.title || 'Dashboard'}</title>
        </Helmet>
        <Suspense fallback={null}>
            <DashboardWrapper>
                <DashboardCore preset={preset} definition={processDefinition(definition)} height="100vh" />
            </DashboardWrapper>
        </Suspense>
    </ThemeProvider>,
    document.getElementById('root')
);
