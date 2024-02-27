import React from 'react';
import Login from '../components/login';
import Page from '../components/page';
import Link from '@splunk/react-ui/Link';
import styled from 'styled-components';
import useSplunkTheme from '@splunk/themes/useSplunkTheme';
import { format } from 'util';
import 'bootstrap/dist/css/bootstrap.css';

export default function Home({}) {
    const { textColor, textGray, focusColor } = useSplunkTheme();
    const Footer = styled.p`
        color: ${focusColor};
        text-align: center;
    `;

    return (
        <Page
            title={process.env.NEXT_PUBLIC_DASHPUBTITLE || 'Dashboards'}
            theme={process.env.NEXT_PUBLIC_HOMETHEME || 'light'}
            baseUrl={process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null}
        >
            <Login></Login>
            {process.env.NEXT_PUBLIC_DASHPUBFOOTER != 'false' ? (
                <Footer align="center">
                    {process.env.NEXT_PUBLIC_DASHPUBFOOTER || 'Hosted Splunk Dashboards'}
                    {process.env.NEXT_PUBLIC_DASHPUBHOSTEDBY ? (
                        <>
                            {' '}
                            by{' '}
                            <Link to={process.env.NEXT_PUBLIC_DASHPUBHOSTEDURL || '#'} openInNewContext="">
                                {process.env.NEXT_PUBLIC_DASHPUBHOSTEDBY}
                            </Link>{' '}
                        </>
                    ) : (
                        ' '
                    )}
                    using{' '}
                    <Link to={process.env.NEXT_PUBLIC_DASHPUBREPO || 'https://github.com/splunk/dashpub'} openInNewContext="">
                        Dashpub
                    </Link>
                </Footer>
            ) : (
                ''
            )}
        </Page>
    );
}
