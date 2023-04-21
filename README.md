## Set page limit, url, nextBtn

```bash
path ./app.js

    url = string
    nextBtn = string
    pageCount = number > 1

```

## Install dependencies

```bash
yarn || npm install
```

## Start the app

```bash
yarn start || npm start
```

#

-   we have 2 way to scrape data from website, one is cluster process (faster) and another is single process (slower), default is cluster (can change in app.js).

-   single process have auto retry, but cluster doesn't.

-   default retry limit is 3 and retry interval is 1000ms. you can change these values in Scraper class's constructor.

-   output will be show in console.

