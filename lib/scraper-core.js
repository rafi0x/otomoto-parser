import puppeteer from "puppeteer";

export class Scraper {
    constructor() {
        this.browser = null;
        this.pages = null;
        this.maxRetries = 3;
        this.retryDelay = 1000;
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: false,
        });
        this.page = await this.browser.newPage();
    }

    async exit() {
        await this.browser.close();
    }

    async getPageContent(url) {
        let tries = 0; // count attempts
        while (tries < this.maxRetries) {
            try {
                await this.page.goto(url, { waitUntil: "networkidle0" });

                // accept cookies if popup is present
                const cookieAccept = await this.page.$(
                    "#onetrust-accept-btn-handler"
                );
                if (cookieAccept)
                    await this.page.click("#onetrust-accept-btn-handler");

                return this.page.content();
            } catch (error) {
                console.error(
                    `Attempt ${tries + 1} failed | err: ${error.message}`
                );
                tries++; // increment attempts
                await new Promise((resolve) =>
                    setTimeout(resolve, this.retryDelay)
                ); // wait for retryDelay
            }
        }
        throw new Error(
            `Execution failed after ${this.maxRetries} attempts on function getPageContent`
        );
    }

    async getNextPageUrl(nextBtn) {
        let tries = 0;
        while (tries < this.maxRetries) {
            try {
                const isBtnEnable = await this.page.$eval(nextBtn, (el) => {
                    return el.getAttribute("aria-disabled") === "false";
                });
                if (!isBtnEnable) return null; // if next page button is disabled, return null

                await this.page.click(nextBtn); // click next page button
                await this.page.waitForNavigation(); // wait for page to load

                return this.page.url(); // return url of loaded page
            } catch (error) {
                console.error(
                    `Attempt ${tries + 1} failed | err: ${error.message}`
                );
                tries++;
                await new Promise((resolve) =>
                    setTimeout(resolve, this.retryDelay)
                );
            }
        }
        throw new Error(
            `Execution failed after ${this.maxRetries} attempts on function getNextPageUrl`
        );
    }


    async cluster({ urls, dataParser, scrapeRate = 5 }) {
        if (!dataParser) throw new Error("dataParser function is required");
        const data = [];
        let currentIndex = 0;
        while (currentIndex < urls.length) {
            const pagePromises = [];

            for (let i = 0; i < scrapeRate && currentIndex < urls.length; i++) {
                const url = urls[currentIndex++];
                const pagePromise = (async () => {
                    const page = await this.browser.newPage();
                    await page.goto(url, {
                        waitUntil: "networkidle0",
                        timeout: 60000,
                    });
                    return page;
                })();
                pagePromises.push(pagePromise);
            }
            
            const pages = await Promise.allSettled(pagePromises);
            for (const result of pages) {
                if (result.status === "fulfilled") {
                    const page = result.value;
                    try {
                        const content = await page.content();
                        const parsedData = dataParser(content);
                        data.push(parsedData);
                    } catch (error) {
                        console.error(`Error parsing data: ${error.message}`);
                    } finally {
                        await page.close();
                    }
                } else {
                    const error = result.reason;
                    console.log(result)
                    console.error(`Error creating page: ${error.message}`);
                }
            }
        }
        return data;
    }
}


