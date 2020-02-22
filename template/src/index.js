import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NotFound from './404';
import Loading from './loading';
import { GlobalStyle } from './styles.js';
import ThemeProvider from './theme';
import { Rotation } from './rotation';
import Home from './home';
import { parse } from 'querystring';

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
                    <Home />
                </Route>
                <Route
                    path="/rotation"
                    exact
                    render={({ location }) => {
                        const { time } = parse((location.search || '').slice(1));
                        let rotationTime = parseInt(time, 10);
                        return (
                            <Rotation
                                time={Math.max(10000, isNaN(rotationTime) ? 180000 : rotationTime * 1000)}
                                dashboards={loadDashboard.keys().map(k => {
                                    const Dash = React.lazy(() => loadDashboard(k));
                                    return <Dash key={k} />;
                                })}
                            />
                        );
                    }}
                ></Route>
                <Route>
                    <NotFound />
                </Route>
            </Switch>
        </Router>
    </ThemeProvider>,
    document.getElementById('root')
);
