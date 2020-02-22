# UDF Dashboard Publisher

This tool creates a create-react-app project for a given list of UDF dashboards, making the dashboards accessible to anyone using [Now](https://now.sh). Search results are proxied through serverless functions, which handle authentication and efficient CDN caching.

## Prerequisites

1. Sign up for [Now](https://now.sh/) and set up Now CLI
2. Node.js 12+, NPM, Yarn

## Get started

1. Install `udfpub` CLI globally

```sh-session
$ npm i -g @splunkdlt/udfpub
```

2. Initialize a new project

```sh-session
$ udfpub init
```

3. Optional: Edit generated UI in a local development environment

```sh-session
$ now dev --listen 3333
```

4. Publish: Deploy to now.sh

```sh-session
$ now
```

5. Create github repository and add the Now.sh integration
