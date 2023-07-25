import React, { lazy, Suspense } from 'react';
import Loading from '../components/loading';
import NoSSR from '../components/nossr';
import Page from '../components/page';

const Dashboard = lazy(() => import('../components/dashboard'));

export default function DashboardPage({ definition, dashboardId, baseUrl }) {
    return (
        <Page
            title={definition.title || 'Dashboard'}
            description={definition.description}
            imageUrl={`/screens/${dashboardId}.png`}
            path={`/${dashboardId}`}
            backgroundColor={definition.layout.options.backgroundColor ? definition.layout.options.backgroundColor : '#000'}
            theme={definition.theme}
            baseUrl={baseUrl}
        >
            <NoSSR>
                <Suspense fallback={<Loading />}>
                    <Dashboard definition={definition} />
                </Suspense>
            </NoSSR>
        </Page>
    );
}

export async function getStaticProps({ params }) {
    const definition = require(`../dashboards/${params.dashboard}/definition.json`);
    return {
        props: {
            definition,
            dashboardId: params.dashboard,
            baseUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        },
    };
}

export async function getStaticPaths() {
    const dashboards = require('../_dashboards.json');
    return {
        paths: Object.keys(dashboards)
            .filter((d) => d !== 'timelapse')
            .map((d) => ({ params: { dashboard: d } })),
        fallback: false,
    };
}
