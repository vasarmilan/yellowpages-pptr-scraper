const Apify = require('apify');

const { utils: { log, enqueueLinks } } = Apify;
const { URL } = require('url');

exports.SEARCHPAGE = async ({ request, page }, { requestQueue, baseUrl, maxPages }) => {
    log.info(`Enqueuing links from ${request.url}`);
    log.info(JSON.stringify(await page.$eval('a.business-name', (el) => el.href)));
    await enqueueLinks({
        page,
        requestQueue,
        baseUrl,
        selector: 'a.business-name',
        transformRequestFunction: (req) => {
            req.userData.label = 'LISTING';
            return req;
        },
    });
    // only enqueue the next page, if current is < maxPages
    const currentPage = new URL(request.url).searchParams.get('page');
    if (currentPage < maxPages || maxPages === 0) {
        await enqueueLinks({
            page,
            requestQueue,
            baseUrl,
            selector: '.next.ajax-page',
            transformRequestFunction: (req) => {
                req.userData.label = 'SEARCHPAGE';
                return req;
            },
        });
    } else {
        log.info(`Reached page ${maxPages}, skipping next page...`);
    }
};

exports.LISTING = async ({ request, page}, { requestQueue }) => {

}