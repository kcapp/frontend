![kcapp logo](https://raw.githubusercontent.com/kcapp/frontend/master/public/images/logo.png)
# kcapp-frontend
![Latest Version](https://img.shields.io/github/package-json/v/kcapp/frontend)
![Docker Image CI Workflow](https://github.com/kcapp/frontend/actions/workflows/docker.image.yaml/badge.svg)
[![Join our Slack](https://img.shields.io/badge/Slack-Join%20the%20discussion-limegreen.svg?logo=slack)](https://kcappdarts.slack.com)
[![Buy me a Coffee](https://img.shields.io/badge/Ko--fi-Buy%20me%20a%20coffee-limegreen.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAIAAACQKrqGAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAE0SURBVChTlZE/S8NAGIff613+gMXYQgYhqxlCSXdxCvQDuAUyFC0BlUz6QcSPUQcJdCrZXB0zJEPo0M1BBAmSJuTim/QE0SU+y3u5e+7N7+6I53nQj4GoPfiHSm3bxlKWZZ7nuz/gEmOsM6Et6E2n0/l8/kkaqDkwSnYlA6Jp2nK5XK/Xw+EQtTYA53w0HhuGYT6n5ntpRi8nI32k67PZzHGcyWRSVZXoijSEAAe4f4DjI6g+4G1TXd+oqrparSzLStNUkiRxLI77cHh1DuUrHFC4vTtkzPf9IAjCMJRlGZ1vlWNPgMsFXCzg8QmHuJBlmeu6lNLBoNXaANg8SZLtdlsUBTk9azYbChBFURzHeCCC2TrEa9V1jZe1n9qjKApmFR8dIgD+Ba/mJ788RKh96K0CfAEJznGqIDf7PAAAAABJRU5ErkJggg==)](https://ko-fi.com/P5P5BBQQ4)

kcapp (pronounced [keɪk æp](https://en.wikipedia.org/wiki/Help:IPA/English)) is an application used for scoring Darts matches, with multiple input methods, statistics tracking, and more. See [Wiki](https://github.com/kcapp/frontend/wiki) for more information

## Install
### Quick & Easy
To get started with development quickly, the following [installer script](https://github.com/kcapp/services/blob/master/installer.sh) can be used. More details can be found on the [Wiki](https://github.com/kcapp/frontend/wiki/Technical-Setup#quick-start)

### Manual
1. Clone repository `git clone https://github.com/kcapp/frontend.git`
2. Install all `nodejs` dependencies `npm install`
3. Start the frontend by running the following command
    * Windows
        ```bat
        set DEBUG=kcapp:* & npm start
        ```
    * Linux / OSX
        ```bash
        # logging to stdout
        DEBUG=kcapp:* npm start
        # or logs redirected to file
        DEBUG=kcapp:* npm start &>> "log/kcapp.log"
        ```

## Update
1. Pull latest changes `git pull`
2. Install all new `nodejs` dependencies `npm install`
3. Delete `.cache` directory `rm -rf .cache`

## Configuration
Frontend depends on the [kcapp-api](https://github.com/kcapp/api) for fetching data from the database.

The following environment variables can be used to adjust configuration
* `NODE_ENV`: specify if app should run in `prod` or `dev` mode.
    * `prod` will enable bundling and minifying
    * `dev`  will start with [browser-refresh](https://github.com/patrick-steele-idem/browser-refresh) for easier development
* `DEBUG`: value is passed to [debug](https://github.com/visionmedia/debug) module to specify which packages should be logged
* `KCAPP_API`: by default `api` runs on `http://localhost:8001`, but this can be changed by setting it to `http://<host>:<port>`
* `PORT` : by default `3000`
* `DISK_CACHE`: settings this will cache to disk (`.cache`) for optimized startup time between server runs. This folder must be deleted when a new version is deployed
