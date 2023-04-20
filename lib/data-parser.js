import * as cheerio from "cheerio";

export function addItems(html) {
    const $ = cheerio.load(html);
    const items = [];

    $("main > article").each((i, el) => {
        const id = $(el).attr("data-id");
        const link = $(el)
            .find("div.ooa-1nihvj5.eayvfn615 > h2 > a")
            .attr("href");
        items.push({
            id,
            link,
        });
    });
    return items;
}

export function getTotalAdsCount(html) {
    const $ = cheerio.load(html);
    const totalAds = $("div.ooa-1mflxhm > div > h1")
        .text()
        .replace(/[^\d]/g, ""); // get only numbers
    return totalAds;
}

export function scrapeTruckItem(html) {
    // used for match needed data from ul > li.
    const properties = {
        power: "Moc",
        course: "Przebieg",
        production: "Rok produkcji",
        registration: "Data pierwszej rejestracji w historii pojazdu",
    };

    const $ = cheerio.load(html);

    const data = {};

    data.id = $('*[id="ad_id"]:eq(1)').text(); // dom has two elements with same id.
    data.price = $(".offer-price").attr("data-price").replace(/\s/g, "");
    data.title = $("span.offer-title.big-text.fake-title").text().trim();

    // some page have two ul.
    $("#parameters > ul").each((i, el) => {
        $(el)
            .find("li")
            .each((i, el) => {
                const title = $(el).find("span").text(); // title of each li

                // match li title with filter object to get needed data.
                Object.entries(properties).forEach(([key, value]) => {
                    if (title === value) {
                        data[key] = $(el).find("div").text().replace(/\s/g, "");
                    }
                });
            });
    });
    return data;
}
