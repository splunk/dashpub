/*
Copyright 2020 Splunk Inc. 

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
