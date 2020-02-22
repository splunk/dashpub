import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { themes as reactUIThemes } from '@splunk/react-ui/themes';
import { themes as dashboardCoreThemes } from '@splunk/dashboard-core';
import { mergeThemes } from '@splunk/dashboard-themes/helper';

const themeKey = 'enterpriseLight';
let theme = mergeThemes(dashboardCoreThemes[themeKey], reactUIThemes[themeKey]);

const themeChangeCallbacks = new Set();

export function applyTheme(themes) {
    theme = mergeThemes(theme, themes[themeKey]);
    themeChangeCallbacks.forEach(cb => cb());
}

export default function Theme({ children }) {
    const [curTheme, setTheme] = useState(theme);
    useEffect(() => {
        const handler = () => {
            setTheme(theme);
        };
        themeChangeCallbacks.add(handler);
        return () => {
            themeChangeCallbacks.delete(handler);
        };
    });

    return <ThemeProvider theme={curTheme}>{children}</ThemeProvider>;
}
