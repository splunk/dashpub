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

import React, { Component } from 'react';
import styled from 'styled-components';
import { variables } from '@splunk/themes';

import User from '@splunk/react-icons/enterprise/User';
import Key from '@splunk/react-icons/Key';

import Text from '@splunk/react-ui/Text';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Button from '@splunk/react-ui/Button';

import 'bootstrap/dist/css/bootstrap.css';

const PageWrapper = styled.div`
    margin: 5%;
    text-align: center;
`;

const LoginForm = styled.form`
    margin: 20px 25%;
    width: 50%;
`;

const Title = styled.h1`
    color: ${variables.textColor};
`;
const SubTitle = styled.h2`
    color: ${variables.textColor};
`;

class Login extends Component {

    render() {
        const handleSubmit = async (event) => {
            event.preventDefault();
            const username = event.target.username.value;
            const password = event.target.password.value;

            const queryParams = new URLSearchParams(window.location.search);
            const redirectUrl = queryParams.get('returnTo'); // Assuming 'redirectUrl' is your query parameter
            // Send the credentials to your API route
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                // Redirect on successful login
                window.location.href = redirectUrl;
            } else {
                // Handle errors, e.g., display an alert
                alert('Login failed. Please check your credentials.');
            }
        };

        return (
            <PageWrapper>
                <Title>{process.env.NEXT_PUBLIC_DASHPUBTITLE || 'Dashboards'}</Title>
                <SubTitle>Login</SubTitle>
                <LoginForm onSubmit={handleSubmit}>
                    <ControlGroup label="Username">
                        <Text
                            name="username"
                            defaultValue=""
                            startAdornment={
                                <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                                    <User size={1} />
                                </div>
                            }
                            inline
                            placeholder="Username"
                        />
                    </ControlGroup>
                    <ControlGroup label="Password">
                        <Text
                            name="password"
                            inline
                            type="password"
                            onChange={this.handleChange}
                            placeholder="*******"
                            startAdornment={
                                <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                                    <Key size={1} />
                                </div>
                            }
                        />
                    </ControlGroup>

                    <br />

                    <br />
                    <Button label="Login &gt;" appearance="primary" type="submit" />
                </LoginForm>
            </PageWrapper>
        );
    }
}
export default Login;
