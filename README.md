# Dashboard Publisher

**EXPERIMENTAL** tool that creates a Next.js project for a given list of Splunk dashboards, optionally making the dashboards accessible to anyone using [Vercel](https://vercel.com). Search results are proxied through serverless functions, which handle authentication and efficient CDN caching.

## Prerequisites

-   Node.js 12+, NPM, Yarn
-   [Vercel CLI](https://vercel.com/download) if you want to publish on Vercel

## Get started

1. Install `dashpub` CLI globally

```sh-session
$ npm i -g @splunk/dashpub
```

2. Initialize a new project

```sh-session
$ dashpub init
```

Follow the instructions to create your dashboard project.






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
