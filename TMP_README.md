# UDF Dashboard Publisher

This tool creates a Next.js project for a given list of Splunk dashboards, optionally making the dashboards accessible to anyone using [Vercel](https://vercel.com). Search results are proxied through serverless functions, which handle authentication and efficient CDN caching.

## Prerequisites

Node.js 12+, NPM, Yarn

## Get started

1. Install `udfpub` CLI globally

```sh-session
$ npm i -g @splunkdlt/udfpub
```

2. Initialize a new project

```sh-session
$ udfpub init
```

Follow the instructions to create your dashboard project.
