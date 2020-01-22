import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import NotFound from './404';
import Loading from './loading';
import { GlobalStyle } from './styles.js';
import ThemeProvider from './theme';

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
                            <Suspense fallback={<Loading />}>
                                <Dash />
                            </Suspense>
                        </Route>
                    );
                })}
                <Route path="/" exact>
                    <Redirect to="/givecrypto_summary" />
                </Route>
                <Route>
                    <NotFound />
                </Route>
            </Switch>
        </Router>
    </ThemeProvider>,
    document.getElementById('root')
);
