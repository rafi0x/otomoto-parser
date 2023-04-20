## Set page limit, url, nextBtn

```bash
path ./app.js

    url = string
    nextBtn = string
    pageCount = number > 1

```

## Start the app

```bash
node app
```

auto retry when error is implemented in Scraper class's methods. default retry limit is 3 and retry interval is 1000ms. you can change these values in Scraper class's constructor.
