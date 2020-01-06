import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
    html, body {
        margin: 0;
        padding: 0;
        background: #666;
    }
`;

export const DashboardWrapper = styled.div`
    min-width: 500px;
    width: 100vw;
`;
