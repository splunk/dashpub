# Docker Instructions

Use one of the options below to deploy your Dashboard Publisher App. This is aimed to be a starting point to enable you to publish your dashboards.  Depending on your use-cases you may wish to consider additional configuration, such as caching/screenshotting/authentication/logging and high-availability.  
Due to the nature of how the production site is built, it is not recommended to run two containers and load-balanced between as certain cached files may not exist in a secondary container. HA is possible using this approach but requires further configuration.

These options do not currently support "Tags", however this is currently in development and instructions will be updated here shortly.

When using the docker-compose files, it is possible to change:
`build: .` to `image: livehybrid/splunk-dashpub:beta` to use a pre-built image.  

Note: that this image is maintained by @livehybrid and not maintained by Splunk.


## Option 1 - Manual Build inside Docker (Requires interaction)

*Note* This is the most basic example of how to run Dashpub inside Docker. You may also wish to set Environment variables (see below) to customise your installation.  
This method may not auto-recover on container failure, but should withstand restarts.

* `docker run -d --restart=always --name dashpub -p 3000:3000 livehybrid/splunk-dashpub:beta`
* `docker exec -it dashpub config`
  * Follow the CLI instructions to configure Dashpub
  * Dashpub will create a production build of the application and begin serving traffic on port 3000, this could take 2-3 minutes.
* See logs with `docker logs -f dashpub`
  * Once completed the docker logs should show  
  `ready - started server on http://localhost:3000`
### Optional Environment variables for customisation
| Variable | Required | Notes |
| --- | --- | --- |
| DASHPUB_BUILD_ID | N | Numeric value used to assist browser caching, increment this number when rebuilding to ensure client machines reload the entire page. |  
| DASHPUB_SCREENSHOTS | N | Set to `Y` to enable screenshots to be displayed on the front page. <br />*Note: This requires additional configuration and currently additional un-documented Docker services*. |  
| DASHPUB_SCREENSHOT_EXT | N |  Used when `DASHPUB_SCREENSHOTS` is enabled, the image extension to look for when using screenshots. *Defaults to "png"* |
| DASHPUB_SCREENSHOT_DIR | N |  Used when `DASHPUB_SCREENSHOTS` is enabled, the folder at http(s)://your_fqdn/ which contains the screenshots for each dashboard. *Defaults to "screenshots"* |
| DASHPUB_TITLE | N |  Set the page `<title>` and the header title on the front page. <br />*Default: `Dashboards`* |
| DASHPUB_VERCEL | N | Whether to deploy to Vercel, Set to `n` to prevent deploying to Vercel and continue with the local running of the app. This is used to remove the need for interactive configuration/setup. *Future enhancement in progress to remove the need to set this when within Docker Container* |
| VERCEL_URL | N | Used in conjuction with `DASHPUB_SCREENSHOTS` to set HTML Metadata to display Dashboard screenshot when URL is *unfurled* (e.g. posting in Slack/LinkedIn etc) | 


## Option 2 - Environment Variables (Idempotent, Repeatably buildable)
See the docker-compose-envs.yml example file to get started. 

### Environment variables for customisation
| Variable | Required | Notes |
| --- | --- | --- |
| DASHPUB_APP  | **Y** | The name of the app on your Search head in which your dashboards reside.<br />*Note: All dashboards must be accessible from within this app.* |
| DASHPUB_BUILD_ID | N | Numeric value used to assist browser caching, increment this number when rebuilding to ensure client machines reload the entire page. |  
| DASHPUB_DASHBOARDS | **Y** | A command delimited (no spaces) list of dashboard IDs (from the URL/slug) to be published. 
| DASHPUB_FOLDERNAME | **Y** | The folder name inside the Docker container to create the dashboard app, this should be set to `app`. Deviations from this may cause issue. | 
| DASHPUB_PROJECTNAME | **Y** | The project name for the dashboard app, this should be set to `app`. Deviations from this may cause issue. |
| DASHPUB_SCREENSHOTS | N | Set to `Y` to enable screenshots to be displayed on the front page. <br />*Note: This requires additional configuration and currently additional un-documented Docker services*. |  
| DASHPUB_SCREENSHOT_EXT | N |  Used when `DASHPUB_SCREENSHOTS` is enabled, the image extension to look for when using screenshots. *Defaults to "png"* |
| DASHPUB_SCREENSHOT_DIR | N |  Used when `DASHPUB_SCREENSHOTS` is enabled, the folder at http(s)://your_fqdn/ which contains the screenshots for each dashboard. *Defaults to "screenshots"* |
| DASHPUB_TITLE | N |  Set the page `<title>` and the header title on the front page. <br />*Default: `Dashboards`* |
| DASHPUB_VERCEL | **Y** | Whether to deploy to Vercel, Set to `n` to prevent deploying to Vercel and continue with the local running of the app. This is used to remove the need for interactive configuration/setup. *Future enhancement in progress to remove the need to set this when within Docker Container* |
| SPLUNKD_URL | **Y** | Full `schema://host:port` url to your Splunk Management Port (8089) |
| SPLUNKD_TOKEN | **Y** | Splunk API token for user with correct permissions to access dashboards and searches for deployment | 
| VERCEL_URL | N | Used in conjuction with `DASHPUB_SCREENSHOTS` to set HTML Metadata to display Dashboard screenshot when URL is *unfurled* (e.g. posting in Slack/LinkedIn etc) | 

## Option 3 - JSON Config (Idempotent, Repeatably buildable)
See the docker-compose-conffile.yml example file to get started.

Example configuration JSON file (dashpub.json)
```json
{"dashpub": {
        "projectName": "app",
        "splunkd": {
            "url": "https://192.168.0.222:8089"
        },
        "app": "search",
        "dashboards": [
          "my_first_dashboard",
          "my_second_dashboard"
        ]
    }
}
```
### Environment variables for customisation
| Variable | Required | Notes |
| --- | --- | --- |
| DASHPUB_BUILD_ID | N | Numeric value used to assist browser caching, increment this number when rebuilding to ensure client machines reload the entire page. |  
| DASHPUB_SCREENSHOTS | N | Set to `Y` to enable screenshots to be displayed on the front page. <br />*Note: This requires additional configuration and currently additional un-documented Docker services*. |  
| DASHPUB_SCREENSHOT_EXT | N |  Used when `DASHPUB_SCREENSHOTS` is enabled, the image extension to look for when using screenshots. *Defaults to "png"* |
| DASHPUB_SCREENSHOT_DIR | N |  Used when `DASHPUB_SCREENSHOTS` is enabled, the folder at http(s)://your_fqdn/ which contains the screenshots for each dashboard. *Defaults to "screenshots"* |
| DASHPUB_TITLE | N |  Set the page `<title>` and the header title on the front page. <br />*Default: `Dashboards`* |
| DASHPUB_VERCEL | **Y** | Whether to deploy to Vercel, Set to `n` to prevent deploying to Vercel and continue with the local running of the app. This is used to remove the need for interactive configuration/setup. *Future enhancement in progress to remove the need to set this when within Docker Container* |
| SPLUNKD_TOKEN | **Y** | Splunk API token for user with correct permissions to access dashboards and searches for deployment | 
| VERCEL_URL | N | Used in conjuction with `DASHPUB_SCREENSHOTS` to set HTML Metadata to display Dashboard screenshot when URL is *unfurled* (e.g. posting in Slack/LinkedIn etc) | 
