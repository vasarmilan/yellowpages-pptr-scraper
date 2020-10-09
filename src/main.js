const Apify = require('apify');
const { URL } = require('url');
const routes = require('./routes');

const { utils: { log } } = Apify;

Apify.main(async () => {
    const { searchTerms, geoLocationTerms, maxPages } = await Apify.getInput();
    log.info(`Search terms: ${searchTerms}, Geolocation terms: ${geoLocationTerms}`);

    const baseURL = 'https://www.yellowpages.com';
    const startUrl = new URL('search', baseURL);
    startUrl.searchParams.append('search_terms', searchTerms);
    startUrl.searchParams.append('geo_location_terms', geoLocationTerms);

    const requestList = await Apify.openRequestList('start-url', [{
        url: startUrl.href,
        userData: { label: 'SEARCHPAGE' },
    }]);

    const requestQueue = await Apify.openRequestQueue();
    // const proxyConfiguration = await Apify.createProxyConfiguration();

    const crawler = new Apify.PuppeteerCrawler({
        requestList,
        requestQueue,
        // proxyConfiguration,
        useSessionPool: true,
        persistCookiesPerSession: true,
        launchPuppeteerOptions: {
            stealth: true,
        },
        handlePageFunction: async (context) => {
            const { request } = context;
            const { userData: { label } } = request;
            log.debug(`Scraping URL ${request.url} with label ${label}`);
            await routes[label](context, { requestQueue, baseURL, maxPages });
        },
    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');
});
