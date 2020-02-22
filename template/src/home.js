import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import dashboardManifest from './_dashboards.json';

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
    color: inherit;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 280px;
    height: 80px;
    border: 1px solid #eee;
    margin: 10px 10px 0 0;
    box-sizing: border-box;

    &:hover {
        background: #eee;
    }
`;

const Separator = styled.hr`
    width: 400px;
    margin-top: 20px;
`;

const DropdownWrapper = styled.div`
    padding: 10px;
`;

export default function Home() {
    const [rotationTime, selectRotationTime] = useState('180');
    const updateRotationTime = useCallback(
        e => {
            selectRotationTime(e.currentTarget.value);
        },
        [selectRotationTime]
    );
    return (
        <Wrapper>
            <h1>BCB Dashboards</h1>
            {Object.keys(dashboardManifest).map(k => (
                <DashLink key={k} href={`/${k}`}>
                    {dashboardManifest[k]}
                </DashLink>
            ))}
            <Separator />

            <DashLink href={`/rotation?time=${encodeURIComponent(rotationTime)}`}>Rotate through all dashboards</DashLink>
            <DropdownWrapper>
                <select onChange={updateRotationTime} value={rotationTime}>
                    <option value="10">every 10 seconds</option>
                    <option value="30">every 30 seconds</option>
                    <option value="60">every minute</option>
                    <option value="180">every 3 minutes</option>
                </select>
            </DropdownWrapper>
        </Wrapper>
    );
}
