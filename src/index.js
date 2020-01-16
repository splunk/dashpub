import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { GlobalStyle } from './styles.js';
import ThemeProvider from './theme';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

const loadDashboard = require.context('./dashboards', true, /\/index\.js$/, 'lazy');

ReactDOM.render(
    <ThemeProvider>
        <GlobalStyle />
        <Router>
            <Switch>
                {loadDashboard.keys().map(k => {
                    const Dash = React.lazy(() => loadDashboard(k));
                    const path = `/${k.split('/')[1]}`;
                    return (
                        <Route key={k} path={path}>
                            <Suspense fallback={<div>Loading {path}</div>}>
                                <Dash />
                            </Suspense>
                        </Route>
                    );
                })}
                <Route>
                    <h1>404</h1>
                </Route>
            </Switch>
        </Router>
    </ThemeProvider>,
    document.getElementById('root')
);
