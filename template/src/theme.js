import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { themes as reactUIThemes } from '@splunk/react-ui/themes';
import { mergeThemes } from '@splunk/dashboard-themes/helper';

const mergedThemes = {
    enterpriseDark: mergeThemes(reactUIThemes['enterpriseDark']),
    enterprise: mergeThemes(reactUIThemes['enterprise']),
};

const themeChangeCallbacks = new Set();
export function applyTheme(themes) {
    for (const themeKey of Object.keys(mergedThemes)) {
        mergedThemes[themeKey] = mergeThemes(mergedThemes[themeKey], themes[themeKey]);
    }
    themeChangeCallbacks.forEach((cb) => cb());
}

if (process.browser) {
    import('@splunk/dashboard-core')
        .then((core) => {
            applyTheme(core.themes);
        })
        .catch((e) => {
            console.error('Failed to apply dashboard core theme', e);
        });
}

export default function Theme({ children, themeName = 'enterprise' }) {
    const theme = mergedThemes[themeName];
    const [curTheme, setTheme] = useState(theme);
    useEffect(() => {
        const handler = () => {
            setTheme(mergedThemes[themeName]);
        };
        themeChangeCallbacks.add(handler);
        return () => {
            themeChangeCallbacks.delete(handler);
        };
    });
    return <ThemeProvider theme={curTheme}>{children}</ThemeProvider>;
}

export const baseThemeVar = (v) => ({ theme }) => theme['react-ui'].base[v];

export const textColor = baseThemeVar('textColor');
