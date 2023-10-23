import React from 'react';
import Homepage from '../components/home';
import Page from '../components/page';

export default function Home({}) {
    return (
        <Page title="Dashboards" theme="dark">
            <Homepage />
        </Page>
    );
}
