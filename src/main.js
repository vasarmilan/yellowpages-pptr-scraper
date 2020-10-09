const Apify = require('apify');
const { handleStart, handleList, handleDetail } = require('./routes');

const { utils: { log } } = Apify;

Apify.main(async () => {
    const { searchTerms, geoLocationTerms } = await Apify.getInput();

    log.info(`Search terms: ${searchTerms}, Geolocation terms: ${geoLocationTerms}`);

    const requestList = await Apify.openRequestList('start-urls', []);
    const requestQueue = await Apify.openRequestQueue();
    const proxyConfiguration = await Apify.createProxyConfiguration();

    const crawler = new Apify.PuppeteerCrawler({
        requestList,
        requestQueue,
        proxyConfiguration,
        useSessionPool: true,
        persistCookiesPerSession: true,
        launchPuppeteerOptions: {
            stealth: true,
        },
        handlePageFunction: async (context) => {
        },
    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');
});
