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
                })
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

}

/**
 * 
 * 
 * <li title="Next Page" data-testid="pagination-step-forwards" aria-disabled="true" font-size="p3" class="pagination-item pagination-item__disabled ooa-1l3vl9c"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" class="ooa-3zxtxy"><path fill="currentColor" fill-rule="evenodd" d="M7 2v1.414l1.271 1.27L15.586 12l-7.315 7.315L7 20.585V22h1.414l1.27-1.271L17 13.414l1-1v-.827l-3.942-3.942v-.001L9.686 3.271 8.413 2z"></path></svg></li>



 */