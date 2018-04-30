# kcapp-frontend
kcapp (pronounced [keɪk æp](https://en.wikipedia.org/wiki/Help:IPA/English)) is an application used for scoring Darts matches, with multiple input methods, statistics tracking, and more. See [Wiki](https://github.com/kcapp/frontend/wiki) for more information

## Install
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

## Configuration
Frontend depends on the [kcapp-api](https://github.com/kcapp/api) for fetching data from the database. Curently this is always running on port `localhost:8001`, but this can be changed locally be modifying this line in `app.js` if the `api` is running on another host or port
```
app.locals.kcapp.api = 'http://localhost:8001';
```