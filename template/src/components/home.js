import React from 'react';
import styled from 'styled-components';
import { textColor } from '../theme';
import dashboardManifest from '../_dashboards.json';

const Wrapper = styled.div`
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

const DashLink = styled.a`
    display: flex;
    color: ${textColor};
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 280px;
    height: 80px;
    border: 1px solid #eee;
    margin: 10px 10px 0 0;
    box-sizing: border-box;
    padding: 0 15px;
    line-height: 120%;

    &:hover {
        background: rgb(0, 0, 0, 0.2);
    }
`;

const Title = styled.h1`
    color: ${textColor};
`;

export default function Home({ title = 'Dashboards' }) {
    return (
        <Wrapper>
            <Title>Dashboards</Title>
            {Object.keys(dashboardManifest).map((k) => (
                <DashLink key={k} href={`/${k}`}>
                    {dashboardManifest[k]}
                </DashLink>
            ))}
        </Wrapper>
    );
}
