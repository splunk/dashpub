import React, { Suspense, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import DashboardCore from '@splunk/dashboard-core';
import preset from './preset';

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

export default function Dashboard({ definition }) {
    const processedDef = useMemo(() => processDefinition(definition), [definition]);
    return (
        <>
            <Helmet>
                <title>{definition.title || 'Dashboard'}</title>
            </Helmet>
            <Suspense fallback={<div>Loading...</div>}>
                <DashboardCore preset={preset} definition={processedDef} />
            </Suspense>
        </>
    );
}
