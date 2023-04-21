import { addItems, getTotalAdsCount, scrapeTruckItem } from "./lib/data-parser.js";
import { Scraper } from "./lib/scraper-core.js";

const scraper = new Scraper();

const url =
    "https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/od-2014/q-actros?search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at+%3Adesc";
const nextBtn = "div.ooa-1oll9pn.e8b33l77 > div > ul > li:last-child";
const pageCount = 0;


(async () => {
    try {
        await scraper.init();

        const html = await scraper.getPageContent(url); // get initial page content
        const totalAds = getTotalAdsCount(html); // get total ads count
        console.log("🚀 ~ totalAds:", totalAds);

        const ads = addItems(html); // parse each ad from page content, return array of objects

        console.log("🚀 ~ parsing ads id & url from initial page...");
        // for multiple pages
        if (pageCount && pageCount > 1) {
            for (let i = 0; i < pageCount - 1; i++) {
                const nextPageUrl = await scraper.getNextPageUrl(nextBtn);
                if (!nextPageUrl) break; // if reached last page, break

                const nextPageHtml = await scraper.getPageContent(nextPageUrl);
                ads.push(...addItems(nextPageHtml)); // add other pages ads in initial page's ads array
            }
        }
        console.log(
            `Found ${ads.length} ads on ${
                pageCount !== 0 ? `${pageCount} pages` : "initial page"
            }`
        );

        console.log("🚀 ~ ads:", ads);
        console.log("🚀 ~ parsing ads data...");

        // parse data from each ad in sequence, single process (slow)
        // for (let i = 0;i < ads.length;i++) {
        //     const itemHtml = await scraper.getPageContent(ads[i].link);
        //     const truck = scrapeTruckItem(itemHtml);
        //     console.log(`🚀 ~ truck-${i + 1}:`, truck);
        // }

        // parse data from each ad using cluster process (fast)
        const data = await scraper.cluster({
            urls: ads.map((ad) => ad.link),
            dataParser: scrapeTruckItem,
        });
        console.log(data, data.length);

    } catch (err) {
        console.error(err);
    } finally {
        await scraper.exit();
    }


})();