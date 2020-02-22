import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
`;
const Inner = styled.div`
    font-size: 34px;
`;

const Code = styled.span`
    color: #333;
`;
const Sep = styled.span`
    color: #666;
`;
const Msg = styled.span`
    color: #111;
    font-weight: bold;
`;

export default function NotFound() {
    return (
        <Wrapper>
            <Inner>
                <Code>404</Code>
                <Sep> | </Sep>
                <Msg>Not Found</Msg>
            </Inner>
        </Wrapper>
    );
}
